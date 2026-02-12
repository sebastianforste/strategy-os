import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/utils/db";
import { authOptions } from "@/utils/auth";
import { getStoredApiKeys } from "@/utils/server-api-keys";
import {
  assertSafeUrl,
  fetchTextWithLimits,
  HttpError,
  jsonError,
  parseJson,
  rateLimit,
  requireSessionForRequest,
} from "@/utils/request-guard";
import { ingestWebHtml } from "@/utils/web-ingest";
import { chunkText } from "@/utils/text-chunker";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const session = await requireSessionForRequest(req, authOptions);
    await rateLimit({ key: `ingest_url:${session.user.id}`, limit: 20, windowMs: 60_000 });

    const body = await parseJson(
      req,
      z
        .object({
          url: z.string().url().max(2048),
          maxExtractChars: z.number().int().min(500).max(50_000).optional(),
        })
        .strict(),
    );

    const url = await assertSafeUrl(body.url);

    const { status, text: html, contentType } = await fetchTextWithLimits({
      url,
      timeoutMs: 7000,
      maxBytes: 2 * 1024 * 1024,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    });

    if (status < 200 || status >= 300) {
      return NextResponse.json({ error: `Failed to fetch URL (${status}).` }, { status: 502 });
    }

    const normalizedType = (contentType || "").toLowerCase();
    if (
      normalizedType &&
      !normalizedType.includes("text/html") &&
      !normalizedType.includes("application/xhtml+xml")
    ) {
      return NextResponse.json(
        { error: `Unsupported content-type for ingestion: ${contentType}` },
        { status: 415 },
      );
    }

    const extracted = ingestWebHtml(html);
    const extractedAt = new Date().toISOString();
    const maxExtract = body.maxExtractChars ?? 20_000;
    const extractedText = extracted.text.slice(0, maxExtract);

	    const existing = await prisma.resource.findFirst({
	      where: { type: "web", url: url.toString(), authorId: session.user.id },
	      orderBy: { createdAt: "desc" },
	    });

    const resource = existing
      ? await prisma.resource.update({
          where: { id: existing.id },
          data: {
            title: extracted.title,
            metadata: {
              canonicalUrl: extracted.canonicalUrl,
              excerpt: extracted.excerpt,
              length: extracted.length,
              contentSha256: extracted.contentSha256,
              extractedAt,
              contentType,
              extractedText,
            },
          },
        })
	      : await prisma.resource.create({
	          data: {
	            title: extracted.title,
	            type: "web",
	            url: url.toString(),
	            authorId: session.user.id,
	            metadata: {
	              canonicalUrl: extracted.canonicalUrl,
	              excerpt: extracted.excerpt,
	              length: extracted.length,
              contentSha256: extracted.contentSha256,
              extractedAt,
              contentType,
              extractedText,
            },
          },
        });

    const storedKeys = await getStoredApiKeys();
    const geminiKey = (storedKeys?.gemini || "").trim();

    let embedded = false;
    let embeddedChunks = 0;
    if (geminiKey) {
      try {
        const { upsertResource } = await import("@/utils/vector-store");
        const chunks = chunkText({
          text: extractedText,
          chunkSize: 1800,
          overlap: 250,
          maxChunks: 24,
        });

	        if (chunks.length === 0) {
	          const textToEmbed = `${extracted.title}\n${url.toString()}\n\n${extractedText}`;
	          await upsertResource(
	            `web:${resource.id}:${extracted.contentSha256}:0`,
	            textToEmbed,
	            {
	              title: extracted.title,
	              sourceType: "web",
	              authorId: session.user.id,
	              teamId: null,
	              url: url.toString(),
	              canonicalUrl: extracted.canonicalUrl,
	              excerpt: extracted.excerpt,
	              sha256: extracted.contentSha256,
	              extractedAt,
	              chunkIndex: 0,
	              start: 0,
	              end: extractedText.length,
	            },
	            geminiKey,
	          );
	          embeddedChunks = 1;
	        } else {
	          for (const chunk of chunks) {
	            const chunkId = `web:${resource.id}:${extracted.contentSha256}:${chunk.index}`;
	            const textToEmbed = `${extracted.title}\n${url.toString()}\n\n[Chunk ${chunk.index + 1}/${chunks.length} ${chunk.start}-${chunk.end}]\n${chunk.text}`;
	            await upsertResource(
	              chunkId,
	              textToEmbed,
	              {
	                resourceId: resource.id,
	                title: extracted.title,
	                sourceType: "web",
	                authorId: session.user.id,
	                teamId: null,
	                url: url.toString(),
	                canonicalUrl: extracted.canonicalUrl,
	                sha256: extracted.contentSha256,
	                extractedAt,
	                chunkIndex: chunk.index,
	                start: chunk.start,
	                end: chunk.end,
	              },
	              geminiKey,
	            );
	            embeddedChunks += 1;
	          }
	        }

        embedded = true;
      } catch (e) {
        console.warn("[Ingest URL] Vector upsert failed:", e);
      }
    }

    return NextResponse.json(
      {
        success: true,
        resource,
        embedded,
        embeddedChunks,
        extracted: {
          url: url.toString(),
          title: extracted.title,
          canonicalUrl: extracted.canonicalUrl,
          excerpt: extracted.excerpt,
          contentSha256: extracted.contentSha256,
          contentType,
          extractedAt,
          text: extractedText.slice(0, 10_000),
          length: extractedText.length,
        },
        citations: [
          {
            resourceId: resource.id,
            url: url.toString(),
            title: extracted.title,
            canonicalUrl: extracted.canonicalUrl,
            sha256: extracted.contentSha256,
            excerpt: extracted.excerpt,
            extractedAt,
          },
        ],
      },
      { status: 201 },
    );
  } catch (error: any) {
    if (error instanceof HttpError) {
      return jsonError(error.status, error.message, error.code);
    }
    console.error("[Ingest URL] Error:", error);
    return NextResponse.json({ error: "Failed to ingest URL" }, { status: 500 });
  }
}
