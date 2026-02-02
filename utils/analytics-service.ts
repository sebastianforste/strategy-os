/**
 * ANALYTICS SERVICE - Intelligence Feedback Loop
 * -----------------------------------------------
 * Analyzes historical performance and provides AI-driven recommendations.
 */

import { GoogleGenAI } from "@google/genai";
import { ArchivedStrategy, getTopPerformers, getArchivedStrategies } from "./archive-service";

const PRIMARY_MODEL = process.env.NEXT_PUBLIC_GEMINI_PRIMARY_MODEL || "models/gemini-2.0-flash-exp";

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
            model: PRIMARY_MODEL,
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });

        return JSON.parse(result.text || "[]");
    } catch (e) {
        console.error("AI Recommendations failed:", e);
        return ["Enable performance tracking on more posts to get personalized recommendations."];
    }
}
