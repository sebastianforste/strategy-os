"use server";

import { generateContent } from "../utils/ai-service-server";
import { GeneratedAssets } from "../utils/ai-service";
import { findRelevantConcepts } from "../utils/rag-service";
import { applyAntiRobotFilter } from "../utils/text-processor";
import { findTrends } from "../utils/search-service";
import { generateImage } from "../utils/image-service";
import { GoogleGenAI } from "@google/genai";
import { 
    PersonaId, 
    PERSONAS, 
    Persona 
} from "../utils/personas";
import { createColleaguePersona } from "../utils/colleague-persona";
import { searchCompetitorContent, generateTrendReport, fetchTrendingNews, CompetitorContent, TrendReport } from "../utils/trend-service";
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
    const { generateSideAssetsFromText } = await import("../utils/ai-service-server");
    return await generateSideAssetsFromText(textPost, apiKeys.gemini, personaId);

}

export async function runGhostAgentAction(
    apiKey: string, 
    options: { draftCount?: number; autoSchedule?: boolean } = {}
) {
    if (!apiKey) throw new Error("API Key required");
    const { runGhostAgent } = await import("../utils/ghost-agent");
    return await runGhostAgent(apiKey, options);
}

export async function generateVideoVisualsAction(storyboard: any[], apiKey: string) {
    if (!apiKey) throw new Error("API Key required");
    const { generateImage } = await import("../utils/image-service");
    
    // Generate in parallel
    const promises = storyboard.map(scene => 
        generateImage(`Cinematic, high-impact background for social video. Mood: ${scene.visual}. Focus: ${scene.text}.`, apiKey)
    );
    return await Promise.all(promises);
}

export async function findTrendsAction(topic: string, apiKey: string) {
    if (!apiKey) throw new Error("API Key required");
    return await findTrends(topic, apiKey);
}

export async function generateCommentAction(
    postContent: string,
    tone: string,
    apiKey: string,
    personaId: PersonaId,
    options: {
        useV2?: boolean;
        industryContext?: string;
        authorContext?: string;
        relatedSignals?: any[];
    } = {}
) {
    if (!apiKey) throw new Error("API Key required");
    const { generateComment } = await import("../utils/ai-service-server");
    return await generateComment(postContent, tone, apiKey, personaId, options);
}



export async function generateHooksAction(topic: string, apiKey: string) {
    if (!apiKey) throw new Error("API Key required");
    const { generateHooks } = await import("../utils/hook-lab");
    return await generateHooks(topic, apiKey);
}

export async function refineAuthorityAction(
    text: string,
    apiKey: string,
    personaId: PersonaId
) {
    if (!apiKey) throw new Error("API Key required");
    
    const { calculateAuthorityScore } = await import("../utils/authority-scorer");
    const score = calculateAuthorityScore(text);
    
    const refinementPrompt = `
    TASK: Refine the following text to increase its "Executive Presence" and "Authority Score".
    
    CURRENT TEXT:
    "${text}"
    
    TARGET PERSONA: ${personaId}
    CURRENT ISSUES: ${score.suggestions.join(", ")}
    
    GUIDELINES FOR HIGH AUTHORITY:
    1. VARY SENTENCE LENGTH: Use short, punchy sentences mixed with sophisticated longer ones.
    2. USE ACTIVE VOICE: Avoid "is being", "has been done". Use direct, ownership-driven verbs.
    3. DATA ANCHORING: If appropriate, inject a specific metric, percentage, or fiscal reality.
    4. LEXICAL DENSITY: Remove repetitive AI-fluff. Use precise industry verbs (e.g., "orchestrated", "galvanized", "pivoted").
    
    OUTPUT ONLY THE REFINED TEXT. NO PREAMBLE.
    `;

    const refined = await generateContent(refinementPrompt, apiKey);
    return refined;
}

/**
 * PROJECT DARWIN: EVOLVE PERSONA
 * Triggers a recursive audit of high-performing strategies to mutate instructions.
 */
