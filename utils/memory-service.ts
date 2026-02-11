import { getLanceDB, openOrCreateTable } from "./lancedb-client";
import { getEmbedding } from "./gemini-embedding";

const DB_PATH = "data/strategy_memory";
const TABLE_NAME = "strategems";

export interface Strategem {
    id: string;
    content: string;
    topic?: string;
    platform?: string;
    performanceScore?: number;
    timestamp: string;
    vector?: number[];
}

async function getDB() {
  return getLanceDB(DB_PATH);
}

/**
 * STORE STRATEGEM
 * Indexes a piece of content for future retrieval.
 */
export async function storeStrategem(strategem: Omit<Strategem, 'vector'>, apiKey: string) {
    console.log(`[MemoryService] Storing Strategem: ${strategem.id}`);
    
    try {
        const vector = await getEmbedding(strategem.content, apiKey);
        const db = await getDB();
        const record = { ...strategem, vector };

        const tableNames = await db.tableNames();
        const tableExists = tableNames.includes(TABLE_NAME);
        const table = await openOrCreateTable(db, TABLE_NAME, [record]);
        
        if (tableExists) {
            await table.add([record]);
        }
        
        return true;
    } catch (e) {
        console.error("[MemoryService] Failed to store strategem:", e);
        return false;
    }
}

/**
 * RETRIEVE RELEVANT MEMORIES
 * Searches for semantically similar past strategies.
 */
export async function retrieveMemories(query: string, apiKey: string, limit: number = 3): Promise<Strategem[]> {
    console.log(`[MemoryService] Retrieving memories for: "${query}"`);
    
    try {
        const vector = await getEmbedding(query, apiKey);
        const db = await getDB();
        
        if (!(await db.tableNames()).includes(TABLE_NAME)) {
            return [];
        }

        const table = await db.openTable(TABLE_NAME);
        const results = await table
            .search(vector)
            .limit(limit)
            .toArray();

        // Map LanceDB results back to Strategem interface
        return results.map((r: any) => ({
            id: r.id,
            content: r.content,
            topic: r.topic,
            platform: r.platform,
            performanceScore: r.performanceScore,
            timestamp: r.timestamp
        }));
    } catch (e) {
        console.error("[MemoryService] Memory retrieval failed:", e);
        return [];
    }
}
