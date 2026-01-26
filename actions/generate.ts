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
    useFewShot: boolean = true // New flag
): Promise<{ prompt: string; mode: string }> {
    console.log(`[Prompt Construction] Persona: ${personaId}, Newsjack: ${forceTrends}, RAG: ${useRAG}, FewShot: ${useFewShot}, Platform: ${adapter.name}`);

    // RAG RETRIEVAL (Strategy Concepts)
    let ragContext = "";
    if (useRAG) {
        try {
            const concepts = await findRelevantConcepts(input, geminiKey);
            if (concepts.length > 0) {
                ragContext = `
                STRATEGY CONTEXT (From Gunnercooke Library):
                ${concepts.map(c => `- "${c.title}" (${c.source}): ${c.content.substring(0, 300)}...`).join("\n")}
                
                USE THESE MENTAL MODELS.
                `;
                console.log(`[RAG] Found ${concepts.length} relevant concepts.`);
            }
        } catch (e) {
            console.warn("[RAG] Retrieval failed:", e);
        }
    } else {
        console.log("[RAG] Skipped by user.");
    }

    // FEW-SHOT EXAMPLES (From user's best posts)
    let fewShotContext = "";
    if (useFewShot) {
        try {
            // Import dynamically to avoid server/client issues
            const { getTopRatedPosts } = await import("../utils/history-service");
            const topPosts = getTopRatedPosts(personaId, 3);
            if (topPosts.length > 0) {
                fewShotContext = `
                YOUR BEST PERFORMING POSTS (Write in this exact style):
                ${topPosts.map((p, i) => `
                Example ${i + 1} (Rated ${p.performance?.rating}):
                """
                ${p.assets.textPost.substring(0, 500)}${p.assets.textPost.length > 500 ? '...' : ''}
                """
                `).join("\n")}
                
                MIMIC THIS VOICE AND STRUCTURE.
                `;
                console.log(`[Few-Shot] Injected ${topPosts.length} examples.`);
            }
        } catch (e) {
            console.warn("[Few-Shot] Failed to retrieve examples:", e);
        }
    } else {
        console.log("[Few-Shot] Skipped by user.");
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
        ${useFewShot ? fewShotContext : ""}

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
        // If Force Trends is ON OR input is short (< 100 chars)
        if (forceTrends || (input.length < 100 && !input.includes("\n"))) {
            try {
                const trends = await findTrends(input, geminiKey);
                if (trends.length > 0) {
                    const primaryTrend = trends[0];
                    enrichedInput = `
                    ${platformInstr}
                    ${ragContext}
                    ${fewShotContext}

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
                // Fallback to treating input as the prompt directly
                enrichedInput = `
                    ${platformInstr}
                    ${ragContext}
                    ${fewShotContext}

                    MODE: THE NEWSJACKER (Standard)
                    TOPIC: ${input}
                    
                    INSTRUCTIONS:
                    Validate the reader's suspicion about this topic. Find a counter-narrative.
                `;
            }
        } else {
            // Standard Newsjacker for longer inputs provided directly
            enrichedInput = `
                ${platformInstr}
                ${ragContext}
                ${fewShotContext}

                MODE: THE NEWSJACKER (Standard)
                TOPIC: ${input}
                
                INSTRUCTIONS:
                Validate the reader's suspicion about this topic. Find a counter-narrative.
            `;
        }
    }
    
    return { prompt: enrichedInput, mode };
}

export async function processInput(
  input: string,
  apiKeys: { gemini: string; serper?: string; openai?: string },
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
  const { prompt: enrichedInput, mode } = await constructEnrichedPrompt(
      input, 
      geminiKey, 
      personaId, 
      forceTrends, 
      adapter,
      true, // useRAG default
      useFewShot
  );

  // 2. AI Generation
  const rawAssets = await generateContent(enrichedInput, geminiKey, personaId, apiKeys.openai);

  // 2b. Image Generation (Optional if Gemini key present - reusing main key)
  let imageUrl = "";
  if (geminiKey && rawAssets.imagePrompt) {
    try {
        console.log("Generating Real Image with Imagen 3...");
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
