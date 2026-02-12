import "server-only";

import type { Citation } from "./citations";
import { searchResources, searchStyleMemoryV2, searchVoiceMemoryV2 } from "./vector-store";

export type RetrievedChunk = { id: string; text: string; score?: number; citation: Citation };

export type RetrievalResult = { chunks: RetrievedChunk[]; contextText: string; citations: Citation[] };

export async function retrieveContext(args: {
  query: string;
  apiKey: string;
  authorId: string;
  teamId?: string | null;
  personaId?: string;
  limit: number;
  include: {
    resources: boolean;
    knowledge: boolean;
    strategems: boolean;
    voiceMemory: boolean;
    styleMemory: boolean;
  };
}): Promise<RetrievalResult> {
  const scope = { authorId: args.authorId, teamId: args.teamId ?? null };
  const chunks: RetrievedChunk[] = [];

  const sourceTypes: string[] = [];
  if (args.include.resources) sourceTypes.push("web", "pdf");
  if (args.include.knowledge) sourceTypes.push("knowledge");
  if (args.include.strategems) sourceTypes.push("memory");

  if (sourceTypes.length > 0) {
    const results = await searchResources(args.query, args.limit, args.apiKey, scope, { sourceTypes });
    for (const r of results as any[]) {
      const meta = r.metadata || {};
      const sourceType = String(meta.sourceType || meta.type || "web");
      const citation: Citation = {
        id: String(r.id || ""),
        source:
          sourceType === "pdf"
            ? "pdf"
            : sourceType === "knowledge"
              ? "knowledge"
              : sourceType === "memory"
                ? "memory"
                : "web",
        title: meta.title || meta.sourceTitle || meta.source || undefined,
        url: meta.url || meta.canonicalUrl || undefined,
        createdAt: meta.createdAt || undefined,
        chunkIndex: meta.chunkIndex ?? undefined,
        start: meta.start ?? undefined,
        end: meta.end ?? undefined,
      };
      chunks.push({
        id: String(r.id || ""),
        text: String(r.text || ""),
        citation,
      });
    }
  }

  if (args.include.voiceMemory && args.personaId) {
    const results = await searchVoiceMemoryV2(args.personaId, args.query, Math.min(3, args.limit), args.apiKey, scope);
    for (const r of results as any[]) {
      const meta = r.metadata || {};
      const citation: Citation = {
        id: String(r.id || ""),
        source: "voice",
        title: meta.title || `Voice memory (${args.personaId})`,
        createdAt: meta.createdAt || undefined,
        chunkIndex: meta.chunkIndex ?? undefined,
        start: meta.start ?? undefined,
        end: meta.end ?? undefined,
      };
      chunks.push({
        id: String(r.id || ""),
        text: String(r.text || ""),
        citation,
      });
    }
  }

  if (args.include.styleMemory) {
    const results = await searchStyleMemoryV2(args.query, Math.min(2, args.limit), args.apiKey, scope);
    for (const r of results as any[]) {
      const meta = r.metadata || {};
      const citation: Citation = {
        id: String(r.id || ""),
        source: "style",
        title: meta.title || "Style reference",
        createdAt: meta.createdAt || undefined,
        chunkIndex: meta.chunkIndex ?? undefined,
        start: meta.start ?? undefined,
        end: meta.end ?? undefined,
      };
      chunks.push({
        id: String(r.id || ""),
        text: String(r.text || ""),
        citation,
      });
    }
  }

  const citations: Citation[] = chunks.map((c) => c.citation);

  const contextText =
    chunks.length === 0
      ? ""
      : [
          "CONTEXT (CITED):",
          ...chunks.slice(0, Math.min(chunks.length, args.limit)).map((c, i) => {
            const snippet = c.text.replace(/\s+/g, " ").trim().slice(0, 420);
            return `- [${i + 1}] (${c.citation.source}) ${snippet} [cite:${c.citation.id}]`;
          }),
        ].join("\n");

  return { chunks, citations, contextText };
}

