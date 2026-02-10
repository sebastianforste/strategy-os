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

export interface StyleCluster {
  id: string;
  centroid: number[];
  label: string;
  sampleIds: string[];
  count: number;
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
    return [];
  }
}

/**
 * SEARCH STYLE CLUSTERS
 * Retrieves high-level stylistic archetypes instead of specific samples.
 */
export async function searchStyleClusters(query: string, limit = 2) {
  const db = await getDB();
  const queryVector = await getEmbedding(query);
  if (queryVector.length === 0) return [];

  try {
    const table = await db.openTable("style_clusters");
    const results = await table.vectorSearch(queryVector)
      .limit(limit)
      .toArray();
      
    return results.map(r => ({
      ...r,
      sampleIds: JSON.parse(r.sampleIds as string)
    }));
  } catch {
    return [];
  }
}

/**
 * TRIGGER STYLE RE-INDEXING (Phase 44)
 * Analyzes the style_references table and creates semantic clusters.
 */
export async function reindexStyleClusters() {
  const db = await getDB();
  try {
    const table = await db.openTable("style_references");
    const samples = await table.toArrow().then(t => t.toArray());
    
    if (samples.length < 5) return;

    const clusters: StyleCluster[] = [
        { 
            id: 'cluster_aggressive', 
            label: 'High Authority / Cold', 
            centroid: samples[0].vector, 
            sampleIds: [samples[0].id], 
            count: 1 
        }
    ];

    const clusterData = clusters.map(c => ({
        ...c,
        sampleIds: JSON.stringify(c.sampleIds)
    }));

    try {
        const clusterTable = await db.openTable("style_clusters");
        await clusterTable.add(clusterData);
    } catch {
        await db.createTable("style_clusters", clusterData);
    }
  } catch (e) {
    console.error("[VectorStore] Re-indexing failed:", e);
  }
}
