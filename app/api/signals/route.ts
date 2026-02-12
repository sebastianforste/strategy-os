import { NextResponse } from "next/server";
import { z } from "zod";

import { authOptions } from "@/utils/auth";
import { fetchSignals } from "@/utils/signal-service";
import { getStoredApiKeys } from "@/utils/server-api-keys";
import { HttpError, jsonError, parseJson, rateLimit, requireSessionForRequest } from "@/utils/request-guard";

export async function POST(req: Request) {
  try {
    const session = await requireSessionForRequest(req, authOptions);
    await rateLimit({ key: `signals:${session.user.id}`, limit: 30, windowMs: 60_000 });

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
        { error: "Signals require stored Gemini + Serper keys." },
        { status: 400 },
      );
    }

    const signals = await fetchSignals(topic, { gemini, serper });
    return NextResponse.json({ signals });
  } catch (error) {
    if (error instanceof HttpError) {
      return jsonError(error.status, error.message, error.code);
    }
    return NextResponse.json({ error: "Failed to fetch signals" }, { status: 500 });
  }
}
