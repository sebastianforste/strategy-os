import { GoogleGenAI } from "@google/genai";

export interface Signal {
  type: 'market' | 'news';
  value: string;
  source: string;
  url: string;
  timestamp: string;
}

const PRIMARY_MODEL = process.env.NEXT_PUBLIC_GEMINI_PRIMARY_MODEL || "models/gemini-flash-latest";
const FALLBACK_MODEL = process.env.NEXT_PUBLIC_GEMINI_FALLBACK_MODEL || "models/gemini-3-flash-preview";

/**
 * SIGNAL SERVICE
 * --------------
 * Detects real-time "Newsjacking" opportunities by:
 * 1. Searching Serper for "Past Hour" (qdr:h) outcomes.
 * 2. Using Gemini to extract hard data points (stickers, percentages, quotes).
 */
export async function fetchSignals(topic: string, apiKeys: { serper: string; gemini: string }): Promise<Signal[]> {
  if (!topic || !apiKeys.serper || !apiKeys.gemini) return [];

  try {
    // 1. Serper News/Search Call (Past Hour/Day)
    const response = await fetch("https://google.serper.dev/search", {
      method: "POST",
      headers: {
        "X-API-KEY": apiKeys.serper,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        q: `${topic} news market data`,
        num: 5,
        tbs: "qdr:d" // Past day for broader coverage, 'qdr:h' can be too strict for demo
      }),
    });

    if (!response.ok) return [];
    
    const searchData = await response.json();
    const organic = searchData.organic || [];
    const news = searchData.news || [];
    
    // Combine for context
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const contextMap = [...news, ...organic].map((item: any) => 
      `- [${item.source || 'Web'}] ${item.title}: ${item.snippet} (${item.date || 'Recent'})`
    ).join("\n");

    if (!contextMap) return [];

    // 2. Gemini Extraction
    const prompt = `
      Analyze these real-time search results for "${topic}":
      
      ${contextMap}
      
      EXTRACT 3 "SIGNALS" that give a content creator an unfair advantage.
      Focus on:
      - Concrete Numbers (Price changes, funding amounts)
      - Breaking Events (Acquisitions, laws passed)
      - Direct Quotes from key figures
      
      Return JSON Array:
      [
        { "type": "market"|"news", "value": "BTC hit $100k", "source": "Bloomberg", "url": "..." }
      ]
    `;

    const genAI = new GoogleGenAI({ apiKey: apiKeys.gemini });
    
    // Try High Velocity Model
    try {
        const result = await genAI.models.generateContent({
            model: PRIMARY_MODEL,
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });
        
        const text = result.text || "";
        return JSON.parse(text);
    } catch (e) {
        console.warn("Signal extraction failed on primary, trying fallback", e);
        const result = await genAI.models.generateContent({
            model: FALLBACK_MODEL,
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });
        const text = result.text || "";
        return JSON.parse(text);
    }

  } catch (error) {
    console.warn("Signal Service Error:", error);
    return [];
  }
}
