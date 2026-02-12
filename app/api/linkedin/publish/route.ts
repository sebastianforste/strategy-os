/**
 * LINKEDIN PUBLISH API ROUTE (Idempotent)
 * --------------------------------------
 * Unified publishing via PublishEngine. Requires OAuth connection.
 */

import { NextResponse } from "next/server";
import { z } from "zod";

import { authOptions } from "@/utils/auth";
import { HttpError, jsonError, parseJson, rateLimit, requireSessionForRequest } from "@/utils/request-guard";
import { publishStrategy } from "@/utils/publish-engine";
import { prisma } from "@/utils/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const session = await requireSessionForRequest(req, authOptions);
    await rateLimit({ key: `linkedin_publish:${session.user.id}`, limit: 10, windowMs: 60_000 });

    const { content, strategyId } = await parseJson(
      req,
      z
        .object({
          content: z.string().min(1).max(40_000),
          strategyId: z.string().max(64).optional(),
        })
        .strict(),
    );

    let resolvedStrategyId = (strategyId || "").trim();
    if (!resolvedStrategyId) {
      const created = await prisma.strategy.create({
        data: {
          content,
          title: content.split("\n")[0]?.slice(0, 80) || "Untitled Strategy",
          platform: "LINKEDIN",
          authorId: session.user.id,
          isPublished: false,
          mode: "ghost_protocol",
          persona: "cso",
          input: content.slice(0, 200),
          assets: {},
        },
        select: { id: true },
      });
      resolvedStrategyId = created.id;
    }

    const result = await publishStrategy({
      strategyId: resolvedStrategyId,
      platform: "LINKEDIN",
      userId: session.user.id,
      content,
      requestId: req.headers.get("x-request-id"),
    });

    if (result.status === "in_progress") {
      return NextResponse.json({ success: false, error: "Publish in progress." }, { status: 409 });
    }

    return NextResponse.json({
      success: true,
      strategyId: resolvedStrategyId,
      postId: result.externalId,
      postUrl: result.url,
      message: result.status === "already_published" ? "Already published." : "Published successfully.",
    });
  } catch (e) {
    if (e instanceof HttpError) return jsonError(e.status, e.message, e.code);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
