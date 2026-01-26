"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";

export interface Explanation {
  pattern: string;
  reason: string;
}

/**
 * Analyzes a post and explains why it will perform well.
 */
export async function explainPost(
  post: string,
  geminiKey: string
): Promise<Explanation[]> {
  if (!post.trim()) return [];
  if (!geminiKey) return [];

  const genAI = new GoogleGenerativeAI(geminiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

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

  try {
    const response = await model.generateContent(prompt);
    const text = response.response.text() || "";
    
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return [];

    return JSON.parse(jsonMatch[0]) as Explanation[];
  } catch (e) {
    console.error("[Explainer] Failed:", e);
    return [];
  }
}
