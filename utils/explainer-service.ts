"use server";

import { GoogleGenAI } from "@google/genai";

export interface Explanation {
  pattern: string;
  reason: string;
}

const PRIMARY_MODEL = "models/gemini-flash-latest";
const FALLBACK_MODEL = "models/gemini-1.5-flash";

/**
 * Analyzes a post and explains why it will perform well.
 */
export async function explainPost(
  post: string,
  geminiKey: string
): Promise<Explanation[]> {
  if (!post.trim()) return [];
  if (!geminiKey) return [];

  const prompt = `You are a LinkedIn content strategist. Analyze this post and identify 2-3 specific persuasion patterns that make it effective.

POST:
"""
${post}
"""

For each pattern, explain:
1. The PATTERN NAME (e.g., "Pattern Interrupt", "Social Proof", "Curiosity Gap")
2. WHY it works psychologically

RESPOND AS JSON ARRAY:
[
  {"pattern": "Pattern Name", "reason": "Why it works"},
  ...
]

ONLY return the JSON array. No markdown.`;

  async function tryWithModel(modelName: string): Promise<Explanation[] | null> {
    try {
      const genAI = new GoogleGenAI({ apiKey: geminiKey });
      const response = await genAI.models.generateContent({
        model: modelName,
        contents: prompt
      });
      const text = response.text || "";
      
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (!jsonMatch) return [];

      return JSON.parse(jsonMatch[0]) as Explanation[];
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : "";
      if (errorMessage.includes("429") || errorMessage.includes("Quota") || errorMessage.includes("quota")) {
        console.warn(`[Explainer] Rate limit on ${modelName}, will try fallback`);
        return null; // Signal fallback
      }
      console.error("[Explainer] Failed:", e);
      return [];
    }
  }

  // Try primary, fallback on rate limit
  let result = await tryWithModel(PRIMARY_MODEL);
  if (result === null) {
    result = await tryWithModel(FALLBACK_MODEL);
  }
  return result || [];
}
