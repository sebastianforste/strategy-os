import { GoogleGenAI } from "@google/genai";
import * as dotenv from "dotenv";
import { PERSONAS } from "../utils/personas";

dotenv.config({ path: "/Users/sebastian/Developer/strategy-os/.env.local" });

const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
const MODEL_NAME = "models/gemini-3-flash-preview";

if (!API_KEY) {
  console.error("Missing Gemini API Key");
  process.exit(1);
}

const genAI = new GoogleGenAI({ apiKey: API_KEY });

const TOPICS = [
  "The illusion of digital transformation in retail banking",
  "The day I realized my co-founder was lying about the burn rate",
  "Navigating a high-stakes migration with no downtime",
  "Why your company doesn't actually need a mission statement",
  "The hidden cost of playing it safe in leadership",
  "Why venture capital might be the worst thing for your product"
];

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function generateContent() {
  const personasToTest = ['cso', 'storyteller', 'colleague', 'contrarian'];
  
  console.log(`\n🚀 STARTING THROTTLED GENERATION AUDIT: ${MODEL_NAME}\n`);
  console.log("Throttling: 15 seconds per request to respect free tier quota.\n");
  console.log("--------------------------------------------------\n");

  for (const personaId of personasToTest) {
    const persona = PERSONAS[personaId];
    if (!persona) continue;

    console.log(`👤 PERSONA: ${persona.name} (${persona.id.toUpperCase()})`);

    // Generate 3 Posts
    console.log(`📝 GENERATING 3 POSTS...`);
    for (let i = 0; i < 3; i++) {
        const topic = TOPICS[Math.floor(Math.random() * TOPICS.length)];
        const prompt = `
            SYSTEM: ${persona.basePrompt}
            
            TASK: Generate a high-velocity LinkedIn post about: "${topic}"
            
            REQUIREMENTS:
            - Follow the CADENCE MAP exactly.
            - Use 1-2 SIGNATURE PHRASES.
            - Apply the ANTI-DETECTION LAYER (fragments, specific numbers, authentic details).
            - NO hashtags.
            - NO emojis (unless persona specifically allows).
            
            Return ONLY the text content.
        `;

        try {
            const result = await genAI.models.generateContent({
                model: MODEL_NAME,
                contents: prompt
            });
            
            if (result && result.text) {
                console.log(`\n[POST ${i+1}] Topic: ${topic}`);
                console.log(result.text.trim());
                console.log("\n---");
            } else {
                console.error(`[POST ${i+1}] No content returned.`);
            }
        } catch (e: any) {
            console.error(`[POST ${i+1}] Error:`, e.message || e);
        }
        await delay(15000); // 15s throttle
    }

    // Generate 3 Comments
    console.log(`\n💬 GENERATING 3 COMMENTS...`);
    for (let i = 0; i < 3; i++) {
        const targetPost = `I think the most important thing for startups today is focus. If you can't focus on one thing, you'll fail at everything. Focus on your customers, focus on your product, and ignore the noise. What do you think?`;
        
        const prompt = `
            SYSTEM: ${persona.basePrompt}
            
            TASK: Reply to this LinkedIn post:
            "${targetPost}"
            
            REQUIREMENTS:
            - Stay in character as ${persona.name}.
            - Be concise (under 50 words).
            - Use the ANTI-DETECTION LAYER.
            - Start a debate or offer a sharp inversion.
        `;

        try {
            const result = await genAI.models.generateContent({
                model: MODEL_NAME,
                contents: prompt
            });
            
            if (result && result.text) {
                console.log(`\n[COMMENT ${i+1}]`);
                console.log(result.text.trim());
                console.log("\n---");
            } else {
                console.error(`[COMMENT ${i+1}] No content returned.`);
            }
        } catch (e: any) {
            console.error(`[COMMENT ${i+1}] Error:`, e.message || e);
        }
        await delay(15000); // 15s throttle
    }

    console.log("\n" + "=".repeat(50) + "\n");
  }

  console.log("✅ GENERATION COMPLETE.");
}

generateContent();
