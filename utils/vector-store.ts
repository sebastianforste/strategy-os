import { getLanceDB } from "./lancedb-client";
import { getEmbedding } from "./gemini-embedding";

const DB_PATH = ".lancedb";

async function getDB() {
  return getLanceDB(DB_PATH);
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
      
    return results.map((r: any) => ({
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
      
    return results.map((r: any) => ({
      ...r,
      metadata: JSON.parse(r.metadata as string)
    }));
  } catch (error) {
    // Table likely doesn't exist yet, which is fine for new personas/resources
    return [];
  }
}

/**
 * PHASE 85: GRAPH RAG (DEEP CONTEXT)
 * Retrieves semantically similar items PLUS logically linked items
 * based on 'association' metadata or sector grouping.
 */
export async function searchGraphContext(query: string, limit = 5) {
  const db = await getDB();
  const queryVector = await getEmbedding(query);
  if (queryVector.length === 0) return [];

  try {
    const table = await db.openTable("resources");
    // 1. Initial semantic search
    const semanticResults = await table.vectorSearch(queryVector)
      .limit(limit)
      .toArray();
      
    const parsedSemantic = semanticResults.map((r: any) => ({
      ...r,
      metadata: JSON.parse(r.metadata as string),
      searchType: 'semantic'
    }));

    // 2. Traversal Search (Graph Leap)
    // Find items tagged with concepts found in the semantic results
    const associations = new Set<string>();
    parsedSemantic.forEach((r: any) => {
        if (r.metadata.associations && Array.isArray(r.metadata.associations)) {
            r.metadata.associations.forEach((a: string) => associations.add(a));
        }
    });

    if (associations.size > 0) {
        // Simple mock of traversal: filter for items sharing these associations
        // In a real knowledge graph we'd query the edges, here we use LanceDB filter
        const associationList = Array.from(associations).map(a => `'${a}'`).join(", ");
        const leakedResults = await table.query()
            .where(`metadata LIKE '%${Array.from(associations)[0]}%'`) // Simplification for MVP
            .limit(3)
            .toArray();

        const parsedLeaps = leakedResults.map((r: any) => ({
            ...r,
            metadata: JSON.parse(r.metadata as string),
            searchType: 'logical-leap'
        }));

        return [...parsedSemantic, ...parsedLeaps];
    }

    return parsedSemantic;
  } catch (error) {
    console.warn("[Graph RAG] Search failed:", error);
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
      
    return results.map((r: any) => ({
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
      
    return results.map((r: any) => ({
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
    const samples = await table.toArrow().then((t: any) => t.toArray());
    
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
