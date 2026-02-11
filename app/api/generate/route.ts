import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { streamText, generateText } from "ai";
import { constructEnrichedPrompt } from "../../../utils/prompt-builder";
import { PERSONAS, PersonaId } from "../../../utils/personas";
import { verifyConstraints } from "../../../utils/constraint-service";
import { LinkedInAdapter } from "../../../utils/platforms/linkedin";
import { TwitterAdapter } from "../../../utils/platforms/twitter";
import { AI_CONFIG } from "../../../utils/config";
import { isRateLimitError } from "../../../utils/gemini-errors";

export async function POST(req: Request) {
  try {
    const { 
        prompt, 
        input: manualInput, 
        apiKeys, 
        personaId, 
        forceTrends, 
        platform, 
        useRAG, 
        fewShotExamples, 
        rlhfContext, 
        styleMemory, 
        styleDNA, // Added
        images, 
        customPersona, 
        isTeamMode, 
        coworkerName, 
        coworkerRole, 
        coworkerRelation,
        subStyle,
        isReplyMode
    } = await req.json();
    const input = prompt || manualInput;
    
    // DEBUG LOGGING
    const fs = require('fs');
    const path = require('path');
    const logFile = path.join(process.cwd(), 'server-debug.log');
    const log = (msg: string) => fs.appendFileSync(logFile, `[${new Date().toISOString()}] ${msg}\n`);
    
    // MODEL AGNOSTICISM: Load from environment variables per global instructions
    const PRIMARY_MODEL = AI_CONFIG.primaryModel;
    const FALLBACK_MODEL = AI_CONFIG.fallbackModel;
    
    log(`Incoming Request: InputLen=${input?.length || 0}, Persona=${personaId}, Model=${PRIMARY_MODEL}, Images=${images?.length || 0}`);
    
    // DIAGNOSTIC: LIST AVAILABLE MODELS
    try {
        console.log("Fetching available models from Google API...");
        const modelsReq = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKeys.gemini}`);
        const modelsData = await modelsReq.json();
        if (modelsData.models) {
            const names = modelsData.models.map((m: any) => m.name);
            console.log(`AVAILABLE MODELS: ${names.join(", ")}`);
            log(`AVAILABLE MODELS: ${names.join(", ")}`);
        } else {
            console.log(`FAILED TO LIST MODELS: ${JSON.stringify(modelsData)}`);
            log(`FAILED TO LIST MODELS: ${JSON.stringify(modelsData)}`);
        }
    } catch (e: any) {
        console.log(`MODEL LISTING ERROR: ${e.message}`);
        log(`MODEL LISTING ERROR: ${e.message}`);
    }

    if (!input) return new Response("Input required", { status: 400 });
    if (!apiKeys?.gemini) return new Response("Gemini API Key required", { status: 400 });

    const geminiKey = apiKeys.gemini.trim();
    const { getAdaptationContext } = await import("../../../utils/adaptation-service");
    const adaptationContext = await getAdaptationContext(personaId as PersonaId);

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
        fewShotExamples, // Pass string content directly
        rlhfContext, // RLHF learning context
        styleMemory, // Style learning context
        styleDNA || (customPersona?.styleDNA || ""), // Pass styleDNA (synthesis anchor)
        adaptationContext, // Darwin Engine v2 context
        isTeamMode,
        coworkerName,
        coworkerRole,
        coworkerRelation,
        subStyle,
        isReplyMode
    );

    // 2. Select Persona System Prompt
    const selectedPersona = customPersona || PERSONAS[personaId as PersonaId] || PERSONAS.cso;

    // 3. Stream Text
    // We modify the system prompt slightly to ensure it doesn't output JSON, but Markdown directly.
    // The original system prompt asks for JSON. We override this for streaming.
    
    const streamingSystemPrompt = `
    ${selectedPersona.basePrompt}

    IMPORTANT OVERRIDE: 
    Do NOT output JSON. 
    Output the "LinkedIn Text Post" (or Twitter Thread) DIRECTLY in Markdown format.
    Do not preface it. Just start writing the post.
    `;

    log(`Enriched Prompt constructed. Length: ${enrichedInput.length}`);

    // Helper function to attempt generation with validation and retry
    async function tryGenerateWithRetry(modelName: string) {
      log(`Trying generateText with ${modelName} (Safety OFF)...`);
      
      const userContent: any[] = [{ type: 'text', text: enrichedInput }];
      
      if (images && Array.isArray(images)) {
          images.forEach((imgData: string) => {
              if (imgData && imgData.startsWith('data:image')) {
                 userContent.push({ type: 'image', image: imgData });
              }
          });
      }

      let currentMessages: any[] = [
          { role: 'user', content: userContent }
      ];
      
      let attempts = 0;
      const MAX_ATTEMPTS = 3;
      let lastText = "";

      while (attempts < MAX_ATTEMPTS) {
          attempts++;
          log(`Attempt ${attempts}/${MAX_ATTEMPTS}`);

          const result = await generateText({
            // @ts-expect-error - Safety settings
            model: google(modelName, {
              safetySettings: [
                  { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
                  { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
                  { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
                  { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
              ]
            }), 
            system: streamingSystemPrompt,
            messages: currentMessages,
            temperature: 0.7
          });

          lastText = result.text;
          const validation = verifyConstraints(lastText);

          if (validation.valid) {
              log(`Constraint Check Passed: ${attempts} attempts`);
              break;
          }

          log(`Constraint Check Failed: ${validation.reason}`);
          
          if (attempts < MAX_ATTEMPTS) {
              // Add context for retry
              currentMessages.push({ role: 'assistant', content: lastText });
              currentMessages.push({ role: 'user', content: `CRITICAL INSTRUCTION: Your previous output failed quality control. \nReason: ${validation.reason}\n\nFIX THIS IMMEDIATELY. Regenerate the post adhering strictly to the constraints.` });
          }
      }

      // Return as stream to satisfy client
      const encoder = new TextEncoder();
      const customStream = new ReadableStream({
          async start(controller) {
              controller.enqueue(encoder.encode(lastText));
              controller.close();
          }
      });

      return new Response(customStream, {
          headers: { 'Content-Type': 'text/plain; charset=utf-8' }
      });
    }
    
    // Try primary model first
    try {
      return await tryGenerateWithRetry(PRIMARY_MODEL);
    } catch (primaryError: unknown) {
      if (isRateLimitError(primaryError)) {
        log(`Primary model rate limited. Falling back to ${FALLBACK_MODEL}...`);
        return await tryGenerateWithRetry(FALLBACK_MODEL);
      }
      throw primaryError;
    }
  } catch (error: unknown) {
    const fs = require('fs');
    const path = require('path');
    const logFile = path.join(process.cwd(), 'server-debug.log');
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    const errorStack = error instanceof Error ? error.stack : "";
    
    fs.appendFileSync(logFile, `[${new Date().toISOString()}] ERROR: ${errorMessage}\nSTACK: ${errorStack}\n`);
    
    console.error("Streaming API Error (Global Catch):", error);
    return new Response(JSON.stringify({ error: errorMessage }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
    });
  }
}
