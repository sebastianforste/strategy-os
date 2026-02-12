"use server";

import { prisma } from "../utils/db";
import { moltbookService } from "../utils/moltbook-service";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../utils/auth";

export type MissionActivity = {
  id: string;
  type: "generation" | "publish" | "system";
  action: string;
  timestamp: Date;
  status: "idle" | "running" | "error" | "complete";
  metadata?: any;
};

export type DashboardData = {
  recentActivity: MissionActivity[];
  moltbookTrends: any[];
  performanceMetrics: {
    totalImpressions: number;
    avgEngagement: number;
    viralHits: number;
  };
};

export async function getMissionControlData(): Promise<DashboardData> {
  const session = await getServerSession(authOptions);

  const userId = session?.user?.id || null;
  const email = session?.user?.email || null;

  // Avoid leaking cross-user telemetry when unauthenticated.
  // We still return Moltbook trends (public), but no local activity.
  const shouldLoadPrivate = Boolean(userId);

  // 1. Fetch Recent Activity from Strategies & Logs (scoped to user)
  const [strategies, logs] = await Promise.all([
    shouldLoadPrivate
      ? prisma.strategy.findMany({
          take: 10,
          orderBy: { createdAt: "desc" },
          where: { authorId: userId as string },
          select: {
            id: true,
            title: true,
            createdAt: true,
            isPublished: true,
            score: true,
            platform: true,
          },
        })
      : Promise.resolve([]),
    shouldLoadPrivate && email
      ? prisma.auditLog.findMany({
          take: 20,
          orderBy: { createdAt: "desc" },
          where: { actor: email },
        })
      : Promise.resolve([]),
  ]);

  const recentActivity: MissionActivity[] = [
    ...strategies.map(s => ({
      id: s.id,
      type: "generation" as const,
      action: `Generated: ${s.title || "Untitled Strategy"}`,
      timestamp: s.createdAt,
      status: s.isPublished ? "complete" as const : "idle" as const,
      metadata: { platform: s.platform, score: s.score }
    })),
    ...logs.map(l => ({
      id: l.id,
      type: "system" as const,
      action: l.action,
      timestamp: l.createdAt,
      status: l.action.includes("error") ? "error" as const : "complete" as const,
      metadata: l.metadata
    }))
  ].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 15);

  // 2. Fetch Moltbook Trends
  let moltbookTrends: any[] = [];
  try {
    const trends = await moltbookService.getTrending("strategy");
    moltbookTrends = trends.slice(0, 5);
  } catch (e) {
    console.warn("[MissionControl] Failed to fetch Moltbook trends:", e);
  }

  // 3. Aggregate Performance Metrics
  const stats = shouldLoadPrivate
    ? await prisma.strategy.aggregate({
        where: { authorId: userId as string },
        _sum: { impressions: true },
        _avg: { engagement: true },
        _count: { id: true },
      })
    : { _sum: { impressions: null }, _avg: { engagement: null }, _count: { id: 0 } };

  const viralHits = shouldLoadPrivate
    ? await prisma.strategy.count({
        where: { authorId: userId as string, rating: "VIRAL" },
      })
    : 0;

  return {
    recentActivity,
    moltbookTrends,
    performanceMetrics: {
      totalImpressions: stats._sum.impressions || 0,
      avgEngagement: stats._avg.engagement || 0,
      viralHits
    }
  };
}
