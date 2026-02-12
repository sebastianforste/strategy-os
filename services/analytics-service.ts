
"use server";

import { prisma } from "@/utils/db";

export interface AnalyticsInsight {
    topPerformers: any[];
    averageEngagement: number;
    trendingTopics: string[];
    personaPerformance: Record<string, number>;
    recommendations: string[];
}

export async function generateAnalyticsReport(userId?: string): Promise<AnalyticsInsight> {
    try {
        // 1. Fetch all strategies (optionally filtered by user)
        const strategies = await prisma.strategy.findMany({
            where: userId ? { authorId: userId } : {},
            orderBy: { createdAt: "desc" },
            take: 100 // Analyze last 100 posts
        });

        if (strategies.length === 0) {
            return {
                topPerformers: [],
                averageEngagement: 0,
                trendingTopics: [],
                personaPerformance: {},
                recommendations: ["Start generating content to build your intelligence database."]
            };
        }

        // 2. Calculate Metrics
        let totalEngagement = 0;
        const personaScores: Record<string, { total: number, count: number }> = {};
        const topicCounts: Record<string, number> = {};

        strategies.forEach(s => {
            // Engagement Mock Calculation (until real LinkedIn API)
            // Using the 'rating' field as a proxy for weight
            let score = s.score || 0;
            if (s.rating === "VIRAL") score += 100;
            if (s.rating === "GOOD") score += 50;
            
            totalEngagement += score;

            // Persona Performance
            if (!personaScores[s.persona]) {
                personaScores[s.persona] = { total: 0, count: 0 };
            }
            personaScores[s.persona].total += score;
            personaScores[s.persona].count += 1;

            // Topic Extraction (Simple heuristic from input/content)
            // In a real app, we'd use an LLM to categorize
            // For now, we don't have a reliable topic field, so we skip or use a placeholder
        });

        // 3. Top Performers
        const topPerformers = strategies
            .sort((a, b) => (b.score || 0) - (a.score || 0))
            .slice(0, 5)
            .map(s => ({
                id: s.id,
                topic: s.input.slice(0, 50) + "...", // Use input as topic proxy
                performance: {
                    likes: s.engagement || 0, // Placeholder mapping
                    dwellScore: s.dwellScore || 0
                }
            }));

        // 4. Persona Performance Aggregation
        const normalizedPersonaPerformance: Record<string, number> = {};
        Object.keys(personaScores).forEach(p => {
            const { total, count } = personaScores[p];
            normalizedPersonaPerformance[p] = Math.round(total / count);
        });

        return {
            topPerformers,
            averageEngagement: Math.round(totalEngagement / strategies.length),
            trendingTopics: [], // To implementation
            personaPerformance: normalizedPersonaPerformance,
            recommendations: generateHeuristicRecommendations(strategies)
        };

    } catch (error) {
        console.error("Analytics generation failed:", error);
        throw new Error("Failed to generate analytics");
    }
}

function generateHeuristicRecommendations(strategies: any[]): string[] {
    const recs = [];
    if (strategies.length < 5) {
        recs.push("Increase posting volume to unlock deeper insights.");
    }
    // Add more logic here
    return recs;
}
