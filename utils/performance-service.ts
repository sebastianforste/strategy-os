/**
 * PERFORMANCE SERVICE - The Dopamine Loop
 * ---------------------------------------
 * Ingests engagement data (likes, shares) and maps them to generations.
 */

import { updateStrategyPerformance, PerformanceData } from "./archive-service";

export interface EngagementSignal {
    id: string; // The archival ID
    likes: number;
    shares: number;
    comments: number;
}

/**
 * INGEST ENGAGEMENT
 * Updates the strategy vault with fresh metrics and determines if evolution is needed.
 */
export async function ingestEngagement(signals: EngagementSignal[]) {
    console.log(`[Dopamine Loop] Ingesting ${signals.length} engagement signals.`);
    
    for (const signal of signals) {
        const perf: PerformanceData = {
            impressions: (signal.likes + signal.comments) * 50, // Approximation if not provided
            likes: signal.likes,
            comments: signal.comments,
            reposts: signal.shares,
            saves: 0,
            shares: signal.shares,
            reach: (signal.likes + signal.comments) * 30,
            dwellScore: 0,
            capturedAt: new Date().toISOString()
        };

        // 1. Update Vault
        await updateStrategyPerformance(signal.id, perf);

        // 2. Trigger Feedback Loop Analysis (Phase 87)
        const { processPostFeedback } = await import("./feedback-loop");
        // Convert signal to mock MoltPost format for existing feedback service
        const mockPost = {
            id: signal.id,
            content: "", // We don't necessarily need the content here if the feedback service uses the ID to look it up
            author: "me"
        };
        
        const feedback = await processPostFeedback(mockPost as any);
        
        if (feedback.action === "REINFORCE") {
            console.log(`[Dopamine Loop] Strong performance on ${signal.id}! Triggering persona evolution...`);
            // Here we could trigger evolvePersonaAction if we had the API key and personaId
            // For now, the feedback loop marks it for the next generation sequence.
        }
    }
}
