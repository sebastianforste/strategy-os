import { GoogleGenAI } from "@google/genai";
import { AI_CONFIG } from "./config";
import { isRateLimitError } from "./gemini-errors";

export interface TrendResult {
  title: string;
  source: string;
  snippet: string;
  url: string;
  sentiment: "Bullish" | "Bearish" | "Neutral" | "Controversial";
  momentum: number; // 0-100
}

const PRIMARY_MODEL = AI_CONFIG.primaryModel;
const FALLBACK_MODEL = AI_CONFIG.fallbackModel;

export async function findTrends(topic: string, apiKey?: string): Promise<TrendResult[]> {
  // Check for Demo Mode
  if (!apiKey || apiKey.toLowerCase().trim() === "demo") {
    // Simulate network delay
    await new Promise(r => setTimeout(r, 1000));
    
    return [
      {
        title: `Big Move in ${topic} Markets`,
        source: "Bloomberg (Demo)",
        snippet: "In a surprise shift today, analysts confirm that the sector is pivoting...",
        url: "https://bloomberg.com/demo",
        sentiment: "Bullish",
        momentum: 85
      },
      {
        title: `Why ${topic} is Overhyped`,
        source: "Reuters (Demo)",
        snippet: "Contrarian investors are shorting the trend, citing lack of fundamentals...",
        url: "https://reuters.com/demo",
        sentiment: "Bearish",
        momentum: 92
      },
      {
         title: "The Silent Crash",
         source: "WSJ (Demo)",
         snippet: "While headlines look good, the underlying metrics tell a different story...",
         url: "https://wsj.com/demo",
         sentiment: "Controversial",
         momentum: 78
      }
    ];
  }

  const prompt = `
    Find high-conflict, controversial, or counter-intuitive news about "${topic}" from the last 48 hours.
    Focus on: Scandals, unexpected risks, "silent killers", or unpopular opinions in the industry.
    Ignore generic press releases.
    
    For each item, also provide:
    1. "sentiment": One of "Bullish", "Bearish", "Neutral", "Controversial".
    2. "momentum": A score from 0-100 based on how fast the story is gaining traction.

    Always return a valid JSON array of objects with these exact keys: "title", "source", "snippet", "url", "sentiment", "momentum".
    Limit to 3 items.
    
    Output strictly valid JSON only. No markdown formatting.
    `;

  async function tryWithModel(modelName: string): Promise<TrendResult[] | null> {
    try {
      const genAI = new GoogleGenAI({ apiKey: apiKey! });
      
      const result = await genAI.models.generateContent({
          model: modelName,
          contents: prompt,
          config: {
             tools: [{ googleSearch: {} }]
          }
      });

      let responseText = result.text || "";
      
      // Clean up potential markdown code blocks
      responseText = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
      
      let data;
      try {
          data = JSON.parse(responseText);
      } catch {
          console.warn("Failed to parse Grounding JSON:", responseText);
          return [];
      }

      // Handle various potential JSON structures from the model
      if (Array.isArray(data)) {
          return data.slice(0, 3);
      } else if (data.news && Array.isArray(data.news)) {
          return data.news.slice(0, 3);
      } else if (data.items && Array.isArray(data.items)) {
          return data.items.slice(0, 3);
      }
      
      return [];
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "";
      
      // Provide backup if rate limited
      if (isRateLimitError(error)) {
        console.warn(`[TrendHunt] Rate limit on ${modelName}, will try fallback`);
        return null;
      }
      
      // Server errors - return mock data
      if (errorMessage.includes("503")) {
          console.warn("Trend Hunt Usage Limit. Switching to Mock Data.");
          return [
              {
                  title: `${topic} Market Shift (Mock - Limit Reached)`,
                  source: "Bloomberg",
                  snippet: "Analysts denote a paradigm shift in the sector as new entrants disrupt legacy players.",
                  url: "https://bloomberg.com",
                  sentiment: "Bullish",
                  momentum: 50
              },
              {
                  title: "The Silent Crash",
                  source: "Reuters",
                  snippet: "While headlines remain optimistic, underlying metrics suggest a correction is imminent.",
                  url: "https://reuters.com",
                  sentiment: "Bearish",
                  momentum: 65
              }
          ];
      }
      console.error("Trend Hunt (Grounding) Failed:", error);
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

/**
 * GENERIC GROUNDED SEARCH
 * -----------------------
 * Performs a broad search using Google Grounding for general intelligence gathering.
 * Useful for finding collaborative articles, influencers, or generic topics.
 */
export async function searchGrounding(query: string, apiKey?: string, maxResults: number = 5): Promise<{ title: string; link: string; snippet: string; source: string }[]> {
  if (!apiKey || apiKey.toLowerCase().trim() === "demo") {
      return [
          { title: "Demo Search Result 1", link: "https://example.com/1", snippet: "This is a demo result for " + query, source: "DemoSource" },
          { title: "Demo Search Result 2", link: "https://example.com/2", snippet: "Another demo result relevant to " + query, source: "DemoSource" }
      ];
  }

  const prompt = `
    Perform a Google Search for: "${query}"
    
    Return the top ${maxResults} most relevant results.
    For each result, provide:
    - title
    - link (url)
    - snippet (summary)
    - source (domain name)

    Output ONLY valid JSON array.
  `;

  async function tryWithModel(modelName: string): Promise<{ title: string; link: string; snippet: string; source: string }[] | null> {
    try {
        const genAI = new GoogleGenAI({ apiKey: apiKey! });
        const result = await genAI.models.generateContent({
            model: modelName,
            contents: prompt,
            config: {
               tools: [{ googleSearch: {} }]
            }
        });

        const text = result.text || "[]";
        const jsonText = text.replace(/```json|```/g, "").trim();
        
        let data;
        try {
            data = JSON.parse(jsonText);
        } catch {
            return [];
        }

        // Normalized extraction
        if (Array.isArray(data)) return data;
        if (data.results) return data.results;
        if (data.items) return data.items;
        
        return [];
    } catch (error: unknown) {
        if (isRateLimitError(error)) {
            console.warn(`[SearchService] Rate limit on ${modelName}, will try fallback`);
            return null;
        }
        console.error("[SearchService] Grounding failed:", error);
        return [];
    }
  }

  // Try primary, fallback on rate limit
  let result = await tryWithModel(PRIMARY_MODEL);
  if (result === null) {
    console.log("[SearchService] Trying fallback model...");
    result = await tryWithModel(FALLBACK_MODEL);
  }
  // If still rate limited, return empty gracefully
  return result || [];
}
