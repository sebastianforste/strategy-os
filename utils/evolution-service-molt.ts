/**
 * EVOLUTION SERVICE (MOLTBOOK EXTENSION)
 * -------------------------------------
 * Tracks agent engagement on Moltbook to refine persona "Style DNA".
 */

import { moltbookService } from "./moltbook-service";
import { GoogleGenAI } from "@google/genai";
import { ingestStyleSamples } from "./vector-store";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";

export const evolutionServiceMolt = {
  /**
   * LEARN FROM MOLTBOOK ENGAGEMENT
   * Pulls top-performing posts from Moltbook and synthesizes style improvements.
   */
  async learnFromFeedback(personaId: string, submolts: string[] = ["strategy", "philosophy", "growth"]): Promise<{ learnedCount: number; success: boolean }> {
    console.log(`[Evolution] Learning from Moltbook feedback for ${personaId}...`);
    
    try {
      // 1. Fetch Trending AND Top posts from ALL target submolts
      const allTrending = await Promise.all(
        submolts.map(submolt => moltbookService.getTrending(submolt))
      );
      
      const allTop = await Promise.all(
        submolts.map(submolt => moltbookService.getTopPosts(submolt))
      );

      // Flatten and slice
      const trendingPosts = allTrending.flat();
      const elitePosts = allTop.flat();
      const combinedPosts = [...elitePosts, ...trendingPosts].slice(0, 20); 

      if (combinedPosts.length === 0) return { learnedCount: 0, success: true };

      // 2. Synthesize "Why this worked" via Gemini
      const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "";
      if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY or GOOGLE_API_KEY is required for analysis.");

      // Fix: Use the same pattern as vector-store.ts
      const genAI = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

      const prompt = `
        You are an AI Social Psychologist and Master Ghostwriter. 
        Analyze these trending posts from Moltbook (a social network for AI agents).
        
        TRENDING POSTS (HIGH STATUS):
        ${combinedPosts.map((p: any) => `- ${p.content}`).join("\n")}
        
        TASK:
        Identify 3 specific "Viral DNA" patterns that make these posts high-status.
        
        OUTPUT FORMAT (JSON):
        [
          {
            "pattern_name": "Name of the pattern (e.g., The Contrarian Pivot)",
            "mechanism": "How it works (1 sentence)",
            "example_snippet": "A short generic example of this pattern"
          }
        ]
      `;

      // @ts-ignore - SDK types might be outdated in this environment
      let result;
      let retries = 3;
      while (retries > 0) {
        try {
          result = await genAI.models.generateContent({
            model: "gemini-2.0-flash",
            contents: [{ role: "user", parts: [{ text: prompt }] }]
          });
          break;
        } catch (error: any) {
          if (error.status === 429 && retries > 1) {
            console.warn(`[Evolution] Rate limit hit. Retrying in 10s... (${retries - 1} left)`);
            await new Promise(resolve => setTimeout(resolve, 10000));
            retries--;
          } else {
            throw error;
          }
        }
      }

      const learnedAnalysis = result?.candidates?.[0]?.content?.parts?.[0]?.text || "";

      if (!learnedAnalysis) {
        console.warn("[Evolution] No analysis generated.");
        return { learnedCount: 0, success: false };
      }

      // 3. Ingest into Vector Store (Phase 24 Style Memory)
      // We store the raw analysis so it can be retrieved as "Style RAG" context
      await ingestStyleSamples([`MOLTBOOK VIRAL DNA (${new Date().toISOString()}):\n${learnedAnalysis}`]);

      console.log(`[Evolution] Molded persona with ${combinedPosts.length} new insights from Moltbook.`);
      return { learnedCount: combinedPosts.length, success: true };
      
    } catch (error) {
      console.error("[Evolution] Moltbook learning failed:", error);
      return { learnedCount: 0, success: false };
    }
  }
};
