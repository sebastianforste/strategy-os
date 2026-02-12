import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { streamText } from "ai";
import { AI_CONFIG } from "../../../utils/config";
import { z } from "zod";

import { authOptions } from "@/utils/auth";
import { HttpError, jsonError, parseJson, rateLimit, requireSession } from "@/utils/request-guard";

export async function POST(req: Request) {
  try {
    await requireSession(authOptions);
    rateLimit({ key: "newsletter", limit: 20, windowMs: 60_000 });

    const { prompt, apiKeys } = await parseJson(
      req,
      z
        .object({
          prompt: z.string().min(1).max(40_000),
          apiKeys: z.object({ gemini: z.string().min(1).max(512) }).passthrough(),
        })
        .strict(),
    );

    if (!prompt) return new Response("Prompt required", { status: 400 });
    if (!apiKeys?.gemini) return new Response("Gemini API Key required", { status: 400 });

    const google = createGoogleGenerativeAI({ apiKey: apiKeys.gemini });
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
