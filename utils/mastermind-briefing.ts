/**
 * MASTERMIND BRIEFING - Chief of Staff Engine
 * -------------------------------------------
 * Synthesizes multiple data streams into a single actionable briefing.
 */

import { GoogleGenAI } from "@google/genai";
import { AI_CONFIG } from "./config";

const PRIMARY_MODEL = AI_CONFIG.primaryModel;

export interface MastermindBriefing {
    summary: string;
    priorities: {
        task: string;
        impact: 'High' | 'Medium' | 'Low';
        reason: string;
    }[];
    vibeCheck: string; // Market sentiment
}

/**
 * GENERATE BRIEFING
 * Synthesizes Trends, Engagement targets, and Queue status.
 */
export async function generateMastermindBriefing(
    trends: any[], 
    targets: any[], 
    queueCount: number, 
    apiKey: string
): Promise<MastermindBriefing> {
    const genAI = new GoogleGenAI({ apiKey });
    
    // Prepare Context
    const trendsLimit = trends.slice(0, 3).map(t => t.headline || t.title).join(", ");
    const targetsLimit = targets.slice(0, 2).map(t => t.title).join(", ");

    const prompt = `
        You are a Chief of Staff for a High-Performance Media Agency. 
        Synthesize the following data into a "Morning Briefing" for the executive.
        
        DATA STREAMS:
        - CURRENT TRENDS: ${trendsLimit || "None detected yet."}
        - ENGAGEMENT TARGETS: ${targetsLimit || "No high-value targets yet."}
        - PENDING POSTS IN QUEUE: ${queueCount}
        
        OUTPUT GUIDELINES:
        - Keep the summary short and punchy (max 50 words).
        - Identify 2-3 clear priorities based on the impact.
        - The "Vibe Check" should be a 1-sentence assessment of the current market mood.
        
        Return ONLY a JSON object matching the MastermindBriefing interface.
    `;

    try {
        const response = await genAI.models.generateContent({
            model: PRIMARY_MODEL,
            contents: prompt
        });

        const text = response.text || "{}";
        const jsonText = text.replace(/```json|```/g, "").trim();
        return JSON.parse(jsonText);
    } catch (e) {
        console.error("[Mastermind] Briefing failed", e);
        return {
            summary: "Market signals are stabilizing. Maintain focus on proprietary research.",
            priorities: [
                { task: "Check Trend Monitor", impact: "Medium", reason: "Stay current on sector shifts." }
            ],
            vibeCheck: "Quiet before the storm. Opportunity for deep content."
        };
    }
}
