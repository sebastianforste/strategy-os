import { generateVideoScript } from "../utils/video-service";
import * as dotenv from "dotenv";
dotenv.config();

async function runTest() {
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    if (!apiKey) {
        console.error("❌ GEMINI_API_KEY / GOOGLE_API_KEY missing");
        process.exit(1);
    }

    const testContent = "The future of AI Agents in the legal sector involves autonomous case research and predictive litigation risk scoring.";
    
    console.log("🚀 Testing Video Architect (Phase 25)...");
    try {
        const script = await generateVideoScript(testContent, "linkedin", apiKey, (p) => {
            console.log(`[${p.phase.toUpperCase()}] ${p.message}`);
        });

        console.log("\n✅ Video Script Generated:");
        console.log(`Title: ${script.title}`);
        console.log(`Hook: ${script.hook}`);
        console.log(`Scenes: ${script.scenes.length}`);
        console.log(`Duration: ${script.totalDuration}s`);
    } catch (e) {
        console.error("❌ Test Failed:", e);
    }
}

runTest();
