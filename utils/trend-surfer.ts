/**
 * TREND SURFER - Newsjacking Engine
 * ----------------------------------
 * Monitors industry signals to identify high-potential "Newsjacking" opportunities.
 * Scores trends based on Virality, Controversy, and Authority Gap.
 */

import { findTrends } from "./search-service";
import { GoogleGenAI } from "@google/genai";
import { AI_CONFIG } from "./config";
import { getRoute } from "./model-mixer";

const PRIMARY_MODEL = AI_CONFIG.primaryModel;

export interface TrendOpportunity {
    id: string;
    topic: string;
    headline: string;
    context: string;
    sourceUrl: string;
    sentiment: 'bullish' | 'bearish' | 'neutral';
    velocity: number; // 0-100 (speed of adoption)
    longevity: number; // 0-100 (how long it will stay relevant)
    viralityScore: number;
    suggestedAngle?: string;
}

export interface TrendForecast extends TrendOpportunity {
    timeframe: string; // e.g., "Next 7 Days"
    impactScore: number;
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

    const modelName = getRoute({ complexity: 'balanced', intent: 'trend analysis' });
    console.log(`[TrendSurfer] Analyzing trends with: ${modelName}`);

    const genAI = new GoogleGenAI({ apiKey });
    
    try {
        const response = await genAI.models.generateContent({
            model: modelName,
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

/**
 * PREDICT FUTURE TRENDS
 * Uses semantic extrapolation to forecast what might happen next in a sector.
 */
export async function predictFutureTrends(sector: string, currentTrends: TrendOpportunity[], apiKey: string): Promise<TrendForecast[]> {
    console.log(`[TrendSurfer] Forecasting future for: "${sector}"`);

    const forecastPrompt = `
        You are a Strategic Futurist. Based on these CURRENT trends in "${sector}", forecast 3-5 PREDICTIVE trends for the NEXT 7-14 DAYS.
        
        CURRENT TRENDS:
        ${JSON.stringify(currentTrends)}
        
        TASK:
        - Extrapolate what happens NEXT.
        - Assign a 'velocity' (how fast it will scale).
        - Assign a 'longevity' (is it a flash in the pan or a structural shift?).
        - Provide a 'sentiment' (Is it a threat or opportunity?).
        
        Return ONLY a JSON array matching the TrendForecast interface.
    `;

    const genAI = new GoogleGenAI({ apiKey });
    
    try {
        const response = await genAI.models.generateContent({
            model: PRIMARY_MODEL,
            contents: forecastPrompt
        });

        const text = response.text || "[]";
        const jsonText = text.replace(/```json|```/g, "").trim();
        const forecasts = JSON.parse(jsonText);
        
        return forecasts.map((f: any, i: number) => ({
            ...f,
            id: f.id || `forecast-${Date.now()}-${i}`,
            viralityScore: f.impactScore || 80 // Default high for forecasts
        }));

    } catch (e) {
        console.error("[TrendSurfer] Forecast failed:", e);
        return [];
    }
}
