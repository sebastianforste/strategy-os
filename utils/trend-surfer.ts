/**
 * TREND SURFER - Newsjacking Engine
 * ----------------------------------
 * Monitors industry signals to identify high-potential "Newsjacking" opportunities.
 * Scores trends based on Virality, Controversy, and Authority Gap.
 */

import { findTrends } from "./search-service";
import { GoogleGenAI } from "@google/genai";
import { AI_CONFIG } from "./config";

const PRIMARY_MODEL = AI_CONFIG.primaryModel;

export interface TrendOpportunity {
    id: string;
    topic: string;
    headline: string;
    context: string;
    viralityScore: number; // 0-100
    suggestedAngle: 'contrarian' | 'analytical' | 'prediction';
    sourceUrl: string;
}

/**
 * SCAN FOR OPPORTUNITIES
 * Scans a specific sector for breaking news and potential strategy angles.
 */
export async function scanForTrends(sector: string, apiKey: string, serperKey: string): Promise<TrendOpportunity[]> {
    console.log(`[TrendSurfer] Scanning sector: "${sector}"`);

    // 1. Get raw news/trends
    const rawTrends = await findTrends(`${sector} news trends last 24h`, serperKey);

    // 2. Analyze and Score with AI
    const analysisPrompt = `
        You are a Viral Content Strategist. Analyze the following news items for "${sector}".
        Identify 3-5 items that have HIGH potential for "Newsjacking" (riding a trend to build authority).
        
        CRITERIA:
        - Must be recent (suggests urgency).
        - Must have an "Idea Gap" (something specific to have an opinion on).
        - Ignore generic "Stock market up" news. Look for structural changes, new laws, or big launches.
        
        RAW NEWS:
        ${JSON.stringify(rawTrends.slice(0, 8))}
        
        Return ONLY a JSON array matching the TrendOpportunity interface.
        For 'viralityScore', estimate 0-100 based on controversy potential.
    `;

    const genAI = new GoogleGenAI({ apiKey });
    
    try {
        const response = await genAI.models.generateContent({
            model: PRIMARY_MODEL,
            contents: analysisPrompt
        });

        const text = response.text || "[]";
        const jsonText = text.replace(/```json|```/g, "").trim();
        const opportunities = JSON.parse(jsonText);
        
        // Assign IDs if missing
        return opportunities.map((op: any, i: number) => ({
            ...op,
            id: op.id || `trend-${Date.now()}-${i}`
        }));

    } catch (e) {
        console.error("[TrendSurfer] Analysis failed:", e);
        return [];
    }
}
