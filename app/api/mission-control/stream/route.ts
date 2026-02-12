import { NextResponse } from "next/server";

import { prisma } from "@/utils/db";
import { authOptions } from "@/utils/auth";
import { HttpError, jsonError, rateLimit, requireSessionForRequest } from "@/utils/request-guard";
import { moltbookService } from "@/utils/moltbook-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type MissionActivity = {
  id: string;
  type: "generation" | "publish" | "system";
  action: string;
  timestamp: string;
  status: "idle" | "running" | "error" | "complete";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata?: any;
};

type DashboardData = {
  recentActivity: MissionActivity[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  moltbookTrends: any[];
  performanceMetrics: {
    totalImpressions: number;
    avgEngagement: number;
    viralHits: number;
  };
};

async function buildDashboardSnapshot(userId: string, email: string | null): Promise<DashboardData> {
  const [strategies, logs, telemetry] = await Promise.all([
    prisma.strategy.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      where: { authorId: userId },
      select: {
        id: true,
        title: true,
        createdAt: true,
        isPublished: true,
        score: true,
        platform: true,
      },
    }),
    email
      ? prisma.auditLog.findMany({
          take: 20,
          orderBy: { createdAt: "desc" },
          where: { actor: email },
        })
      : Promise.resolve([]),
    prisma.telemetryEvent.findMany({
      take: 20,
      orderBy: { createdAt: "desc" },
      where: { authorId: userId },
    }),
  ]);

  const recentActivity: MissionActivity[] = [
    ...strategies.map((s) => ({
      id: s.id,
      type: "generation" as const,
      action: `Generated: ${s.title || "Untitled Strategy"}`,
      timestamp: s.createdAt.toISOString(),
      status: s.isPublished ? ("complete" as const) : ("idle" as const),
      metadata: { platform: s.platform, score: s.score },
    })),
    ...telemetry.map((e) => {
      const kind = String(e.kind || "");
      const isGeneration = kind.startsWith("generation_");
      const status =
        kind.endsWith("_failed")
          ? ("error" as const)
          : kind.endsWith("_started")
            ? ("running" as const)
            : ("complete" as const);
      return {
        id: e.id,
        type: isGeneration ? ("generation" as const) : ("system" as const),
        action: kind,
        timestamp: e.createdAt.toISOString(),
        status,
        metadata: e.metadata,
      } satisfies MissionActivity;
    }),
    ...logs.map((l) => ({
      id: l.id,
      type: "system" as const,
      action: l.action,
      timestamp: l.createdAt.toISOString(),
      status: l.action.includes("error") ? ("error" as const) : ("complete" as const),
      metadata: l.metadata,
    })),
  ]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 15);

  let moltbookTrends: any[] = [];
  try {
    const trends = await moltbookService.getTrending("strategy");
    moltbookTrends = trends.slice(0, 5);
  } catch {
    // best-effort only
  }

  const stats = await prisma.strategy.aggregate({
    where: { authorId: userId },
    _sum: { impressions: true },
    _avg: { engagement: true },
  });

  const viralHits = await prisma.strategy.count({
    where: { authorId: userId, rating: "VIRAL" },
  });

  return {
    recentActivity,
    moltbookTrends,
    performanceMetrics: {
      totalImpressions: stats._sum.impressions || 0,
      avgEngagement: stats._avg.engagement || 0,
      viralHits,
    },
  };
}

function encodeSseEvent({
  event,
  data,
}: {
  event: string;
  data: unknown;
}): string {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

export async function GET(req: Request) {
  try {
    const session = await requireSessionForRequest(req, authOptions);
    await rateLimit({ key: `mission_control_stream:${session.user.id}`, limit: 30, windowMs: 60_000 });

    const encoder = new TextEncoder();

    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        let closed = false;

        const close = () => {
          if (closed) return;
          closed = true;
          controller.close();
        };

        const send = (chunk: string) => {
          if (closed) return;
          controller.enqueue(encoder.encode(chunk));
        };

        send("retry: 3000\n\n");

        const sendSnapshot = async () => {
          try {
            const snapshot = await buildDashboardSnapshot(session.user.id, session.user.email || null);
            send(encodeSseEvent({ event: "snapshot", data: snapshot }));
          } catch (error) {
            // keep the stream alive; client will show stale state + keep retrying
            send(encodeSseEvent({ event: "error", data: { message: "snapshot_failed" } }));
          }
        };

        // Initial payload.
        await sendSnapshot();

        const heartbeat = setInterval(() => {
          send(": ping\n\n");
        }, 15_000);

        const interval = setInterval(() => {
          void sendSnapshot();
        }, 5_000);

        const abort = () => {
          clearInterval(interval);
          clearInterval(heartbeat);
          close();
        };

        if (req.signal.aborted) {
          abort();
          return;
        }

        req.signal.addEventListener("abort", abort, { once: true });
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (error) {
    if (error instanceof HttpError) {
      return jsonError(error.status, error.message, error.code);
    }
    return NextResponse.json({ error: "Unable to start telemetry stream." }, { status: 500 });
  }
}
