/**
 * FEEDBACK SERVICE - RLHF Learning Loop
 * 
 * This service connects user ratings to AI generation, creating a feedback loop
 * where the AI learns from your preferences over time.
 */

import { getHistory, HistoryItem } from "./history-service";

const BLACKLIST_KEY = "strategyos_blacklist";

/**
 * Get highly-rated posts as positive examples for few-shot learning
 */
export function getPositiveExamples(limit: number = 3): string[] {
  const history = getHistory();
  
  const highlyRated = history
    .filter(item => item.performance?.rating === "viral" || item.performance?.rating === "good")
    .sort((a, b) => (b.performance?.markedAt || 0) - (a.performance?.markedAt || 0))
    .slice(0, limit);

  return highlyRated.map(item => item.assets.textPost);
}

/**
 * Extract patterns from poorly-rated posts to avoid
 */
export function getNegativePatterns(): string[] {
  const history = getHistory();
  
  const poorlyRated = history.filter(
    item => item.performance?.rating === "flopped"
  );

  // Extract common phrases/patterns from flopped posts
  // For MVP, we just return a summary instruction
  if (poorlyRated.length === 0) return [];

  // Simple pattern extraction: first sentence of each flopped post
  const patterns = poorlyRated.slice(0, 5).map(item => {
    const firstSentence = item.assets.textPost.split(/[.!?]/)[0];
    return firstSentence.trim();
  });

  return patterns;
}

/**
 * User-defined blacklist of phrases the AI should never use
 */
export function getBlacklist(): string[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(BLACKLIST_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function addToBlacklist(phrase: string): void {
  const current = getBlacklist();
  if (!current.includes(phrase.toLowerCase())) {
    current.push(phrase.toLowerCase());
    localStorage.setItem(BLACKLIST_KEY, JSON.stringify(current));
  }
}

export function removeFromBlacklist(phrase: string): void {
  const current = getBlacklist();
  const filtered = current.filter(p => p !== phrase.toLowerCase());
  localStorage.setItem(BLACKLIST_KEY, JSON.stringify(filtered));
}

export function clearBlacklist(): void {
  localStorage.removeItem(BLACKLIST_KEY);
}

/**
 * Apply blacklist filter to generated text
 * Replaces blacklisted phrases with alternatives
 */
export function applyBlacklistFilter(text: string): string {
  const blacklist = getBlacklist();
  let filtered = text;

  for (const phrase of blacklist) {
    // Case-insensitive replacement with [REDACTED] or just removal
    const regex = new RegExp(phrase, "gi");
    filtered = filtered.replace(regex, "");
  }

  // Clean up double spaces
  filtered = filtered.replace(/\s{2,}/g, " ").trim();
  
  return filtered;
}

/**
 * Build RLHF context for AI prompts
 */
export function buildRLHFContext(): string {
  const positives = getPositiveExamples(2);
  const negatives = getNegativePatterns();
  const blacklist = getBlacklist();

  let context = "";

  if (positives.length > 0) {
    context += `
POSTS THAT PERFORMED WELL (Mimic this style):
${positives.map((p, i) => `Example ${i + 1}: "${p.substring(0, 300)}..."`).join("\n")}
`;
  }

  if (negatives.length > 0) {
    context += `
PATTERNS THAT FLOPPED (Avoid these openings):
${negatives.map(n => `- "${n}"`).join("\n")}
`;
  }

  if (blacklist.length > 0) {
    context += `
BANNED PHRASES (Never use these words):
${blacklist.join(", ")}
`;
  }

  return context;
}
