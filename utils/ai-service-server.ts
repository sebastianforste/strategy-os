import "server-only";
import { GoogleGenAI } from "@google/genai";
import { PERSONAS, PersonaId } from "./personas";
import { verifyConstraints } from "./constraint-service";
import { optimizeContent } from "./refinement-service";
import { SYSTEM_PROMPTS, formatPrompt } from "./prompts";
import { prisma, Resource } from "./db";
import { AI_CONFIG } from "./config";
import { isRateLimitError, getErrorMessage } from "./gemini-errors";
import { GeneratedAssets } from "./ai-service";
import { retrieveMemories } from "./memory-service";
import { getRoute } from "./model-mixer";

/**
 * PROMPT CONSTRUCTION: SYSTEM INSTRUCTION
 * --------------------------------------
 * Composes the base persona, JSON schema, strategic context, and memories.
 */
export function constructSystemInstruction(
  persona: any,
  strategicContext: string,
  memories: string[] = []
): string {
  let instruction = (persona?.basePrompt || persona?.systemPrompt || "") + "\n" + (persona?.jsonSchema || "");
  
  if (strategicContext) {
    instruction += "\n" + strategicContext;
  }

  if (memories.length > 0) {
    const memoryContext = memories.map(m => `- [PAST SUCCESS] ${m}`).join("\n");
    instruction += `\n\nRELEVANT HISTORICAL PATTERNS (MEMORY):\n${memoryContext}\n(Ground your tone and logic in these past successful patterns.)\n`;
  }

  return instruction;
}

/**
 * PROMPT CONSTRUCTION: USER MESSAGE
 * ---------------------------------
 * Composes the input and real-time signals into the final user prompt.
 */
export function constructUserPrompt(input: string, signals: any[] = []): string {
  let signalContext = "";
  if (signals.length > 0) {
    signalContext = `
    REAL-TIME SIGNALS (NEWSJACKING CONTEXT):
    The following events just happened. You MUST incorporate at least one data point to prove timeliness.
    ${signals.map(s => `- [${s.type.toUpperCase()}] ${s.value} (${s.source})`).join("\n")}
    `;
  }

  return formatPrompt(SYSTEM_PROMPTS.CORE_GENERATION_V1, {
    input,
    signalContext
  });
}

/**
 * RESPONSE PARSING: ROBUST EXTRACTION
 * ----------------------------------
 * Handles common field name variations and JSON edge cases.
 */
export function parseAIResponse(json: any): GeneratedAssets {
  return {
    textPost: json.textPost || json.text_post || json["LinkedIn Text Post"] || json["LinkedIn Post"] || "",
    imagePrompt: json.imagePrompt || json.image_prompt || json["Visualize Value Image Prompt"] || json["Image Prompt"] || "",
    thumbnailPrompt: json.thumbnailPrompt || json.thumbnail_prompt || json["YouTube Thumbnail Prompt"] || "High contrast close-up with bold text overlay.",
    videoScript: json.videoScript || json.video_script || json["60s Video Script"] || "",
    xThread: json.xThread || json.x_thread || json["X Thread"] || [],
    substackEssay: json.substackEssay || json.substack_essay || json["Substack Essay"] || "",
    visualConcept: json.visualConcept || json.visual_concept || json["Visual Concept"] || "Strategy",
    ragConcepts: [] // Populated by the caller
  };
}

/**
 * FETCH STRATEGIC CONTEXT (RAG)
 * -----------------------------
 * Retrieves the most recent ingested documents to inform generation.
 */
/**
 * FETCH STRATEGIC CONTEXT (RAG)
 * -----------------------------
 * Retrieves the most recent ingested documents to inform generation.
 * [Phase 22 Update]: Now uses Semantic Search via LanceDB if available.
 */
