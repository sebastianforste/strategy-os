/**
 * Intent Engine: StrategyOS 2.0
 * Automatically detects user intent based on editor state and content.
 */

export type UserIntent = 'IDEATION' | 'DRAFTING' | 'NEWSJACKING' | 'POLISHING' | 'REPLYING' | 'LINKEDIN' | 'SUBSTACK';

export interface IntentState {
  intent: UserIntent;
  confidence: number;
  activeContexts: string[];
}

export function detectIntent(content: string): IntentState {
  const normalized = content.trim();
  const words = normalized.split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  // Rule 1: Manual Overrides
  if (normalized.toLowerCase().includes('#substack')) {
    return { intent: 'SUBSTACK', confidence: 1, activeContexts: ['LONG_FORM', 'DEEP_DIVE', 'NEWSLETTER_SYNTAX'] };
  }
  if (normalized.toLowerCase().includes('#linkedin')) {
    return { intent: 'LINKEDIN', confidence: 1, activeContexts: ['VIRAL_SYNTAX', 'HOOK_ENGINE'] };
  }

  // Rule 2: Newsjacking (URLs)
  const urlRegex = /https?:\/\/[^\s]+/;
  if (urlRegex.test(normalized)) {
    return { intent: 'NEWSJACKING', confidence: 0.95, activeContexts: ['WEB_SEARCH', 'GROUNDING'] };
  }

  // Rule 3: Replying
  if (normalized.toLowerCase().startsWith('re:') || normalized.toLowerCase().includes('comment on')) {
    return { intent: 'REPLYING', confidence: 0.9, activeContexts: ['PERSONA_VOICE', 'PLATFORM_ADAPTOR'] };
  }

  // Rule 4: Substack (Long-form / Headers)
  const hasHeaders = normalized.includes('#') && normalized.split('\n').some(l => l.trim().startsWith('# '));
  if (wordCount > 300 || hasHeaders) {
    return { intent: 'SUBSTACK', confidence: 0.85, activeContexts: ['LONG_FORM', 'EDITORIAL_FLOW'] };
  }

  // Rule 5: LinkedIn (Bro-etry)
  const isBroetry = normalized.includes('\n\n') && normalized.split('\n\n').length > 3;
  if (isBroetry || (wordCount > 50 && normalized.toLowerCase().includes('?'))) {
    return { intent: 'LINKEDIN', confidence: 0.8, activeContexts: ['PLATFORM_OPTIMIZATION', 'VIRALITY_CHECK'] };
  }

  // Rule 6: Polishing
  if (wordCount > 50) {
    return { intent: 'POLISHING', confidence: 0.75, activeContexts: ['VIRALITY_SCORE', 'ADVERSARIAL_EDIT'] };
  }

  // Rule 7: Drafting
  if (wordCount > 10) {
    return { intent: 'DRAFTING', confidence: 0.7, activeContexts: ['PERSONA_PROMPT', 'MIRRORING'] };
  }

  // Default: Ideation
  return { intent: 'IDEATION', confidence: 0.5, activeContexts: ['RAG_BOOKS', 'TREND_HUNTER'] };
}
