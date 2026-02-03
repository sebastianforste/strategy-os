import { GoogleGenAI } from "@google/genai";
// HACK: Suppress 'server-only' error for standalone script execution
import module from 'module';
const originalRequire = (module as any).prototype.require;
(module as any).prototype.require = function() {
  if (arguments[0] === 'server-only') return {};
  return originalRequire.apply(this, arguments);
};

import { PERSONAS, PersonaId } from "../utils/personas";
import { constructEnrichedPrompt } from "../actions/generate";
import { LinkedInAdapter } from "../utils/platforms/linkedin";
import * as dotenv from "dotenv";

dotenv.config({ path: "/Users/sebastian/Developer/strategy-os/.env.local" });

const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY || "";
const PRIMARY_MODEL = "models/gemini-2.5-flash-native-audio-latest"; 
const DISCRIMINATOR_MODEL = "models/deep-research-pro-preview-12-2025";

if (!API_KEY) {
  console.error("Missing Gemini API Key");
  process.exit(1);
}

const genAI = new GoogleGenAI({ apiKey: API_KEY });

async function runBenchmark() {
  const personaId: PersonaId = "cso";
  const persona = PERSONAS[personaId];
  const topic = "The dangerous myth of 'Efficient Growth' in early-stage fintech";

  console.log(`\n🧪 STARTING DARWIN PHASE 4 BENCHMARK: V1 (Static) vs V2 (Adaptive)`);
  console.log(`Persona: ${persona.name} | Topic: ${topic}\n`);

  // --- STEP 1: PREPARE MOCK VOICE MEMORY ---
  console.log("1. Injecting Successful Style Markers (Mock)...");
  const mockHighDwell = [
    "Consultants sell process. We sell survival. In 2024, survival is the only growth metric that matters.",
    "The board is lying to you. Your burn isn't 'investment'. It's an exit wound.",
    "Stop optimizing for LTV/CAC. Optimize for the day you don't need a VC to sign your payroll cheques."
  ];
  
  const mockAdaptationContext = {
    highDwellPosts: mockHighDwell,
    performanceSummary: "Users respond best to ruthless financial realism and short, punchy warnings about VC dependency."
  };

  // --- STEP 2: GENERATE V1 (STATIC) ---
  console.log("2. Generating Darwin V1 (Static Prompt)...");
  const { prompt: promptV1 } = await constructEnrichedPrompt(
    topic,
    API_KEY,
    personaId,
    false,
    LinkedInAdapter,
    false, // No RAG
    "",
    "",
    "", // styleMemory
    "", // styleDNA
    undefined, // adaptationContext
    false, // isTeamMode
    undefined, // name
    undefined, // role
    undefined, // relation
    "professional", // subStyle
    false // isTopVoiceMode
  );

  const resultV1 = await genAI.models.generateContent({
      model: PRIMARY_MODEL,
      contents: promptV1
  });
  const textV1 = resultV1.text || "";

  // --- STEP 3: GENERATE V2 (ADAPTIVE) ---
  console.log("3. Generating Darwin V2 (Adaptive Prompt with Voice Memory)...");
  const { prompt: promptV2 } = await constructEnrichedPrompt(
    topic,
    API_KEY,
    personaId,
    false,
    LinkedInAdapter,
    true, // RAG ON
    "",
    "",
    "", // styleMemory
    "", // styleDNA
    mockAdaptationContext,
    false, // isTeamMode
    undefined, // name
    undefined, // role
    undefined, // relation
    "professional", // subStyle
    false // isTopVoiceMode
  );

  const resultV2 = await genAI.models.generateContent({
      model: PRIMARY_MODEL,
      contents: promptV2
  });
  const textV2 = resultV2.text || "";

  // --- STEP 4: DISCRIMINATOR PASS ---
  console.log("4. Running LLM Discriminator Analysis...");
  
  const discriminatorPrompt = `
    You are a Senior Strategic Editor. Compare these two LinkedIn posts for the persona: "${persona.name}".
    
    PERSONA CHARACTERISTICS:
    - ${persona.signaturePhrases?.join(", ") || "No specific phrases"}
    - Anti-Patterns: ${persona.antiPatterns?.join(", ") || "No specific anti-patterns"}
    
    POST A (Darwin V1):
    ${textV1}
    
    POST B (Darwin V2):
    ${textV2}
    
    EVALUATE BASED ON:
    1. VOICE DISTINCTION: Which one sounds more like a real, ruthless strategist?
    2. VALUE DENSITY: Which one offers deeper strategic insight?
    3. ANTI-PATTERN DETECTION: Does either use forbidden phrases?
    4. DWELL PREDICTION: Which one is more likely to hold a reader's attention?
    
    RETURN ONLY A JSON OBJECT:
    {
      "v1_score": 0-10,
      "v2_score": 0-10,
      "winner": "V1" | "V2",
      "rational": "Brief explanation of why B is better/worse",
      "style_drift": "Did V2 maintain the persona while adapting?"
    }
  `;

  const discResult = await genAI.models.generateContent({
      model: DISCRIMINATOR_MODEL,
      contents: discriminatorPrompt
  });
  
  const rawJson = discResult.text || "{}";
  const finalAnalysis = JSON.parse(rawJson.replace(/```json|```/g, "").trim());

  // --- STEP 5: OUTPUT RESULTS ---
  console.log("\n" + "=".repeat(60));
  console.log("📊 BENCHMARK RESULTS:");
  console.log("=".repeat(60));
  console.log(`V1 (Static) Score:  ${finalAnalysis.v1_score}/10`);
  console.log(`V2 (Adaptive) Score: ${finalAnalysis.v2_score}/10`);
  console.log(`WINNER:              ${finalAnalysis.winner}`);
  console.log(`\nRATIONALE: ${finalAnalysis.rational}`);
  console.log(`STYLE DRIFT: ${finalAnalysis.style_drift}`);
  console.log("=".repeat(60));

  console.log("\n[SAMPLE V1 OUTOUT]:\n", textV1.substring(0, 400), "...");
  console.log("\n" + "-".repeat(30));
  console.log("\n[SAMPLE V2 OUTOUT]:\n", textV2.substring(0, 400), "...");
}

runBenchmark().catch(console.error);
