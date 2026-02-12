/**
 * ANALYTICS SERVICE - Intelligence Feedback Loop
 * -----------------------------------------------
 * Analyzes historical performance and provides AI-driven recommendations.
 */

import { GoogleGenAI } from "@google/genai";
import { ArchivedStrategy, getTopPerformers, getArchivedStrategies } from "./archive-service";
import { AI_CONFIG } from "./config";
import { prisma } from "./db";
import { calculateReadability, analyzeSignaturePhrases } from "./analytics-helpers";

/**
 * PHASE 24: VIRALITY ENGINE V2
 * Predicts the potential performance of a draft based on historical success patterns and qualitative AI critique.
 */
export async function getViralityPrediction(content: string, personaId: string, apiKey: string): Promise<{ 
    score: number; 
    confidence: number; 
    hooks: string[];
    critique: string;
    breakdown: { hook: number; strategy: number; formatting: number }
}> {
    const historicalSuccess = await prisma.strategy.findMany({
        where: {
            persona: personaId,
            rating: "VIRAL"
        },
        take: 3
    });

    // --- HEURISTICS (Phase 24) ---
    const wordCount = content.split(/\s+/).length;
    const readability = calculateReadability(content);
    const hasForbiddenWords = /delve|leverage|unleash/i.test(content);

    let baseScore = 70;
    if (wordCount < 50) baseScore -= 10;
    if (readability < 60) baseScore += 15; // Higher readability = more viral
    if (hasForbiddenWords) baseScore -= 30;

    // Qualitative AI Critique (Hybrid Approach)
    const genAI = new (await import("@google/genai")).GoogleGenAI({ apiKey });
    
    const prompt = `
    Analyze this LinkedIn draft for a "${personaId}" persona.
    Predict virality based on historical performance patterns (Current Benchmark: ${historicalSuccess.length > 0 ? "High" : "Average"}).
    
    DRAFT:
    "${content}"
    
    RETURN JSON ONLY:
    {
        "aiScore": number, // 0-100
        "critique": "One specific sentence on why this works/fails",
        "betterHooks": ["Hook 1", "Hook 2"],
        "breakdown": { "hook": number, "strategy": number, "formatting": number }
    }
    `;

    try {
        const result = await genAI.models.generateContent({
            model: AI_CONFIG.staticPrimaryModel,
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });
        const aiResponse = JSON.parse(result.text || "{}");
        
        const finalScore = Math.round((baseScore * 0.4) + (aiResponse.aiScore * 0.6));

        return {
            score: Math.min(Math.max(finalScore, 0), 100),
            confidence: historicalSuccess.length > 0 ? 0.95 : 0.7,
            hooks: aiResponse.betterHooks || ["Start with a negative qualifier"],
            critique: aiResponse.critique || "Strategic alignment confirmed.",
            breakdown: aiResponse.breakdown || { hook: 70, strategy: 70, formatting: 70 }
        };
    } catch (e) {
        console.error("AI Virality Prediction failed, falling back to heuristics:", e);
        return {
            score: Math.min(Math.max(baseScore, 0), 100),
            confidence: 0.5,
            hooks: ["Start with a negative qualifier", "Use single-sentence paragraphs"],
            critique: "Heuristic-only analysis. AI critique unavailable.",
            breakdown: { hook: 60, strategy: 60, formatting: 60 }
        };
    }
}

// --- TEAM ANALYTICS INTERFACES ---

export interface TeamPerformanceMetrics {
  totalPosts: number;
  totalImpressions: number;
  avgEngagement: number;
  topPersona: string;
  personaBreakdown: Record<string, number>;
  topColleague: string;
  avgWordCount: number;
  avgReadabilityScore: number;
  signaturePhraseFreq: number;
  timeSeriesData: { date: string; impressions: number; engagement: number }[];
}

export interface ColleagueStats {
  name: string;
  role: string | null;
  postCount: number;
  avgImpressions: number;
}

// --- TEAM ANALYTICS FUNCTIONS ---

/**
 * Get aggregated team performance metrics
 */
