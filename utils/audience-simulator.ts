
import { GoogleGenAI } from "@google/genai";
import { AI_CONFIG } from "./config";

/**
 * AUDIENCE SIMULATOR 🎭
 * ---------------------
 * Simulates a skeptical reader (e.g. CTO) to roast the draft.
 */

export interface RoastResult {
  score: number; // 1-10
  critique: string[]; // List of 3 major flaws
  verdict: string; // "Publish" or "Start Over"
}

export async function simulateAudience(text: string, apiKey: string, persona = "Skeptical CTO"): Promise<RoastResult> {
    const client = new GoogleGenAI({ apiKey });
    
    const prompt = `
You are a ${persona}.
Read the following LinkedIn post and "Roast" it. Be harsh but fair.
Focus on: Fluff, lack of data, obvious platitudes, and cringe formatting.

Return a JSON object:
{
  "score": number, // 1-10
  "critique": ["point 1", "point 2", "point 3"],
  "verdict": "Publish" | "Start Over"
}

POST:
"${text}"
    `;

    try {
        const response = await client.models.generateContent({
            model: AI_CONFIG.primaryModel,
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            config: { 
                temperature: 0.7,
                responseMimeType: "application/json"
            }
        });

        // SDK v2 Access
        const content = response.text;
        if (!content) throw new Error("No content generated");

        return JSON.parse(content) as RoastResult;
    } catch (e) {
        console.error("Audience Simulator failed:", e);
        return {
            score: 0,
            critique: ["Validation failed due to API error."],
            verdict: "Unknown"
        };
    }
}
