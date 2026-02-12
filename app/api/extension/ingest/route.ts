
import { NextResponse } from "next/server";
import { prisma } from "../../../../utils/db";
import { z } from "zod";

import { authOptions } from "@/utils/auth";
import { HttpError, jsonError, parseJson, rateLimit, requireSessionOrHeaderToken } from "@/utils/request-guard";

export async function POST(req: Request) {
  try {
    await requireSessionOrHeaderToken({
      req,
      headerName: "x-strategyos-extension-token",
      envVarName: "STRATEGYOS_EXTENSION_TOKEN",
      authOptions,
    });

    rateLimit({ key: `extension_ingest`, limit: 60, windowMs: 60_000 });

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
            metadata: { snippet: content, clippedAt: new Date() }
        }
    });

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
