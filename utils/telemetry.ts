import "server-only";

import { Prisma } from "@prisma/client";
import { prisma } from "./db";
import { logger } from "./logger";

export type TelemetryKind =
  | "rate_limited"
  | "generation_started"
  | "generation_completed"
  | "generation_failed"
  | "rag_retrieval"
  | "data_corruption";

export async function emitTelemetryEvent(args: {
  kind: TelemetryKind | string;
  authorId?: string | null;
  teamId?: string | null;
  requestId?: string | null;
  route?: string | null;
  status?: number | null;
  latencyMs?: number | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata?: Record<string, any> | null;
}): Promise<void> {
  try {
    await prisma.telemetryEvent.create({
      data: {
        kind: args.kind,
        authorId: args.authorId ?? null,
        teamId: args.teamId ?? null,
        requestId: args.requestId ?? null,
        route: args.route ?? null,
        status: args.status ?? null,
        latencyMs: args.latencyMs ?? null,
        metadata:
          args.metadata === null
            ? Prisma.DbNull
            : args.metadata === undefined
              ? undefined
              : args.metadata,
      },
    });
  } catch (e) {
    logger
      .scope("Telemetry")
      .warn("Failed to emit telemetry event (best-effort).", { kind: args.kind });
  }
}
