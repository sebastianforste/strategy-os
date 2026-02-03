/**
 * List Available Google Models
 * Helper to debug model name issues
 */

import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function listModels() {
    const apiKey = process.env.GOOGLE_GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
        console.error("No API Key found");
        return;
    }

    console.log("Fetching models...");
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await response.json();

    if (data.models) {
        console.log("\n✅ AVAILABLE MODELS:");
        data.models.forEach((m: any) => {
            console.log(`- ${m.name} (${m.displayName})`);
            console.log(`  Supported methods: ${m.supportedGenerationMethods.join(", ")}`);
        });
    } else {
        console.error("Error fetching models:", data);
    }
}

listModels();
