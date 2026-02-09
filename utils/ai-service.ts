/**
 * AI SERVICE TYPES & INTERFACES
 * ----------------------------
 * This file contains strictly types and interfaces to be shared between
 * client and server. The implementation is in ai-service-server.ts.
 */

import { PersonaId } from "./personas";

export interface GeneratedAssets {
  /** The main LinkedIn text post content (filtered & formatted). */
  textPost: string;
  /** Detailed prompt for image generation (Visualize Value style). */
  imagePrompt: string;
  /** 60-second video script for vertical video content. */
  videoScript: string;
  /** X (Twitter) Thread as an array of tweets. */
  xThread?: string[];
  /** Substack/Medium Long-form Essay. */
  substackEssay?: string;
  /** Voice note script optimized for audio delivery. */
  audioScript?: string;
  /** Optional URL of the generated image (if image generation was successful). */
  imageUrl?: string;
  /** High-CTR image prompt for YouTube/Blog thumbnails. */
  thumbnailPrompt?: string;
  /** A single keyword or short phrase for abstract visualization (e.g. "Leverage", "Compound Interest"). */
  visualConcept?: string;
  /** Concepts retrieved from the Knowledge Graph (if RAG was used). */
  ragConcepts?: string[];
}

// Re-export type if needed for other components
export type { PersonaId };
export type { SectorId } from "./sectors";
