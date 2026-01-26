
import { google } from "@ai-sdk/google";
import { streamText } from "ai";
import { constructEnrichedPrompt } from "../../../actions/generate";
import { PERSONAS, PersonaId } from "../../../utils/personas";
import { LinkedInAdapter } from "../../../utils/platforms/linkedin";
import { TwitterAdapter } from "../../../utils/platforms/twitter";

export async function POST(req: Request) {
  try {
    const { input, apiKeys, personaId, forceTrends, platform, useRAG } = await req.json();

    if (!input) return new Response("Input required", { status: 400 });
    if (!apiKeys?.gemini) return new Response("Gemini API Key required", { status: 400 });

    const geminiKey = apiKeys.gemini.trim();
    
    // Select Adapter
    const adapter = platform === "twitter" ? TwitterAdapter : LinkedInAdapter;

    // 1. Construct the RAG-enriched prompt (REUSING LOGIC)
    const { prompt: enrichedInput } = await constructEnrichedPrompt(
        input, 
        geminiKey, 
        personaId as PersonaId, 
        forceTrends, 
        adapter,
        useRAG // Pass flag
    );

    // 2. Select Persona System Prompt
    const selectedPersona = PERSONAS[personaId as PersonaId] || PERSONAS.cso;

    // 3. Stream Text
    // We modify the system prompt slightly to ensure it doesn't output JSON, but Markdown directly.
    // The original system prompt asks for JSON. We override this for streaming.
    
    const streamingSystemPrompt = `
    ${selectedPersona.systemPrompt}

    IMPORTANT OVERRIDE: 
    Do NOT output JSON. 
    Output the "LinkedIn Text Post" (or Twitter Thread) DIRECTLY in Markdown format.
    Do not preface it. Just start writing the post.
    `;

    const result = streamText({
      model: google("gemini-1.5-flash", { apiKey: geminiKey }), // Use 1.5 Flash for speed
      system: streamingSystemPrompt,
      prompt: enrichedInput,
      temperature: 0.7,
    });

    return result.toDataStreamResponse();
  } catch (error: any) {
    console.error("Streaming API Error:", error);
    return new Response(error.message, { status: 500 });
  }
}
