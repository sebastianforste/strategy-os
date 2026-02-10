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
    // Add to Voice Memory
    // We assume the author name maps to a specific Persona ID, or we default to 'global_mind' or 'cso'
    // For now, let's try to infer or default to 'cso' if not found, 
    // BUT strictly we should check if *we* generated it. 
    // In Phase 26, we check local generation history. 
    // For this utility, we'll assume the caller passes the correct Persona ID or we extract it from metadata if we had it.
    // Since MoltPost doesn't have metadata, we'll rely on the caller script to match it.
    
    // However, if we are analyzing *our own* posts from `getRecentPosts`, we might not know the persona easily 
    // unless we stored it in the post text or we look up our local file log.
    
    // For this V1, we will return the Recommendation, and let the Script handle the specific Vector Upsert 
    // because the Script has access to the local file history (mapping Post -> Persona).
    
    return { postId: post.id, action, reason };
  }

  return { postId: post.id, action, reason };
}