async function fetchContext(query: string): Promise<{ context: string; concepts: string[] }> {
    const concepts: string[] = [];
    try {
        let contextString = "";

        // 1. Try Semantic Search (LanceDB)
        try {
             // Dynamic import to avoid build issues if vector-store setup is partial
             const { searchVectorStore } = await import("./vector-store");
             const results = await searchVectorStore(query, 5);
             
             if (results.length > 0) {
                 // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  const semanticItems = results.map((r: any) => {
                     const meta = r.metadata || {};
                     concepts.push(meta.title || "Untitled Concept");
                     return `- [${meta.title}] (Relevance: High) Summary: ${meta.summary || r.text.slice(0, 100)}...`;
                  }).join("\n");
                 contextString += `\nSTRATEGIC CONTEXT (Deep Memory / Semantic):\n${semanticItems}\n`;
             }
        } catch (e) {
            console.warn("[AI Service] Vector search failed (or not active), falling back to recent.", e);
        }

        // 2. Fetch Recent Documents (Prisma) - Chronological Anchor
        // We always include a couple of recent ones just in case the semantic search missed "news".
        const recentResources = await prisma.resource.findMany({
            take: 3,
            orderBy: { createdAt: 'desc' },
            where: { type: 'pdf' }
        });

        if (recentResources.length > 0) {
            const recentItems = recentResources.map((r: Resource) => {
                concepts.push(r.title);
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const meta = r.metadata as any || {};
                return `- [${r.title}] (Type: ${meta.document_type || 'Doc'}, Date: ${meta.date || 'Unknown'}) Summary: ${meta.summary || r.metadata}`;
            }).join("\n");
            
            // Avoid duplication if possible, but for now appending is safer context
            contextString += `\nRECENT DOCUMENTS:\n${recentItems}\n`;
        }

        if (!contextString) return { context: "", concepts: [] };
        
        return { 
            context: `${contextString}\n(Use this verified context to ground your strategy.)\n`,
            concepts 
        };

    } catch (error) {
        console.warn("[AI Service] Failed to fetch context:", error);
        return { context: "", concepts: [] };
    }
}

/**
 * CORE GENERATION FUNCTION
 * ------------------------
 * Orchestrates the text generation process using Google Gemini.
 * 
 * Flow:
 * 1. Selects the System Prompt based on `personaId`.
 * 2. Configures the Gemini Model (currently using `models/gemini-flash-latest`).
 * 3. Constructs the User Prompt with specific instructions.
 * 4. Calls the LLM and parses the JSON response.
 * 5. Validates the output against constraints (Length, Formatting).
 * 6. Retries automatically if validation fails.
 * 
 * @param input The raw user input (Topic or URL).
 * @param apiKey Google Gemini API Key.
 * @param personaId The selected persona (default: 'cso').
 */
