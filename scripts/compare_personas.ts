
import { GoogleGenAI } from "@google/genai";
import * as dotenv from "dotenv";
import { PERSONAS } from "../utils/personas";

dotenv.config({ path: ".env.local" });

const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;

if (!API_KEY) {
  console.error("No API Key found");
  process.exit(1);
}

const genAI = new GoogleGenAI({ apiKey: API_KEY });
const MODEL = "models/gemini-2.5-flash-native-audio-latest"; 

// OLD PROMPTS (Reconstructed from logs)
const OLD_PROMPTS = {
    cso: `You are the Chief Digital Strategy Officer for an elite consultancy.
You are authoritative, cynical of fluff, obsessed with clarity.
Goal: Convert inputs into high-velocity LinkedIn assets.
Protocol: Anti-Robot Filter (No 'delve', 'leverage'). Viral Syntax (Double line breaks).
Frameworks: The Villain, The Paradox.
Hooks: "Most people are playing the wrong game."`,

    storyteller: `You are a bootstrap founder who has failed 10 times and succeeded once.
Goal: Write a viral LinkedIn post that uses vulnerability to build trust.
Rules: Use "I" statements. Start with a failure. Justin Welsh formatting.
Tone: Humble but wise, gritty.
Hooks: "I lost $100k in 30 days."`,

    colleague: `You are a high-performing employee at a top-tier tech company.
Goal: Celebrate a team win WITHOUT sounding like a press release.
Rules: Focus on "WE". Be specific. No hashtags like #Blessed.
Tone: Enthusiastic, Grateful, Smart.
Hooks: "I didn't think we would ship this on time."`,

    contrarian: `You are a Silicon Valley VC who thinks most people are idiots.
Goal: Start a fight in the comments. Attack a popular consensus.
Rules: Use absolute statements ("Never", "Always"). Attack "Common Wisdom".
Tone: Aggressive, sharp, elitist.
Hooks: "Stop hiring Junior Developers."`
};

const TEST_SCENARIOS = [
    { 
        id: "cso", 
        topic: "The illusion of digital transformation in retail banking", 
        oldPrompt: OLD_PROMPTS.cso 
    },
    { 
        id: "storyteller", 
        topic: "The day I realized my co-founder was lying about the burn rate", 
        oldPrompt: OLD_PROMPTS.storyteller 
    },
    { 
        id: "colleague", 
        topic: "Navigating a high-stakes migration with no downtime", 
        oldPrompt: OLD_PROMPTS.colleague 
    },
    { 
        id: "contrarian", 
        topic: "Why your company doesn't actually need a mission statement", 
        oldPrompt: OLD_PROMPTS.contrarian 
    },
    {
        id: "cso",
        topic: "Reply to post: 'AI will replace all developers by 2030'. Take a pragmatic but firm stance.",
        oldPrompt: "You are a strategist. Write a comment to this post."
    }
];

// Helper for delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function generate(promptSystem: string, label: string, topic: string) {
    const fullPrompt = `
SYSTEM:
${promptSystem}

USER INPUT:
Topic: ${topic}

Please generate a LinkedIn post.
Return ONLY the text content.
`;

    console.log(`\n--- ${label} ---`);
    try {
        const result = await genAI.models.generateContent({
            model: MODEL,
            contents: fullPrompt
        });
        if (result && result.text) {
            console.log(result.text.trim());
        } else {
            console.log("No content generated.");
        }
        console.log("-----------------------------------");
    } catch (e) {
        console.error("Error:", e);
    }
}

async function run() {
    console.log("=== RUNNING FULL PERSONA COMPARISON (With Delays) ===\n");
    
    for (const scenario of TEST_SCENARIOS) {
        const newPersona = PERSONAS[scenario.id];
        console.log(`\n\n🔎 TESTING: ${newPersona.name} (${scenario.id.toUpperCase()})`);
        console.log(`TOPIC: "${scenario.topic}"`);
        
        // Generate Old
        await generate(scenario.oldPrompt, "OLD (V1)", scenario.topic);
        
        console.log("Waiting 30s to respect rate limits...");
        await delay(30000);

        // Generate New
        await generate(newPersona.basePrompt || "", "NEW (World Class)", scenario.topic);
        
        console.log("Waiting 30s before next persona...");
        await delay(30000);
    }
}

run();
