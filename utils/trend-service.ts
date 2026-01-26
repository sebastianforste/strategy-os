import { GoogleGenerativeAI } from "@google/generative-ai";

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
  const genAI = new GoogleGenerativeAI(apiKey);
  // Using gemini-1.5-flash for speed/cost or gemini-3.0-flash if preferred, 
  // keeping consistent with ai-service which uses gemini-3-flash-preview.
  const model = genAI.getGenerativeModel({ model: "models/gemini-1.5-flash" });

  const prompt = `
    Analyze the topic: "${topic}" from a business strategy perspective.
    Generate a 3-part deep dive report in JSON format:
    
    1. "mainstreamView": What is the common, generic advice people give about this?
    2. "contrarianAngle": What is a smart, defensible way to disagree with the mainstream?
    3. "underratedInsight": What is a specific nuance most people miss?

    Keep each section under 20 words. Concise, punchy, "Wall Street" style.
    Values should be plain strings.
  `;

  try {
    const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json" }
    });
    
    const text = result.response.text();
    return JSON.parse(text);
  } catch (e) {
    console.error("Deep dive generation failed:", e);
    return {
        mainstreamView: "Analysis unavailable.",
        contrarianAngle: "Try again later.",
        underratedInsight: "Service disruption."
    };
  }
}
