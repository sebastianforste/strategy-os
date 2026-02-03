/**
 * ADAPTATION SERVICE - Darwin Engine v2
 * -------------------------------------
 * Implements self-correcting prompt architecture using real performance data.
 */

import { prisma } from "./db";
import { PersonaId } from "./personas";

export interface AdaptationContext {
    highDwellPosts: string[];
    antiPatterns: string[];
    performanceSummary: string;
}

/**
 * GET ADAPTATION CONTEXT
 * Fetches high and low performing strategy examples for a specific persona.
 */
export async function getAdaptationContext(personaId: PersonaId): Promise<AdaptationContext> {
    try {
        // 1. Fetch Top 5 High-Dwell Posts
        const topStrategies = await prisma.strategy.findMany({
            where: {
                persona: personaId,
                isPublished: true,
                dwellScore: { gt: 0 }
            } as any,
            orderBy: {
                dwellScore: 'desc'
            } as any,
            take: 5,
            select: {
                content: true,
                dwellScore: true,
                title: true
            } as any
        }) as any[];

        // 2. Fetch Top 5 Low-Dwell Posts
        const lowStrategies = await prisma.strategy.findMany({
            where: {
                persona: personaId,
                isPublished: true,
                dwellScore: { gt: 0 }
            } as any,
            orderBy: {
                dwellScore: 'asc'
            } as any,
            take: 5,
            select: {
                content: true,
                dwellScore: true
            } as any
        }) as any[];

        const highDwellPosts: string[] = topStrategies.map(s => String(s.content));
        const antiPatterns: string[] = lowStrategies.map(s => String(s.content));

        // 3. Construct a performance summary
        let performanceSummary = "No significant performance data yet.";
        if (topStrategies.length > 0) {
            const avgDwell = topStrategies.reduce((sum, s) => sum + (Number(s.dwellScore) || 0), 0) / topStrategies.length;
            const topicsList = topStrategies.map(s => String(s.title)).filter(t => t && t !== "null");
            performanceSummary = `Your average dwell score for top content is ${avgDwell.toFixed(1)}. Users respond best to posts about ${topicsList.join(", ")}.`;
        }

        return {
            highDwellPosts,
            antiPatterns,
            performanceSummary
        };
    } catch (error) {
        console.error("[Adaptation Service] Failed to fetch context:", error);
        return {
            highDwellPosts: [],
            antiPatterns: [],
            performanceSummary: "Error fetching performance data. Stick to base persona guidelines."
        };
    }
}
