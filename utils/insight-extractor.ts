/**
 * INSIGHT EXTRACTOR - Signal Intelligence
 * -----------------------------------------
 * Distills raw research data into "Proprietary Sparks".
 * Focuses on finding the gap between shared knowledge and hidden data.
 */

import { ResearchInsight } from "./research-agent";
import { GoogleGenAI } from "@google/genai";
import { AI_CONFIG } from "./config";

const PRIMARY_MODEL = AI_CONFIG.primaryModel;

export interface ProprietarySpark {
    insight: string;        // The core "aha" moment
    dataPoint: string;      // The hard evidence supporting it
    originalityScore: number; // 1-10 (how common is this?)
    citationUrl: string;
}

/**
 * EXTRACT PROPRIETARY SPARKS
 * Distills a set of research insights into actionable strategic "sparks".
 */
export async function extractProprietarySparks(insights: ResearchInsight[], apiKey: string): Promise<ProprietarySpark[]> {
    const genAI = new GoogleGenAI({ apiKey });
    
    const prompt = `
        Analyze the following research data and extract 3 "Proprietary Sparks". 
        A "Spark" is a high-leverage insight that contradicts common industry wisdom or reveals a hidden pattern.
        
        DATA:
        ${JSON.stringify(insights)}
        
        For each Spark, provide:
        - insight: A 1-sentence contrarian observation.
        - dataPoint: The specific number, fact, or quote that proves it.
        - originalityScore: A rating from 1-10 on how "rare" this insight is.
        - citationUrl: The source URL.
        
        Return ONLY valid JSON array with keys matching the ProprietarySpark interface.
    `;

    try {
        const response = await genAI.models.generateContent({
            model: PRIMARY_MODEL,
            contents: prompt
        });

        const text = response.text || "[]";
        const jsonText = text.replace(/```json|```/g, "").trim();
        return JSON.parse(jsonText);
    } catch (e) {
        console.error("[InsightExtractor] Extraction failed:", e);
        return [];
    }
}
