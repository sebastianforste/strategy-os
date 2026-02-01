import { GoogleGenAI } from "@google/genai";

export interface CompetitorContent {
  title: string;
  link: string;
  snippet: string;
  date: string;
  source: string;
}

/**
 * TREND REPORT SCHEMA
 * -------------------
 * Output format for deep-dive topic analysis.
 */
export interface TrendReport {
  mainstreamView: string;
  contrarianAngle: string;
  underratedInsight: string;
}

export async function searchCompetitorContent(
  competitorName: string, 
  apiKey: string
): Promise<CompetitorContent[]> {
  if (!apiKey) return [];

  try {
    const query = `site:linkedin.com/in/ OR site:twitter.com "${competitorName}" "posted"`;
    
    const response = await fetch("https://google.serper.dev/search", {
      method: "POST",
      headers: {
        "X-API-KEY": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        q: query,
        num: 5,
        tbs: "qdr:w" // past week
      }),
    });

    if (!response.ok) {
       console.error("Serper API error:", await response.text());
       return [];
    }
    
    const data = await response.json();
    if (!data.organic) return [];

    interface SerperItem {
      title: string;
      link: string;
      snippet: string;
      date?: string;
    }

    return data.organic.map((item: SerperItem) => ({
      title: item.title,
      link: item.link,
      snippet: item.snippet,
      date: item.date || "Recent",
      source: item.link.includes("linkedin") ? "LinkedIn" : "Twitter/X"
    }));

  } catch (e) {
    console.error("Failed to search competitor:", e);
    return [];
  }
}

const PRIMARY_MODEL = "models/gemini-flash-latest";
const FALLBACK_MODEL = "models/gemini-1.5-flash";

/**
 * TREND REPORT GENERATOR
 * ----------------------
 * Generates a "Deep Dive" strategy report for a given topic.
 * 
 * Output Structure:
 * 1. Mainstream View (The common consensus)
 * 2. Contrarian Angle (The value-add disagreement)
 * 3. Underrated Insight (The nuanced detail)
 */
export async function generateTrendReport(
  topic: string,
  apiKey: string
): Promise<TrendReport> {
  const prompt = `
    Analyze the topic: "${topic}" from a business strategy perspective.
    Generate a 3-part deep dive report in JSON format:
    
    1. "mainstreamView": What is the common, generic advice people give about this?
    2. "contrarianAngle": What is a smart, defensible way to disagree with the mainstream?
    3. "underratedInsight": What is a specific nuance most people miss?

    Keep each section under 20 words. Concise, punchy, "Wall Street" style.
    Values should be plain strings.
  `;

  async function tryWithModel(modelName: string): Promise<TrendReport | null> {
    try {
      const genAI = new GoogleGenAI({ apiKey });
      const result = await genAI.models.generateContent({
          model: modelName,
          contents: prompt,
          config: { responseMimeType: "application/json" }
      });
      
      const text = result.text || "";
      return JSON.parse(text);
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : "";
      if (errorMessage.includes("429") || errorMessage.includes("Quota") || errorMessage.includes("quota")) {
        console.warn(`[TrendReport] Rate limit on ${modelName}, will try fallback`);
        return null; // Signal fallback
      }
      console.error("Deep dive generation failed:", e);
      return {
          mainstreamView: "Analysis unavailable.",
          contrarianAngle: "Try again later.",
          underratedInsight: "Service disruption."
      };
    }
  }

  // Try primary, fallback on rate limit
  let result = await tryWithModel(PRIMARY_MODEL);
  if (result === null) {
    result = await tryWithModel(FALLBACK_MODEL);
  }
  return result || {
      mainstreamView: "Analysis unavailable.",
      contrarianAngle: "Try again later.",
      underratedInsight: "Service disruption."
  };
}
