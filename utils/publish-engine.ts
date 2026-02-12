import "server-only";

import { prisma } from "./db";
import { emitTelemetryEvent } from "./telemetry";
import { logger } from "./logger";
import { createPost, createPostWithImage, getCurrentUserProfile } from "./linkedin-api-v2";
import { postThread, postTweet } from "./twitter-api";
import { splitIntoTweets } from "./platforms/twitter-api";
import type { PublishPlatform } from "@prisma/client";
import { HttpError } from "./request-guard";

const log = logger.scope("PublishEngine");

function normalizePlatform(input: string): PublishPlatform | null {
  const v = (input || "").trim().toLowerCase();
  if (v === "linkedin") return "LINKEDIN";
  if (v === "twitter" || v === "x") return "TWITTER";
  if (v === "substack") return "SUBSTACK";
  if (v === "discord") return "DISCORD";
  if (v === "slack") return "SLACK";
  if (v === "moltbook") return "MOLTBOOK";
  return null;
}

async function sleep(ms: number) {
  await new Promise((r) => setTimeout(r, ms));
}

export type PublishEngineResult =
  | { status: "already_published"; strategyId: string; platform: PublishPlatform; externalId: string; url: string }
  | { status: "published"; strategyId: string; platform: PublishPlatform; externalId: string; url: string }
  | { status: "in_progress"; strategyId: string; platform: PublishPlatform };

