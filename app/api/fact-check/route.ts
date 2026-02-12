import { NextResponse } from "next/server";
import { z } from "zod";

import { authOptions } from "@/utils/auth";
import { checkFacts } from "@/utils/fact-checker";
import { getStoredApiKeys } from "@/utils/server-api-keys";
import { HttpError, jsonError, parseJson, rateLimit, requireSessionForRequest } from "@/utils/request-guard";

export async function POST(req: Request) {
  try {
    const session = await requireSessionForRequest(req, authOptions);
    await rateLimit({ key: `fact_check:${session.user.id}`, limit: 15, windowMs: 60_000 });

    const { content } = await parseJson(
      req,
      z
        .object({
          content: z.string().min(1).max(10_000),
        })
        .strict(),
    );

    const keys = await getStoredApiKeys();
    const gemini = (keys?.gemini || "").trim();
    const serper = (keys?.serper || "").trim();
    if (!gemini || !serper) {
      return NextResponse.json(
        { error: "Fact check requires stored Gemini + Serper keys." },
        { status: 400 },
      );
    }

    const results = await checkFacts(content, gemini, serper);
    return NextResponse.json({ results });
  } catch (error) {
    if (error instanceof HttpError) {
      return jsonError(error.status, error.message, error.code);
    }
    return NextResponse.json({ error: "Fact check failed" }, { status: 500 });
  }
}
