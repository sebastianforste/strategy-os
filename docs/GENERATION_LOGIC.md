# Strategy OS: Generation Logic Compilation (v2.0)

This file contains the complete source code for every component involved in generating content.
Updated to include **Streaming Responses**, **Unified Prompt Logic**, and **RAG Toggles**.

## 1. Shared Logic & Orchestrator (`actions/generate.ts`)
Refactored to export `constructEnrichedPrompt` so both Server Actions and Streaming APIs can use the exact same RAG/Prompting logic.

```typescript
"use server";

import { generateContent, GeneratedAssets } from "../utils/ai-service";
import { findRelevantConcepts } from "../utils/rag-service";
import { applyAntiRobotFilter } from "../utils/text-processor";
import { findTrends } from "../utils/search-service";
import { generateImage } from "../utils/image-service";
import { PersonaId } from "../utils/personas";
// ... imports

/**
 * HELPER: Constructs the enriched prompt with RAG, Mode, and Platform instructions.
 * USED BY: Server Action & Streaming API
 */
export async function constructEnrichedPrompt(
    input: string, 
    geminiKey: string,
    personaId: PersonaId,
    forceTrends: boolean,
    adapter: PlatformAdapter,
    useRAG: boolean = true // Default ON
): Promise<{ prompt: string; mode: string }> {
    console.log(`[Prompt Construction] Persona: ${personaId}, Newsjack: ${forceTrends}, RAG: ${useRAG}, Platform: ${adapter.name}`);

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
            }
        } catch (e) {
            console.warn("[RAG] Retrieval failed:", e);
        }
    } else {
        console.log("[RAG] Skipped by user.");
    }

    let enrichedInput = input;
    let mode = "Newsjacker"; 
    // ... [Mode Detection & Platform Instructions] ...

    if (hasUrl) {
        mode = "Translator";
        enrichedInput = `
        ${platformInstr}
        ${ragContext}
        MODE: THE TRANSLATOR...
        `;
    } else {
        // ... [Trend Hunting Logic] ...
        enrichedInput = `
        ${platformInstr}
        ${ragContext}
        MODE: THE NEWSJACKER...
        `;
    }
    
    return { prompt: enrichedInput, mode };
}

/**
 * LEGACY SERVER ACTION (For Background/Scheduled Jobs)
 */
export async function processInput(
  input: string,
  apiKeys: { gemini: string; serper?: string; openai?: string },
  personaId: PersonaId = "cso",
  forceTrends: boolean = false,
  platform: "linkedin" | "twitter" = "linkedin"
): Promise<GeneratedAssets> {
   // ... [Calls constructEnrichedPrompt + generateContent] ...
}
```

## 2. Streaming API Route (`app/api/generate/route.ts`)
The new endpoint for real-time text streaming.

```typescript
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

    const geminiKey = apiKeys.gemini.trim();
    const adapter = platform === "twitter" ? TwitterAdapter : LinkedInAdapter;

    // 1. REUSE LOGIC: Construct the enriched prompt
    const { prompt: enrichedInput } = await constructEnrichedPrompt(
        input, 
        geminiKey, 
        personaId as PersonaId, 
        forceTrends, 
        adapter,
        useRAG
    );

    // 2. Select Persona
    const selectedPersona = PERSONAS[personaId as PersonaId] || PERSONAS.cso;

    // 3. OVERRIDE SYSTEM PROMPT FOR STREAMING
    // We want raw Markdown, not JSON, so we can stream it character-by-character.
    const streamingSystemPrompt = `
    ${selectedPersona.systemPrompt}

    IMPORTANT OVERRIDE: 
    Do NOT output JSON. 
    Output the "LinkedIn Text Post" (or Twitter Thread) DIRECTLY in Markdown format.
    Do not preface it. Just start writing the post.
    `;

    // 4. STREAM USING VERCEL AI SDK
    const result = streamText({
      model: google("gemini-1.5-flash", { apiKey: geminiKey }),
      system: streamingSystemPrompt,
      prompt: enrichedInput,
      temperature: 0.7,
    });

    return result.toDataStreamResponse();
  } catch (error: any) {
    return new Response(error.message, { status: 500 });
  }
}
```

## 3. The Brain: Personas (`utils/personas.ts`)
Defines the "Voice" and core instructions.

```typescript
export const PERSONAS = {
  cso: {
    id: "cso",
    name: "The Strategist (CDSO)",
    systemPrompt: `
You are the Chief Digital Strategy Officer...
CORE PROTOCOLS:
1. THE ANTI-ROBOT FILTER...
2. THE VIRAL SYNTAX...
3. OPERATION MODES...
OUTPUT FORMAT (JSON): { textPost, imagePrompt, videoScript }
`,
  },
  // ... [Other Personas] ...
};
```

## 4. RAG Service (`utils/rag-service.ts`)
Vector retrieval logic.

```typescript
// ... [Imports] ...

export async function findRelevantConcepts(query: string, apiKey: string, topK: number = 3): Promise<KnowledgeChunk[]> {
    if (!fs.existsSync(KNOWLEDGE_FILE)) return [];

    // 1. Load Index
    const rawData = fs.readFileSync(KNOWLEDGE_FILE, "utf-8");
    const index: KnowledgeChunk[] = JSON.parse(rawData);
    
    // 2. Embed Query
    const queryVector = await embedText(query, apiKey);

    // 3. Cosine Similarity Rank
    const scored = index.map(chunk => ({
        chunk,
        score: cosineSimilarity(queryVector, chunk.embedding)
    }));
    return scored.sort((a, b) => b.score - a.score).slice(0, topK).map(s => s.chunk);
}
```

## 5. Streaming UI (`components/StreamingConsole.tsx`)
The client-side component handling the stream.

```typescript
"use client";
import { useCompletion } from "ai/react";
// ...

export default function StreamingConsole({ useRAG, setUseRAG, ...props }: StreamingConsoleProps) {
  // VERCEL AI HOOK
  const { complete, completion, isLoading } = useCompletion({
    api: "/api/generate",
    body: {
        apiKeys: props.apiKeys,
        personaId: props.personaId,
        forceTrends: props.useNewsjack,
        useRAG: props.useRAG, // <--- Flag passed here
        platform: props.platform
    },
    onFinish: (prompt, result) => {
        props.onGenerationComplete(result);
    }
  });

  return (
    // ... UI with Textarea (Input) or Div (Completion) ...
    // ... Toggle Buttons for Newsjack / RAG / Persona ...
    <button onClick={() => complete(input)}>GENERATE STREAM</button>
  );
}
```
