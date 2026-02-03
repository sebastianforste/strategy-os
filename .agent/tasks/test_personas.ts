/**
 * PERSONA TESTING SCRIPT
 * ----------------------
 * Generates 5 test posts for each persona and evaluates quality
 */

import { GoogleGenAI } from "@google/genai";
import { AI_CONFIG } from "../../utils/config";
import { PERSONAS, PersonaId } from "../../utils/personas";
import * as dotenv from "dotenv";
import * as path from "path";

// Load environment variables
dotenv.config({ path: path.join(__dirname, "../../.env.local") });

const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY || "";

// Test prompts designed to evaluate persona authenticity
const TEST_PROMPTS = [
  "The market just crashed 15%. What's your take?",
  "Everyone's talking about AI replacing jobs. Thoughts?",
  "I just got promoted to VP. How should I announce it?",
  "Burnout is real. How do you handle it?",
  "What's one contrarian belief you hold about leadership?",
];

interface TestResult {
  persona: string;
  prompt: string;
  output: string;
  timestamp: string;
}

async function generateForPersona(personaId: PersonaId, prompt: string): Promise<string> {
  const genAI = new GoogleGenAI({ apiKey: API_KEY });
  const persona = PERSONAS[personaId];
  
  try {
    const result = await genAI.models.generateContent({
      model: "models/gemini-flash-lite-latest", // Verified alias
      contents: prompt,
      config: {
        systemInstruction: persona.systemPrompt || persona.basePrompt,
        responseMimeType: "text/plain",
      }
    });
    
    return result.text || "[No output]";
  } catch (e: any) {
    return `[ERROR: ${e.message}]`;
  }
}

async function runTests() {
  const results: TestResult[] = [];
  const personaIds = Object.keys(PERSONAS) as PersonaId[];
  
  console.log("🧪 Starting Persona Quality Testing (Model: Flash Lite)...\n");
  console.log(`Testing ${personaIds.length} personas with ${TEST_PROMPTS.length} prompts each\n`);
  
  for (const personaId of personaIds) {
    const persona = PERSONAS[personaId];
    console.log(`\n📝 Testing: ${persona.name} (${personaId})`);
    console.log("─".repeat(60));
    
    for (let i = 0; i < TEST_PROMPTS.length; i++) {
      const prompt = TEST_PROMPTS[i];
      console.log(`\n  Prompt ${i + 1}: "${prompt}"`);
      
      const output = await generateForPersona(personaId, prompt);
      
      results.push({
        persona: persona.name,
        prompt,
        output,
        timestamp: new Date().toISOString(),
      });
      
      // Show preview
      const preview = output.substring(0, 150).replace(/\n/g, " ");
      console.log(`  Output: ${preview}${output.length > 150 ? "..." : ""}`);
      
      // Rate limit protection - increased for safety
      await new Promise(resolve => setTimeout(resolve, 4000));
    }
  }
  
  // Save results
  const fs = require("fs");
  const outputPath = ".agent/tasks/persona_test_results.json";
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
  console.log(`\n✅ Results saved to ${outputPath}`);
  
  return results;
}

async function reviewWithGemini(results: TestResult[]) {
  console.log("\n🔍 Running Gemini Quality Review...\n");
  
  const genAI = new GoogleGenAI({ apiKey: API_KEY });
  
  // Group by persona
  const byPersona: Record<string, TestResult[]> = {};
  results.forEach(r => {
    if (!byPersona[r.persona]) byPersona[r.persona] = [];
    byPersona[r.persona].push(r);
  });
  
  const reviews: any[] = [];
  
  for (const [personaName, personaResults] of Object.entries(byPersona)) {
    const reviewPrompt = `
You are a LinkedIn content strategist analyzing AI-generated posts.

PERSONA: ${personaName}

SAMPLE OUTPUTS:
${personaResults.map((r, i) => `
${i + 1}. Prompt: "${r.prompt}"
   Output: ${r.output}
`).join("\n")}

EVALUATION CRITERIA:
1. Voice Consistency (1-10): Does each post sound like the same person?
2. Authenticity (1-10): Does it feel human, not robotic?
3. Strategic Value (1-10): Would this actually perform well on LinkedIn?
4. Differentiation (1-10): Is this persona distinct from generic LinkedIn advice?

Provide:
- Overall scores for each criterion
- Key strengths (2-3 bullet points)
- Key weaknesses (2-3 bullet points)
- One specific improvement recommendation

Format as JSON:
{
  "voiceConsistency": <score>,
  "authenticity": <score>,
  "strategicValue": <score>,
  "differentiation": <score>,
  "strengths": ["...", "..."],
  "weaknesses": ["...", "..."],
  "recommendation": "..."
}
`;
    
    try {
      const result = await genAI.models.generateContent({
        model: AI_CONFIG.primaryModel,
        contents: reviewPrompt,
        config: {
          responseMimeType: "application/json",
        }
      });
      
      const review = JSON.parse(result.text || "{}");
      reviews.push({
        persona: personaName,
        ...review,
      });
      
      console.log(`✅ ${personaName}: Voice=${review.voiceConsistency}/10, Auth=${review.authenticity}/10, Strategy=${review.strategicValue}/10, Diff=${review.differentiation}/10`);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (e: any) {
      console.error(`❌ Failed to review ${personaName}:`, e.message);
    }
  }
  
  // Save reviews
  const fs = require("fs");
  const reviewPath = ".agent/tasks/persona_reviews.json";
  fs.writeFileSync(reviewPath, JSON.stringify(reviews, null, 2));
  console.log(`\n✅ Reviews saved to ${reviewPath}`);
  
  return reviews;
}

async function main() {
  if (!API_KEY) {
    console.error("❌ No API key found. Set NEXT_PUBLIC_GEMINI_API_KEY or GOOGLE_GENERATIVE_AI_API_KEY");
    process.exit(1);
  }
  
  const results = await runTests();
  const reviews = await reviewWithGemini(results);
  
  console.log("\n" + "=".repeat(60));
  console.log("📊 FINAL SUMMARY");
  console.log("=".repeat(60));
  
  reviews.forEach(r => {
    const avg = ((r.voiceConsistency + r.authenticity + r.strategicValue + r.differentiation) / 4).toFixed(1);
    console.log(`\n${r.persona}: ${avg}/10 overall`);
    console.log(`  Strengths: ${r.strengths?.[0] || "N/A"}`);
    console.log(`  Improve: ${r.recommendation || "N/A"}`);
  });
  
  console.log("\n✨ Testing complete!\n");
}

main().catch(console.error);
