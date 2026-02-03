"use server";

/**
 * SCHEDULE ACTIONS - Server-side Temporal Orchestration
 * ----------------------------------------------------
 */

import { processInput } from "./generate";
import { schedulePost } from "../utils/archive-service";
import { findTrends } from "../utils/search-service";
import { PERSONAS } from "../utils/personas";

export async function autoFillQueueAction(gaps: any[], apiKey: string) {
    if (!apiKey) throw new Error("API Key required");

    console.log(`[TemporalEngine] Initializing Auto-Fill for ${gaps.length} gaps...`);

    const results = [];

    for (const gap of gaps) {
        try {
            // 1. Find a trend for this gap
            const trends = await findTrends("Strategic Industry Pivots", apiKey);
            const trend = (trends && trends.length > 0) ? trends[0] : null;
            
            const prompt = trend 
                ? `Write a high-status strategy post about this trend: ${trend.title}. Signal: ${trend.snippet}. Tone: Authoritative, cynical, yet visionary.`
                : "Write a visionary strategy post about the future of AI-driven business models. Focus on 'Sovereignty' and 'Automated Executive' roles.";

            // 2. Generate content
            const post = await processInput(prompt, { gemini: apiKey }, "thompson"); 

            // 3. Schedule it
            const scheduledId = await schedulePost({
                content: post.textPost,
                topic: trend?.title || "Autonomous Insight",
                scheduledFor: gap.date,
                platform: 'linkedin' // Default to LinkedIn
            });

            results.push({ gap: gap.label, status: 'filled', id: scheduledId });
        } catch (e) {
            console.error(`[TemporalEngine] Failed to fill gap: ${gap.label}`, e);
            results.push({ gap: gap.label, status: 'failed' });
        }
    }

    return results;
}
