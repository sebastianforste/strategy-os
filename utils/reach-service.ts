import { GoogleGenAI } from "@google/genai";

export interface ReachForecast {
  estimatedImpressions: string;
  confidenceScore: number; // 0-100
  bestPlatform: string;
  viralProbability: "Low" | "Moderate" | "High" | "Extremely High";
  reasoning: string;
}

/**
 * REACH FORECASTER (2028 ALPHA)
 * ----------------------------
 * Predicts the performance of a post across multiple platforms.
 */
export async function getReachForecast(content: string, apiKey: string): Promise<ReachForecast | null> {
  if (!content || !apiKey) return null;

  const prompt = `
    You are an Algorithmic Analyst for 2028 social media platforms.
    Analyze the following content and predict its performance.
    
    CONTENT:
    """
    ${content}
    """
    
    GUIDELINES:
    - LinkedIn impressions are generally 2x-5x higher than follower count for viral content.
    - X (Twitter) depends heavily on the first hook line.
    - Confidence score should reflect how much this adheres to proven viral patterns.
    
    OUTPUT JSON:
    {
      "estimatedImpressions": "10k - 50k",
      "confidenceScore": 85,
      "bestPlatform": "LinkedIn",
      "viralProbability": "High",
      "reasoning": "Strong opening hook, contrarian take on common industry belief."
    }
  `;

  try {
    const genAI = new GoogleGenAI({ apiKey });
    const result = await genAI.models.generateContent({
        model: "models/gemini-flash-latest",
        contents: prompt,
        config: { responseMimeType: "application/json" }
    });

    const text = result.text || "";
    return JSON.parse(text) as ReachForecast;
  } catch (e) {
    console.error("Reach forecast failed:", e);
    return null;
  }
}
