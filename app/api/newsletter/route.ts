import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { streamText } from "ai";
import { AI_CONFIG } from "../../../utils/config";

export async function POST(req: Request) {
  try {
    const { prompt, apiKeys } = await req.json();

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
    console.error("Newsletter API Error:", error);
    return new Response(JSON.stringify({ error: error.message }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
    });
  }
}
