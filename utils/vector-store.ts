import "server-only";
import * as lancedb from "@lancedb/lancedb";
import { GoogleGenAI } from "@google/genai";

const DB_PATH = ".lancedb";
const EMBEDDING_MODEL = "models/text-embedding-004";
const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY || "";

// Singleton for GenAI
const genAI = new GoogleGenAI({ apiKey: API_KEY });

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
    const response = await genAI.models.embedContent({
      model: EMBEDDING_MODEL,
      contents: text,
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

// Improved Upsert Logic
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