export async function getTeamPerformance(args?: { teamId?: string | null; authorId?: string | null }): Promise<TeamPerformanceMetrics> {
  try {
    const whereScope =
      args?.teamId
        ? { teamId: args.teamId }
        : args?.authorId
          ? { authorId: args.authorId }
          : {};

    const strategies = await prisma.strategy.findMany({
      where: {
        isPublished: true,
        ...whereScope,
      },
      select: {
        persona: true,
        content: true,
        impressions: true,
        engagement: true,
        isTeamPost: true,
        teamMemberName: true
      }
    });

    const totalPosts = strategies.length;
    const totalImpressions = strategies.reduce((sum, s) => sum + (s.impressions || 0), 0);
    const totalEngagement = strategies.reduce((sum, s) => sum + (s.engagement || 0), 0);
    const avgEngagement = totalPosts > 0 ? totalEngagement / totalPosts : 0;

    // Persona Breakdown
    const personaBreakdown: Record<string, number> = {};
    strategies.forEach(s => {
      const p = s.persona || "unknown";
      personaBreakdown[p] = (personaBreakdown[p] || 0) + 1;
    });

    const topPersona = Object.entries(personaBreakdown).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";

    // Top Colleague (for Team Mode)
    const colleagueCounts: Record<string, number> = {};
    strategies.filter(s => s.isTeamPost && s.teamMemberName).forEach(s => {
      const name = s.teamMemberName!;
      colleagueCounts[name] = (colleagueCounts[name] || 0) + 1;
    });

    const topColleague = Object.entries(colleagueCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";

    // Content Metrics
    const totalWords = strategies.reduce((sum, s) => sum + (s.content?.split(/\s+/).length || 0), 0);
    const avgWordCount = totalPosts > 0 ? Math.round(totalWords / totalPosts) : 0;

    const totalReadability = strategies.reduce((sum, s) => sum + calculateReadability(s.content), 0);
    const avgReadabilityScore = totalPosts > 0 ? parseFloat((totalReadability / totalPosts).toFixed(1)) : 0;

    const totalSignaturePhrases = strategies.reduce((sum, s) => sum + analyzeSignaturePhrases(s.content, s.persona), 0);
    const signaturePhraseFreq = totalPosts > 0 ? parseFloat((totalSignaturePhrases / totalPosts).toFixed(1)) : 0;

    // --- TIME SERIES DATA (Phase 24) ---
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const timeSeriesRaw = await prisma.strategy.findMany({
      where: {
        isPublished: true,
        publishedAt: { gte: sevenDaysAgo },
        ...whereScope,
      },
      select: {
        publishedAt: true,
        impressions: true,
        engagement: true
      },
      orderBy: { publishedAt: "asc" }
    });

    const timeSeriesMap: Record<string, { impressions: number; engagement: number }> = {};
    timeSeriesRaw.forEach(s => {
      const date = s.publishedAt!.toISOString().split("T")[0];
      if (!timeSeriesMap[date]) timeSeriesMap[date] = { impressions: 0, engagement: 0 };
      timeSeriesMap[date].impressions += (s.impressions || 0);
      timeSeriesMap[date].engagement += (s.engagement || 0);
    });

    const timeSeriesData = Object.entries(timeSeriesMap).map(([date, vals]) => ({
      date,
      ...vals
    }));

    return {
      totalPosts,
      totalImpressions,
      avgEngagement,
      topPersona,
      personaBreakdown,
      topColleague,
      avgWordCount,
      avgReadabilityScore,
      signaturePhraseFreq,
      timeSeriesData
    };
  } catch (e) {
    console.error("Failed to fetch team performance:", e);
    return {
      totalPosts: 0,
      totalImpressions: 0,
      avgEngagement: 0,
      topPersona: "N/A",
      personaBreakdown: {},
      topColleague: "N/A",
      avgWordCount: 0,
      avgReadabilityScore: 0,
      signaturePhraseFreq: 0,
      timeSeriesData: []
    };
  }
}

/**
 * Get stats for individual colleagues
 */
export async function getColleaguePerformance(args?: { teamId?: string | null; authorId?: string | null }): Promise<ColleagueStats[]> {
  try {
    const whereScope =
      args?.teamId
        ? { teamId: args.teamId }
        : args?.authorId
          ? { authorId: args.authorId }
          : {};

    const posts = await prisma.strategy.groupBy({
      by: ['teamMemberName', 'teamMemberRole'],
      where: {
        isTeamPost: true,
        teamMemberName: { not: null },
        ...whereScope,
      },
      _count: {
        id: true
      },
      _avg: {
        impressions: true
      }
    });

    // Cast the result to the expected type since Prisma's groupBy type inference can be tricky in some environments
    const typedPosts = posts as unknown as Array<{
        teamMemberName: string | null;
        teamMemberRole: string | null;
        _count: { id: number };
        _avg: { impressions: number | null };
    }>;

    return typedPosts.map(p => ({
      name: p.teamMemberName!,
      role: p.teamMemberRole,
      postCount: p._count.id,
      avgImpressions: p._avg.impressions || 0
    })).sort((a, b) => b.postCount - a.postCount);
  } catch (e) {
    console.error("Failed to fetch colleague stats:", e);
    return [];
  }


}

/**
 * AI Recommendations for Team Strategy
 */
export function generateTeamRecommendations(metrics: TeamPerformanceMetrics): string[] {
  const recommendations: string[] = [];

  if (metrics.topPersona !== "cso" && metrics.topPersona !== "N/A") {
    recommendations.push(`Scale content output for '${metrics.topPersona}' - it's your highest volume persona.`);
  }

  if (metrics.avgEngagement < 2.0 && metrics.totalPosts > 5) {
    recommendations.push("Team engagement is low. Focus on 'Contrarian' persona posts to spark debate.");
  }

  if (metrics.topColleague !== "N/A") {
    recommendations.push(`${metrics.topColleague} is your top advocate. Clone their voice model for other execs.`);
  }

  return recommendations;
}

// --- LEGACY ANALYTICS ---


export interface AnalyticsInsight {
    topPerformers: ArchivedStrategy[];
    averageEngagement: number;
    trendingTopics: string[];
    recommendations: string[];
    personaPerformance?: Record<string, number>;
}

/**
 * CALCULATE DWELL SCORE
 * Estimates the "stickiness" of content based on depth and engagement.
 */
export function calculateDwellScore(content: string, performance: any): number {
    const wordCount = content.split(/\s+/).length;
    const baseTime = wordCount / 3; // Assume 200 wpm (3.3 words/sec)
    const engagementBonus = (performance.likes || 0) * 2 + (performance.comments || 0) * 5 + (performance.shares || 0) * 10;
    return Math.round(baseTime + engagementBonus);
}

/**
 * GENERATE ANALYTICS REPORT
 * Aggregates performance data into actionable insights.
 */
export async function generateAnalyticsReport(apiKey: string): Promise<AnalyticsInsight | null> {
    if (!apiKey) return null;

    const topPerformers = await getTopPerformers(5);
    const allStrategies = await getArchivedStrategies();
    
    // Calculate average engagement for strategies with performance data
    const withPerformance = allStrategies.filter(s => s.performance);
    let averageEngagement = 0;
    if (withPerformance.length > 0) {
        const total = withPerformance.reduce((sum, s) => {
            return sum + (s.performance?.likes || 0) + (s.performance?.comments || 0) + (s.performance?.reposts || 0);
        }, 0);
        averageEngagement = Math.round(total / withPerformance.length);
    }

    // Calculate persona performance
    const personaMap: Record<string, { total: number, count: number }> = {};
    allStrategies.forEach(s => {
        if (s.persona && s.performance) {
            if (!personaMap[s.persona]) personaMap[s.persona] = { total: 0, count: 0 };
            const score = (s.performance.likes || 0) + (s.performance.comments || 0) + (s.performance.shares || 0);
            personaMap[s.persona].total += score;
            personaMap[s.persona].count += 1;
        }
    });

    const personaPerformance: Record<string, number> = {};
    Object.keys(personaMap).forEach(p => {
        personaPerformance[p] = Math.round(personaMap[p].total / personaMap[p].count);
    });

    // Extract trending topics from top performers
    const trendingTopics = topPerformers.map(s => s.topic);

    // Generate AI recommendations based on top performers
    let recommendations: string[] = [];
    if (topPerformers.length > 0) {
        recommendations = await getAIRecommendations(topPerformers, apiKey);
    }

    return {
        topPerformers,
        averageEngagement,
        trendingTopics,
        recommendations,
        personaPerformance
    };
}

/**
 * GET AI RECOMMENDATIONS
 * Uses Gemini to analyze top performers and suggest new directions.
 */
async function getAIRecommendations(topPerformers: ArchivedStrategy[], apiKey: string): Promise<string[]> {
    const genAI = new GoogleGenAI({ apiKey });

    const contentSummary = topPerformers.map(s => 
        `Topic: ${s.topic}\nEngagement: ${(s.performance?.likes || 0) + (s.performance?.comments || 0)} interactions\nContent Preview: ${s.content.substring(0, 200)}...`
    ).join("\n\n");

    const prompt = `
        You are a top-tier LinkedIn strategist analyzing performance data.
        
        Here are my TOP-PERFORMING posts:
        ${contentSummary}
        
        Based on this data, provide 3-5 actionable recommendations:
        - What TOPICS should I double down on?
        - What FORMATS or STYLES seem to resonate most?
        - What should I AVOID based on engagement patterns?
        
        OUTPUT AS JSON ARRAY:
        ["Recommendation 1", "Recommendation 2", ...]
    `;

    try {
        const result = await genAI.models.generateContent({
            model: AI_CONFIG.staticPrimaryModel,
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });

        return JSON.parse(result.text || "[]");
    } catch (e) {
        console.error("AI Recommendations failed:", e);
        return ["Enable performance tracking on more posts to get personalized recommendations."];
    }
}
