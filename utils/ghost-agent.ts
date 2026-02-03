import { findTrends } from "./search-service";
import { generateContent } from "./ai-service-server";
import { GeneratedAssets } from "./ai-service";
import { PERSONAS } from "./personas";
import { schedulePost } from "./archive-service";

export interface GhostDraft {
  id: string;
  topic: string; // The specific angle/topic chosen
  trend: string; // The headline
  trendSource?: string; // The origin event (e.g. "TechCrunch: AI Act Passed")
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
  const selectedSectorObjects = await selectTrendingSectors(apiKey, draftCount);
  console.log(`[Ghost V2] Selected sectors: ${selectedSectorObjects.map(s => s.sector).join(", ")}`);

  // 2. Generate drafts in parallel
  const draftPromises = selectedSectorObjects.map(item => generateDraft(item.sector, apiKey, item.trendContext, item.source));
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

interface SectorOpportunity {
    sector: string;
    trendContext: string; // The raw news snippet to feed the prompt
    source: string;
}

/**
 * Select sectors by analyzing real-time trends and mapping them to opportunities.
 */
async function selectTrendingSectors(apiKey: string, count: number): Promise<SectorOpportunity[]> {
  const opportunities: SectorOpportunity[] = [];
  
  try {
    // 1. Fetch Chaos/Conflict Trends
    console.log("[Ghost V2] Scanning for global business conflicts...");
    const generalTrends = await findTrends("business strategy controversy 2027", apiKey);
    
    if (generalTrends.length > 0) {
       // 2. Analyze top trends to find best sectors
       // We'll take the top 5 trends and ask AI to map them
       const trendSummary = generalTrends.slice(0, 5).map((t, i) => `${i+1}. "${t.title}" (${t.source}): ${t.snippet}`).join("\n");
       
       const analysisPrompt = `
       TASK: Analyze these real-world trends and map them to the most relevant business sectors.
       
       TRENDS:
       ${trendSummary}
       
       AVAILABLE SECTORS:
       ${SECTORS.join(", ")}
       
       INSTRUCTIONS:
       For the top ${count} most "viral" or "critical" trends, identifying the matching Sector.
       If no existing sector fits, INVENT a new relevant sector name (e.g., "Neuromorphic Computing").
       
       OUTPUT JSON ONLY:
       [
         { "sector": "Sector Name", "trendIndex": 1 },
         ...
       ]
       `;

       const analysis = await generateContent(analysisPrompt, apiKey, "cso");
       try {
           const parsed = JSON.parse(analysis.textPost.replace(/```json|```/g, "").trim());
           
           if (Array.isArray(parsed)) {
               parsed.forEach((p: any) => {
                   const trendIdx = (p.trendIndex || 1) - 1;
                   const trend = generalTrends[trendIdx];
                   if (trend) {
                       opportunities.push({
                           sector: p.sector,
                           trendContext: `REAL NEWS: "${trend.title}" - ${trend.snippet}`,
                           source: trend.source
                       });
                   }
               });
           }
       } catch (parseError) {
           console.warn("[Ghost V2] Failed to parse sector map, using fallback mapping", parseError);
           // Fallback: Just map 1-to-1 linearly
           generalTrends.slice(0, count).forEach(t => {
               opportunities.push({
                   sector: "Emerging Market Trend",
                   trendContext: `REAL NEWS: "${t.title}" - ${t.snippet}`,
                   source: t.source
               });
           });
       }
    }
  } catch (e) {
    console.warn("[Ghost V2] Trend fetch failed, using random sectors", e);
  }
  
  // Fill remaining slots with random sectors if needed
  while (opportunities.length < count) {
      const randomSector = SECTORS[Math.floor(Math.random() * SECTORS.length)];
      // Ensure specific uniqueness in a real impl, but simple check here
      opportunities.push({
          sector: randomSector,
          trendContext: "No breaking news. Invent a 'Silent Crisis' scenario common in this industry.",
          source: "Ghost Logical Inference"
      });
  }
  
  return opportunities.slice(0, count);
}

/**
 * Generate a single draft for a sector
 */
async function generateDraft(sector: string, apiKey: string, context: string, source: string): Promise<GhostDraft> {
  const startTime = Date.now();
  
  // Refined prompt using the specific context passed in
  const prompt = `
  MODE: GHOST AGENT V2 (Autonomous Draft)
  SECTOR: ${sector}
  CONTEXT:
  ${context}
  
  INSTRUCTIONS:
  You are 'Ghost', the autonomous strategist.
  Write a viral post exposing a conflict in the market based on the Context.
  Use the 'The Villain' framework: Identify who is lying or what is broken.
  
  IMPORTANT:
  - If the context is real news, QUOTE it or reference it implicitly.
  - If the context is a "Silent Crisis", make it feel urgent.
  `;

  const assets = await generateContent(prompt, apiKey, "cso");
  
  // Calculate virality score (heuristic based on content characteristics)
  const viralityScore = calculateViralityScore(assets.textPost);
  
  console.log(`[Ghost V2] Draft for "${sector}" completed in ${Date.now() - startTime}ms (Score: ${viralityScore})`);

  return {
    id: crypto.randomUUID(),
    topic: sector,
    trend: assets.textPost.split('\n')[0].substring(0, 50) + "...", // Use first line as title/hook
    trendSource: source,
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
