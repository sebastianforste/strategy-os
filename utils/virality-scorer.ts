import { GoogleGenAI } from "@google/genai";
import { AI_CONFIG } from "./config";

export interface ViralityScore {
  totalScore: number;
  hookScore: number;
  readabilityScore: number;
  strategyScore: number;
  feedback: string[];
  improvedHook?: string;
}

export async function scorePostVirality(content: string, apiKey: string): Promise<ViralityScore> {
  if (!apiKey) throw new Error("API Key required for Virality Scoring");
  
  const genAI = new GoogleGenAI({ apiKey });
  
  const prompt = `
  Analyze the following social media post (LinkedIn/Twitter) and score its "Virality Potential" from 0-100.
  
  POST CONTENT:
  """
  ${content}
  """
  
  SCORING CRITERIA:
  1. HOOK (0-40 pts): Does the first line stop the scroll? Is it punchy, contradictory, or surprising? (Low score for "I'm excited to announce...")
  2. READABILITY (0-30 pts): Is there "white space"? Short sentences? Vertical rhythm? (Low score for walls of text).
  3. STRATEGY (0-30 pts): Is it authoritative? Does it avoid cliches? (Low score for "Delve", "Leverage", "Generic advice").
  
  OUTPUT FORMAT (JSON ONLY):
  {
    "hookScore": number, // 0-40
    "readabilityScore": number, // 0-30
    "strategyScore": number, // 0-30
    "totalScore": number, // Sum of above
    "feedback": ["Bulleted list of 3 specific improvements"],
    "improvedHook": "A rewritten, viral-worthy version of the first line (if score < 35)"
  }
  `;

  try {
    const result = await genAI.models.generateContent({
      model: AI_CONFIG.primaryModel,
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });

    const responseText = result.text;
    if (!responseText) throw new Error("No response from AI");
    
    return JSON.parse(responseText);
  } catch (error) {
    console.error("Virality Scoring Failed:", error);
    // Fallback if AI fails
    return {
      totalScore: 50,
      hookScore: 20,
      readabilityScore: 15,
      strategyScore: 15,
      feedback: ["AI Scoring unavailable. Check manual guidelines."],
    };
  }
}

export interface HookVariant {
  text: string;
  style: "Contrarian" | "Story" | "Negative" | "Curiosity";
  ctr: number; // Simulated CTR (e.g. 1.2% - 3.5%)
  attention: number; // Simulated Attention Score (0-100)
}

export async function generateAlternativeHooks(topic: string, currentHook: string | undefined, apiKey: string): Promise<HookVariant[]> {
  const genAI = new GoogleGenAI({ apiKey });
  
  // Handle empty/placeholder hook
  const hookContext = currentHook && currentHook.length > 5 
    ? `CURRENT HOOK TO IMPROVE: "${currentHook}"` 
    : "NO CURRENT HOOK. GENERATE FROM SCRATCH.";

  const prompt = `
  Generate 4 "Viral Hooks" (opening lines) for a LinkedIn post about: "${topic}".
  
  ${hookContext}
  
  CRITERIA:
  1. Must constitute a "Pattern Interrupt" (start with a negative qualifier, a hard truth, or a paradox).
  2. Under 15 words.
  3. No questions unless rhetorical and punchy.
  4. Use "High Status" language (Authoritative, no hedging).
  
  OUTPUT FORMAT (JSON ARRAY of objects):
  [
    {
      "text": "The hook text...",
      "style": "Contrarian" | "Story" | "Negative" | "Curiosity",
      "ctr": number, // Estimate CTR between 1.5 and 4.5
      "attention": number // Estimate Attention Score 70-99
    }
  ]
  `;

  try {
    const result = await genAI.models.generateContent({
      model: AI_CONFIG.primaryModel,
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });
    
    const responseText = result.text;
    return JSON.parse(responseText || "[]");
  } catch (e) {
    console.error("Hook Generation Failed", e);
    return [];
  }
}
