"use server";

import { prisma } from "../utils/db";
import { moltbookService } from "../utils/moltbook-service";
import { getServerSession } from "next-auth/next";

export type MissionActivity = {
  id: string;
  type: "generation" | "publish" | "system";
  action: string;
  timestamp: Date;
  status: "idle" | "running" | "error" | "complete";
  metadata?: any;
};

export type DashboardData = {
  recentActivity: MissionActivity[];
  moltbookTrends: any[];
  performanceMetrics: {
    totalImpressions: number;
    avgEngagement: number;
    viralHits: number;
  };
};

export async function getMissionControlData(): Promise<DashboardData> {
  const session = await getServerSession();
  
  // 1. Fetch Recent Activity from Strategies & Logs
  const [strategies, logs] = await Promise.all([
    prisma.strategy.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        createdAt: true,
        isPublished: true,
        score: true,
        platform: true,
      }
    }),
    prisma.auditLog.findMany({
      take: 20,
      orderBy: { createdAt: "desc" },
    })
  ]);

  const recentActivity: MissionActivity[] = [
    ...strategies.map(s => ({
      id: s.id,
      type: "generation" as const,
      action: `Generated: ${s.title || "Untitled Strategy"}`,
      timestamp: s.createdAt,
      status: s.isPublished ? "complete" as const : "idle" as const,
      metadata: { platform: s.platform, score: s.score }
    })),
    ...logs.map(l => ({
      id: l.id,
      type: "system" as const,
      action: l.action,
      timestamp: l.createdAt,
      status: l.action.includes("error") ? "error" as const : "complete" as const,
      metadata: l.metadata
    }))
  ].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 15);

  // 2. Fetch Moltbook Trends
  let moltbookTrends: any[] = [];
  try {
    const trends = await moltbookService.getTrending("strategy");
    moltbookTrends = trends.slice(0, 5);
  } catch (e) {
    console.warn("[MissionControl] Failed to fetch Moltbook trends:", e);
  }

  // 3. Aggregate Performance Metrics
  const stats = await prisma.strategy.aggregate({
    _sum: { impressions: true },
    _avg: { engagement: true },
    _count: { id: true }
  });

  const viralHits = await prisma.strategy.count({
    where: { rating: "viral" }
  });

  return {
    recentActivity,
    moltbookTrends,
    performanceMetrics: {
      totalImpressions: stats._sum.impressions || 0,
      avgEngagement: stats._avg.engagement || 0,
      viralHits
    }
  };
}
