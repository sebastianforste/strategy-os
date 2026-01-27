"use server";

import { generateContent, GeneratedAssets } from "../utils/ai-service";
import { findRelevantConcepts } from "../utils/rag-service";
import { applyAntiRobotFilter } from "../utils/text-processor";
import { findTrends } from "../utils/search-service";
import { generateImage } from "../utils/image-service";
import { PersonaId } from "../utils/personas";
import { searchCompetitorContent, generateTrendReport, CompetitorContent, TrendReport } from "../utils/trend-service";
import fs from "fs";
import path from "path";
import { LinkedInAdapter } from "../utils/platforms/linkedin";
import { TwitterAdapter } from "../utils/platforms/twitter";
import { PlatformAdapter } from "../utils/platforms/types";

// Helper to sanitize filename
function sanitizeFilename(text: string): string {
    return text
        .replace(/[^a-z0-9]/gi, '-') // Replace non-alphanumeric with dashes
        .replace(/-+/g, '-')         // Collapse multiple dashes
        .replace(/^-|-$/g, '')       // Trim dashes
        .toLowerCase()
        .substring(0, 50);           // Max length
}

export async function analyzeCompetitorAction(
    name: string, 
    serperKey?: string
): Promise<CompetitorContent[]> {
    if (!serperKey) return [];
    return await searchCompetitorContent(name, serperKey);
}

export async function deepDiveAction(
    topic: string, 
    geminiKey: string
): Promise<TrendReport> {
    if (!geminiKey) throw new Error("API Key missing");
    return await generateTrendReport(topic, geminiKey);
}

export async function generateSideAssetsAction(
    textPost: string,
    apiKeys: { gemini: string },
    personaId: PersonaId
) {
    if (!apiKeys.gemini) throw new Error("API Key missing");
    // Dynamic import to avoid cycles/use server issues if checking
    const { generateSideAssetsFromText } = await import("../utils/ai-service");
    return await generateSideAssetsFromText(textPost, apiKeys.gemini, personaId);

}

export async function runGhostAgentAction(apiKey: string) {
    if (!apiKey) throw new Error("API Key required");
    const { runGhostAgent } = await import("../utils/ghost-agent");
    return await runGhostAgent(apiKey);
}


/**
 * SERVER ACTION: PROCESS INPUT
 * ----------------------------
 * The main entry point for the application's generation pipeline.
 * 
 * PIPELINE STEPS:
 * 1. Mode Detection:
 *    - IF input contains a URL -> Activates "Translator Mode" (Focus: Impact vs Law).
 *    - IF input is a Topic -> Activates "Newsjacker Mode" (Focus: Counter-narrative).
 * 
 * 2. Trend Hunting (Newsjacker Mode only):
 *    - If enabled, searches Google News/Twitter for context.
 *    - Injects recent news snippets into the prompt.
 * 
 * 3. AI Generation:
 *    - Calls `generateContent` with the enriched prompt.
 * 
 * 4. Asset Generation:
 *    - Triggers Image Generation (if prompt exists).
 * 
 * 5. Post-Processing:
 *    - Applies "Anti-Robot Filter" (banning words like 'Delve').
 * 
 * 6. Persistence:
 *    - Saves the generated post to 'generated_posts/' directory.
 * 
 * @returns {GeneratedAssets} The final ready-to-use assets.
 */
/**
 * Helper: Constructs the enriched prompt with RAG, Mode, and Platform instructions.
 * Refactored for use in both Server Actions (legacy) and API Route (Streaming).
 */
