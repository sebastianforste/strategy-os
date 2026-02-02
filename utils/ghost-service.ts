export interface Signal {
  id: string;
  topic: string;
  source: "X_TRENDS" | "TECHCRUNCH" | "HN" | "MARKET_MOVER";
  relevanceScore: number;
  velocity: "RISING" | "PEAKING" | "EXPLODING";
  timestamp: string;
  summary: string;
  suggestedAngle: string;
}

import { findTrends } from "./search-service";

export async function scanForSignals(apiKey?: string): Promise<Signal | null> {
  if (!apiKey) return null;

  try {
    // Search for highly volatile "Pattern Interruption" topics
    const trends = await findTrends("breaking business strategy controversy", apiKey);
    
    if (trends && trends.length > 0) {
      const topTrend = trends[Math.floor(Math.random() * trends.length)];
      
      // We don't want to alert on every scan to keep it "special"
      if (Math.random() > 0.4) {
        return {
            id: Math.random().toString(36).substring(7),
            topic: topTrend.title,
            source: "MARKET_MOVER",
            relevanceScore: 85 + Math.floor(Math.random() * 15),
            velocity: Math.random() > 0.5 ? "EXPLODING" : "RISING",
            timestamp: "Just now",
            summary: topTrend.snippet,
            suggestedAngle: "Analyze how this disrupts established business models and who loses the most."
        };
      }
    }
  } catch (e) {
    console.error("Signal scan failed:", e);
  }
  return null;
}