export async function generateContent(
  input: string,
  apiKey: string,
  personaId: PersonaId = "cso",
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  signals: any[] = [],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  customPersona?: any
): Promise<GeneratedAssets> {
  // MOCK MODE
  if (apiKey.toLowerCase().trim() === "demo") {
    await new Promise(r => setTimeout(r, 2000));
    const personaName = PERSONAS[personaId]?.name || "Unknown";
    return {
      textPost: `[MOCK ${personaName.toUpperCase()} OUTPUT]\n\nSuccess is about avoiding stupidity.`,
      xThread: ["1/ Success isn't about being smart."],
      substackEssay: "# The Stupidity Paradox",
      imagePrompt: "Minimalist vector line art.",
      videoScript: "HOOK: Stop trying to be smart."
    };
  }

  const PRIMARY_MODEL = AI_CONFIG.primaryModel;
  const FALLBACK_MODEL = AI_CONFIG.fallbackModel;
  const persona = customPersona || PERSONAS[personaId];
  
  // 1. Model Mixer Selection
  let modelName = getRoute({ 
      complexity: 'complex',
      inputLength: input.length 
  });
  
  // 2. FETCH CONTEXT & MEMORIES
  const { context: strategicContext, concepts: ragConcepts } = await fetchContext(input);
  if (strategicContext) {
      console.log(`[AI Service] Injecting Strategic Context with ${ragConcepts.length} concepts...`);
  }
  
  let formattedMemories: string[] = [];
  try {
    const rawMemories = await retrieveMemories(input, apiKey, 2);
    if (rawMemories.length > 0) {
      console.log(`[AI Service] Injecting ${rawMemories.length} relevant memories...`);
    }
    formattedMemories = rawMemories.map(m => `Topic: ${m.topic || 'Unknown'} | Content: ${m.content.substring(0, 200)}...`);
  } catch (e) {
    console.warn("[AI Service] Memory retrieval failed", e);
  }

  // 3. CONSTRUCT INSTRUCTIONS
  let finalSystemInstruction = constructSystemInstruction(persona, strategicContext, formattedMemories);
  if (personaId === "custom" && persona?.geminiModelId) {
    console.log(`Using custom voice model: ${persona.geminiModelId}`);
    modelName = persona.geminiModelId;
    finalSystemInstruction = "You are a LinkedIn creator with a unique voice. Maintain this voice strictly.";
  }

  const basePrompt = constructUserPrompt(input, signals);

  // 4. ATTEMPT GENERATION
  async function attemptGeneration(useModel: string): Promise<GeneratedAssets | null> {
    const genAI = new GoogleGenAI({ apiKey });
    const generationConfig = { responseMimeType: "application/json" };
    let attempts = 0;
    const MAX_ATTEMPTS = 2;
    let currentPrompt = basePrompt;

    while (attempts <= MAX_ATTEMPTS) {
      attempts++;
      try {
        console.log(`[AI Service] Generation Attempt ${attempts} with ${useModel}...`);
        
        const result = await genAI.models.generateContent({
            model: useModel,
            contents: currentPrompt,
            config: {
                ...generationConfig,
                systemInstruction: finalSystemInstruction
            }
        });

        // @ts-ignore - type definitions for @google/genai can be mismatched
        const content = result.text || "";
        if (!content) throw new Error("No content generated");
        
        console.log(`[AI Service] Raw Output (Attempt ${attempts}):`, content.substring(0, 500) + "...");

        // Basic JSON cleaning if needed
        let cleanedContent = content.trim();
        if (cleanedContent.startsWith("```json")) {
            cleanedContent = cleanedContent.replace(/```json\n?/, "").replace(/\n?```/, "");
        }

        const parsedRaw = JSON.parse(cleanedContent);
        const parsed = parseAIResponse(parsedRaw);
        parsed.ragConcepts = ragConcepts;

        console.log("📝 Running Adversarial Refinement Loop...");
        parsed.textPost = await optimizeContent(parsed.textPost, apiKey);
        
        const validation = verifyConstraints(parsed.textPost);

        if (validation.valid) {
          console.log(`[AI Service] Constraint Check Passed ✅`);
          return parsed;
        }

        console.warn(`[AI Service] Constraint Failed ❌: ${validation.reason}`);
        
        if (attempts <= MAX_ATTEMPTS) {
          currentPrompt += `\n\nCRITICAL SYSTEM ALERT: Reset instructions. Fix: ${validation.reason}. Rewrite shorter.`;
        } else {
          return { ...parsed, textPost: `[CONSTRAINT FAILED] ${parsed.textPost}` };
        }
      } catch (e: any) {
        if (isRateLimitError(e)) return null;
        if (attempts > MAX_ATTEMPTS) throw e;
        await new Promise(r => setTimeout(r, 1000)); // Delay before retry
      }
    }
    return null;
  }

  console.log(`[AI Service] Trying primary model: ${modelName}`);
  let result = await attemptGeneration(modelName);
  
  if (result === null && modelName === PRIMARY_MODEL) {
    console.log(`[AI Service] Falling back to: ${FALLBACK_MODEL}`);
    result = await attemptGeneration(FALLBACK_MODEL);
  }
  
  if (result) return result;
  throw new Error("AI Generation failed after fallback.");
}

/**
 * SIDE ASSET GENERATION
 * ---------------------
 * Generates secondary assets (Image Prompt, Video Script) based on the already generated text.
 * Used for the streaming workflow where we first stream text, then fill in the rest.
 */
