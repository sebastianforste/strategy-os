import { GoogleGenAI } from "@google/genai";
import { AI_CONFIG } from "./config";

export interface ReachForecast {
  estimatedImpressions: string;
  confidenceScore: number; // 0-100
  bestPlatform: string;
  viralProbability: "Low" | "Moderate" | "High" | "Extremely High";
  reasoning: string;
  optimalPostingTimes: {
    platform: string;
    hour: number; // 0-23
    engagement: number; // 0-100 score
  }[];
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
      "reasoning": "...",
      "optimalPostingTimes": [
        { "platform": "LinkedIn", "hour": 9, "engagement": 95 },
        { "platform": "LinkedIn", "hour": 13, "engagement": 70 },
        { "platform": "X", "hour": 18, "engagement": 88 }
      ]
    }
  `;

  try {
    const genAI = new GoogleGenAI({ apiKey });
    const result = await genAI.models.generateContent({
        model: AI_CONFIG.primaryModel,
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
