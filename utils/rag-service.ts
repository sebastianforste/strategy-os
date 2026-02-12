import "server-only";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth";
import { searchResources } from "./vector-store";

export interface KnowledgeChunk {
    id: string;
    source: string;
    title: string;
    content: string;
    embedding: number[];
}

export async function findRelevantConcepts(query: string, apiKey: string, topK: number = 3): Promise<KnowledgeChunk[]> {
    const session = await getServerSession(authOptions);
    const authorId = session?.user?.id || "anonymous";

    const results = await searchResources(
      query,
      topK,
      apiKey,
      { authorId, teamId: null },
      { sourceTypes: ["knowledge"] },
    );

    return results.map((r: any) => {
      const meta = r.metadata || {};
      return {
        id: String(r.id || ""),
        source: String(meta.url || meta.source || ""),
        title: String(meta.title || "Knowledge"),
        content: String(r.text || ""),
        embedding: Array.isArray(r.vector) ? (r.vector as number[]) : [],
      } satisfies KnowledgeChunk;
    });
}

/**
 * PHASE 85: GRAPH RAG CONCEPTS
 * Retrieves semantically relevant + logically associated concepts.
 */
export async function findGraphConcepts(query: string, limit = 5, apiKey?: string): Promise<string[]> {
    // Legacy "Graph RAG" is now just a scoped semantic lookup.
    const session = await getServerSession(authOptions);
    const authorId = session?.user?.id || "anonymous";

    const results = await searchResources(query, limit, apiKey, { authorId, teamId: null });
    return results.map((r: any) => `[Direct Context]: ${String(r.text || "").slice(0, 600)}`);
}
