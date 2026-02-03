
import { GoogleGenAI } from "@google/genai";
import { AI_CONFIG } from "./config";

export interface HookVariant {
    text: string;
    style: string;
    ctr: number; // 0-100
    attention: number; // 0-100
}

/**
 * HOOK LAB 🪝
 * ------------
 * Generates 5 distinct hook variations with predictive scoring.
 */
export async function generateHooks(topic: string, apiKey: string): Promise<HookVariant[]> {
    const client = new GoogleGenAI({ apiKey });
    
    const prompt = `
You are a Viral Ghostwriter. Your job is to write 5 "Hooks" (Opening lines) for a LinkedIn post about: "${topic}".

TASK:
1. Write 5 variations using these styles: Contrarian, Storyteller, Analyst, Direct, Question.
2. For each hook, provide a "Predicted CTR" (0-100) and an "Attention Score" (0-100) based on social media algorithms.

OUTPUT JSON ONLY:
[
  { "text": "...", "style": "Contrarian", "ctr": 85, "attention": 92 },
  ...
]

Make hooks punchy, under 20 words each.
    `;

    try {
        const response = await client.models.generateContent({
            model: AI_CONFIG.primaryModel,
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            config: { temperature: 0.8 }
        });

        const text = response.text;
        if (!text) return [];

        const jsonStr = text.replace(/```json\n?|\n?```/g, "").trim();
        return JSON.parse(jsonStr);
    } catch (e) {
        console.error("Hook Lab failed:", e);
        return [];
    }
}
