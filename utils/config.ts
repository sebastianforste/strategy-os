/**
 * AI CONFIG - Centralized Model Configuration
 * -------------------------------------------
 * Single source of truth for AI model settings.
 * Eliminates duplication across 15+ service files.
 */

export const AI_CONFIG = {
  // Primary model for all generation tasks
  primaryModel: process.env.NEXT_PUBLIC_GEMINI_PRIMARY_MODEL || "models/gemini-3-flash-preview",
  
  // High-reasoning model for complex tasks
  reasoningModel: "models/deep-research-pro-preview-12-2025",
  
  // Fallback model when primary hits rate limits
  fallbackModel: process.env.NEXT_PUBLIC_GEMINI_FALLBACK_MODEL || "models/gemini-3-flash-preview",
  
  // Image generation model
  imageModel: "models/imagen-4.0-generate-001",
  
  // Embedding model for RAG
  embeddingModel: "models/text-embedding-004",
  
  // Default generation parameters
  defaults: {
    temperature: 0.7,
    maxOutputTokens: 2048,
    topP: 0.9,
  },
  
  // Rate limiting
  rateLimits: {
    retryDelayMs: 1000,
    maxRetries: 3,
  },
} as const;

// Deep-freeze to ensure true immutability at runtime
Object.freeze(AI_CONFIG);
Object.freeze(AI_CONFIG.defaults);
Object.freeze(AI_CONFIG.rateLimits);

// Type-safe model selection
export type ModelName = typeof AI_CONFIG.primaryModel | typeof AI_CONFIG.fallbackModel;

/**
 * Get the appropriate model with fallback logic
 */
export function getModelWithFallback(preferPrimary: boolean = true): string {
  return preferPrimary ? AI_CONFIG.primaryModel : AI_CONFIG.fallbackModel;
}
