import { NextResponse } from "next/server";

import { prisma } from "@/utils/db";
import { authOptions } from "@/utils/auth";
import { assertE2EToken, HttpError, jsonError, requireSessionForRequest } from "@/utils/request-guard";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    // Concealment + hard gating.
    assertE2EToken(req);

    const session = await requireSessionForRequest(req, authOptions);
    const userId = session.user.id;
    const email = session.user.email || null;

    const strategyIds = await prisma.strategy.findMany({
      where: { authorId: userId },
      select: { id: true },
    });
    const ids = strategyIds.map((s) => s.id);

    await prisma.$transaction([
      prisma.strategyPublication.deleteMany({ where: { strategyId: { in: ids } } }),
      prisma.publishAttempt.deleteMany({ where: { strategyId: { in: ids } } }),
      prisma.strategyVersion.deleteMany({ where: { strategyId: { in: ids } } }),
      prisma.strategy.deleteMany({ where: { authorId: userId } }),
      prisma.telemetryEvent.deleteMany({ where: { authorId: userId } }),
      ...(email ? [prisma.auditLog.deleteMany({ where: { actor: email } })] : []),
    ]);

    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof HttpError) {
      return jsonError(e.status, e.message, e.code);
    }
    return NextResponse.json({ error: "Reset failed" }, { status: 500 });
  }
}
