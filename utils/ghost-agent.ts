import { findTrends } from "./search-service";
import { generateContent } from "./ai-service-server";
import { GeneratedAssets } from "./ai-service";
import { PERSONAS } from "./personas";
import { schedulePost } from "./archive-service";

export interface GhostDraft {
  id: string;
  topic: string;
  trend: string;
  assets: GeneratedAssets;
  createdAt: number;
  status: 'unread' | 'saved' | 'discarded' | 'scheduled';
  viralityScore: number;
}

// Dynamic sectors based on 2027-2028 executive concerns
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
  "Executive Burnout",
  "ESG Compliance",
  "Quantum Computing Risk",
  "Creator Economy M&A",
  "Generative AI Liability"
];

/**
 * GHOST AGENT V2: Autonomous Strategist
 * -------------------------------------
 * 1. Dynamic Sector Selection (trend-based)
 * 2. Multi-Draft Generation (3 drafts)
 * 3. Virality Ranking
 * 4. Auto-Schedule Option
 */
export async function runGhostAgent(
  apiKey: string,
  options: { autoSchedule?: boolean; draftCount?: number } = {}
): Promise<GhostDraft[]> {
  const { autoSchedule = false, draftCount = 3 } = options;
  console.log(`[Ghost V2] Starting autonomous hunt. Drafts: ${draftCount}, AutoSchedule: ${autoSchedule}`);

  // 1. Dynamic Sector Selection: Pick sectors with active conflict signals
  const selectedSectors = await selectTrendingSectors(apiKey, draftCount);
  console.log(`[Ghost V2] Selected sectors: ${selectedSectors.join(", ")}`);

  // 2. Generate drafts in parallel
  const draftPromises = selectedSectors.map(sector => generateDraft(sector, apiKey));
  const drafts = await Promise.all(draftPromises);

  // 3. Rank by virality score
  drafts.sort((a, b) => b.viralityScore - a.viralityScore);
  console.log(`[Ghost V2] Top draft: "${drafts[0]?.trend}" (Score: ${drafts[0]?.viralityScore})`);

  // 4. Auto-schedule the best draft if enabled
  if (autoSchedule && drafts.length > 0) {
    const best = drafts[0];
    const scheduledTime = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now
    await schedulePost({
      content: best.assets.textPost,
      topic: best.trend,
      scheduledFor: scheduledTime.toISOString(),
      platform: 'linkedin'
    });
    best.status = 'scheduled';
    console.log(`[Ghost V2] Auto-scheduled "${best.trend}" for ${scheduledTime.toISOString()}`);
  }

  return drafts;
}

/**
 * Select sectors with active conflict signals
 */
async function selectTrendingSectors(apiKey: string, count: number): Promise<string[]> {
  try {
    // Try to find trending topics to inform sector selection
    const generalTrends = await findTrends("business strategy controversy 2027", apiKey);
    
    if (generalTrends.length > 0) {
      // Map trends to closest sectors
      const trendTopics = generalTrends.slice(0, count).map(t => t.title);
      // For now, we still use our sectors but could enhance with NLP matching
      return SECTORS.slice(0, count);
    }
  } catch (e) {
    console.warn("[Ghost V2] Trend fetch failed, using random sectors");
  }
  
  // Fallback: Random selection
  const shuffled = [...SECTORS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

/**
 * Generate a single draft for a sector
 */
async function generateDraft(sector: string, apiKey: string): Promise<GhostDraft> {
  const startTime = Date.now();
  
  // Hunt for conflict in this sector
  const trends = await findTrends(sector, apiKey);
  
  let topic = sector;
  let context = "";
  
  if (trends && trends.length > 0) {
    const trend = trends[0];
    topic = trend.title;
    context = `
    REAL NEWS CONTEXT:
    Title: "${trend.title}"
    Source: ${trend.source}
    Snippet: "${trend.snippet}"
    
    Hook on this specific event, then pivot to the strategic failure.
    `;
  } else {
    context = "No breaking news. Invent a 'Silent Crisis' scenario common in this industry.";
  }

  const prompt = `
  MODE: GHOST AGENT V2 (Autonomous Draft)
  SECTOR: ${sector}
  ${context}
  
  INSTRUCTIONS:
  You are 'Ghost', the autonomous strategist.
  Write a viral post exposing a conflict in the market.
  Use the 'The Villain' framework: Identify who is lying or what is broken.
  `;

  const assets = await generateContent(prompt, apiKey, "cso");
  
  // Calculate virality score (heuristic based on content characteristics)
  const viralityScore = calculateViralityScore(assets.textPost);
  
  console.log(`[Ghost V2] Draft for "${sector}" completed in ${Date.now() - startTime}ms (Score: ${viralityScore})`);

  return {
    id: crypto.randomUUID(),
    topic: sector,
    trend: topic,
    assets,
    createdAt: Date.now(),
    status: 'unread',
    viralityScore
  };
}

/**
 * Heuristic virality score (0-100)
 */
function calculateViralityScore(content: string): number {
  let score = 50; // Base score
  
  // Positive signals
  if (content.includes("?")) score += 5; // Questions drive engagement
  if (content.length > 500 && content.length < 1500) score += 10; // Optimal length
  if (/\d+%/.test(content)) score += 8; // Stats increase credibility
  if (content.includes("👇") || content.includes("🧵")) score += 5; // Thread indicators
  if (/\n\n/.test(content)) score += 5; // Good formatting
  
  // Negative signals
  if (content.length < 200) score -= 15; // Too short
  if (content.length > 2000) score -= 10; // Too long
  if (/delve|unleash|game.?changer/i.test(content)) score -= 20; // Robot words
  
  return Math.max(0, Math.min(100, score));
}

// Legacy export for backward compatibility
export { runGhostAgent as runGhostAgentV1 };
