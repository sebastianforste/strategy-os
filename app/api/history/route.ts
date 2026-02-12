import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/utils/db";
import { authOptions } from "@/utils/auth";
import { z } from "zod";
import type { StrategyRating } from "@prisma/client";

import { HttpError, jsonError, parseJson, rateLimit, requireSessionForRequest } from "@/utils/request-guard";
const CitationSchema = z
  .object({
    id: z.string().min(1).max(512),
    source: z.enum(["web", "pdf", "knowledge", "memory", "voice", "style"]),
    title: z.string().max(500).optional(),
    url: z.string().url().max(2048).optional(),
    createdAt: z.string().max(64).optional(),
    chunkIndex: z.number().int().nonnegative().optional(),
    start: z.number().int().nonnegative().optional(),
    end: z.number().int().nonnegative().optional(),
  })
  .strict();

function toDbRating(input?: string | null): StrategyRating | null {
  const value = (input || "").trim().toLowerCase();
  if (!value) return null;
  if (value === "viral") return "VIRAL";
  if (value === "good") return "GOOD";
  if (value === "meh") return "MEH";
  if (value === "flopped") return "FLOPPED";
  return null;
}

function fromDbRating(input?: StrategyRating | string | null): "viral" | "good" | "meh" | "flopped" | null {
  if (!input) return null;
  const value = String(input).trim().toUpperCase();
  if (value === "VIRAL") return "viral";
  if (value === "GOOD") return "good";
  if (value === "MEH") return "meh";
  if (value === "FLOPPED") return "flopped";
  return null;
}

export async function GET(req: NextRequest) {
  try {
    const session = await requireSessionForRequest(req, authOptions);

    await rateLimit({ key: `history_get:${session.user.id}`, limit: 120, windowMs: 60_000 });

    const strategies = await prisma.strategy.findMany({
      where: {
        authorId: session.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Map back to HistoryItem format for frontend compatibility
    const history = strategies.map(s => ({
      id: s.id,
      workspaceId: "default",
      createdAt: s.createdAt.getTime(),
      input: s.input,
      personaId: s.persona,
      assets: (s.assets || {}) as any,
      performance: {
          rating: fromDbRating(s.rating as any),
          engagement: {
              likes: (s.engagement || 0) as number, // Simplified mapping
              comments: 0,
              shares: s.shares || 0,
              impressions: s.impressions || 0,
          },
          markedAt: s.updatedAt.getTime()
      }
    }));

    return NextResponse.json({ success: true, history });
  } catch (error) {
    console.error("History API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await requireSessionForRequest(req, authOptions);

    await rateLimit({ key: `history_create:${session.user.id}`, limit: 60, windowMs: 60_000 });

    const body = await parseJson(
      req,
      z
        .object({
          input: z.string().min(1).max(40_000),
          personaId: z.string().max(64).optional(),
          platform: z.enum(["LINKEDIN", "TWITTER", "BOTH"]).optional(),
          title: z.string().max(200).optional(),
          assets: z
            .object({
              textPost: z.string().max(40_000).optional(),
              imagePrompt: z.string().max(20_000).optional(),
              videoScript: z.string().max(40_000).optional(),
              xThread: z.array(z.string().max(4000)).optional(),
              substackEssay: z.string().max(80_000).optional(),
              audioScript: z.string().max(40_000).optional(),
              imageUrl: z.string().max(2048).optional(),
              thumbnailPrompt: z.string().max(20_000).optional(),
              visualConcept: z.string().max(200).optional(),
              ragConcepts: z.array(z.string().max(500)).optional(),
              citations: z.array(CitationSchema).max(30).optional(),
            })
            .strict(),
        })
        .strict(),
    );

    const persona = (body.personaId || "cso").toString();
    const platform = body.platform || "LINKEDIN";
    const content = (body.assets?.textPost || "").toString();
    const fallbackTitle =
      (body.title || "").trim() ||
      content.split("\n")[0]?.trim().slice(0, 80) ||
      body.input.slice(0, 80);

    const strategy = await prisma.strategy.create({
      data: {
        content: content || "Untitled Strategy",
        title: fallbackTitle || "Untitled Strategy",
        platform,
        persona,
        input: body.input,
        assets: (body.assets || {}) as any,
        status: "DRAFT",
        isPublished: false,
        authorId: session.user.id,
      },
    });

    return NextResponse.json(
      {
        success: true,
        item: {
          id: strategy.id,
          workspaceId: "default",
          createdAt: strategy.createdAt.getTime(),
          input: strategy.input,
          personaId: strategy.persona,
          assets: (strategy.assets || {}) as any,
          performance: {
            rating: fromDbRating(strategy.rating as any),
            engagement: {
              likes: (strategy.engagement || 0) as number,
              comments: 0,
              shares: strategy.shares || 0,
              impressions: strategy.impressions || 0,
            },
            markedAt: strategy.updatedAt.getTime(),
          },
        },
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof HttpError) {
      return jsonError(error.status, error.message, error.code);
    }
    console.error("History POST Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await requireSessionForRequest(req, authOptions);

    await rateLimit({ key: `history_patch:${session.user.id}`, limit: 120, windowMs: 60_000 });

    const body = await parseJson(
      req,
      z
        .object({
          id: z.string().min(1).max(128),
          performance: z
            .object({
              rating: z.enum(["viral", "good", "meh", "flopped"]).nullable(),
              engagement: z
                .object({
                  likes: z.number().int().nonnegative(),
                  comments: z.number().int().nonnegative(),
                  shares: z.number().int().nonnegative(),
                  impressions: z.number().int().nonnegative(),
                })
                .optional(),
              markedAt: z.number().int().optional(),
              notes: z.string().max(2000).optional(),
            })
            .partial(),
        })
        .strict(),
    );

    const rating = body.performance?.rating;
    const engagement = body.performance?.engagement;

    const updated = await prisma.strategy.updateMany({
      where: { id: body.id, authorId: session.user.id },
      data: {
        ...(typeof rating !== "undefined" ? { rating: toDbRating(rating) } : {}),
        ...(engagement
          ? {
              impressions: engagement.impressions,
              shares: engagement.shares,
              engagement: engagement.likes + engagement.comments,
            }
          : {}),
      },
    });

    if (updated.count === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof HttpError) {
      return jsonError(error.status, error.message, error.code);
    }
    console.error("History PATCH Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
