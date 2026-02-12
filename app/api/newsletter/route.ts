import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { streamText } from "ai";
import { AI_CONFIG } from "../../../utils/config";
import { resolveApiKeys } from "../../../utils/server-api-keys";
import { z } from "zod";

import { authOptions } from "@/utils/auth";
import { HttpError, jsonError, parseJson, rateLimit, requireSessionForRequest } from "@/utils/request-guard";

export async function POST(req: Request) {
  try {
    const session = await requireSessionForRequest(req, authOptions);
    await rateLimit({ key: `newsletter:${session.user.id}`, limit: 20, windowMs: 60_000 });

    const { prompt, apiKeys } = await parseJson(
      req,
      z
        .object({
          prompt: z.string().min(1).max(40_000),
          apiKeys: z
            .object({ gemini: z.string().min(1).max(512).optional(), serper: z.string().optional() })
            .strict()
            .optional(),
        })
        .strict(),
    );

    if (!prompt) return new Response("Prompt required", { status: 400 });

    const resolved = await resolveApiKeys(apiKeys);
    const geminiKey = (resolved?.gemini || "").trim();
    if (!geminiKey) return new Response("Gemini API Key required", { status: 400 });

    if (geminiKey.toLowerCase() === "demo") {
      const mock = `# Executive Summary\n\n[DEMO MODE]\n\n- Key decision: standardize inputs and measure outcomes.\n- Risk: shipping without idempotency.\n\n## Action Items\n- Tighten the pipeline.\n- Add telemetry.\n`;
      return new Response(mock, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
    }

    const google = createGoogleGenerativeAI({ apiKey: geminiKey });
    const model = AI_CONFIG.primaryModel;

    const systemInstruction = `
    You are the StrategyOS Synthesis Engine. 
    Your goal is to transform fragmented strategic intelligence (meeting transcripts, posts, thoughts) into a cohesive, high-stakes executive newsletter.
    
    STRUCTURE:
    - # EXECUTIVE SUMMARY (Level 1 Header)
    - ## KEY DECISIONS & PIVOTS (Level 2 Header + Bullets)
    - ## STRATEGIC IMPLICATIONS (Level 2 Header + Paragraph)
    - ## ACTION ITEMS (Level 2 Header + Checklist)
    
    TONE: Direct, analytical, zero fluff. Use a "Senior Staff" persona. 
    Focus on leverage and risk.
    `;

    const result = await streamText({
      model: google(model),
      system: systemInstruction,
      prompt: prompt,
      temperature: 0.5, // Lower temperature for more factual synthesis
    });

    return result.toTextStreamResponse();
  } catch (error: any) {
    if (error instanceof HttpError) {
      return jsonError(error.status, error.message, error.code);
    }
    console.error("Newsletter API Error:", error);
    return new Response(JSON.stringify({ error: error.message }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
    });
  }
}
