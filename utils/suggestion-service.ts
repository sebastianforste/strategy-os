"use server";

import { GoogleGenAI } from "@google/genai";
import { AI_CONFIG } from "./config";
import { isRateLimitError } from "./gemini-errors";

export interface Suggestion {
  id: string;
  angle: string;
}

const PRIMARY_MODEL = AI_CONFIG.primaryModel;
const FALLBACK_MODEL = AI_CONFIG.fallbackModel;

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
      const genAI = new GoogleGenAI({ apiKey: geminiKey });
      const response = await genAI.models.generateContent({
        model: modelName,
        contents: prompt
      });
      let cleanText = (response.text || "").trim();
      // Strip markdown code blocks if present
      if (cleanText.startsWith("```json")) {
        cleanText = cleanText.replace(/^```json\n?/, "").replace(/\n?```$/, "");
      } else if (cleanText.startsWith("```")) {
        cleanText = cleanText.replace(/^```\n?/, "").replace(/\n?```$/, "");
      }

      const jsonMatch = cleanText.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
          console.warn("[Suggestions] No JSON array found in response:", response.text);
          return [];
      }

      let jsonStr = jsonMatch[0];
      // Basic cleaning for trailing commas which break JSON.parse
      jsonStr = jsonStr.replace(/,\s*\]/g, ']');

      const parsed: string[] = JSON.parse(jsonStr);
      
      return parsed.slice(0, 3).map((angle, i) => ({
        id: `suggestion-${i}`,
        angle: String(angle).trim(),
      }));
    } catch (e: unknown) {
      // Provide safe fallback on rate limit
      if (isRateLimitError(e)) {
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
