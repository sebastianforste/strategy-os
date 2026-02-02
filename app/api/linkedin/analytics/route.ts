/**
 * LINKEDIN ANALYTICS API ROUTE
 * ----------------------------
 * Phase 17.3: Fetch engagement data for published posts
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { getPostAnalytics, getPostComments } from "../../../../utils/linkedin-api-v2";
import { prisma } from "../../../../utils/db";
import { logger } from "../../../../utils/logger";

const log = logger.scope("API/LinkedIn/Analytics");

export async function GET(request: NextRequest) {
  try {
    // Get authenticated session
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get query params
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get("postId");
    const strategyId = searchParams.get("strategyId");

    if (!postId && !strategyId) {
      return NextResponse.json(
        { error: "postId or strategyId is required" },
        { status: 400 }
      );
    }

    // Get user's LinkedIn token
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        accounts: {
          where: { provider: "linkedin" },
        },
      },
    });

    if (!user || user.accounts.length === 0) {
      return NextResponse.json(
        { error: "LinkedIn account not connected" },
        { status: 400 }
      );
    }

    const accessToken = user.accounts[0].access_token;
    if (!accessToken) {
      return NextResponse.json(
        { error: "LinkedIn token expired" },
        { status: 401 }
      );
    }

    // If strategyId provided, get postId from database
    let targetPostId = postId;
    if (strategyId && !postId) {
      const strategy = await prisma.strategy.findUnique({
        where: { id: strategyId },
      });
      if (!strategy?.externalId) {
        return NextResponse.json(
          { error: "Strategy not published" },
          { status: 400 }
        );
      }
      targetPostId = strategy.externalId;
    }

    if (!targetPostId) {
      return NextResponse.json(
        { error: "No post ID found" },
        { status: 400 }
      );
    }

    // Fetch analytics and comments in parallel
    const [analytics, comments] = await Promise.all([
      getPostAnalytics(accessToken, targetPostId),
      getPostComments(accessToken, targetPostId, 10),
    ]);

    if (!analytics) {
      return NextResponse.json(
        { error: "Could not fetch analytics" },
        { status: 500 }
      );
    }

    // Update strategy with latest metrics
    if (strategyId) {
      await prisma.strategy.update({
        where: { id: strategyId },
        data: {
          impressions: analytics.impressions,
          engagement: analytics.engagementRate,
        },
      });
    }

    log.info("Analytics fetched", { postId: targetPostId, impressions: analytics.impressions });

    return NextResponse.json({
      analytics,
      comments,
      postId: targetPostId,
    });
  } catch (error) {
    log.error("Analytics error", error as Error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
