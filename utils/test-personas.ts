/**
 * Persona Test Script v2
 * Tests content generation across all personas with rate limit handling
 */

import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";
import { PERSONAS, PersonaId } from "./personas";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const TEST_PROMPT = "Why most leaders fail at strategic thinking";

const PERSONAS_TO_TEST: PersonaId[] = ["cso", "storyteller", "contrarian"];

async function sleep(ms: number) {
    console.log(`   ⏳ Waiting ${ms/1000}s to respect rate limits...`);
    return new Promise(r => setTimeout(r, ms));
}

async function testPersona(personaId: PersonaId, apiKey: string) {
    const persona = PERSONAS[personaId];
    console.log(`\n${"=".repeat(60)}`);
    console.log(`🎭 TESTING: ${persona.name} (${personaId})`);
    console.log(`${"=".repeat(60)}`);

    // Use the project default model
    const google = createGoogleGenerativeAI({ apiKey });
    const model = google("models/gemini-2.0-flash");

    const systemPrompt = persona.basePrompt || persona.systemPrompt || "";
    
    // Truncate system prompt to reduce tokens
    const truncatedPrompt = systemPrompt.slice(0, 1500);
    
    const fullPrompt = `${truncatedPrompt}

USER INPUT: ${TEST_PROMPT}

Generate a LinkedIn post. Output ONLY the post text.`;

    try {
        const { text } = await generateText({
            model,
            prompt: fullPrompt,
        });
        
        console.log(`\n📄 OUTPUT (${text.length} chars):\n`);
        console.log(text.slice(0, 800));
        if (text.length > 800) console.log("\n...[truncated]");
        
        // Quality checks
        const bannedWords = ["delve", "leverage", "unleash", "unlock", "embark", "navigate", "tapestry", "game-changer", "seamless", "landscape"];
        const foundBanned = bannedWords.filter(w => text.toLowerCase().includes(w));
        
        console.log(`\n📊 QUALITY CHECK:`);
        console.log(`   - Length: ${text.length} chars`);
        console.log(`   - Lines: ${text.split("\n").filter(l => l.trim()).length}`);
        console.log(`   - Banned words found: ${foundBanned.length > 0 ? foundBanned.join(", ") : "✅ None"}`);
        
        return { success: true, output: text };
    } catch (error: any) {
        console.error(`❌ ERROR: ${error.message.slice(0, 200)}`);
        return { success: false, error: error.message.slice(0, 100) };
    }
}

async function main() {
    const apiKey = process.env.GOOGLE_GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    
    if (!apiKey) {
        console.error("❌ No API key found.");
        process.exit(1);
    }

    console.log("🧪 PERSONA TEST SUITE v2");
    console.log(`📝 Test Prompt: "${TEST_PROMPT}"`);
    console.log(`🔑 API Key: ${apiKey.slice(0, 10)}...`);
    console.log(`⚙️  Model: gemini-1.5-flash (fallback for quota)`);
    
    const results: Record<string, any> = {};
    
    for (let i = 0; i < PERSONAS_TO_TEST.length; i++) {
        const personaId = PERSONAS_TO_TEST[i];
        
        // Wait between requests to avoid rate limits
        if (i > 0) {
            await sleep(65000); // 65 second delay between requests
        }
        
        results[personaId] = await testPersona(personaId, apiKey);
    }
    
    console.log(`\n\n${"=".repeat(60)}`);
    console.log("📋 SUMMARY");
    console.log(`${"=".repeat(60)}`);
    
    for (const [id, result] of Object.entries(results)) {
        const persona = PERSONAS[id as PersonaId];
        const status = result.success ? "✅" : "❌";
        console.log(`${status} ${persona.name}: ${result.success ? `${result.output.length} chars` : result.error}`);
    }
}

main().catch(console.error);
