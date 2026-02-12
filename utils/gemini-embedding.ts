import { GoogleGenAI } from "@google/genai";
import { AI_CONFIG } from "./config";

/**
 * Centralized Gemini Embedding Service
 * -----------------------------------
 * Provides a unified interface for content embedding across RAG, Memory, and Vector Store.
 */

const genAIInstances = new Map<string, GoogleGenAI>();
let workingEmbeddingModel: string | null = null;
const unsupportedEmbeddingModels = new Set<string>();
const warnedKeys = new Set<string>();

function getGenAI(apiKey?: string): GoogleGenAI {
  const finalKey = (apiKey || process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY || "").trim();
  if (!finalKey) {
    throw new Error("No API key found for Embedding Service.");
  }

  const existing = genAIInstances.get(finalKey);
  if (existing) return existing;

  const instance = new GoogleGenAI({ apiKey: finalKey });
  genAIInstances.set(finalKey, instance);
  return instance;
}

function warnOnce(key: string, message: string): void {
  if (warnedKeys.has(key)) return;
  warnedKeys.add(key);
  console.warn(message);
}

function isNotSupportedEmbeddingModelError(error: unknown): boolean {
  if (!error) return false;
  const raw = typeof error === "string" ? error : JSON.stringify(error);
  const normalized = raw.toLowerCase();
  return (
    normalized.includes("not supported for embedcontent") ||
    (normalized.includes("model") && normalized.includes("not found")) ||
    normalized.includes("\"status\":\"not_found\"")
  );
}

function getCandidateEmbeddingModels(): string[] {
  const candidates = [
    workingEmbeddingModel,
    AI_CONFIG.embeddingModel,
    ...AI_CONFIG.embeddingFallbackModels,
  ].filter(Boolean) as string[];

  return [...new Set(candidates)];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractEmbeddings(response: any): number[][] {
  if (response?.embeddings && Array.isArray(response.embeddings)) {
    return response.embeddings
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((e: any) => e?.values || [])
      .filter((v: number[]) => Array.isArray(v) && v.length > 0);
  }

  if (response?.embedding?.values && Array.isArray(response.embedding.values)) {
    return [response.embedding.values];
  }

  return [];
}

async function embedWithModel(
  genAI: GoogleGenAI,
  texts: string[],
  model: string
): Promise<number[][]> {
  const embeddingClient = genAI.models as unknown as {
    embedContent(args: { model: string; contents: string[] }): Promise<unknown>;
  };
  const response = await embeddingClient.embedContent({
    model,
    contents: texts
  });
  return extractEmbeddings(response);
}

/**
 * Fetches embeddings for a single string.
 */
export async function getEmbedding(text: string, apiKey?: string): Promise<number[]> {
  if (!text.trim()) return [];
  if ((apiKey || "").trim().toLowerCase() === "demo") return [];

  try {
    const genAI = getGenAI(apiKey);

    for (const model of getCandidateEmbeddingModels()) {
      if (unsupportedEmbeddingModels.has(model)) continue;

      try {
        const embeddings = await embedWithModel(genAI, [text], model);
        const embedding = embeddings[0];
        if (!embedding || embedding.length === 0) {
          continue;
        }
        if (workingEmbeddingModel !== model) {
          workingEmbeddingModel = model;
          warnOnce(
            "embedding-model-selected",
            `[Embedding Service] Using embedding model "${model}".`
          );
        }
        return embedding;
      } catch (error) {
        if (isNotSupportedEmbeddingModelError(error)) {
          unsupportedEmbeddingModels.add(model);
          warnOnce(
            `embedding-unsupported-${model}`,
            `[Embedding Service] Embedding model "${model}" is unavailable for this API surface. Trying fallback.`
          );
          continue;
        }
        console.error(`[Embedding Service] Error generating embedding with "${model}":`, error);
        return [];
      }
    }

    warnOnce("embedding-none-available", "[Embedding Service] No usable embedding model available; continuing without vector context.");
    return [];
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
  if ((apiKey || "").trim().toLowerCase() === "demo") return texts.map(() => []);

  try {
    const genAI = getGenAI(apiKey);

    for (const model of getCandidateEmbeddingModels()) {
      if (unsupportedEmbeddingModels.has(model)) continue;

      try {
        const embeddings = await embedWithModel(genAI, texts, model);
        if (embeddings.length > 0) {
          if (workingEmbeddingModel !== model) {
            workingEmbeddingModel = model;
            warnOnce(
              "embedding-model-selected",
              `[Embedding Service] Using embedding model "${model}".`
            );
          }
          return embeddings;
        }
      } catch (error) {
        if (isNotSupportedEmbeddingModelError(error)) {
          unsupportedEmbeddingModels.add(model);
          warnOnce(
            `embedding-unsupported-${model}`,
            `[Embedding Service] Embedding model "${model}" is unavailable for this API surface. Trying fallback.`
          );
          continue;
        }
        console.error(`[Embedding Service] Batch embedding error with "${model}":`, error);
        return [];
      }
    }

    warnOnce("embedding-none-available", "[Embedding Service] No usable embedding model available; continuing without vector context.");
    return [];
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
