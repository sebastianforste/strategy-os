/**
 * AI CONFIG - Centralized Model Configuration
 * -------------------------------------------
 * Single source of truth for AI model settings.
 * Eliminates duplication across 15+ service files.
 */

// Model rotation pool - distributes load across available models
const MODEL_POOL = [
  "models/gemini-2.5-flash",
  "models/gemini-flash-latest",
  "models/gemini-2.5-flash-preview-09-2025",
  "models/gemini-3-flash-preview",
] as const;

let currentModelIndex = 0;

/**
 * Get the next model in rotation (round-robin)
 * Distributes API calls across all available models to avoid rate limits
 */
export function getNextModel(): string {
  const model = MODEL_POOL[currentModelIndex];
  currentModelIndex = (currentModelIndex + 1) % MODEL_POOL.length;
  return model;
}

/**
 * Get a model, advancing rotation on rate limit errors
 */
export function getModelAfterError(): string {
  return getNextModel();
}

export const AI_CONFIG = {
  // Primary model for all generation tasks (uses rotation)
  get primaryModel(): string {
    return getNextModel();
  },
  
  // Static primary for cases that need consistency
  staticPrimaryModel: "models/gemini-2.5-flash",
  
  // High-reasoning model for complex tasks
  reasoningModel: "models/deep-research-pro-preview-12-2025",
  
  // Fallback model when primary hits rate limits
  fallbackModel: "models/gemini-3-flash-preview",
  
  // Image generation model
  imageModel: "models/imagen-4.0-generate-001",
  
  // Embedding model for RAG
  embeddingModel: "models/text-embedding-004",
  
  // Model pool for manual rotation
  modelPool: MODEL_POOL,
  
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

// Type-safe model selection
export type ModelName = (typeof MODEL_POOL)[number];

/**
 * Get the appropriate model with fallback logic
 */
export function getModelWithFallback(preferPrimary: boolean = true): string {
  return preferPrimary ? getNextModel() : AI_CONFIG.fallbackModel;
}
