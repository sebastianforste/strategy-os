import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";
import { constructEnrichedPrompt } from "../../../utils/prompt-builder";
import { PERSONAS, PersonaId } from "../../../utils/personas";
import { verifyConstraints } from "../../../utils/constraint-service";
import { LinkedInAdapter } from "../../../utils/platforms/linkedin";
import { TwitterAdapter } from "../../../utils/platforms/twitter";
import { AI_CONFIG } from "../../../utils/config";
import { isRateLimitError } from "../../../utils/gemini-errors";
import { resolveApiKeys } from "../../../utils/server-api-keys";
import { z } from "zod";
import { appendStrategyOSMeta } from "../../../utils/stream-meta";

import { authOptions } from "@/utils/auth";
import { logger } from "@/utils/logger";
import { emitTelemetryEvent } from "@/utils/telemetry";
import { HttpError, jsonError, parseJson, rateLimit, requireSessionForRequest } from "@/utils/request-guard";

export async function POST(req: Request) {
  const requestId = req.headers.get("x-request-id");
  const route = "/api/generate";

  try {
    const session = await requireSessionForRequest(req, authOptions);
    await rateLimit({ key: `generate:${session.user.id}`, limit: 20, windowMs: 60_000 });

    const body = await parseJson(
      req,
      z
        .object({
          prompt: z.string().max(40_000).optional(),
          input: z.string().max(40_000).optional(),
          apiKeys: z
            .object({
              gemini: z.string().optional(),
              serper: z.string().optional(),
            })
            .strict()
            .optional(),
          personaId: z.string().max(64).optional(),
          forceTrends: z.boolean().optional(),
          platform: z.string().max(32).optional(),
          useRAG: z.boolean().optional(),
          fewShotExamples: z.string().max(40_000).optional(),
          rlhfContext: z.string().max(40_000).optional(),
          styleMemory: z.string().max(40_000).optional(),
          styleDNA: z.string().max(20_000).optional(),
          images: z.array(z.string().max(2_000_000)).max(4).optional(),
          customPersona: z.any().optional(),
          isTeamMode: z.boolean().optional(),
          coworkerName: z.string().max(120).optional(),
          coworkerRole: z.string().max(120).optional(),
          coworkerRelation: z.string().max(120).optional(),
          subStyle: z.enum(["professional", "casual", "provocative"]).optional(),
          isReplyMode: z.boolean().optional(),
        })
        .strict(),
    );

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
      styleDNA,
      images,
      customPersona,
      isTeamMode,
      coworkerName,
      coworkerRole,
      coworkerRelation,
      subStyle,
      isReplyMode,
    } = body;
    const input = prompt || manualInput;
    
    const log = logger.scope("API/Generate");
    const debug = process.env.DEBUG_SERVER_LOG === "true";
    
    // MODEL AGNOSTICISM: Load from environment variables per global instructions
    const PRIMARY_MODEL = AI_CONFIG.primaryModel;
    const FALLBACK_MODEL = AI_CONFIG.fallbackModel;
    
    if (!input) return new Response("Input required", { status: 400 });
    const resolvedApiKeys = await resolveApiKeys(apiKeys);
    const geminiKey = (resolvedApiKeys?.gemini || "").trim();
    if (!geminiKey) return new Response("Gemini API Key required", { status: 400 });

    await emitTelemetryEvent({
      kind: "generation_started",
      authorId: session.user.id,
      teamId: (session.user as any)?.teamId ?? null,
      requestId,
      route,
      metadata: {
        personaId: personaId || null,
        platform: platform || null,
        hasImages: Array.isArray(images) && images.length > 0,
      },
    });

    if (debug) {
      log.debug("Incoming request", {
        inputLen: input?.length || 0,
        personaId,
        model: PRIMARY_MODEL,
        images: Array.isArray(images) ? images.length : 0,
      });
    }

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
    const { prompt: enrichedInput, citations } = await constructEnrichedPrompt(
        input, 
        geminiKey, 
        personaId as PersonaId, 
        Boolean(forceTrends),
        adapter,
        Boolean(useRAG), // Pass flag
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

    if (debug) {
      log.debug("Enriched prompt constructed", { length: enrichedInput.length });
    }

    // Helper function to attempt generation with validation and retry
    async function tryGenerateWithRetry(modelName: string) {
      const startedAt = Date.now();
      if (debug) {
        log.debug("Trying generateText", { modelName });
      }
      
      const userContent: any[] = [{ type: 'text', text: enrichedInput }];
      
      if (images && Array.isArray(images)) {
          images.forEach((imgData: string) => {
              if (imgData && imgData.startsWith('data:image')) {
                 userContent.push({ type: 'image', image: imgData });
              }
          });
      }

	      const currentMessages: any[] = [
	          { role: 'user', content: userContent }
	      ];
      
      let attempts = 0;
      const MAX_ATTEMPTS = 3;
      let lastText = "";

      while (attempts < MAX_ATTEMPTS) {
          attempts++;
          if (debug) {
            log.debug("Generation attempt", { attempt: attempts, max: MAX_ATTEMPTS });
          }

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
              if (debug) {
                log.debug("Constraint check passed", { attempts });
              }
              break;
          }

          if (debug) {
            log.warn("Constraint check failed", { reason: validation.reason });
          }
          
          if (attempts < MAX_ATTEMPTS) {
              // Add context for retry
              currentMessages.push({ role: 'assistant', content: lastText });
              currentMessages.push({ role: 'user', content: `CRITICAL INSTRUCTION: Your previous output failed quality control. \nReason: ${validation.reason}\n\nFIX THIS IMMEDIATELY. Regenerate the post adhering strictly to the constraints.` });
          }
      }

      await emitTelemetryEvent({
        kind: "generation_completed",
        authorId: session.user.id,
        teamId: (session.user as any)?.teamId ?? null,
        requestId,
        route,
        status: 200,
        latencyMs: Date.now() - startedAt,
        metadata: {
          modelName,
          attempts,
          outputLen: lastText.length,
          citationsCount: Array.isArray(citations) ? citations.length : 0,
        },
      });

      // Return as stream to satisfy client; append metadata footer for citations.
      const encoder = new TextEncoder();
      const customStream = new ReadableStream({
          async start(controller) {
              const withMeta = citations?.length
                ? appendStrategyOSMeta(lastText, { citations })
                : lastText;
              controller.enqueue(encoder.encode(withMeta));
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
        if (debug) {
          log.warn("Primary model rate limited. Falling back.", { fallback: FALLBACK_MODEL });
        }
        return await tryGenerateWithRetry(FALLBACK_MODEL);
      }
      throw primaryError;
    }
  } catch (error: unknown) {
    if (error instanceof HttpError) {
      if (error.status === 429) {
        // Best-effort; don't block rate limit response.
        void emitTelemetryEvent({
          kind: "rate_limited",
          requestId,
          route,
          status: 429,
          metadata: { code: error.code || null },
        });
      }
      return jsonError(error.status, error.message, error.code);
    }
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    logger.error("Streaming API Error (Global Catch)", error as Error);
    void emitTelemetryEvent({
      kind: "generation_failed",
      requestId,
      route,
      status: 500,
      metadata: { message: errorMessage },
    });
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
