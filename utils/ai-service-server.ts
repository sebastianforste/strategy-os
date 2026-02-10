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
  signals:any[] = [],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  customPersona?: any // Using any to avoid circular dependency issues if easy, or import Persona
): Promise<GeneratedAssets> {
  // MOCK MODE for Testing/Demo if key is 'demo'
  if (apiKey.toLowerCase().trim() === "demo") {
    await new Promise(r => setTimeout(r, 2000));
    const personaName = PERSONAS[personaId]?.name || "Unknown";
    return {
      textPost: `[MOCK ${personaName.toUpperCase()} OUTPUT]\n\nSuccess is about avoiding stupidity.\n\nMost people think they need to be smart.\n\nThey are wrong.\n\nYou just need to not be stupid.\n\n- Avoid ruin.\n- Survive long enough.\n- Let compounding work.\n\n(Generated by ${personaName})`,
      xThread: [
        "1/ Success isn't about being smart.",
        "2/ It's about avoiding stupidity.",
        "3/ Most 'geniuses' blow up. The survivor wins.",
        "4/ Avoid ruin, let compounding do the work."
      ],
      substackEssay: "# The Stupidity Paradox\n\nIn this week's exploration, we dive deep into why inverse competence is the secret to 2028 baseline wealth...",
      imagePrompt: "Minimalist vector line art. White on black. High contrast. A maze with one clear exit path.",
      videoScript: "HOOK: Stop trying to be smart. It's killing your gains.\n\nCUT TO: Black screen, white text 'AVOID STUPIDITY'.\n\nVO: In a world of geniuses, the survivor wins."
    };
  }

  // MODEL AGNOSTICISM: Load from environment variables per global instructions
  const PRIMARY_MODEL = AI_CONFIG.primaryModel;
  const FALLBACK_MODEL = AI_CONFIG.fallbackModel;
  
  const persona = customPersona || PERSONAS[personaId];
  
  // Model Mixer Selection
  let modelName = getRoute({ 
      complexity: 'complex', // Pro for main strategy generation
      inputLength: input.length 
  });
  
  let systemInstruction = (persona?.basePrompt || persona?.systemPrompt || "") + "\n" + (persona?.jsonSchema || "");
  
  // INJECT RAG CONTEXT (Phase 20 + 22)
  const { context: strategicContext, concepts: ragConcepts } = await fetchContext(input);
  if (strategicContext) {
      console.log(`[AI Service] Injecting Strategic Context with ${ragConcepts.length} concepts...`);
      systemInstruction += "\n" + strategicContext;
  }

  // 1.5 INJECT LONG-TERM MEMORIES (Phase 39)
  try {
    const memories = await retrieveMemories(input, apiKey, 2);
    if (memories.length > 0) {
        console.log(`[AI Service] Injecting ${memories.length} relevant memories...`);
        const memoryContext = memories.map(m => `- [PAST SUCCESS] Topic: ${m.topic || 'Unknown'} | Content: ${m.content.substring(0, 200)}...`).join("\n");
        systemInstruction += `\n\nRELEVANT HISTORICAL PATTERNS (MEMORY):\n${memoryContext}\n(Ground your tone and logic in these past successful patterns.)\n`;
    }
  } catch (e) {
    console.warn("[AI Service] Memory retrieval skipped.", e);
  }

  // Check if using custom voice with fine-tuned model
  if (personaId === "custom") {
    if (persona?.geminiModelId) {
      console.log(`Using custom voice model: ${persona.geminiModelId}`);
      modelName = persona.geminiModelId;
      systemInstruction = "You are a LinkedIn creator with a unique voice. Maintain this voice strictly.";
    } else {
      console.warn("Custom persona selected but no trained model found, falling back to base Gemini");
    }
  }

  let signalContext = "";
  if (signals.length > 0) {
    signalContext = `
    REAL-TIME SIGNALS (NEWSJACKING CONTEXT):
    The following events just happened. You MUST incorporate at least one data point to prove timeliness.
    ${signals.map(s => `- [${s.type.toUpperCase()}] ${s.value} (${s.source})`).join("\n")}
    `;
  }

  const prompt = formatPrompt(SYSTEM_PROMPTS.CORE_GENERATION_V1, {
      input,
      signalContext
  });

  // Helper function to attempt generation with a specific model
  async function attemptGeneration(useModel: string): Promise<GeneratedAssets | null> {
    const genAI = new GoogleGenAI({ apiKey });
    
    // Config object for the new SDK
    const generationConfig = {
        responseMimeType: "application/json",
        systemInstruction: systemInstruction
    };

    let attempts = 0;
    const MAX_ATTEMPTS = 2;
    let currentPrompt = prompt;

    while (attempts <= MAX_ATTEMPTS) {
      attempts++;
      try {
        console.log(`[AI Service] Generation Attempt ${attempts} with ${useModel}...`);
        
        // New SDK Method Signature
        const result = await genAI.models.generateContent({
            model: useModel,
            contents: currentPrompt, // Simple string input supported
            config: generationConfig
        });

        // result.text is a getter/property
        const content = result.text;
        if (!content) throw new Error("No content generated");
        
        const parsed = JSON.parse(content);
        let textPost = parsed.textPost || parsed.text_post || "";

        // --- PHASE 3: VIRAL OPTIMIZATION ---
        console.log("📝 Running Adversarial Refinement Loop...");
        textPost = await optimizeContent(textPost, apiKey);
        
        // VERIFY CONSTRAINTS
        const validation = verifyConstraints(textPost);

        if (validation.valid) {
          console.log(`[AI Service] Constraint Check Passed ✅ (Model: ${useModel})`);
          return {
            textPost,
            imagePrompt: parsed.imagePrompt || parsed.image_prompt || "",
            thumbnailPrompt: parsed.thumbnailPrompt || parsed.thumbnail_prompt || "High contrast close-up with bold text overlay.",
            videoScript: parsed.videoScript || parsed.video_script || "",
            xThread: parsed.xThread || parsed.x_thread || [],
            substackEssay: parsed.substackEssay || parsed.substack_essay || "",
            visualConcept: parsed.visualConcept || parsed.visual_concept || "Strategy",
            ragConcepts: ragConcepts
          };
        }

        console.warn(`[AI Service] Constraint Failed ❌: ${validation.reason}`);
        
        if (attempts <= MAX_ATTEMPTS) {
          currentPrompt += `\n\nCRITICAL SYSTEM ALERT: The previous output failed verification. \nREASON: ${validation.reason}\n\nFIX: Rewrite the hook to be shorter. Strict limit: 210 chars.`;
        } else {
          console.warn("[AI Service] Max attempts reached. Returning best effort.");
          return {
            textPost: `[CONSTRAINT FAILED] ${textPost}`,
            imagePrompt: parsed.imagePrompt || parsed.image_prompt || "",
            videoScript: parsed.videoScript || parsed.video_script || "",
            ragConcepts: ragConcepts
          };
        }
      } catch (e: unknown) {
        const errorMessage = e instanceof Error ? e.message : "Unknown error";
        console.error(`[AI Service] Attempt ${attempts} Error with ${useModel}:`, e);
        
        // RATE LIMIT: Return null to trigger fallback to different model
        if (isRateLimitError(e)) {
          console.warn(`[AI Service] Rate limit hit on ${useModel}. Will try fallback model.`);
          return null; // Signal to try fallback
        }
        
        // NETWORK/SERVER ERRORS: Return backup content
        if (errorMessage.includes("503") || errorMessage.includes("500") || errorMessage.includes("fetch failed")) {
          console.warn("[AI Service] Network/Server Error. Switching to Backup Content.");
          return {
            textPost: `[BACKUP MODE: API BUSY]\n\nConsistency beats intensity.\n\nEveryone starts strong.\nFew finish.\n\nThe secret isn't a hack.\nIt's showing up when you don't want to.\n\nDon't break the chain.`,
            imagePrompt: "Minimalist vector lines showing a consistent upward trend vs erratic spikes. White on black.",
            videoScript: "HOOK: Why do 99% of people fail?\n\nCUT TO: Graph showing jagged spikes then a crash.\n\nVO: They rely on motivation.\n\nCUT TO: Straight rising line.\n\nVO: Winners rely on discipline.",
            ragConcepts: ragConcepts
          };
        }

        if (attempts > MAX_ATTEMPTS) throw e;
      }
    }
    return null;
  }

  // TRY PRIMARY MODEL FIRST
  console.log(`[AI Service] Trying primary model: ${modelName}`);
  let result = await attemptGeneration(modelName);
  
  // IF RATE LIMITED, TRY FALLBACK MODEL
  if (result === null && modelName === PRIMARY_MODEL) {
    console.log(`[AI Service] Falling back to: ${FALLBACK_MODEL}`);
    result = await attemptGeneration(FALLBACK_MODEL);
  }
  
  if (result) {
    return result;
  }

  throw new Error("AI Generation failed after trying all models.");
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
