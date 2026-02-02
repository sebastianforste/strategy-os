/**
 * LINKEDIN PUBLISH API ROUTE
 * --------------------------
 * Phase 17.3: Server-side LinkedIn publishing endpoint
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { createPost, getCurrentUserProfile } from "../../../../utils/linkedin-api-v2";
import { prisma } from "../../../../utils/db";
import { logger } from "../../../../utils/logger";

const log = logger.scope("API/LinkedIn");

export async function POST(request: NextRequest) {
  try {
    // Get authenticated session
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get request body
    const body = await request.json();
    const { content, visibility = "PUBLIC", strategyId } = body;

    if (!content) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }

    // Get user's LinkedIn token from database
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

    const linkedInAccount = user.accounts[0];
    const accessToken = linkedInAccount.access_token;

    if (!accessToken) {
      return NextResponse.json(
        { error: "LinkedIn token expired. Please reconnect." },
        { status: 401 }
      );
    }

    // Get user's person URN
    const profile = await getCurrentUserProfile(accessToken);
    if (!profile) {
      return NextResponse.json(
        { error: "Could not get LinkedIn profile" },
        { status: 500 }
      );
    }

    // Create post
    const result = await createPost(accessToken, profile.personUrn, content, visibility);

    if (!result.success) {
      log.error("LinkedIn publish failed", undefined, { error: result.error });
      return NextResponse.json(
        { error: result.error || "Failed to publish" },
        { status: 500 }
      );
    }

    // Update strategy if provided
    if (strategyId && result.postId) {
      await prisma.strategy.update({
        where: { id: strategyId },
        data: {
          isPublished: true,
          publishedAt: new Date(),
          externalId: result.postId,
          platform: "LINKEDIN",
        },
      });
    }

    // Log audit
    await prisma.auditLog.create({
      data: {
        action: "linkedin_post_published",
        actor: session.user.email,
        metadata: {
          postId: result.postId,
          strategyId,
          contentLength: content.length,
        },
      },
    });

    log.info("LinkedIn post published", { postId: result.postId, userId: user.id });

    return NextResponse.json({
      success: true,
      postId: result.postId,
      postUrl: `https://www.linkedin.com/feed/update/${result.postId}`,
    });
  } catch (error) {
    log.error("LinkedIn publish error", error as Error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
