import "server-only";
import { GoogleGenAI } from "@google/genai";
import fs from "fs";
import path from "path";
import { AI_CONFIG } from "./config";

export interface KnowledgeChunk {
    id: string;
    source: string;
    title: string;
    content: string;
    embedding: number[];
}

const KNOWLEDGE_FILE = path.join(process.cwd(), "data", "knowledge_index.json");

// Similarity calculation (Cosine Similarity)
function cosineSimilarity(vecA: number[], vecB: number[]): number {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        normA += vecA[i] * vecA[i];
        normB += vecB[i] * vecB[i];
    }
    
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

export async function embedText(text: string, apiKey: string): Promise<number[]> {
    const genAI = new GoogleGenAI({ apiKey });
    
    try {
        const response = await genAI.models.embedContent({
            model: AI_CONFIG.embeddingModel,
            contents: text
        });
        
        // Handle both single and batch return structures
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const embedding = (response as any).embedding?.values || (response as any).embeddings?.[0]?.values;
        if (!embedding) throw new Error("No embedding values returned");
        return embedding;
    } catch (e) {
        console.error("Embedding error:", e);
        return [];
    }
}

export async function findRelevantConcepts(query: string, apiKey: string, topK: number = 3): Promise<KnowledgeChunk[]> {
    if (!fs.existsSync(KNOWLEDGE_FILE)) {
        console.warn("Knowledge index not found. Skipping RAG.");
        return [];
    }

    // 1. Load Index
    const rawData = fs.readFileSync(KNOWLEDGE_FILE, "utf-8");
    const index: KnowledgeChunk[] = JSON.parse(rawData);
    
    // 2. Embed Query
    const queryVector = await embedText(query, apiKey);
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
