"use server";

import { GoogleGenAI } from "@google/genai";
import { AI_CONFIG } from "./config";

import { BANNED_WORDS as CRINGE_WORDS, applyAntiRobotFilter } from "./text-processor";

export interface Critique {
  score: number; // 0-100
  issues: string[]; // List of specific problems
  verdict: "PUBLISH" | "REFINE";
}

/**
 * Checks for banned words and returns a list of violations.
 */
export async function checkGuardrails(content: string): Promise<string[]> {
  const violations: string[] = [];
  const lower = content.toLowerCase();
  
  CRINGE_WORDS.forEach(word => {
    if (lower.includes(word)) {
      violations.push(word);
    }
  });
  
  return violations;
}

/**
 * THE CRITIC: ruthless editor that looks for fluff and clichés.
 */
export async function critiquePost(content: string, apiKey: string): Promise<Critique> {
  const genAI = new GoogleGenAI({ apiKey });
  
  const prompt = `
    You are a ruthless, cynical senior editor at a tier-1 publication.
    Your job is to reject content that is "AI-sounding", cliché, or boring.
    
    Analyze this LinkedIn post:
    """
    ${content}
    """
    
    CRITICISM RULES:
    1. Hate clichés (e.g., "In today's fast-paced world...").
    2. Hate fluff (sentences that say nothing).
    3. Hate weak hooks (opening lines that don't grab attention).
    4. Hate "bro-etry" if it feels fake.
    
    OUTPUT JSON ONLY:
    {
      "score": number (0-100, be harsh),
      "issues": ["Issue 1", "Issue 2"],
      "verdict": "PUBLISH" (if score > 85) or "REFINE"
    }
  `;
  
  try {
     const result = await genAI.models.generateContent({
        model: AI_CONFIG.primaryModel,
        contents: prompt,
        config: { responseMimeType: "application/json" }
     });
     
     const text = result.text || "";
     return JSON.parse(text) as Critique;
  } catch (e) {
      console.error("Critique failed:", e);
      // Fallback to allow publishing if AI fails
      return { score: 90, issues: [], verdict: "PUBLISH" };
  }
}

/**
 * THE REFINER: Rewrites content based on the Critic's feedback.
 */
export async function refinePost(content: string, critique: Critique, apiKey: string): Promise<string> {
   const genAI = new GoogleGenAI({ apiKey });
   
   const prompt = `
     You are a master copywriter.
     Review this draft and the Editor's feedback. Rewrite it to be WORLD CLASS.
     
     DRAFT:
     """
     ${content}
     """
     
     EDITOR FEEDBACK:
     - Score: ${critique.score}/100
     - Issues: ${critique.issues.join(", ")}
     
     INSTRUCTIONS:
     1. Fix all issues identified by the editor.
     2. Make the hook significantly punchier (under 12 words).
     3. Remove all "cringe" words (delve, tapestry, unlock, leverage, unleash, navigate, embark, facilitate).
     4. VIRAL SYNTAX (CRITICAL): EVERY SINGLE SENTENCE must be its own paragraph. Use DOUBLE newline breaks between EVERY sentence.
     5. Keep the core insight but make it sound human and high-status.
     
     Return ONLY the rewritten post text.
   `;
   
   try {
     const result = await genAI.models.generateContent({
        model: AI_CONFIG.primaryModel,
        contents: prompt
     });
     return result.text || content;
   } catch (e) {
       console.error("Refinement failed:", e);
       return content;
   }
}

/**
 * Main Orchestrator: The Adversarial Loop
 */
export async function optimizeContent(content: string, apiKey: string): Promise<string> {
    if (!content || !apiKey) return content;
    
    // 1. Guardrail Check
    const violations = await checkGuardrails(content);
    if (violations.length > 0) {
        console.log(`[Guardrails] Found cringe words: ${violations.join(", ")}`);
        // We will let the refiner fix these implicitly or explicitly
    }
    
    // 2. The Critic
    console.log("[Viral Opt] invoking Critic...");
    const critique = await critiquePost(content, apiKey);
    console.log(`[Viral Opt] Critic Verdict: ${critique.verdict} (Score: ${critique.score})`);
    
    // 3. The Decision
    if (critique.verdict === "PUBLISH" && violations.length === 0) {
        return content;
    }
    
    // 4. The Refiner (if needed)
    console.log("[Viral Opt] invoking Refiner...");
    const refined = await refinePost(content, critique, apiKey);
    
    // 5. Final Safety Net: Deterministic Filter
    return applyAntiRobotFilter(refined);
}
