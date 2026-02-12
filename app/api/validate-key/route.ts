import { NextResponse } from "next/server";
import {
  clearStoredApiKeys,
  getStoredApiKeys,
  maskApiKey,
  setStoredApiKeys,
} from "@/utils/server-api-keys";
import { z } from "zod";

import { authOptions } from "@/utils/auth";
import { HttpError, jsonError, parseJson, rateLimit, requireSession } from "@/utils/request-guard";

export async function GET() {
  try {
    await requireSession(authOptions);
    const stored = await getStoredApiKeys();

    return NextResponse.json({
      success: true,
      configured: Boolean(stored?.gemini),
      hasSerper: Boolean(stored?.serper),
      geminiKeyPreview: stored?.gemini ? maskApiKey(stored.gemini) : null,
    });
  } catch (error) {
    if (error instanceof HttpError) {
      return jsonError(error.status, error.message, error.code);
    }
    return NextResponse.json({ success: false, error: "Unable to load key status." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await requireSession(authOptions);
    rateLimit({ key: `validate_key`, limit: 30, windowMs: 60_000 });

    const body = await parseJson(
      req,
      z
        .object({
          clear: z.boolean().optional(),
          persist: z.boolean().optional(),
          key: z.string().optional(),
          serper: z.string().optional(),
        })
        .strict(),
    );

    const clear = Boolean(body?.clear);
    const persist = Boolean(body?.persist);
    const key = (body?.key || "").toString().trim();
    const serper = (body?.serper || "").toString().trim();

    if (clear) {
      await clearStoredApiKeys();
      return NextResponse.json({ success: true, configured: false });
    }

    if (!key) {
      return NextResponse.json(
        { success: false, error: "Gemini API key is required." },
        { status: 400 }
      );
    }

    if (key.toLowerCase() === "demo") {
      if (persist) {
        await setStoredApiKeys({ gemini: key, serper });
      }
      return NextResponse.json({ success: true, mode: "demo" });
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(key)}`
    );

    if (!response.ok) {
      const detail = await response.text();
      if (response.status === 400 || response.status === 401 || response.status === 403) {
        return NextResponse.json(
          { success: false, error: "Gemini key rejected. Verify it in Google AI Studio." },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { success: false, error: `Validation request failed (${response.status}). ${detail.slice(0, 120)}` },
        { status: 502 }
      );
    }

    const data = await response.json();
    const hasModels = Array.isArray(data?.models) && data.models.length > 0;
    if (!hasModels) {
      return NextResponse.json(
        { success: false, error: "Gemini key validated but no models were returned." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      modelCount: data.models.length,
      ...(persist ? { configured: await setStoredApiKeys({ gemini: key, serper }) } : {}),
    });
  } catch (error) {
    if (error instanceof HttpError) {
      return jsonError(error.status, error.message, error.code);
    }
    // A narrow error response here avoids exposing upstream details.
    return NextResponse.json({ success: false, error: "Unable to validate key right now." }, { status: 500 });
  }
}
