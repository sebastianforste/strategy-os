import { generateContent } from "../utils/ai-service-server";
import { PERSONAS } from "../utils/personas";
import * as fs from "fs";
import * as path from "path";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

if (!API_KEY) {
    console.error("❌ No API KEY found in .env.local");
    process.exit(1);
}

const TOPICS = [
    "The future of remote work is hybrid.",
    "Why AI will replace middle management.",
    "Coding is the new literacy.",
    "Bootstrapping vs VC funding.",
    "The importance of personal branding.",
    "Why most startups fail.",
    "The 4-day work week.",
    "Mental health in tech.",
    "The death of the resume.",
    "How to learn effectively."
];

async function runBenchmarkParallel() {
    console.log("🚀 Starting Parallel Variant Benchmark...");
    
    let markdownOutput = "# Variant Benchmark Report\n\n";

    for (const personaKey of Object.keys(PERSONAS)) {
        if (personaKey === 'custom') continue;
        
        const persona = PERSONAS[personaKey as keyof typeof PERSONAS];
        console.log(`\nGenerating 10 samples for: ${persona.name} (${personaKey})...`);
        markdownOutput += `## Persona: ${persona.name}\n\n`;

        // Run all 10 topics in parallel for this persona
        const promises = TOPICS.map(async (topic, index) => {
             try {
                // Add jitter to avoid instant rate limit clashing (though provider might still limit)
                await new Promise(r => setTimeout(r, index * 200)); 
                const assets = await generateContent(topic, API_KEY!, personaKey as any);
                return {
                    topic,
                    text: assets.textPost,
                    success: true
                };
             } catch (e) {
                 console.error(`❌ Error on topic "${topic}":`, e);
                 return { topic, text: "Error generating content.", success: false };
             }
        });

        const results = await Promise.all(promises);

        results.forEach((res, i) => {
            markdownOutput += `### Topic ${i+1}: ${res.topic}\n`;
            markdownOutput += `**Post:**\n\`\`\`text\n${res.text}\n\`\`\`\n\n`;
            markdownOutput += `---\n\n`;
        });
    }

    const outputPath = path.join(process.cwd(), "variant_benchmark_results.md");
    fs.writeFileSync(outputPath, markdownOutput);
    console.log(`\n✅ Benchmark Complete. Results saved to: ${outputPath}`);
}

runBenchmarkParallel();