export async function constructEnrichedPrompt(
    input: string, 
    geminiKey: string,
    personaId: PersonaId,
    forceTrends: boolean,
    adapter: PlatformAdapter,
    useRAG: boolean = true, // Default ON
    fewShotExamples: string = "", // PASS IN CONTEXT instead of fetching it
    rlhfContext: string = "" // RLHF learning loop context
): Promise<{ prompt: string; mode: string }> {
    const startTime = Date.now();
    console.log(`[Prompt Construction] START Persona: ${personaId}, Newsjack: ${forceTrends}`);

    // RAG RETRIEVAL (Strategy Concepts)
    let ragContext = "";
    if (useRAG) {
        try {
            const ragStart = Date.now();
            const concepts = await findRelevantConcepts(input, geminiKey);
            console.log(`[RAG] Found ${concepts.length} concepts in ${Date.now() - ragStart}ms`);
            
            if (concepts.length > 0) {
                ragContext = `
                STRATEGY CONTEXT (From Gunnercooke Library):
                ${concepts.map(c => `- "${c.title}" (${c.source}): ${c.content.substring(0, 300)}...`).join("\n")}
                
                USE THESE MENTAL MODELS.
                `;
            }
        } catch (e) {
            console.warn("[RAG] Retrieval failed:", e);
        }
    }

    // FEW-SHOT EXAMPLES (Provided by caller)
    let fewShotContext = "";
    if (fewShotExamples) {
        fewShotContext = `
        YOUR BEST PERFORMING POSTS (Write in this exact style):
        ${fewShotExamples}
        
        MIMIC THIS VOICE AND STRUCTURE.
        `;
    }

    // RLHF CONTEXT (Learning from ratings)
    let rlhfSection = "";
    if (rlhfContext) {
        rlhfSection = `
        PERSONALIZED LEARNING (From your feedback):
        ${rlhfContext}
        `;
    }

    let enrichedInput = input;
    let mode = "Newsjacker"; // Default
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const hasUrl = urlRegex.test(input);

    // PREPEND PLATFORM INSTRUCTIONS
    const platformInstr = adapter.getAIInstructions();

    if (hasUrl) {
        mode = "Translator";
        enrichedInput = `
        ${platformInstr}
        ${ragContext}
        ${fewShotContext}
        ${rlhfSection}

        MODE: THE TRANSLATOR (Document/URL Analysis)
        INPUT SOURCE: ${input}
        
        INSTRUCTIONS:
        1. Extract the "Holding" (Decision) and "Impact" (Consequence).
        2. Discard "Dicta" (Legal fluff).
        3. Identify the "Loser" (Who gets hurt?) and the "Winner" (Who benefits?).
        4. Draft the post focusing on the IMPACT, not the LAW.
        `;
    } else {
        // Trend Hunting Check (Newsjacker Mode)
        if (forceTrends || (input.length < 100 && !input.includes("\n"))) {
            try {
                const searchStart = Date.now();
                const trends = await findTrends(input, geminiKey);
                console.log(`[Search] Found ${trends.length} trends in ${Date.now() - searchStart}ms`);

                if (trends.length > 0) {
                    const primaryTrend = trends[0];
                    enrichedInput = `
                    ${platformInstr}
                    ${ragContext}
                    ${fewShotContext}
                    ${rlhfSection}

                    MODE: THE NEWSJACKER (Trend Hunter)
                    TOPIC: ${input}
                    CONTEXT FROM NEWS: "${primaryTrend.title}" - ${primaryTrend.snippet} (${primaryTrend.source})
                    
                    INSTRUCTIONS:
                    1. Find the "Counter-Narrative" (e.g., "It's a silent layoff").
                    2. Draft a post that validates the reader's suspicion.
                    `;
                } else {
                    throw new Error("No trends found");
                }
            } catch (e) {
                console.warn("Trend hunting failed or skipped:", e);
                enrichedInput = `
                    ${platformInstr}
                    ${ragContext}
                    ${fewShotContext}
                    ${rlhfSection}

                    MODE: THE NEWSJACKER (Standard)
                    TOPIC: ${input}
                    
                    INSTRUCTIONS:
                    Validate the reader's suspicion about this topic. Find a counter-narrative.
                `;
            }
        } else {
            enrichedInput = `
                ${platformInstr}
                ${ragContext}
                ${fewShotContext}
                ${rlhfSection}

                MODE: THE NEWSJACKER (Standard)
                TOPIC: ${input}
                
                INSTRUCTIONS:
                Validate the reader's suspicion about this topic. Find a counter-narrative.
            `;
        }
    }
    
    console.log(`[Prompt Construction] DONE in ${Date.now() - startTime}ms. Mode: ${mode}`);
    return { prompt: enrichedInput, mode };
}

