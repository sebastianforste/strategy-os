import { NextResponse } from "next/server";
import { z } from "zod";

import { authOptions } from "@/utils/auth";
import { performDeepResearch } from "@/utils/research-agent";
import { getStoredApiKeys } from "@/utils/server-api-keys";
import { HttpError, jsonError, parseJson, rateLimit, requireSessionForRequest } from "@/utils/request-guard";

export async function POST(req: Request) {
  try {
    const session = await requireSessionForRequest(req, authOptions);
    await rateLimit({ key: `deep_research:${session.user.id}`, limit: 10, windowMs: 60_000 });

    const { topic } = await parseJson(
      req,
      z
        .object({
          topic: z.string().min(1).max(300),
        })
        .strict(),
    );

    const keys = await getStoredApiKeys();
    const gemini = (keys?.gemini || "").trim();
    const serper = (keys?.serper || "").trim();
    if (!gemini || !serper) {
      return NextResponse.json(
        { error: "Deep research requires stored Gemini + Serper keys." },
        { status: 400 },
      );
    }

    const insights = await performDeepResearch(topic, gemini, serper);
    return NextResponse.json({ insights });
  } catch (error) {
    if (error instanceof HttpError) {
      return jsonError(error.status, error.message, error.code);
    }
    return NextResponse.json({ error: "Deep research failed" }, { status: 500 });
  }
}
