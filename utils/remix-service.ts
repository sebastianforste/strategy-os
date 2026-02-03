"use server";

import { GoogleGenAI } from "@google/genai";
import { AI_CONFIG } from "./config";
import { isRateLimitError } from "./gemini-errors";

export interface RemixResult {
  id: string;
  label: string;
  content: string;
}

const PRIMARY_MODEL = AI_CONFIG.primaryModel;
const FALLBACK_MODEL = AI_CONFIG.fallbackModel;

/**
 * Generates 3 variations of a post:
 * 1. Different Hook
 * 2. Shorter Version
 * 3. More Provocative
 */
export async function generateRemixes(
  originalPost: string,
  geminiKey: string
): Promise<RemixResult[]> {
  if (!originalPost.trim()) return [];
  if (!geminiKey) throw new Error("Gemini API Key required");

  const prompt = `You are a LinkedIn ghostwriter. Take this post and create 3 DIFFERENT variations:

ORIGINAL POST:
"""
${originalPost}
"""

VARIATIONS NEEDED:
1. DIFFERENT HOOK: Same message, but start with a completely different opening line.
2. SHORTER VERSION: Cut it to under 100 words while keeping the core insight.
3. MORE PROVOCATIVE: Make it more controversial/bold without being offensive.

RESPOND IN THIS EXACT JSON FORMAT:
{
  "differentHook": "...",
  "shorter": "...",
  "provocative": "..."
}

ONLY return the JSON. No markdown, no explanation.`;

  async function tryWithModel(modelName: string): Promise<RemixResult[] | null> {
    try {
      const genAI = new GoogleGenAI({ apiKey: geminiKey });
      const response = await genAI.models.generateContent({
          model: modelName,
          contents: prompt
      });
      const text = response.text || "";
      
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.error("[Remix] Failed to parse JSON:", text);
        return [];
      }

      const parsed = JSON.parse(jsonMatch[0]);

      return [
        { id: "hook", label: "Different Hook", content: parsed.differentHook || "" },
        { id: "short", label: "Shorter", content: parsed.shorter || "" },
        { id: "provocative", label: "More Provocative", content: parsed.provocative || "" },
      ];
    } catch (e: unknown) {
      // Return safe fallback on error
      if (isRateLimitError(e)) {
        console.warn(`[Remix] Rate limit on ${modelName}, will try fallback`);
        return null; // Signal fallback
      }
      console.error("[Remix] Generation failed:", e);
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