export async function processInput(
  input: string,
  apiKeys: { gemini: string; serper?: string },
  personaId: PersonaId = "cso",
  forceTrends: boolean = false,
  platform: "linkedin" | "twitter" = "linkedin",
  useFewShot: boolean = true // New flag
): Promise<GeneratedAssets> { // GeneratedAssets is { textPost, imagePrompt, videoScript, imageUrl? }
  if (!input) throw new Error("Input required");
  if (!apiKeys.gemini) throw new Error("Gemini API Key required");

  // Select Adapter
  const adapter: PlatformAdapter = platform === "twitter" ? TwitterAdapter : LinkedInAdapter;

  // Sanitize key
  const geminiKey = apiKeys.gemini.trim();

  // 1. Construct Prompt (Refactored)
  // For Server Action (Legacy): We can't easily access localStorage.
  // We'll skip few-shot unless we refactor processInput to accept it too.
  // For now, passing empty string to fix the crash.
  const { prompt: enrichedInput, mode } = await constructEnrichedPrompt(
      input, 
      geminiKey, 
      personaId, 
      forceTrends, 
      adapter,
      true, // useRAG default
      "" // fewShotExamples - skipped in legacy server action used by test scripts, fix later if needed
  );

  // 2. AI Generation
  const rawAssets = await generateContent(enrichedInput, geminiKey, personaId);

  // 2b. Image Generation (Optional if Gemini key present - reusing main key)
  let imageUrl = "";
  if (geminiKey && rawAssets.imagePrompt) {
    try {
        console.log("Generating Real Image with Imagen 4...");
        imageUrl = await generateImage(rawAssets.imagePrompt, geminiKey);
    } catch (e) {
        console.error("Image generation failed:", e);
        // We don't fail the whole request, just leave imageUrl empty
    }
  }

  // 3. Anti-Robot Filter
  // Apply strictly to the text post.
  let processedText = applyAntiRobotFilter(rawAssets.textPost);

  // 3b. Platform Formatting (Threading, etc)
  processedText = adapter.differentiate(processedText);

  // 3c. Platform Validation (Logging only for now)
  const validation = adapter.validate(processedText);
  if (!validation.isValid) {
      console.warn(`[Validation] ${adapter.name} issues:`, validation.errors);
  }

  const finalAssets = {
    ...rawAssets,
    textPost: processedText,
    imageUrl // Return the URL (or empty string)
  };

  // 4. Save to Filesystem
  try {
    const saveDir = path.join(process.cwd(), "generated_posts");
    if (!fs.existsSync(saveDir)) {
        fs.mkdirSync(saveDir);
    }

    const dateStr = new Date().toISOString().split('T')[0];
    const slug = sanitizeFilename(input);
    const filename = `${dateStr}-${platform}-${slug}.md`;
    const filePath = path.join(saveDir, filename);

    const fileContent = `---
date: ${new Date().toISOString()}
input: "${input.replace(/"/g, '\\"')}"
persona: "${personaId}"
mode: "${mode}"
---

# Generated Post

${finalAssets.textPost}

## Image Prompt
${finalAssets.imagePrompt}

## Video Script
${finalAssets.videoScript}
`;

    fs.writeFileSync(filePath, fileContent, "utf8");
    console.log(`[Server Action] Saved post to: ${filePath}`);
    
  } catch (fsError) {
      console.error("[Server Action] Failed to save file:", fsError);
      // We don't block the return if saving fails
  }

  return finalAssets;
}
