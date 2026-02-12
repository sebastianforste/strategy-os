import { NextResponse } from "next/server";
import { z } from "zod";

import { authOptions } from "@/utils/auth";
import { scanForTrends } from "@/utils/trend-surfer";
import { getStoredApiKeys } from "@/utils/server-api-keys";
import { HttpError, jsonError, parseJson, rateLimit, requireSessionForRequest } from "@/utils/request-guard";

export async function POST(req: Request) {
  try {
    const session = await requireSessionForRequest(req, authOptions);
    await rateLimit({ key: `trends:${session.user.id}`, limit: 10, windowMs: 60_000 });

    const { sector } = await parseJson(
      req,
      z
        .object({
          sector: z.string().min(1).max(200),
        })
        .strict(),
    );

    const keys = await getStoredApiKeys();
    const gemini = (keys?.gemini || "").trim();
    const serper = (keys?.serper || "").trim();
    if (!gemini || !serper) {
      return NextResponse.json(
        { error: "Trends require stored Gemini + Serper keys." },
        { status: 400 },
      );
    }

    const trends = await scanForTrends(sector, gemini, serper);
    return NextResponse.json({ trends });
  } catch (error) {
    if (error instanceof HttpError) {
      return jsonError(error.status, error.message, error.code);
    }
    return NextResponse.json({ error: "Trend scan failed" }, { status: 500 });
  }
}
