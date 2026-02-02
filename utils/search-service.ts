import { GoogleGenAI } from "@google/genai";

export interface TrendResult {
  title: string;
  source: string;
  snippet: string;
  url: string;
}

const PRIMARY_MODEL = process.env.NEXT_PUBLIC_GEMINI_PRIMARY_MODEL || "models/gemini-flash-latest";
const FALLBACK_MODEL = process.env.NEXT_PUBLIC_GEMINI_FALLBACK_MODEL || "models/gemini-3-flash-preview";

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
      },
      {
        title: `Why ${topic} is Overhyped`,
        source: "Reuters (Demo)",
        snippet: "Contrarian investors are shorting the trend, citing lack of fundamentals...",
        url: "https://reuters.com/demo",
      },
      {
         title: "The Silent Crash",
         source: "WSJ (Demo)",
         snippet: "While headlines look good, the underlying metrics tell a different story...",
         url: "https://wsj.com/demo"
      }
    ];
  }

  const prompt = `
    Find high-conflict, controversial, or counter-intuitive news about "${topic}" from the last 48 hours.
    Focus on: Scandals, unexpected risks, "silent killers", or unpopular opinions in the industry.
    Ignore generic press releases.
    
    Always return a valid JSON array of objects with these exact keys: "title", "source", "snippet", "url".
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
      
      // Rate limit - signal to try fallback
      if (errorMessage.includes("429") || errorMessage.includes("Quota") || errorMessage.includes("quota")) {
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
                  url: "https://bloomberg.com"
              },
              {
                  title: "The Silent Crash",
                  source: "Reuters",
                  snippet: "While headlines remain optimistic, underlying metrics suggest a correction is imminent.",
                  url: "https://reuters.com"
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
