import "server-only";
import * as lancedb from "@lancedb/lancedb";
import { GoogleGenAI } from "@google/genai";
import { AI_CONFIG } from "./config";

const DB_PATH = ".lancedb";
const EMBEDDING_MODEL = AI_CONFIG.embeddingModel;

// Lazy GenAI singleton - initialized on first use to avoid module load errors
let genAIInstance: GoogleGenAI | null = null;

function getGenAI(): GoogleGenAI {
  if (!genAIInstance) {
    const apiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY || "";
    if (!apiKey) {
      throw new Error("No API key found. Set GOOGLE_API_KEY or GEMINI_API_KEY environment variable.");
    }
    genAIInstance = new GoogleGenAI({ apiKey });
  }
  return genAIInstance;
}

// Singleton for LanceDB
let dbInstance: lancedb.Connection | null = null;

async function getDB() {
  if (!dbInstance) {
    dbInstance = await lancedb.connect(DB_PATH);
  }
  return dbInstance;
}

export interface VectorDocument {
  id: string;
  text: string;
  metadata: string; // JSON stringified
  vector: number[];
  createdAt: number;
}

// --- Embedding Helper ---

export async function getEmbedding(text: string): Promise<number[]> {
  try {
    // @ts-ignore - SDK type definitions can be inconsistent
    const response = await getGenAI().models.embedContent({
      model: EMBEDDING_MODEL,
      contents: [text]
    });
    // Handle both single and batch return structures
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const embedding = (response as any).embedding?.values || (response as any).embeddings?.[0]?.values;
    if (!embedding) {
        // Fallback or check for 'embeddings' if batch
        console.warn("Embedding check: ", JSON.stringify(response));
        throw new Error("No embedding returned");
    }
    return embedding;
  } catch (error) {
    console.error("Embedding Error:", error);
    return [];
  }
}

// --- Store Operations ---

export async function addToVectorStore(
  id: string,
  text: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata: Record<string, any>
) {
  const db = await getDB();
  const vector = await getEmbedding(text);
  
  if (vector.length === 0) return;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _table = await db.createTable("resources", [
    { id, text, metadata: JSON.stringify(metadata), vector, createdAt: Date.now() }
  ], { mode: "overwrite" }); // For MVP, we might want 'append' but 'overwrite' if table doesn't exist?
  
  // Actually, createTable errors if exists usually, or mode overwrite deletes it.
  // We want to open or create.
  // LanceDB API: db.openTable(name). 
}

// --- Persona-Specific Voice Memory ---

/**
 * UPSERT STRATEGY TO VOICE MEMORY
 * Saves a successful strategy to a persona's long-term memory.
 */
export async function upsertToVoiceMemory(
  personaId: string,
  id: string,
  text: string,
  metadata: Record<string, any>
) {
  const db = await getDB();
  const vector = await getEmbedding(text);
  if (vector.length === 0) return;

  const tableName = `voice_memory_${personaId.toLowerCase()}`;
  const data = [{ id, text, metadata: JSON.stringify(metadata), vector, createdAt: Date.now() }];
  
  try {
    const table = await db.openTable(tableName);
    await table.add(data);
  } catch {
    await db.createTable(tableName, data);
  }
}

/**
 * SEARCH VOICE MEMORY
 * Retrieves stylistic examples from a persona's own past successes.
 */
export async function searchVoiceMemory(personaId: string, query: string, limit = 3) {
  const db = await getDB();
  const queryVector = await getEmbedding(query);
  if (queryVector.length === 0) return [];

  const tableName = `voice_memory_${personaId.toLowerCase()}`;
  try {
    const table = await db.openTable(tableName);
    const results = await table.vectorSearch(queryVector)
      .limit(limit)
      .toArray();
      
    return results.map(r => ({
      ...r,
      metadata: JSON.parse(r.metadata as string)
    }));
  } catch (error) {
    console.warn(`Voice Memory search failed for ${personaId}:`, error);
    return [];
  }
}

// Improved Upsert Logic (General Resources)
export async function upsertResource(
  id: string,
  text: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata: Record<string, any>
) {
  const db = await getDB();
  const vector = await getEmbedding(text);
  if (vector.length === 0) return;

  const data = [{ id, text, metadata: JSON.stringify(metadata), vector, createdAt: Date.now() }];
  
  try {
    const table = await db.openTable("resources");
    await table.add(data);
  } catch {
    // Table likely doesn't exist, create it
    await db.createTable("resources", data);
  }
}

export async function searchVectorStore(query: string, limit = 5) {
  const db = await getDB();
  const queryVector = await getEmbedding(query);
  if (queryVector.length === 0) return [];

  try {
    const table = await db.openTable("resources");
    const results = await table.vectorSearch(queryVector)
      .limit(limit)
      .toArray();
      
    return results.map(r => ({
      ...r,
      metadata: JSON.parse(r.metadata as string)
    }));
  } catch (error) {
    console.warn("Vector Store Search rejected:", error);
    return [];
  }
}

// --- Style RAG (Phase 24) ---

/**
 * INGEST STYLE SAMPLES
 * batch processes a user's "hall of fame" posts to create a style reference index.
 */
export async function ingestStyleSamples(texts: string[]) {
  const db = await getDB();
  
  // Create embeddings in parallel
  const entries = await Promise.all(texts.map(async (text, i) => {
    const vector = await getEmbedding(text);
    if (vector.length === 0) return null;
    
    return {
      id: `style_${Date.now()}_${i}`,
      text,
      metadata: JSON.stringify({ type: 'style_reference', source: 'user_upload' }),
      vector,
      createdAt: Date.now()
    };
  }));

  const validEntries = entries.filter(e => e !== null) as any[]; // Cast for valid lancedb input
  if (validEntries.length === 0) return;

  const tableName = "style_references";
  try {
    const table = await db.openTable(tableName);
    await table.add(validEntries);
  } catch {
    await db.createTable(tableName, validEntries);
  }
}

/**
 * SEARCH STYLE MEMORY
 * Retrieves the most stylistically relevant past posts for a given topic/emotion.
 */
export async function searchStyleMemory(query: string, limit = 3) {
  const db = await getDB();
  const queryVector = await getEmbedding(query);
  if (queryVector.length === 0) return [];

  const tableName = "style_references";
  try {
    const table = await db.openTable(tableName);
    const results = await table.vectorSearch(queryVector)
      .limit(limit)
      .toArray();
      
    return results.map(r => ({
      ...r,
      metadata: JSON.parse(r.metadata as string)
    }));
  } catch (error) {
    // If table doesn't exist, just return empty (user hasn't uploaded samples yet)
    return [];
  }
}
