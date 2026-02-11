
import { PersonaId } from "./personas";
import { SectorId, SECTORS } from "./sectors";
import { PlatformAdapter } from "./platforms/types";
import { findRelevantConcepts } from "./rag-service";
import { findTrends, fetchTrendingNews } from "./trend-service";
import { stitchService } from "./stitch-service";
import { moltbookService } from "./moltbook-service";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth";

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
    isTopVoiceMode: boolean = false,
    sectorId: SectorId = "general",
    isReplyMode: boolean = false
): Promise<{ prompt: string; mode: string }> {
    const startTime = Date.now();
    console.log(`[Prompt Construction] START Persona: ${personaId}, Newsjack: ${forceTrends}`);

    // RAG RETRIEVAL (Strategy Concepts)
    let ragContext = "";
    if (useRAG) {
        try {
            const ragStart = Date.now();
            const { findGraphConcepts } = await import("./rag-service");
            const graphConcepts = await findGraphConcepts(input, 5);
            console.log(`[Graph RAG] Found ${graphConcepts.length} concepts in ${Date.now() - ragStart}ms`);
            
            if (graphConcepts.length > 0) {
                ragContext = `
                STRATEGY CONTEXT (From Gunnercooke Library & Knowledge Graph):
                ${graphConcepts.map(c => `- ${c}`).join("\n")}
                
                USE THESE MENTAL MODELS AND LOGICAL ASSOCIATIONS.
                `;
            }
        } catch (e) {
            console.warn("[Graph RAG] Retrieval failed:", e);
        }
    }

    // RAG V2: VOICE MEMORY (Stylistic Matching)
    let voiceMemoryContext = "";
    if (useRAG) {
        try {
            const { searchVoiceMemory } = await import("./vector-store");
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

    // PHASE 24: STYLE MEMORY (User-uploaded samples)
    let styleRagContext = "";
    if (useRAG) {
        try {
            const { searchStyleMemory } = await import("./vector-store");
            const styles = await searchStyleMemory(input, 2);
            if (styles.length > 0) {
                 styleRagContext = `
                 USER STYLE REFERENCES (Mimic this exact writing style):
                 ${styles.map((s, i) => `[Style Reference ${i+1}]:\n${s.text}`).join("\n\n")}
                 
                 CRITICAL: ADOPT THE VOCABULARY, SENTENCE STRUCTURE, AND RHYTHM OF THESE SAMPLES.
                 `;
                 console.log(`[Style RAG] Found ${styles.length} style references`);
            }
        } catch (e) {
            console.warn("[Style RAG] Retrieval failed:", e);
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

    // SECTOR CONTEXT INJECTION (Phase 23)
    let sectorSection = "";
    if (sectorId && SECTORS[sectorId]) {
        const sector = SECTORS[sectorId];
        sectorSection = `
        SECTOR CONTEXT (${sector.name}):
        ${sector.contextPrompt}

        KEY TERMINOLOGY TO USE: ${sector.jargon.join(", ")}
        AVOID: ${sector.antiPatterns.join(", ")}
        `;
    }

    // PHASE 4: STRATEGIC REALISM
    const { getFiscalContext } = await import("./context-service");
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
    


    // PHASE 28: STITCH DESIGN DNA
    let stitchDnaContext = "";
    try {
        const session = await getServerSession(authOptions);
        const dna = await stitchService.getDesignDNA((session as any)?.accessToken);
        if (dna) {
            stitchDnaContext = stitchService.formatDNAForPrompt(dna);
            console.log(`[Stitch] Design DNA injected for visual grounding via OAuth.`);
        }
    } catch (e) {
        console.warn("[Stitch] DNA retrieval failed:", e);
    }

    // PHASE 28: MOLTBOOK TRENDS & SEARCH (AI Social Ingestion)
    let moltbookContext = "";
    try {
        const submolt = sectorId === "general" ? "strategy" : sectorId.toLowerCase();
        
        // Parallel fetch: Trending AND Semantic Search
        const [trendingPosts, searchResults] = await Promise.all([
            moltbookService.getTrending(submolt),
            moltbookService.search(input, 3)
        ]);

        if (trendingPosts.length > 0 || searchResults.length > 0) {
            moltbookContext = `
            MOLTBOOK AGENT DISCOURSE (Real-time Social context):
            
            ${trendingPosts.length > 0 ? `[Trending in submolt/${submolt}]:\n${trendingPosts.slice(0, 2).map((p, i) => `- Agent Discourse ${i+1}: ${p.content}`).join("\n")}` : ""}
            
            ${searchResults.length > 0 ? `[Semantic Search Results for "${input}"]:\n${searchResults.map((p, i) => `- Relevant Insight ${i+1}: ${p.content}`).join("\n")}` : ""}
            
            ADAPT TO THESE TRENDS: If these agents are debating a new mental model or contrarian angle, weave it into your response to stay "AI Native" and authoritative.
            `;
            console.log(`[Moltbook] Injected ${trendingPosts.length} trending and ${searchResults.length} search results.`);
        }
    } catch (e) {
        console.warn("[Moltbook] Context retrieval failed:", e);
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
        ${sectorSection}
        ${adaptationSection}
        ${voiceMemoryContext}
        ${styleRagContext}
        ${strategicRealism}
        ${topVoiceInstr}
        ${stitchDnaContext}
        ${moltbookContext}

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
                    ${sectorSection}
                    ${adaptationSection}
                    ${voiceMemoryContext}
                    ${styleRagContext}
                    ${strategicRealism}
                    ${topVoiceInstr}
                    ${stitchDnaContext}

                    MODE: THE NEWSJACKER (Trend Hunter)
                    TOPIC: ${input}
                    CONTEXT FROM NEWS ANALYST: "${primaryTrend.title}" - ${primaryTrend.snippet} (${primaryTrend.source})
                    SENTIMENT ANALYSIS: ${primaryTrend.sentiment} (Momentum: ${primaryTrend.momentum}/100)
                    REAL-TIME HEADLINES:
                    ${rawNews.slice(0, 3).map((n: string) => `- ${n}`).join("\n")}
                    
                    INSTRUCTIONS:
                    1. Use the SENTIMENT ANALYSIS to calibrate your tone (e.g., if Bullish, be punchy and optimistic; if Controversial, be more inquisitive or skeptical).
                    2. Acknowledge the rising momentum of this topic.
                    3. Find the "Counter-Narrative" (e.g., "It's a silent layoff").
                    4. Draft a post that validates the reader's suspicion.
                    `;
                } else {
                    console.warn("No trends found for", input);
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
                    ${sectorSection}
                    ${adaptationSection}
                    ${voiceMemoryContext}
                    ${styleRagContext}
                    ${strategicRealism}
                    ${topVoiceInstr}
                    ${stitchDnaContext}
                    ${moltbookContext}

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
                ${sectorSection}
                ${adaptationSection}
                ${voiceMemoryContext}
                ${styleRagContext}
                ${strategicRealism}
                ${topVoiceInstr}
                ${stitchDnaContext}
                ${moltbookContext}

                MODE: THE NEWSJACKER (Standard)
                TOPIC: ${input}
                
                INSTRUCTIONS:
                Validate the reader's suspicion about this topic. Find a counter-narrative.
            `;
        }
    }

    // PHASE 28: REPLY MODE (THE DISMANTLER)
    if (isReplyMode) {
        mode = "Dismantler";
        enrichedInput = `
            ${platformInstr}
            ${ragContext}
            ${styleSection}
            ${dnaSection}
            ${sectorSection}
            ${stitchDnaContext}

            MODE: THE DISMANTLER (High-Status Thread Reply)
            TARGET CONTENT TO DISMANTLE: 
            "${input}"

            INSTRUCTIONS:
            1. DO NOT AGREE. Find the one specific claim in the target that is "Dangerous" or "Half-True".
            2. INVERT THE LOGIC. Use the "Marcus Vane" (CSO) or chosen persona to expose why the original author is missing the 80/20.
            3. BRO-ETRY SYNTAX: Use single, punchy sentences. Maximum clarity. Zero fluff.
            4. END WITH A PUNCHLINE: A single sentence that leaves no room for debate.
            5. LENGTH: Stay under 150 words. Be a "Ghost in the Machine".
        `;
    }
    
    console.log(`[Prompt Construction] DONE in ${Date.now() - startTime}ms. Mode: ${mode}`);
    return { prompt: enrichedInput, mode };
}