export async function generateSideAssetsFromText(
  textPost: string,
  apiKey: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  personaId: PersonaId = "cso"
): Promise<Pick<GeneratedAssets, "imagePrompt" | "videoScript">> {
  const genAI = new GoogleGenAI({ apiKey });
  
  const prompt = formatPrompt(SYSTEM_PROMPTS.SIDE_ASSETS_V1, {
      textPost
  });

  const modelName = getRoute({ complexity: 'simple' }); // Use Flash for speed in side assets
  console.log(`[AI Service] Generating side assets with: ${modelName}`);

  try {
    const result = await genAI.models.generateContent({
        model: modelName,
        contents: prompt,
        config: { responseMimeType: "application/json" }
    });
    const content = result.text;
    if (!content) throw new Error("No content generated");
    const parsed = JSON.parse(content);

    // Extraction with fallbacks for common naming variants from different models
    const imagePrompt = parsed.imagePrompt || 
                       parsed.image_prompt || 
                       parsed.visualize_value_image_prompt || 
                       "Minimalist geometric abstraction of operational velocity.";
                       
    let videoScript = parsed.videoScript || 
                      parsed.video_script || 
                      parsed.video_script_60s || 
                      "Script generation failed.";
    
    // Safety: If videoScript is an object (common with complex schemas), format it as readable string
    if (typeof videoScript === 'object') {
        videoScript = JSON.stringify(videoScript, null, 2)
            .replace(/[{}\[\]",]/g, '')  // Remove JSON syntax characters
            .split('\n')
            .filter(line => line.trim())  // Remove empty lines
            .map(line => line.trim())
            .join('\n');
    }

    return {
      imagePrompt: String(imagePrompt),
      videoScript: String(videoScript),
    };
  } catch (e) {
    console.error("Side asset generation failed:", e);
    return {
      imagePrompt: "Error generating image prompt.",
      videoScript: "Error generating video script."
    };
  }
}

/**
 * GENERATE COMMENT
 * ----------------
 * Generates a reply/comment to a specific post based on a selected tone.
 * V2 adds: industry context, author context, persona voice for smarter comments.
 */
export async function generateComment(
  postContent: string,
  tone: string,
  apiKey: string,
  personaId: PersonaId = "cso",
  options: {
    useV2?: boolean;
    industryContext?: string;
    authorContext?: string;
    relatedSignals?: any[];
  } = {}
): Promise<string> {
    const { useV2 = false, industryContext = "", authorContext = "" } = options;
    const genAI = new GoogleGenAI({ apiKey });
    const modelName = AI_CONFIG.fallbackModel;

    const persona = PERSONAS[personaId];
    const personaContext = persona?.basePrompt || "";

    let prompt: string;
    
    let signalContext = "";
    if (options.relatedSignals && options.relatedSignals.length > 0) {
        signalContext = `
CURRENT MARKET CONTEXT (Related News/Signals):
Use these real-time signals to add authority and timeliness to your reply:
${options.relatedSignals.map((s: any) => `- ${s.title} (${s.source}): ${s.snippet}`).join("\n")}
        `;
    }

    if (useV2) {
        // V2: Custom prompt with tone framework
        prompt = formatPrompt(SYSTEM_PROMPTS.COMMENT_GENERATOR_V2, {
            personaName: persona?.name || "Strategist",
            personaContext,
            postContent,
            tone,
            signalContext,
            industryContext,
            authorContext
        });
    } else {
        // V1: Classic comment generation
        prompt = formatPrompt(SYSTEM_PROMPTS.COMMENT_GENERATOR_V1, {
            personaName: persona?.name || "Strategist",
            personaContext,
            postContent,
            tone,
            signalContext: signalContext // V1 might not use it yet but passing just in case
        });
    }

    try {
        const result = await genAI.models.generateContent({
            model: modelName,
            contents: prompt
        });
        return result.text || "Error: No response";
    } catch (e) {
        console.error("Comment generation failed:", e);
        return "Error generating comment. Please try again.";
    }
}
