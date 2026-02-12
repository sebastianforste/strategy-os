import { NextResponse } from "next/server";
import { prisma } from "../../../../utils/db";
import { logger } from "../../../../utils/logger";
import { authOptions } from "@/utils/auth";
import { HttpError, jsonError, rateLimit, requireSessionForRequest } from "@/utils/request-guard";

const log = logger.scope("API/Analytics/Dashboard");

export async function GET(req: Request) {
  try {
    const session = await requireSessionForRequest(req, authOptions);
    await rateLimit({ key: `analytics_dashboard:${session.user.id}`, limit: 60, windowMs: 60_000 });

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { 
          strategies: { 
              orderBy: { createdAt: 'desc' },
              where: { isPublished: true }
          } 
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Transform Prisma strategies to Analytics format
    // Note: We're mapping 'impressions', 'engagement' (rate), etc.
    // Ideally we would also fetch FRESH analytics for each here, but that's too slow.
    // We rely on 'api/linkedin/analytics' being called individually or background jobs.
    // For now, we return what's in the DB.

    // Transform Prisma strategies to Analytics format
    const strategies = user.strategies.map(s => {
        const perf = {
            impressions: s.impressions || 0,
            likes: 0, 
            comments: 0,
            reposts: 0,
            saves: (s as any).saves || 0,
            shares: (s as any).shares || 0,
            reach: (s as any).reach || 0,
            dwellScore: (s as any).dwellScore || 0.0,
            engagementRate: s.engagement || 0,
            capturedAt: new Date().toISOString()
        };

        return {
            id: s.id,
            topic: s.title || "Untitled Strategy",
            content: s.content,
            platform: s.platform.toLowerCase(),
            timestamp: s.createdAt.toISOString(),
            type: "post",
            persona: s.persona,
            performance: perf
        };
    });

    // Calculate aggregate stats
    const totalImpressions = strategies.reduce((acc: number, s: any) => acc + (s.performance.impressions || 0), 0);
    const avgEngagement = strategies.length > 0 
        ? strategies.reduce((acc: number, s: any) => acc + (s.performance.engagementRate || 0), 0) / strategies.length 
        : 0;
    const totalSaves = strategies.reduce((acc: number, s: any) => acc + (s.performance.saves || 0), 0);

    // Top Performers (by Engagement Rate)
    const topPerformers = [...strategies]
        .sort((a, b) => b.performance.engagementRate - a.performance.engagementRate)
        .slice(0, 5);

    return NextResponse.json({
        topPerformers,
        averageEngagement: Math.round(avgEngagement * 100) / 100, // Round to 2 decimals
        trendingTopics: topPerformers.map(p => p.topic),
        recommendations: [] // We can implement AI recommendations here later if needed
    });

  } catch (error) {
    if (error instanceof HttpError) {
      return jsonError(error.status, error.message, error.code);
    }
    log.error("Dashboard analytics error", error as Error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
