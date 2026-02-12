import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth";
import { searchResources, upsertResource } from "./vector-store";

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
 * STORE STRATEGEM
 * Indexes a piece of content for future retrieval.
 */
export async function storeStrategem(strategem: Omit<Strategem, 'vector'>, apiKey: string) {
    console.log(`[MemoryService] Storing Strategem: ${strategem.id}`);
    
    try {
        const session = await getServerSession(authOptions);
        const authorId = session?.user?.id;
        if (!authorId) return false;

        const id = `memory:${authorId}:${strategem.id}`;
        await upsertResource(
          id,
          strategem.content,
          {
            sourceType: "memory",
            authorId,
            teamId: null,
            topic: strategem.topic,
            platform: strategem.platform,
            performanceScore: strategem.performanceScore,
            timestamp: strategem.timestamp,
          },
          apiKey,
        );
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
        const session = await getServerSession(authOptions);
        const authorId = session?.user?.id;
        if (!authorId) return [];

        const results = await searchResources(
          query,
          limit,
          apiKey,
          { authorId, teamId: null },
          { sourceTypes: ["memory"] },
        );

        return results.map((r: any) => {
          const meta = r.metadata || {};
          return {
            id: String(r.id || ""),
            content: String(r.text || ""),
            topic: meta.topic,
            platform: meta.platform,
            performanceScore: meta.performanceScore,
            timestamp: meta.timestamp || new Date(meta.createdAt || Date.now()).toISOString(),
          } satisfies Strategem;
        });
    } catch (e) {
        console.error("[MemoryService] Memory retrieval failed:", e);
        return [];
    }
}

export async function retrieveMemoriesScoped(
  query: string,
  apiKey: string,
  limit: number,
  scope: { authorId: string; teamId?: string | null }
): Promise<Strategem[]> {
  const results = await searchResources(
    query,
    limit,
    apiKey,
    { authorId: scope.authorId, teamId: scope.teamId ?? null },
    { sourceTypes: ["memory"] },
  );
  return results.map((r: any) => {
    const meta = r.metadata || {};
    return {
      id: String(r.id || ""),
      content: String(r.text || ""),
      topic: meta.topic,
      platform: meta.platform,
      performanceScore: meta.performanceScore,
      timestamp: meta.timestamp || new Date(meta.createdAt || Date.now()).toISOString(),
    } satisfies Strategem;
  });
}
