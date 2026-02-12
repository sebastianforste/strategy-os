import { NextResponse } from "next/server";
import { prisma } from "@/utils/db";
import { getStoredApiKeys } from "@/utils/server-api-keys";
import { z } from "zod";
import crypto from "crypto";

import { authOptions } from "@/utils/auth";
import { HttpError, jsonError, parseJson, rateLimit, requireSessionForRequest } from "@/utils/request-guard";
import { chunkText } from "@/utils/text-chunker";

export async function POST(request: Request) {
  try {
    const session = await requireSessionForRequest(request, authOptions);
    await rateLimit({ key: `ingest:${session.user.id}`, limit: 60, windowMs: 60_000 });

    const { filename, metadata, content_summary } = await parseJson(
      request,
      z
        .object({
          filename: z.string().min(1).max(300),
          metadata: z.record(z.string(), z.unknown()),
          content_summary: z.string().max(20_000).optional(),
        })
        .strict(),
    );

    const metaSize = JSON.stringify(metadata || {}).length;
    if (metaSize > 50_000) {
      throw new HttpError(400, "metadata too large");
    }

    if (!filename || !metadata) {
      return NextResponse.json(
        { error: "Missing required fields: filename, metadata" },
        { status: 400 }
      );
    }

    // Create the resource in the database
    // Note: In a real production scenario, 'url' might be a cloud storage link.
    // For this local integrations, we might store the absolute local path 
    // or a placeholder if the file isn't uploaded.
    const resource = await prisma.resource.create({
      data: {
        title: filename,
        type: "pdf", // Defaulting to PDF as this is an OCR tool ingestion
        url: `local://${filename}`, // Placeholder for local file reference
        authorId: session.user.id,
        metadata: {
            ...metadata,
            content_summary
        },
        // Optional team link
        // team: { connect: { slug: "default-team" } } 
      },
    });

    // [Phase 22] Add to Vector Store (LanceDB)
    // We use the content_summary as the primary text for embedding if full text isn't provided
    const textToEmbed = `${filename}\n\n${content_summary || JSON.stringify(metadata)}`;
    
    // Import dynamically to avoid build-time issues if module isn't present
    const { upsertResource } = await import("@/utils/vector-store");
    const storedKeys = await getStoredApiKeys();
    const geminiKey = (storedKeys?.gemini || "").trim();

    if (geminiKey) {
      const sha256 = crypto.createHash("sha256").update(textToEmbed).digest("hex");
      const extractedAt = new Date().toISOString();

      const chunks = chunkText({
        text: textToEmbed,
        chunkSize: 1400,
        overlap: 160,
        maxChunks: 24,
      });
      for (const chunk of chunks) {
        const chunkId = `pdf:${resource.id}:${sha256}:${chunk.index}`;
        await upsertResource(
          chunkId,
          `${filename}\n${resource.url}\n\n[Chunk ${chunk.index + 1}/${chunks.length} ${chunk.start}-${chunk.end}]\n${chunk.text}`,
          {
            resourceId: resource.id,
            sourceType: "pdf",
            authorId: session.user.id,
            teamId: null,
            title: filename,
            url: resource.url,
            sha256,
            extractedAt,
            chunkIndex: chunk.index,
            start: chunk.start,
            end: chunk.end,
          },
          geminiKey,
        );
      }
    }

    return NextResponse.json({ success: true, resource }, { status: 201 });
  } catch (error: any) {
    if (error instanceof HttpError) {
      return jsonError(error.status, error.message, error.code);
    }
    console.error("Ingest Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}
