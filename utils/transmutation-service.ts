/**
 * TRANSMUTATION SERVICE - 2028 Unified Intelligence Pillar
 * 
 * Transforms content from one platform format to another.
 * e.g., LinkedIn Post -> X Thread or Substack Essay
 */

import { GoogleGenAI } from "@google/genai";

const PRIMARY_MODEL = process.env.NEXT_PUBLIC_GEMINI_PRIMARY_MODEL || "models/gemini-flash-latest";

export type Platform = "linkedin" | "twitter" | "substack";

/**
 * TRANSMUTE CONTENT
 * -----------------
 * converts content between platforms.
 * 
 * @param content - Original content
 * @param from - Source platform
 * @param to - Target platform
 * @param apiKey - Gemini API key
 */
export async function transmuteContent(
  content: string,
  from: Platform,
  to: Platform,
  apiKey: string
): Promise<string> {
  const genAI = new GoogleGenAI({ apiKey });
  
  const platformPrompts = {
    twitter: "Convert this content into a punchy X (Twitter) THREAD. Use 3-5 tweets. High curiosity gap in the first tweet. Use numbers/bullets sparingly.",
    substack: "Convert this content into a deep-dive Substack ESSAY (minimum 400 words). Add a 'TL;DR' at the top, followed by sections with H2 headers. Expand on the strategic implications.",
    linkedin: "Convert this content into a professional, high-signal LinkedIn post. Use line breaks for readability and a strong closing question."
  };
  
  const prompt = `
    TRANSMUTATION REQUEST:
    FROM: ${from.toUpperCase()}
    TO: ${to.toUpperCase()}
    
    ORIGINAL CONTENT:
    """
    ${content}
    """
    
    TRANSFORMATION RULES:
    ${platformPrompts[to]}
    
    OUTPUT:
    Pure text only. No meta-commentary.
  `;
  
  try {
    const result = await genAI.models.generateContent({
      model: PRIMARY_MODEL,
      contents: prompt
    });
    
    return result.text || "Transmutation failed.";
  } catch (e) {
    console.error("Transmutation failed:", e);
    return "Failed to transmute content. Check API key.";
  }
}
