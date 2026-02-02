import { GoogleGenAI } from "@google/genai";

export interface PredictionResult {
  score: number; // 0-100
  breakdown: {
    hookStrength: number; // 0-100
    retainability: number; // 0-100
    viralityPotential: number; // 0-100
  };
  critique: string;
  improvementTips: string[];
}

const PRIMARY_MODEL = process.env.NEXT_PUBLIC_GEMINI_PRIMARY_MODEL || "models/gemini-flash-latest";
const FALLBACK_MODEL = process.env.NEXT_PUBLIC_GEMINI_FALLBACK_MODEL || "models/gemini-3-flash-preview";

/**
 * PREDICTIVE SERVICE
 * ------------------
 * "Pre-Post" Analytics.
 * Uses Gemini to score a draft against high-performing LinkedIn patterns.
 */
export async function predictImpact(draft: string, apiKey: string): Promise<PredictionResult | null> {
  if (!draft || draft.length < 50 || !apiKey) return null;

  try {
    const prompt = `
      You are a LinkedIn Virality Algorithm Simulator. 
      Analyze the following draft post and predict its performance score (0-100).
      
      DRAFT POST:
      """
      ${draft}
      """
      
      SCORING CRITERIA:
      1. Hook Strength (40%): Curiosity gap, pattern interrupt, emotional hook.
      2. Retainability (30%): Formatting, whitespace, sentence variance, readability.
      3. Virality Potential (30%): Shareability, controversy, "Lightbulb Moment" factor.
      
      OUTPUT FORMAT (JSON ONLY):
      {
        "score": 85,
        "breakdown": {
          "hookStrength": 90,
          "retainability": 80,
          "viralityPotential": 85
        },
        "critique": "One sentence summary of why this score was given.",
        "improvementTips": [
          "Tip 1 (specific action)",
          "Tip 2 (specific action)",
          "Tip 3 (specific action)"
        ]
      }
    `;

    const genAI = new GoogleGenAI({ apiKey });
    
    // Try High Velocity Model
    async function tryModel(model: string) {
       const result = await genAI.models.generateContent({
            model: model,
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });
        const text = result.text || "";
        return JSON.parse(text);
    }

    try {
        return await tryModel(PRIMARY_MODEL);
    } catch (e) {
        console.warn("Prediction failed on primary, using fallback", e);
        return await tryModel(FALLBACK_MODEL);
    }

  } catch (error) {
    console.warn("Predictive Service Error:", error);
    return null;
  }
}
