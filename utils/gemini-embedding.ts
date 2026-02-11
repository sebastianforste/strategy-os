import { GoogleGenAI } from "@google/genai";
import { AI_CONFIG } from "./config";

/**
 * Centralized Gemini Embedding Service
 * -----------------------------------
 * Provides a unified interface for content embedding across RAG, Memory, and Vector Store.
 */

let genAIInstance: GoogleGenAI | null = null;

function getGenAI(apiKey?: string): GoogleGenAI {
  if (!genAIInstance) {
    const finalKey = apiKey || process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY || "";
    if (!finalKey) {
      throw new Error("No API key found for Embedding Service.");
    }
    genAIInstance = new GoogleGenAI({ apiKey: finalKey });
  }
  return genAIInstance;
}

/**
 * Fetches embeddings for a single string.
 */
export async function getEmbedding(text: string, apiKey?: string): Promise<number[]> {
  if (!text.trim()) return [];

  try {
    const genAI = getGenAI(apiKey);
    
    // @ts-ignore - SDK type definitions can be inconsistent
    const response = await genAI.models.embedContent({
      model: AI_CONFIG.embeddingModel,
      contents: [text]
    });
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const embedding = (response as any).embedding?.values || (response as any).embeddings?.[0]?.values;

    if (!embedding || embedding.length === 0) {
      console.warn("[Embedding Service] Received empty embedding values.");
      return [];
    }

    return embedding;
  } catch (error) {
    console.error(`[Embedding Service] Error generating embedding:`, error);
    return [];
  }
}

/**
 * Fetches embeddings for a batch of strings.
 */
export async function getBatchEmbeddings(texts: string[], apiKey?: string): Promise<number[][]> {
  if (texts.length === 0) return [];

  try {
    const genAI = getGenAI(apiKey);

    // @ts-ignore - SDK type definitions can be inconsistent
    const response = await genAI.models.embedContent({
      model: AI_CONFIG.embeddingModel,
      contents: texts
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const embeddings = (response as any).embeddings;
    if (!embeddings) return [];

    return embeddings.map((e: any) => e.values);
  } catch (error) {
    console.error(`[Embedding Service] Batch Error:`, error);
    return [];
  }
}

/**
 * Simple Cosine Similarity (Fallback for non-vector-native logic)
 */
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  return normA === 0 || normB === 0 ? 0 : dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}
