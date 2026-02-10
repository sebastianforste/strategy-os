
import { processInput } from "../actions/generate";
import dotenv from "dotenv";

dotenv.config();

async function main() {
    console.log("🧪 Testing Generation with Style Memory...");
    const apiKeys = { gemini: process.env.GEMINI_API_KEY || "" };
    
    try {
        // We use a topic likely to trigger style retrieval
        const result = await processInput("The future of AI agents and social strategy", apiKeys);
        console.log("Generated Post Length:", result.textPost.length);
        console.log("Snippet:\n", result.textPost.substring(0, 300));
        
        // We can't easily see the internal logs of the server action here since it runs in the same process,
        // but if we look at the console output of this script, we should see the [Style RAG] logs from actions/generate.ts
    } catch (error) {
        console.error("Generation Test Failed:", error);
    }
}

main();
