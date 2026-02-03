/**
 * RESEARCH AGENT - Deep Investigation Node
 * -----------------------------------------
 * Orchestrates multi-hop searches to find obscure data points 
 * and "contrarian" evidence.
 */

import { findTrends } from "./search-service";
import { GoogleGenAI } from "@google/genai";
import { AI_CONFIG } from "./config";

const PRIMARY_MODEL = AI_CONFIG.primaryModel;

export interface ResearchInsight {
    title: string;
    snippet: string;
    url: string;
    sourceType: 'report' | 'academic' | 'forum' | 'news';
    relevanceScore: number;
    contrarianSignal: boolean;
}

/**
 * PERFORM DEEP RESEARCH
 * Executes a targeted search for specific "hard-to-find" evidence.
 */
export async function performDeepResearch(topic: string, apiKey: string, serperKey: string): Promise<ResearchInsight[]> {
    console.log(`[ResearchAgent] Deep Research initiated for: "${topic}"`);
    
    // 1. Generate specialized search queries
    const queryGenPrompt = `
        You are a Staff Research Investigator. Generate 3 highly specific search queries to find obscure data, 
        contrarian viewpoints, or niche industry reports about: "${topic}".
        Focus on finding "the things nobody else is talking about."
        
        Return ONLY a JSON array of 3 strings.
    `;

    const genAI = new GoogleGenAI({ apiKey });
    const queryResponse = await genAI.models.generateContent({
        model: PRIMARY_MODEL,
        contents: queryGenPrompt
    });

    const queriesText = queryResponse.text || "[]";
    const queries = JSON.parse(queriesText.replace(/```json|```/g, "").trim());

    // 2. Execute parallel searches
    const searchResults = await Promise.all(queries.map((q: string) => findTrends(q, serperKey)));
    const flatResults = searchResults.flat();

    // 3. Filter and Score for "Proprietary Intelligence"
    const scoringPrompt = `
        Analyze the following search results and identify the 4 most "Proprietary" or "Contrarian" insights.
        Avoid obvious news; look for niche data, academic abstracts, or deep-industry observations.
        
        RESULTS:
        ${JSON.stringify(flatResults)}
        
        Return ONLY a JSON array matching the ResearchInsight interface.
    `;

    try {
        const scoringResponse = await genAI.models.generateContent({
            model: PRIMARY_MODEL,
            contents: scoringPrompt
        });

        const insightsText = scoringResponse.text || "[]";
        return JSON.parse(insightsText.replace(/```json|```/g, "").trim());
    } catch (e) {
        console.error("[ResearchAgent] Scoring failed", e);
        return flatResults.slice(0, 4).map(r => ({
            title: r.title,
            snippet: r.snippet,
            url: r.link,
            sourceType: 'news',
            relevanceScore: 0.5,
            contrarianSignal: false
        }));
    }
}
