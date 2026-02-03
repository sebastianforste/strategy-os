/**
 * WAR ROOM SERVICE - Defensive Intelligence
 * ----------------------------------------
 * Simulates adversarial reactions and scores strategic defensibility.
 */

import { GoogleGenAI } from "@google/genai";
import { AI_CONFIG } from "./config";

const PRIMARY_MODEL = AI_CONFIG.primaryModel;

export interface SimulatedAttack {
    persona: string;
    comment: string;
    vulnerability: string;
    counterMeasure: string;
}

export interface DefensibilityReport {
    score: number; // 0-100
    riskLevel: 'low' | 'medium' | 'high';
    attacks: SimulatedAttack[];
    summary: string;
}

/**
 * SIMULATE CONFLICT
 * Generates an adversarial report for a piece of content.
 */
export async function simulateConflict(content: string, apiKey: string): Promise<DefensibilityReport | null> {
    if (!content || !apiKey) return null;

    const genAI = new GoogleGenAI({ apiKey });
    
    const prompt = `
        ACT AS A "WAR ROOM" ADVERSARIAL AGENT. 
        Your goal is to find the CRITICAL WEAKNESSES in this strategic content.
        
        CONTENT TO ANALYZE:
        """
        ${content}
        """
        
        TASK:
        1. Generate 3 adversarial "Attacks" (comments/critiques) from different perspectives (e.g. A Cynical Competitor, A Skeptical Investor, A Pedantic Technical Lead).
        2. Identify the core "Vulnerability" each attack exploits.
        3. Suggest a "Counter-Measure" (how to edit the post to survive this attack).
        4. Provide a "Defensibility Score" (0-100). Higher is better. 100 means bulletproof.
        
        OUTPUT AS JSON:
        {
            "score": number,
            "summary": "1 sentence executive summary of risk",
            "attacks": [
                {
                    "persona": "Competitor",
                    "comment": "Adversarial comment",
                    "vulnerability": "What is weak?",
                    "counterMeasure": "How to fix it"
                }
            ]
        }
    `;

    try {
        const result = await genAI.models.generateContent({
            model: PRIMARY_MODEL,
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });

        const data = JSON.parse(result.text || "{}");
        
        return {
            score: data.score || 50,
            riskLevel: data.score > 80 ? 'low' : data.score > 50 ? 'medium' : 'high',
            attacks: data.attacks || [],
            summary: data.summary || "No summary available."
        };
    } catch (e) {
        console.error("War Room Simulation Failed:", e);
        return null;
    }
}
