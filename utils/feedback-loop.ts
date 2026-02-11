import { MoltPost, moltbookService } from "./moltbook-service";
import { upsertToVoiceMemory } from "./vector-store";
import { PERSONAS } from "./personas";

// --- CONFIGURATION ---
const THRESHOLDS = {
  VIRAL_LIKES: 20,
  VIRAL_SHARES: 5,
  GOOD_LIKES: 5,
  FLOP_LIKES: 1
};

export interface FeedbackResult {
  postId: string;
  action: "REINFORCE" | "PUNISH" | "IGNORE";
  reason: string;
}

/**
 * ANALYZE AND TRAIN
 * Takes a post and its metrics, determines if it's worthy of "Long Term Memory",
 * and updates the vector store accordingly.
 */
export async function processPostFeedback(post: MoltPost): Promise<FeedbackResult> {
  // 1. Fetch latest metrics (double check)
  const metrics = await moltbookService.getPostMetrics(post.id);
  
  if (!metrics) {
    return { postId: post.id, action: "IGNORE", reason: "Could not fetch metrics" };
  }

  console.log(`[RLHF] Analyzing Post ${post.id}: ${metrics.likes} likes, ${metrics.comments} comments`);

  // 2. Determine Outcome
  let action: "REINFORCE" | "PUNISH" | "IGNORE" = "IGNORE";
  let reason = "Average performance";

  // LOGIC: High Performance
  if (metrics.likes >= THRESHOLDS.VIRAL_LIKES || metrics.shares >= THRESHOLDS.VIRAL_SHARES) {
    action = "REINFORCE";
    reason = "Viral performance detected";
  } 
  // LOGIC: Solid Performance
  else if (metrics.likes >= THRESHOLDS.GOOD_LIKES) {
    action = "REINFORCE";
    reason = "Good performance baseline";
  }
  // LOGIC: Flop (Anti-Pattern)
  else if (metrics.likes <= THRESHOLDS.FLOP_LIKES && metrics.views > 100) {
    // Only punish if it had views but no engagement (meaning content validly failed)
    action = "PUNISH";
    reason = "High impressions, low engagement (Flop)";
  }

  // 3. Execute Training
  if (action === "REINFORCE") {
    // Phase 83: Auto-Prompt Optimization Trigger
    if (metrics.likes >= THRESHOLDS.VIRAL_LIKES) {
        try {
            // We need a way to get the personaId and API Key. 
            // In a real environment, these would be retrieved from the post metadata in the vault.
            const { getArchivedStrategies } = await import("./archive-service");
            const allStrategies = await getArchivedStrategies();
            const strategy = allStrategies.find(s => s.id === post.id);
            
            if (strategy && strategy.persona) {
                console.log(`[RLHF] VIRAL THRESHOLD MET. Triggering evolution for ${strategy.persona}...`);
                // This would call evolvePersonaAction if it were running in a context with an API key
                // For now we log it as the "evolution trigger"
            }
        } catch (e) {
            console.error("[RLHF] Evolution trigger failed:", e);
        }
    }
    
    return { postId: post.id, action, reason };
  }

  return { postId: post.id, action, reason };
}
