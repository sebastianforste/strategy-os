/**
 * RESEARCH SERVICE - 2027 Agentic Intelligence
 * 
 * Handles deep topic research before content generation:
 * 1. Fetches real-time news headlines
 * 2. Searches for competitor/influencer content
 * 3. Synthesizes findings into a Research Brief
 * 
 * This service powers the "Agentic Mode" autonomous workflow.
 */

import { GoogleGenAI } from "@google/genai";
import { fetchTrendingNews, searchCompetitorContent } from "./trend-service";

// --- TYPES ---

export interface ResearchBrief {
  topic: string;
  newsHeadlines: string[];
  competitorInsights: string[];
  synthesizedContext: string;
  suggestedAngles: string[];
  timestamp: string;
}

export interface ResearchProgress {
  phase: "news" | "competitors" | "synthesis" | "complete";
  message: string;
}

// --- CONFIG ---

const PRIMARY_MODEL = process.env.NEXT_PUBLIC_GEMINI_PRIMARY_MODEL || "models/gemini-flash-latest";

/**
 * RUN DEEP RESEARCH
 * -----------------
 * Performs autonomous multi-step research on a topic.
 * 
 * Steps:
 * 1. Fetch real-time news (past 24h)
 * 2. Search for competitor/influencer content
 * 3. Synthesize findings into a coherent Research Brief
 * 
 * @param topic - The topic to research
 * @param apiKeys - API keys for Gemini and Serper
 * @param onProgress - Optional callback for progress updates
 * @returns A structured Research Brief
 */
export async function runDeepResearch(
  topic: string,
  apiKeys: { gemini: string; serper?: string },
  onProgress?: (progress: ResearchProgress) => void
): Promise<ResearchBrief> {
  // Phase 1: Fetch real-time news
  onProgress?.({ phase: "news", message: "Scanning real-time news..." });
  let newsHeadlines: string[] = [];
  if (apiKeys.serper) {
    newsHeadlines = await fetchTrendingNews(topic, apiKeys.serper);
  }
  
  // Phase 2: Search for competitor content
  onProgress?.({ phase: "competitors", message: "Analyzing competitor content..." });
  const competitorInsights: string[] = [];
  if (apiKeys.serper) {
    // Extract key influencers/companies from the topic
    const competitors = extractCompetitorNames(topic);
    for (const competitor of competitors.slice(0, 2)) { // Limit to 2 to avoid rate limits
      const content = await searchCompetitorContent(competitor, apiKeys.serper);
      competitorInsights.push(...content.map(c => `${c.source}: ${c.snippet}`).slice(0, 2));
    }
  }
  
  // Phase 3: Synthesize findings
  onProgress?.({ phase: "synthesis", message: "Synthesizing research brief..." });
  const synthesizedContext = await synthesizeResearchFindings(
    topic,
    newsHeadlines,
    competitorInsights,
    apiKeys.gemini
  );
  
  // Phase 4: Generate suggested angles
  const suggestedAngles = await generateSuggestedAngles(
    topic,
    synthesizedContext,
    apiKeys.gemini
  );
  
  onProgress?.({ phase: "complete", message: "Research complete." });
  
  return {
    topic,
    newsHeadlines,
    competitorInsights,
    synthesizedContext,
    suggestedAngles,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Extract potential competitor/influencer names from a topic.
 * Uses simple heuristics - could be enhanced with NER.
 */
function extractCompetitorNames(topic: string): string[] {
  // Look for capitalized words that might be names/companies
  const words = topic.split(/\s+/);
  const potentialNames = words.filter(word => 
    word.length > 2 && 
    /^[A-Z]/.test(word) &&
    !["The", "And", "For", "With", "How", "Why", "What", "When", "Where"].includes(word)
  );
  
  // If no names found, use the topic keywords
  if (potentialNames.length === 0) {
    return [topic.split(" ").slice(0, 2).join(" ")];
  }
  
  return potentialNames.slice(0, 3);
}

/**
 * Synthesize research findings into a coherent context paragraph.
 */
async function synthesizeResearchFindings(
  topic: string,
  news: string[],
  competitors: string[],
  apiKey: string
): Promise<string> {
  if (news.length === 0 && competitors.length === 0) {
    return `No real-time data available for "${topic}". Generating content based on general knowledge.`;
  }
  
  const genAI = new GoogleGenAI({ apiKey });
  
  const prompt = `
    You are a senior research analyst. Synthesize the following research into a 2-3 sentence context brief.
    
    TOPIC: ${topic}
    
    REAL-TIME NEWS (past 24h):
    ${news.length > 0 ? news.map(n => `- ${n}`).join("\n") : "No recent news found."}
    
    COMPETITOR/INFLUENCER CONTENT:
    ${competitors.length > 0 ? competitors.map(c => `- ${c}`).join("\n") : "No competitor content found."}
    
    OUTPUT:
    Write a concise synthesis that:
    1. Identifies the current narrative/trend
    2. Notes any contrarian opportunities
    3. Highlights what competitors are saying
    
    Keep it under 50 words. Be specific, not generic.
  `;
  
  try {
    const result = await genAI.models.generateContent({
      model: PRIMARY_MODEL,
      contents: prompt
    });
    return result.text || "Research synthesis unavailable.";
  } catch (e) {
    console.error("Failed to synthesize research:", e);
    return `Research found ${news.length} news items and ${competitors.length} competitor insights for "${topic}".`;
  }
}

/**
 * Generate 3 suggested content angles based on research.
 */
async function generateSuggestedAngles(
  topic: string,
  context: string,
  apiKey: string
): Promise<string[]> {
  const genAI = new GoogleGenAI({ apiKey });
  
  const prompt = `
    You are a viral content strategist. Based on this research, suggest 3 provocative angles for a LinkedIn post.
    
    TOPIC: ${topic}
    RESEARCH CONTEXT: ${context}
    
    OUTPUT:
    Return a JSON array of 3 strings, each under 15 words.
    Focus on contrarian, surprising, or counterintuitive angles.
    
    Example: ["The real reason X fails isn't Y", "Everyone is wrong about Z", "What nobody tells you about A"]
  `;
  
  try {
    const result = await genAI.models.generateContent({
      model: PRIMARY_MODEL,
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });
    const text = result.text || "[]";
    return JSON.parse(text);
  } catch (e) {
    console.error("Failed to generate angles:", e);
    return [
      `The contrarian view on ${topic}`,
      `What everyone gets wrong about ${topic}`,
      `The hidden truth about ${topic}`
    ];
  }
}

/**
 * FORMAT RESEARCH BRIEF FOR PROMPT
 * --------------------------------
 * Converts a Research Brief into a formatted string for injection into the generation prompt.
 */
export function formatResearchForPrompt(brief: ResearchBrief): string {
  return `
=== RESEARCH BRIEF (Agentic Mode) ===
Topic: ${brief.topic}
Timestamp: ${brief.timestamp}

CURRENT NARRATIVE:
${brief.synthesizedContext}

SUGGESTED ANGLES:
${brief.suggestedAngles.map((a, i) => `${i + 1}. ${a}`).join("\n")}

INSTRUCTIONS:
- Use this research to ground your content in current events
- Choose one of the suggested angles OR create a better one
- Be specific, not generic
=====================================
  `.trim();
}
