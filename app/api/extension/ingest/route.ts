
import { NextResponse } from "next/server";
import { prisma } from "../../../../utils/db";
import { z } from "zod";
import crypto from "crypto";

import { authOptions } from "@/utils/auth";
import { getStoredApiKeys } from "@/utils/server-api-keys";
import { chunkText } from "@/utils/text-chunker";
import { HttpError, jsonError, parseJson, rateLimit, requireSessionOrHeaderToken } from "@/utils/request-guard";

export async function POST(req: Request) {
  try {
    const auth = await requireSessionOrHeaderToken({
      req,
      headerName: "x-strategyos-extension-token",
      envVarName: "STRATEGYOS_EXTENSION_TOKEN",
      authOptions,
    });

    const identity = auth.session?.user?.id || auth.session?.user?.email || auth.token || "unknown";
    await rateLimit({ key: `extension_ingest:${identity}`, limit: 60, windowMs: 60_000 });

    const { type, content, title, source } = await parseJson(
      req,
      z
        .object({
          type: z.string().min(1).max(32),
          content: z.string().min(1).max(50_000),
          title: z.string().max(200).optional(),
          source: z.string().max(2048).optional(),
        })
        .strict(),
    );

    console.log(`[EXTENSION] Received: ${type} from ${source}`);

    // If "clip", add to StrategyOS 'Inbox' or 'Signals'
    // For now, we will add it as a "Resource" (Phase 19) or "Signal" (Ghost)
    
    // Let's create a Signal for the Ghost Agent to pick up
    // However, Signal DB isn't strictly defined yet, so let's log and create a "Resource"
    
    // MVP: Create a Resource
    const newResource = await prisma.resource.create({
        data: {
            title: title || "Clipped Content",
            type: "web",
            url: source || "",
            authorId: auth.session?.user?.id ?? null,
            metadata: { snippet: content, clippedAt: new Date().toISOString(), sourceType: type }
        }
    });

    // Best-effort: embed into LanceDB only when we have a session + stored Gemini key.
    const authorId = auth.session?.user?.id || null;
    const storedKeys = authorId ? await getStoredApiKeys() : null;
    const geminiKey = (storedKeys?.gemini || "").trim();
    if (authorId && geminiKey) {
      try {
        const { upsertResource } = await import("@/utils/vector-store");
        const sha256 = crypto.createHash("sha256").update(content).digest("hex");
        const extractedAt = new Date().toISOString();
        const chunks = chunkText({ text: content, chunkSize: 1600, overlap: 200, maxChunks: 16 });
        for (const chunk of chunks) {
          const chunkId = `clip:${newResource.id}:${sha256}:${chunk.index}`;
          await upsertResource(
            chunkId,
            `${title || "Clipped Content"}\n${source || ""}\n\n[Chunk ${chunk.index + 1}/${chunks.length} ${chunk.start}-${chunk.end}]\n${chunk.text}`,
            {
              resourceId: newResource.id,
              sourceType: "web",
              authorId,
              teamId: null,
              title: title || "Clipped Content",
              url: source || "",
              sha256,
              extractedAt,
              chunkIndex: chunk.index,
              start: chunk.start,
              end: chunk.end,
            },
            geminiKey,
          );
        }
      } catch (e) {
        console.warn("[EXTENSION] Vector upsert failed:", e);
      }
    }

    return NextResponse.json({ success: true, id: newResource.id });
  } catch (error) {
    if (error instanceof HttpError) {
      return jsonError(error.status, error.message, error.code);
    }
    console.error("[EXTENSION API] Error ingest:", error);
    return NextResponse.json({ success: false, error: "Failed to ingest" }, { status: 500 });
  }
}

export async function GET() {
    return NextResponse.json({ status: "StrategyOS Extension API Active" });
}
