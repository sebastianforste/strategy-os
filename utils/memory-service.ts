/**
 * MEMORY SERVICE - Cognitive Architecture
 * ----------------------------------------
 * Manages long-term tactical memory using LanceDB (Vector Store).
 * Enables StrategyOS to "remember" past high-performing content.
 */

import * as lancedb from "@lancedb/lancedb";
import { GoogleGenAI } from "@google/genai";
import { AI_CONFIG } from "./config";

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

/**
 * INITIALIZE MEMORY STORE
 */
async function getTable() {
    const db = await lancedb.connect(DB_PATH);
    const tableNames = await db.tableNames();
    
    if (tableNames.includes(TABLE_NAME)) {
        return await db.openTable(TABLE_NAME);
    } else {
        // Create table with empty data initially to define schema
        // LanceDB can infer schema from the first record
        return null; 
    }
}

/**
 * GENERATE EMBEDDINGS
 */
async function getEmbedding(text: string, apiKey: string): Promise<number[]> {
    const genAI = new GoogleGenAI({ apiKey });
    const result = await genAI.models.embedContent({
        model: "text-embedding-004",
        contents: [{ parts: [{ text }] }]
    });
    return (result as any).embeddings[0].values;
}

/**
 * STORE STRATEGEM
 * Indexes a piece of content for future retrieval.
 */
export async function storeStrategem(strategem: Omit<Strategem, 'vector'>, apiKey: string) {
    console.log(`[MemoryService] Storing Strategem: ${strategem.id}`);
    
    try {
        const vector = await getEmbedding(strategem.content, apiKey);
        const db = await lancedb.connect(DB_PATH);
        const record = { ...strategem, vector };

        if ((await db.tableNames()).includes(TABLE_NAME)) {
            const table = await db.openTable(TABLE_NAME);
            await table.add([record]);
        } else {
            await db.createTable(TABLE_NAME, [record]);
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
        const db = await lancedb.connect(DB_PATH);
        
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
