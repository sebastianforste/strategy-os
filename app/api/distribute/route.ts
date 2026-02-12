import { NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";

import { prisma } from "@/utils/db";
import { authOptions } from "@/utils/auth";
import { HttpError, jsonError, parseJson, rateLimit, requireSessionForRequest } from "@/utils/request-guard";
import { publishStrategy } from "@/utils/publish-engine";
import { moltbookService } from "@/utils/moltbook-service";

const DistributeSchema = z
  .object({
    platform: z.enum(["linkedin", "twitter", "x", "substack", "discord", "slack", "moltbook"]),
    content: z.string().min(1).max(40_000),
    imageUrl: z.string().max(2048).optional(),
    persona: z.string().max(64).optional(),
    title: z.string().max(200).optional(),
    strategyId: z.string().max(64).optional(),
    idempotencyKey: z.string().max(200).optional(),
  })
  .strict();

export async function POST(req: Request) {
  try {
    const session = await requireSessionForRequest(req, authOptions);
    await rateLimit({ key: `distribute:${session.user.id}`, limit: 10, windowMs: 60_000 });

    const body = await parseJson(req, DistributeSchema);
    const requestId = req.headers.get("x-request-id");
    const effectiveTitle = (body.title || "").trim() || body.content.slice(0, 80) || "Untitled Strategy";

    // Strategy-linked, idempotent publishing (LinkedIn + X/Twitter).
    if (body.platform === "linkedin" || body.platform === "twitter" || body.platform === "x") {
      const isLinkedIn = body.platform === "linkedin";

      let strategyId = (body.strategyId || "").trim();
      if (!strategyId) {
        // Best-effort reuse to avoid duplicates on retries/double-clicks.
        const existing = await prisma.strategy.findFirst({
          where: {
            authorId: session.user.id,
            isPublished: false,
            content: body.content,
            platform: isLinkedIn ? "LINKEDIN" : "TWITTER",
          },
          orderBy: { createdAt: "desc" },
          select: { id: true },
        });

        if (existing?.id) {
          strategyId = existing.id;
        } else {
          const created = await prisma.strategy.create({
            data: {
              content: body.content,
              title: effectiveTitle,
              platform: isLinkedIn ? "LINKEDIN" : "TWITTER",
              authorId: session.user.id,
              isPublished: false,
              mode: "ghost_protocol",
              persona: body.persona || "cso",
              input: body.content.slice(0, 200),
              assets: {},
            },
            select: { id: true },
          });
          strategyId = created.id;
        }
      }

      const derivedKey = `publish:${strategyId}:${isLinkedIn ? "LINKEDIN" : "TWITTER"}:${crypto
        .createHash("sha256")
        .update(body.content)
        .digest("hex")
        .slice(0, 16)}`;

      const result = await publishStrategy({
        strategyId,
        platform: isLinkedIn ? "LINKEDIN" : "TWITTER",
        userId: session.user.id,
        content: body.content,
        imageUrl: body.imageUrl,
        requestId,
        idempotencyKey: body.idempotencyKey || derivedKey,
      });

      if (result.status === "in_progress") {
        return NextResponse.json(
          { success: false, error: "Publish in progress. Please retry shortly.", strategyId },
          { status: 409 },
        );
      }

      return NextResponse.json({
        success: true,
        platform: body.platform,
        strategyId,
        postId: result.externalId,
        url: result.url,
        message: result.status === "already_published" ? "Already published." : "Published successfully.",
      });
    }

    // Webhooks (no strategy persistence).
    if (body.platform === "discord" || body.platform === "slack") {
      const webhookUrl =
        body.platform === "discord" ? process.env.DISCORD_WEBHOOK_URL : process.env.SLACK_WEBHOOK_URL;

      if (!webhookUrl) {
        return NextResponse.json(
          {
            success: true,
            platform: body.platform,
            postId: `mock-webhook-${Date.now()}`,
            message: `MOCK: Content sent to ${body.platform} (no webhook configured).`,
          },
          { status: 200 },
        );
      }

      const messagePayload =
        body.platform === "slack"
          ? { text: `*StrategyOS Distribution*\n\n${body.content}` }
          : {
              content: `**StrategyOS Distribution**\n\n${body.content}`,
              embeds: body.imageUrl ? [{ image: { url: body.imageUrl } }] : [],
            };

      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(messagePayload),
      });

      if (!response.ok) {
        return NextResponse.json(
          { success: false, error: `${body.platform.toUpperCase()} webhook returned ${response.status}` },
          { status: 502 },
        );
      }

      return NextResponse.json({
        success: true,
        platform: body.platform,
        postId: `hook-${Date.now()}`,
        message: `Successfully pushed to ${body.platform}.`,
      });
    }

    // Moltbook (no strategy persistence yet).
    if (body.platform === "moltbook") {
      const submolt = "strategy";
      const result = await moltbookService.postToMoltbook(body.content, submolt);
      if (!result.success) {
        return NextResponse.json({ success: false, error: result.error || "Moltbook post failed" }, { status: 502 });
      }
      const id = result.data?.id || `molt-${Date.now()}`;
      return NextResponse.json({
        success: true,
        platform: body.platform,
        postId: id,
        url: result.data?.id ? `https://www.moltbook.com/post/${result.data.id}` : "https://www.moltbook.com",
        message: "Published successfully to Moltbook.",
      });
    }

    // Substack is mock for now.
    if (body.platform === "substack") {
      await new Promise((r) => setTimeout(r, 250));
      return NextResponse.json({
        success: true,
        platform: body.platform,
        postId: `mock-subs-${Date.now()}`,
        message: "Substack draft simulated. Use 'Copy for Substack' in the UI for optimal results.",
      });
    }

    return NextResponse.json({ success: false, error: "Unsupported platform" }, { status: 400 });
  } catch (e) {
    if (e instanceof HttpError) {
      return jsonError(e.status, e.message, e.code);
    }
    return NextResponse.json(
      { success: false, error: e instanceof Error ? e.message : "Distribution server error" },
      { status: 500 },
    );
  }
}
