import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const key = (body?.key || "").toString().trim();

    if (!key) {
      return NextResponse.json(
        { success: false, error: "Gemini API key is required." },
        { status: 400 }
      );
    }

    if (key.toLowerCase() === "demo") {
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
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Unable to validate key right now." },
      { status: 500 }
    );
  }
}
