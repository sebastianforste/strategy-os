"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";

export interface Suggestion {
  id: string;
  angle: string;
}

const PRIMARY_MODEL = "gemini-flash-latest";
const FALLBACK_MODEL = "gemini-1.5-flash";

/**
 * Generates 3 provocative LinkedIn post angles for a given topic.
 */
export async function getSuggestions(
  topic: string,
  geminiKey: string
): Promise<Suggestion[]> {
  if (!topic.trim() || topic.length < 3) return [];
  if (!geminiKey) return [];

  const prompt = `You are a LinkedIn content strategist. Given this topic, suggest 3 PROVOCATIVE post angles that would drive engagement.

TOPIC: "${topic}"

RULES:
- Each angle should be contrarian or surprising
- Use specific language, not generic
- Keep each under 15 words

RESPOND AS JSON ARRAY:
["angle 1", "angle 2", "angle 3"]

ONLY return the JSON array. No markdown.`;

  async function tryWithModel(modelName: string): Promise<Suggestion[] | null> {
    try {
      const genAI = new GoogleGenerativeAI(geminiKey);
      const model = genAI.getGenerativeModel({ model: modelName });
      const response = await model.generateContent(prompt);
      const text = response.response.text() || "";
      
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (!jsonMatch) return [];

      const parsed: string[] = JSON.parse(jsonMatch[0]);
      
      return parsed.slice(0, 3).map((angle, i) => ({
        id: `suggestion-${i}`,
        angle: angle.trim(),
      }));
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : "";
      if (errorMessage.includes("429") || errorMessage.includes("Quota") || errorMessage.includes("quota")) {
        console.warn(`[Suggestions] Rate limit on ${modelName}, will try fallback`);
        return null; // Signal fallback
      }
      console.error("[Suggestions] Generation failed:", e);
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