export async function evolvePersonaAction(
    personaId: string,
    apiKey: string
) {
    if (!apiKey) throw new Error("API Key required");

    const { evolvePersona } = await import("../utils/evolution-service");
    const { getArchivedStrategies } = await import("../utils/archive-service");
    const { PERSONAS } = await import("../utils/personas");

    // 1. Get Base Persona
    const basePersona = (PERSONAS as any)[personaId];
    if (!basePersona) throw new Error("Persona not found");

    // 2. Get Top Performing Strategies
    const strategies = await getArchivedStrategies();
    const topStrategies = strategies
        .filter(s => s.persona === personaId && s.performance)
        .sort((a, b) => {
            const aScore = (a.performance?.likes || 0) + (a.performance?.comments || 0);
            const bScore = (b.performance?.likes || 0) + (b.performance?.comments || 0);
            return bScore - aScore;
        })
        .slice(0, 5);

    if (topStrategies.length === 0) {
        throw new Error("Insufficient data for evolution. Publish more high-performing content first.");
    }

    // 3. Evolve
    const report = await evolvePersona(basePersona, topStrategies, apiKey);
    return report;
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
    rlhfContext: string = "", // RLHF learning loop context
    styleMemory: string = "", // Style learning context
    styleDNA: string = "", // Synthesized Style DNA from Voice Alchemist
    adaptationContext?: { highDwellPosts: string[], performanceSummary: string },
    isTeamMode: boolean = false,
    coworkerName?: string,
    coworkerRole?: string,
    coworkerRelation?: string,
    subStyle: "professional" | "casual" | "provocative" = "professional",
    isTopVoiceMode: boolean = false
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

    // RAG V2: VOICE MEMORY (Stylistic Matching)
    let voiceMemoryContext = "";
    if (useRAG) {
        try {
            const { searchVoiceMemory } = await import("../utils/vector-store");
            const memories = await searchVoiceMemory(personaId, input, 3);
            console.log(`[RAG V2] Found ${memories.length} voice memories for ${personaId}`);
            
            if (memories.length > 0) {
                voiceMemoryContext = `
                VOICE MEMORY (Your past successful styles):
                ${memories.map((m, i) => `[Style Reference ${i+1}]:\n${m.text}`).join("\n\n")}
                
                MIMIC THE TONE, CADENCE, AND STRUCTURE OF THESE REFERENCES.
                `;
            }
        } catch (e) {
            console.warn("[RAG V2] Voice memory retrieval failed:", e);
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

    // DARWIN ENGINE V2: ADAPTATION CONTEXT
    let adaptationSection = "";
    if (adaptationContext && adaptationContext.highDwellPosts.length > 0) {
        adaptationSection = `
        DARWIN ENGINE V2 - RECENT HIGH-PERFORMING EXAMPLES:
        ${adaptationContext.highDwellPosts.map((p, i) => `[Successful Example ${i+1}]:\n${p}`).join("\n\n")}
        
        PERFORMANCE INSIGHT: ${adaptationContext.performanceSummary}
        
        ADAPT YOUR Cadence and Tone to reflect these successful patterns while maintaining core persona DNA.
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

    // STYLE MEMORY CONTEXT
    let styleSection = "";
    if (styleMemory) {
        styleSection = `
        STYLE MEMORY (Personalized for this persona):
        ${styleMemory}
        `;
    }

    // VOICE ALCHEMIST: STYLE DNA (High Fidelity Anchor)
    let dnaSection = "";
    if (styleDNA) {
        let subStyleInstr = "";
        if (subStyle === "professional") {
            subStyleInstr = "TONE: Be authoritative, polished, and structured. Use high-stakes vocabulary.";
        } else if (subStyle === "casual") {
            subStyleInstr = "TONE: Be conversational, accessible, and use relatable analogies. Lower the friction of the language.";
        } else if (subStyle === "provocative") {
            subStyleInstr = "TONE: Be contrarian, punchy, and challenge the status quo. Use short, high-impact sentences.";
        }

        dnaSection = `
        STYLE DNA (Your Unique Fingerprint):
        ${styleDNA}
        
        MIMIC THIS DNA WITH ABSOLUTE PRECISION. THIS IS YOUR PRIMARY STYLISTIC ANCHOR.
        
        SUB-STYLE OVERLAY:
        ${subStyleInstr}
        `;
    }

    // PHASE 4: STRATEGIC REALISM
    const { getFiscalContext } = await import("../utils/context-service");
    const fiscal = getFiscalContext();
    const strategicRealism = `
    STRATEGIC REALITY (Current Context):
    - Fiscal Quarter: ${fiscal.fiscalQuarter}
    - Situation: ${fiscal.significantEvents.join(", ") || "Business as usual"}
    - Market Phase: ${fiscal.marketPhase.toUpperCase()}
    
    Acknowledge this reality implicitly in your commentary where it adds weight.
    `;
    
    // TOP VOICE OPTIMIZER
    let topVoiceInstr = "";
    if (isTopVoiceMode) {
        topVoiceInstr = `
        TOP VOICE OPTIMIZER (GOLD BADGE PROTOCOL):
        1. NARROW FOCUS: Stick strictly to the core topic of "${input}". Do not drift.
        2. DEPTH over BREADTH: Go deep into one specific angle.
        3. REFERENCE EXPERIENCE: Use phrases like "In my experience..." or "I've seen...".
        4. COMMUNITY: End with a question that sparks genuine debate (comments > likes).
        `;
    }
    


    let enrichedInput = input;
    let mode = "Newsjacker"; // Default
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const hasUrl = urlRegex.test(input);

    // PREPEND PLATFORM INSTRUCTIONS
    const platformInstr = adapter.getAIInstructions();

    const widgetInstructions = `
    GENERATIVE UI WIDGETS:
    You have access to specialized UI widgets. If the topic allows for strategic analysis or trend data, YOU MUST include one of these at the end of your response as a JSON block (wrapped in \`\`\`json).

    1. SWOT Analysis (Use for strategic breakdown):
    \`\`\`json
    {
      "type": "swot",
      "data": {
        "strengths": ["..."],
        "weaknesses": ["..."],
        "opportunities": ["..."],
        "threats": ["..."]
      }
    }
    \`\`\`

    2. Trend Chart (Use for data visualization/growth):
    \`\`\`json
    {
      "type": "trend",
      "data": {
        "title": "Topic Interest Over Time",
        "data": [
            { "label": "Q1", "value": 20 },
            { "label": "Q2", "value": 45, "growth": "+125%" },
            { "label": "Q3", "value": 80, "growth": "+77%" }
        ],
        "insight": "Brief 1-sentence insight about the trend."
      }
    }
    \`\`\`

    RULE: Do NOT mention the widget in the text. Just append the JSON block at the very end.
    `;

    if (hasUrl) {
        mode = "Translator";
        enrichedInput = `
        ${platformInstr}
        ${widgetInstructions}
        ${ragContext}
        ${fewShotContext}
        ${rlhfSection}
        ${styleSection}
        ${dnaSection}
        ${adaptationSection}
        ${voiceMemoryContext}
        ${strategicRealism}
        ${topVoiceInstr}

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
                const [trends, rawNews] = await Promise.all([
                    findTrends(input, geminiKey),
                    fetchTrendingNews(input, geminiKey)
                ]);
                console.log(`[Search] Found ${trends.length} AI trends and ${rawNews.length} raw headlines in ${Date.now() - searchStart}ms`);

                if (trends.length > 0) {
                    const primaryTrend = trends[0];
                    enrichedInput = `
                    ${platformInstr}
                    ${widgetInstructions}
                    ${ragContext}
                    ${fewShotContext}
                    ${rlhfSection}
                    ${styleSection}
                    ${dnaSection}
                    ${adaptationSection}
                    ${voiceMemoryContext}
                    ${strategicRealism}
                    ${topVoiceInstr}

                    MODE: THE NEWSJACKER (Trend Hunter)
                    TOPIC: ${input}
                    CONTEXT FROM NEWS ANALYST: "${primaryTrend.title}" - ${primaryTrend.snippet} (${primaryTrend.source})
                    SENTIMENT ANALYSIS: ${primaryTrend.sentiment} (Momentum: ${primaryTrend.momentum}/100)
                    REAL-TIME HEADLINES:
                    ${rawNews.slice(0, 3).map(n => `- ${n}`).join("\n")}
                    
                    INSTRUCTIONS:
                    1. Use the SENTIMENT ANALYSIS to calibrate your tone (e.g., if Bullish, be punchy and optimistic; if Controversial, be more inquisitive or skeptical).
                    2. Acknowledge the rising momentum of this topic.
                    3. Find the "Counter-Narrative" (e.g., "It's a silent layoff").
                    4. Draft a post that validates the reader's suspicion.
                    `;
                } else {
                    throw new Error("No trends found");
                }
            } catch (e) {
                console.warn("Trend hunting failed or skipped:", e);
                enrichedInput = `
                    ${platformInstr}
                    ${widgetInstructions}
                    ${ragContext}
                    ${fewShotContext}
                    ${rlhfSection}
                    ${styleSection}
                    ${dnaSection}
                    ${adaptationSection}
                    ${voiceMemoryContext}
                    ${strategicRealism}
                    ${topVoiceInstr}

                    MODE: THE NEWSJACKER (Standard)
                    TOPIC: ${input}
                    
                    INSTRUCTIONS:
                    Validate the reader's suspicion about this topic. Find a counter-narrative.
                `;
            }
        } else {
            enrichedInput = `
                ${platformInstr}
                ${widgetInstructions}
                ${ragContext}
                ${fewShotContext}
                ${rlhfSection}
                ${styleSection}
                ${dnaSection}
                ${adaptationSection}
                ${voiceMemoryContext}
                ${strategicRealism}
                ${topVoiceInstr}

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
  useFewShot: boolean = true,
  customPersona?: any,
  isTeamMode: boolean = false,
  coworkerName?: string,
  coworkerRole?: string,
  coworkerRelation?: string,
  styleDNA?: string,
  subStyle: "professional" | "casual" | "provocative" = "professional",
  isTopVoiceMode: boolean = false
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
      "", // fewShotExamples
      "", // rlhfContext
      "", // styleMemory (empty for server action legacy)
      styleDNA || "", // Synthesis anchor
      await (await import("../utils/adaptation-service")).getAdaptationContext(personaId),
      isTeamMode,
      coworkerName,
      coworkerRole,
      coworkerRelation,
      subStyle,
      isTopVoiceMode
  );

  // 1b. Dynamic Persona Override (Phase 27)
  let activePersona = customPersona;
  if (isTeamMode) {
      console.log(`[Generate] Activating Dynamic Colleague Persona: ${coworkerName} (${coworkerRole})`);
      activePersona = createColleaguePersona(
          coworkerName || "Colleague", 
          coworkerRole || "Team Member", 
          coworkerRelation || "Colleague"
      );
  }

  // 2. AI Generation
  const rawAssets = await generateContent(enrichedInput, geminiKey, personaId, [], activePersona);

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

export async function listGeneratedPostsAction() {
    const saveDir = path.join(process.cwd(), "generated_posts");
    if (!fs.existsSync(saveDir)) return [];

    try {
        const files = fs.readdirSync(saveDir);
        return files
            .filter(f => f.endsWith(".md"))
            .map(f => ({
                id: f,
                title: f.replace(/^\d{4}-\d{2}-\d{2}-/, "").replace(".md", "").replace(/-/g, " "),
                filename: f
            }))
            .sort((a, b) => b.id.localeCompare(a.id))
            .slice(0, 10); // Limit to latest 10 for speed
    } catch (e) {
        console.error("Failed to list generated posts", e);
        return [];
    }
}

/**
 * VOICE ALCHEMIST: STYLE DNA SYNTHESIS
 * -----------------------------------
 * Analyzes a batch of historical content (training samples) to synthesize
 * a high-fidelity stylistic anchor for the AI.
 */
export async function synthesizeVoiceDNAAction(trainingPosts: string[], apiKey: string): Promise<string> {
    if (!trainingPosts || trainingPosts.length === 0) {
        throw new Error("No training posts provided for synthesis.");
    }

    const genAI = new GoogleGenAI({ apiKey });

    const analysisPrompt = `
    You are a linguistics expert and master ghostwriter. 
    Analyze the following list of posts to decode the author's "Style DNA".
    
    TRAINING SAMPLES:
    ${trainingPosts.map((p, i) => `[Post ${i+1}]:\n${p}`).join("\n\n")}
    
    EXTRACT THE FOLLOWING "STYLE DNA" (Markdown format):
    1. VOCABULARY: Most-used words, signature phrases, and words they REFUSE to use (Anti-patterns).
    2. CADENCE: Average sentence length, use of rhythm, how they break lines, and paragraph structure.
    3. THE HOOK: Analysis of how they start (Negative qualifiers? Paradoxes? Stories?).
    4. THE CTA: How they end (Questions? Commands? Emotional pulls?).
    5. THE "ENEMY": What or who do they consistently push back against?
    6. TONE: The specific emotional fingerprint (Cynical? Vulnerable? Elitist? Grateful?).
    
    Output strictly as a Markdown block titled "# STYLE DNA [V1.0]". 
    Be hyper-specific. Instead of "Punchy," say "Uses 3-5 word sentences followed by a single-word paragraph for impact."
    `;

    try {
        const result = await genAI.models.generateContent({
            model: "models/gemini-2.0-flash-exp", // or "gemini-2.0-flash"
            contents: analysisPrompt
        });
        
        const responseText = result.text;
        if (!responseText) throw new Error("Synthesis failed: No response from AI.");
        
        return responseText;
    } catch (e) {
        console.error("[Voice Alchemist] Synthesis Error:", e);
        throw e;
    }
}

// --- 2027 AGENTIC MODE ---

import { runDeepResearch, formatResearchForPrompt, ResearchProgress } from "../utils/research-service";
import { runAutonomousCouncil, AutonomousProgress } from "../utils/swarm-service";

export interface AgenticOptions {
  onResearchProgress?: (progress: ResearchProgress) => void;
  onCouncilProgress?: (progress: AutonomousProgress) => void;
  viralityThreshold?: number;
  maxIterations?: number;
}

/**
 * AGENTIC MODE: AUTONOMOUS GENERATION
 * ------------------------------------
 * 2027-era autonomous workflow:
 * 1. Deep Research: News, competitor analysis, synthesis
 * 2. Research-Informed Generation: Inject research context into prompt
 * 3. Autonomous Council: Self-improving debate loop until virality >= threshold
 * 
 * @param topic - The topic to generate content about
 * @param apiKeys - API keys (gemini required, serper optional for research)
 * @param options - Agentic options (progress callbacks, thresholds)
 * @returns The final optimized content with metadata
 */
export async function processInputAgentic(
  topic: string,
  apiKeys: { gemini: string; serper?: string },
  personaId: PersonaId = "cso",
  options: AgenticOptions = {}
): Promise<{
  textPost: string;
  researchBrief: string;
  iterations: number;
  finalScore: number;
  history: { iteration: number; score: number; feedback: string }[];
}> {
  const { onResearchProgress, onCouncilProgress, viralityThreshold = 75, maxIterations = 3 } = options;
  
  if (!topic) throw new Error("Topic required for agentic mode");
  if (!apiKeys.gemini) throw new Error("Gemini API Key required");

  console.log(`[Agentic Mode] Starting autonomous workflow for: "${topic}"`);
  const startTime = Date.now();

  // Phase 1: Deep Research
  console.log("[Agentic Mode] Phase 1: Deep Research...");
  const researchBrief = await runDeepResearch(
    topic,
    { gemini: apiKeys.gemini, serper: apiKeys.serper },
    onResearchProgress
  );
  
  console.log(`[Agentic Mode] Research complete. Found ${researchBrief.newsHeadlines.length} news items, ${researchBrief.suggestedAngles.length} angles.`);

  // Phase 2: Prepare enriched topic with research context
  const researchContext = formatResearchForPrompt(researchBrief);
  const enrichedTopic = `${topic}\n\n${researchContext}`;

  // Phase 3: Autonomous Council with self-improving loop
  console.log("[Agentic Mode] Phase 2: Autonomous Council...");
  const councilResult = await runAutonomousCouncil(
    enrichedTopic,
    apiKeys.gemini,
    {
      threshold: viralityThreshold,
      maxIterations: maxIterations,
      onProgress: onCouncilProgress
    }
  );

  console.log(`[Agentic Mode] Complete in ${Date.now() - startTime}ms. Final score: ${councilResult.finalScore}/100 after ${councilResult.iterations} iterations.`);

  // Post-process final content
  const processedText = applyAntiRobotFilter(councilResult.finalPost);
  const formattedText = LinkedInAdapter.differentiate(processedText);

  // Save agentic output
  try {
    const saveDir = path.join(process.cwd(), "generated_posts");
    if (!fs.existsSync(saveDir)) {
      fs.mkdirSync(saveDir);
    }

    const dateStr = new Date().toISOString().split('T')[0];
    const slug = sanitizeFilename(topic);
    const filename = `${dateStr}-agentic-${slug}.md`;
    const filePath = path.join(saveDir, filename);

    const fileContent = `---
date: ${new Date().toISOString()}
topic: "${topic.replace(/"/g, '\\"')}"
persona: "${personaId}"
mode: "agentic"
iterations: ${councilResult.iterations}
finalScore: ${councilResult.finalScore}
---

# Autonomous Generation

## Research Brief
${researchBrief.synthesizedContext}

## Suggested Angles
${researchBrief.suggestedAngles.map((a, i) => `${i + 1}. ${a}`).join("\n")}

## Final Post (Score: ${councilResult.finalScore}/100)

${formattedText}

## Iteration History
${councilResult.history.map(h => `- Iteration ${h.iteration}: Score ${h.score} - ${h.feedback}`).join("\n")}
`;

    fs.writeFileSync(filePath, fileContent, "utf8");
    console.log(`[Agentic Mode] Saved to: ${filePath}`);
  } catch (fsError) {
    console.error("[Agentic Mode] Failed to save file:", fsError);
  }

  return {
    textPost: formattedText,
    researchBrief: researchBrief.synthesizedContext,
    iterations: councilResult.iterations,
    finalScore: councilResult.finalScore,
    history: councilResult.history
  };
}