export async function publishStrategy(args: {
  strategyId: string;
  platform: PublishPlatform | string;
  userId: string;
  content: string;
  imageUrl?: string;
  requestId?: string | null;
  idempotencyKey?: string;
}): Promise<PublishEngineResult> {
  const platform = typeof args.platform === "string" ? (normalizePlatform(args.platform) as PublishPlatform | null) : args.platform;
  if (!platform) {
    throw new HttpError(400, "Unsupported platform");
  }

  const isTestMode = process.env.PUBLISH_ENGINE_TEST_MODE === "true" && process.env.NODE_ENV !== "production";

  // Idempotency is strategy+platform by default.
  const idempotencyKey = (args.idempotencyKey || `publish:${args.strategyId}:${platform}`).slice(0, 200);

  // Fast-path: already published for this strategy+platform.
  const existingPub = await prisma.strategyPublication.findUnique({
    where: { strategyId_platform: { strategyId: args.strategyId, platform } },
  });
  if (existingPub) {
    return {
      status: "already_published",
      strategyId: args.strategyId,
      platform,
      externalId: existingPub.externalId,
      url: existingPub.url,
    };
  }

  const startedAt = Date.now();

  // Create or join an attempt record (acts as a cross-instance lock).
  try {
    await prisma.publishAttempt.create({
      data: {
        idempotencyKey,
        strategyId: args.strategyId,
        platform,
        status: "PENDING",
        attemptCount: 0,
        requestId: args.requestId ?? null,
      },
    });
  } catch {
    // Someone else created it. Poll briefly for success.
    for (let i = 0; i < 12; i += 1) {
      const pub = await prisma.strategyPublication.findUnique({
        where: { strategyId_platform: { strategyId: args.strategyId, platform } },
      });
      if (pub) {
        return { status: "already_published", strategyId: args.strategyId, platform, externalId: pub.externalId, url: pub.url };
      }
      await sleep(250);
    }
    return { status: "in_progress", strategyId: args.strategyId, platform };
  }

  // Only emit "started" after we successfully acquire the attempt lock.
  await emitTelemetryEvent({
    kind: "publish_started",
    authorId: args.userId,
    requestId: args.requestId ?? null,
    route: "/publish-engine",
    metadata: { strategyId: args.strategyId, platform },
  });

  // Verify ownership before calling external APIs.
  const strategy = await prisma.strategy.findUnique({ where: { id: args.strategyId }, select: { id: true, authorId: true } });
  if (!strategy || strategy.authorId !== args.userId) {
    await prisma.publishAttempt.update({
      where: { idempotencyKey },
      data: { status: "FAILED", error: "Unauthorized", attemptCount: { increment: 1 } },
    });
    await emitTelemetryEvent({
      kind: "publish_failed",
      authorId: args.userId,
      requestId: args.requestId ?? null,
      route: "/publish-engine",
      status: 403,
      latencyMs: Date.now() - startedAt,
      metadata: { strategyId: args.strategyId, platform, message: "Unauthorized" },
    });
    throw new HttpError(403, "Unauthorized");
  }

  try {
    let externalId = "";
    let url = "";

    if (isTestMode) {
      externalId = `test-${platform.toLowerCase()}-${args.strategyId}`;
      url = `https://example.test/${platform.toLowerCase()}/${externalId}`;
    } else if (platform === "LINKEDIN") {
      const account = await prisma.account.findFirst({
        where: { userId: args.userId, provider: "linkedin" },
        select: { access_token: true },
      });
      const accessToken = (account?.access_token || "").trim();
      if (!accessToken) throw new HttpError(400, "LinkedIn account not connected");

      const profile = await getCurrentUserProfile(accessToken);
      if (!profile?.personUrn) throw new HttpError(502, "Could not resolve LinkedIn profile");

      const result = args.imageUrl
        ? await createPostWithImage(accessToken, profile.personUrn, args.content, args.imageUrl, "PUBLIC")
        : await createPost(accessToken, profile.personUrn, args.content, "PUBLIC");
      if (!result.success || !result.postId) throw new HttpError(502, result.error || "LinkedIn publish failed");

      externalId = result.postId;
      url = `https://www.linkedin.com/feed/update/${externalId}`;
    } else if (platform === "TWITTER") {
      const account = await prisma.account.findFirst({
        where: { userId: args.userId, provider: "twitter" },
        select: { access_token: true },
      });
      const accessToken = (account?.access_token || "").trim();
      if (!accessToken) throw new HttpError(400, "Twitter/X account not connected");

      const tweets = splitIntoTweets(args.content);
      if (tweets.length <= 1) {
        const r = await postTweet(accessToken, (tweets[0] || args.content).slice(0, 280));
        if (!r.success || !r.tweetId) throw new HttpError(502, r.error || "Tweet failed");
        externalId = r.tweetId;
      } else {
        const r = await postThread(accessToken, tweets);
        if (!r.success || !r.tweetIds?.[0]) throw new HttpError(502, r.error || "Thread failed");
        externalId = r.tweetIds[0];
      }
      url = `https://x.com/i/status/${externalId}`;
    } else {
      throw new HttpError(400, `PublishEngine does not support platform ${platform} yet`);
    }

    await prisma.$transaction(async (tx) => {
      await tx.strategyPublication.create({
        data: { strategyId: args.strategyId, platform, externalId, url },
      });
      await tx.strategy.update({
        where: { id: args.strategyId },
        data: {
          isPublished: true,
          publishedAt: new Date(),
          // Keep legacy columns populated for existing analytics/UI.
          externalId,
        },
      });
      await tx.publishAttempt.update({
        where: { idempotencyKey },
        data: {
          status: "SUCCEEDED",
          attemptCount: { increment: 1 },
          externalId,
          url,
          error: null,
        },
      });
    });

    await emitTelemetryEvent({
      kind: "publish_completed",
      authorId: args.userId,
      requestId: args.requestId ?? null,
      route: "/publish-engine",
      status: 200,
      latencyMs: Date.now() - startedAt,
      metadata: { strategyId: args.strategyId, platform, externalId },
    });

    log.info("Published", { strategyId: args.strategyId, platform, externalId });
    return { status: "published", strategyId: args.strategyId, platform, externalId, url };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown publish error";
    await prisma.publishAttempt.update({
      where: { idempotencyKey },
      data: { status: "FAILED", attemptCount: { increment: 1 }, error: message },
    });
    await emitTelemetryEvent({
      kind: "publish_failed",
      authorId: args.userId,
      requestId: args.requestId ?? null,
      route: "/publish-engine",
      status: 500,
      latencyMs: Date.now() - startedAt,
      metadata: { strategyId: args.strategyId, platform, message },
    });
    throw e;
  }
}
