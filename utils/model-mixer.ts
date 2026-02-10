/**
 * MODEL MIXER - Multi-Model Orchestration Engine
 * --------------------------------------------
 * Dynamically routes AI requests based on task complexity, cost, and latency requirements.
 * 
 * Logic:
 * - Simple (Latency Sensitive): Gemini 1.5 Flash
 * - Complex (Logic Sensitive): Gemini 1.5 Pro
 * - Balanced: Dynamic choice based on input length or specific intent keywords.
 */

import { AI_CONFIG } from "./config";

export type TaskComplexity = 'simple' | 'complex' | 'balanced';

export interface ModelRouteOptions {
    complexity?: TaskComplexity;
    intent?: string;
    inputLength?: number;
}

/**
 * DETERMINES THE OPTIMAL MODEL FOR A TASK
 */
export function getRoute(options: ModelRouteOptions = {}): string {
    const { complexity, intent, inputLength = 0 } = options;

    // 1. Explicit Complexity
    if (complexity === 'complex') return AI_CONFIG.primaryModel; // Pro
    if (complexity === 'simple') return AI_CONFIG.fallbackModel; // Flash

    // 2. Intent-Based Routing
    const proIntents = ['audit', 'criticize', 'architect', 'council', 'debate', 'verify'];
    if (intent && proIntents.some(i => intent.toLowerCase().includes(i))) {
        return AI_CONFIG.primaryModel;
    }

    // 3. Heuristic: Input Length
    // Very long contexts often benefit from Pro's better reasoning
    if (inputLength > 4000) return AI_CONFIG.primaryModel;

    // 4. Default to Flash for speed and cost efficiency
    return AI_CONFIG.fallbackModel;
}

/**
 * LOG USAGE (Placeholder for future cost tracking)
 */
export function logModelUsage(model: string, tokens: number) {
    console.log(`[ModelMixer] Log: ${model} | Tokens: ${tokens}`);
}
