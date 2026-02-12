import { NextResponse } from "next/server";
import { prisma } from "@/utils/db";
import { z } from "zod";

import { authOptions } from "@/utils/auth";
import { HttpError, jsonError, parseJson, rateLimit, requireSession } from "@/utils/request-guard";

export async function POST(request: Request) {
  try {
    await requireSession(authOptions);
    rateLimit({ key: `ingest`, limit: 60, windowMs: 60_000 });

    const { filename, metadata, content_summary } = await parseJson(
      request,
      z
        .object({
          filename: z.string().min(1).max(300),
          metadata: z.object({}).passthrough(),
          content_summary: z.string().max(20_000).optional(),
        })
        .strict(),
    );

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
    
    await upsertResource(
        resource.id,
        textToEmbed,
        { 
            title: filename, 
            type: "pdf", 
            summary: content_summary,
            date: metadata.date || new Date().toISOString() 
        }
    );

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
