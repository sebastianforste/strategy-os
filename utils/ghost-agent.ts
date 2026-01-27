import { findTrends } from "./search-service";
import { generateContent, GeneratedAssets } from "./ai-service";
import { PERSONAS } from "./personas";

export interface GhostDraft {
  id: string;
  topic: string;
  trend: string;
  assets: GeneratedAssets;
  createdAt: number;
  status: 'unread' | 'saved' | 'discarded';
}

const SECTORS = [
  "SaaS Pricing Models",
  "Remote Work Leadership",
  "AI Regulation",
  "Corporate Real Estate",
  "B2B Sales Strategy",
  "Venture Capital Trends",
  "Employee Retention Crisis",
  "Supply Chain Fragility",
  "Cybersecurity Insurance",
  "Executive Burnout"
];

export async function runGhostAgent(apiKey: string): Promise<GhostDraft> {
  // 1. Pick a Sector
  const sector = SECTORS[Math.floor(Math.random() * SECTORS.length)];
  console.log(`[Ghost] Hunting in sector: ${sector}`);

  // 2. Hunt for Conflict (Newsjacking)
  // We force the "Conflict Search" prompt we built earlier
  const trends = await findTrends(sector, apiKey);
  
  let topic = sector;
  let context = "";
  
  if (trends && trends.length > 0) {
    const trend = trends[0];
    topic = trend.title; // Use the specific news title as the topic
    context = `
    CONTEXT FROM REAL NEWS:
    Title: "${trend.title}"
    Source: ${trend.source}
    Snippet: "${trend.snippet}"
    
    Start with a hook about this specific news event but pivot to the strategic failure behind it.
    `;
  } else {
    context = "No specific breaking news found. Invent a 'Silent Crisis' scenario common in this industry.";
  }

  // 3. Generate Content (The CSO Persona is best for "Cold" drafts)
  const persona = PERSONAS.cso;
  
  const prompt = `
  MODE: GHOST AGENT (Autonomous Proactive Draft)
  SECTOR: ${sector}
  ${context}
  
  INSTRUCTIONS:
  You are 'Ghost', the autonomous strategist.
  You found this conflict in the market.
  Write a viral post exposing it.
  Use the 'The Villain' framework.
  `;

  // We reuse the existing generateContent but wrap it
  const assets = await generateContent(prompt, apiKey, "cso");

  return {
    id: crypto.randomUUID(),
    topic: sector, // High level tag
    trend: topic, // Specific story
    assets,
    createdAt: Date.now(),
    status: 'unread'
  };
}
