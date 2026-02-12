import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/utils/db";
import { authOptions } from "@/utils/auth";
import type { HistoryItem } from "@/utils/history-service";
import type { StrategyRating } from "@prisma/client";
import { z } from "zod";

import { HttpError, jsonError, parseJson, rateLimit, requireSessionForRequest } from "@/utils/request-guard";

function toDbRating(input?: string | null): StrategyRating | null {
  const value = (input || "").trim().toLowerCase();
  if (!value) return null;
  if (value === "viral") return "VIRAL";
  if (value === "good") return "GOOD";
  if (value === "meh") return "MEH";
  if (value === "flopped") return "FLOPPED";
  return null;
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireSessionForRequest(req, authOptions);
    await rateLimit({ key: `migrate_history:${session.user.id}`, limit: 5, windowMs: 60_000 });

    const { historyItems } = await parseJson(
      req as any,
      z
        .object({
          historyItems: z.array(z.any()).min(1).max(200),
        })
        .strict(),
    );

    let migrated = 0;
    let failed = 0;

    for (const item of historyItems as HistoryItem[]) {
      try {
        await prisma.strategy.create({
          data: {
            id: item.id,
            content: item.assets.textPost || "Untitled Strategy",
            title: item.input.substring(0, 50) + (item.input.length > 50 ? "..." : ""),
            platform: "LINKEDIN",
            persona: item.personaId || "cso",
            input: item.input,
            assets: item.assets as any,
            rating: toDbRating(item.performance?.rating || null),
            impressions: item.performance?.engagement?.impressions || 0,
            engagement: (item.performance?.engagement?.likes || 0) + (item.performance?.engagement?.comments || 0),
            saves: 0,
            shares: item.performance?.engagement?.shares || 0,
            status: "DRAFT",
            isPublished: false,
            authorId: session.user.id,
            createdAt: new Date(item.createdAt),
          },
        });
        migrated++;
      } catch (e) {
        console.error("Failed to migrate item:", item.id, e);
        failed++;
      }
    }

    return NextResponse.json({
      success: true,
      migrated,
      failed,
      message: `Migrated ${migrated} items, ${failed} failed.`
    });
  } catch (error) {
    if (error instanceof HttpError) {
      return jsonError(error.status, error.message, error.code);
    }
    console.error("Migration API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
