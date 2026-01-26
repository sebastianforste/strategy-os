import { GoogleGenerativeAI } from "@google/generative-ai";

export interface TrendResult {
  title: string;
  source: string;
  snippet: string;
  url: string;
}

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

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
        model: "gemini-flash-latest", 
        // @ts-expect-error - googleSearch is a valid tool but types might lag
        tools: [{ googleSearch: {} }] 
    });

    const prompt = `
    Find breaking news about "${topic}" in business strategy from the last 24 hours.
    Always return a valid JSON array of objects with these exact keys: "title", "source", "snippet", "url".
    Limit to 3 items.
    
    Output strictly valid JSON only. No markdown formatting.
    `;

    const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }]}],
    });

    let responseText = result.response.text();
    
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
    if (errorMessage.includes("429") || errorMessage.includes("503")) {
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
