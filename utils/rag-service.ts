import "server-only";
import fs from "fs";
import path from "path";
import { getEmbedding, cosineSimilarity } from "./gemini-embedding";

export interface KnowledgeChunk {
    id: string;
    source: string;
    title: string;
    content: string;
    embedding: number[];
}

const KNOWLEDGE_FILE = path.join(process.cwd(), "data", "knowledge_index.json");

export async function findRelevantConcepts(query: string, apiKey: string, topK: number = 3): Promise<KnowledgeChunk[]> {
    if (!fs.existsSync(KNOWLEDGE_FILE)) {
        console.warn("Knowledge index not found. Skipping RAG.");
        return [];
    }

    // 1. Load Index
    const rawData = fs.readFileSync(KNOWLEDGE_FILE, "utf-8");
    const index: KnowledgeChunk[] = JSON.parse(rawData);
    
    // 2. Embed Query
    const queryVector = await getEmbedding(query, apiKey);
    if (queryVector.length === 0) return [];

    // 3. Rank
    const scored = index.map(chunk => ({
        chunk,
        score: cosineSimilarity(queryVector, chunk.embedding)
    }));

    // Sort descending
    scored.sort((a, b) => b.score - a.score);

    return scored.slice(0, topK).map(s => s.chunk);
}

/**
 * PHASE 85: GRAPH RAG CONCEPTS
 * Retrieves semantically relevant + logically associated concepts.
 */
export async function findGraphConcepts(query: string, limit = 5): Promise<string[]> {
    const { searchGraphContext } = await import("./vector-store");
    const results = await searchGraphContext(query, limit);
    
    return results.map(r => {
        const prefix = (r as any).searchType === 'logical-leap' ? "[Logical Association]" : "[Direct Context]";
        return `${prefix}: ${r.text}`;
    });
}
