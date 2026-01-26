import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { streamText } from "ai";
import { constructEnrichedPrompt } from "../../../actions/generate";
import { PERSONAS, PersonaId } from "../../../utils/personas";
import { LinkedInAdapter } from "../../../utils/platforms/linkedin";
import { TwitterAdapter } from "../../../utils/platforms/twitter";

export async function POST(req: Request) {
  try {
    const { input, apiKeys, personaId, forceTrends, platform, useRAG, useFewShot } = await req.json();

    if (!input) return new Response("Input required", { status: 400 });
    if (!apiKeys?.gemini) return new Response("Gemini API Key required", { status: 400 });

    const geminiKey = apiKeys.gemini.trim();

    // DEMO MODE HANDLER
    if (geminiKey.toLowerCase() === "demo") {
        const mockContent = `[DEMO MODE] 
        
Here is a generated post about: ${input}

Success is about seeing what others miss.
While everyone looks at the data, look at the people.

Data tells better lies than people do.

- Ignore the spreadsheet.
- Talk to the customer.
- Trust your gut.

(This is a simulated response because you are in Demo Mode).`;

        // Create a simple stream
        const encoder = new TextEncoder();
        const customStream = new ReadableStream({
            async start(controller) {
                const chunks = mockContent.split(/(?=[.\n])/); // Split by sentences/lines for effect
                for (const chunk of chunks) {
                    controller.enqueue(encoder.encode(chunk));
                    await new Promise(r => setTimeout(r, 100)); // Simulate typing delay
                }
                controller.close();
            }
        });

        return new Response(customStream, {
            headers: { 'Content-Type': 'text/plain; charset=utf-8' }
        });
    }

    const google = createGoogleGenerativeAI({ apiKey: geminiKey });
    
    // Select Adapter
    const adapter = platform === "twitter" ? TwitterAdapter : LinkedInAdapter;

    // 1. Construct the RAG-enriched prompt (REUSING LOGIC)
    const { prompt: enrichedInput } = await constructEnrichedPrompt(
        input, 
        geminiKey, 
        personaId as PersonaId, 
        forceTrends, 
        adapter,
        useRAG, // Pass flag
        useFewShot // Pass new flag
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
      model: google("gemini-3-flash-preview"), // Updated to match available models
      system: streamingSystemPrompt,
      prompt: enrichedInput,
      temperature: 0.7,
    });

    return result.toTextStreamResponse();
  } catch (error: unknown) {
    console.error("Streaming API Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return new Response(errorMessage, { status: 500 });
  }
}
