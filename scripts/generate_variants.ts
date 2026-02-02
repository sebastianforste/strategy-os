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

async function runBenchmark() {
    console.log("🚀 Starting Variant Benchmark...");
    
    let markdownOutput = "# Variant Benchmark Report\n\n";

    for (const personaKey of Object.keys(PERSONAS)) {
        // Skip 'custom' for this benchmark
        if (personaKey === 'custom') continue;
        
        const persona = PERSONAS[personaKey as keyof typeof PERSONAS];
        console.log(`\nGenerating 10 samples for: ${persona.name} (${personaKey})...`);
        
        markdownOutput += `## Persona: ${persona.name}\n\n`;
        
        for (let i = 0; i < TOPICS.length; i++) {
            const topic = TOPICS[i];
            console.log(`  [${i+1}/10] Topic: ${topic}`);
            
            try {
                // Using 'demo' key logic override IF strictly required, but we want real generation here.
                // Assuming ai-service handles the actual call if a real key is provided.
                const assets = await generateContent(topic, API_KEY!, personaKey as any);
                
                markdownOutput += `### Topic ${i+1}: ${topic}\n`;
                markdownOutput += `**Post:**\n\`\`\`text\n${assets.textPost}\n\`\`\`\n\n`;
                markdownOutput += `**Hook Analysis:** (Self-Reflective)\n> ${assets.textPost.split('\n')[0]}\n\n`;
                markdownOutput += `---\n\n`;
                
                // Small delay to prevent rate limits
                await new Promise(r => setTimeout(r, 2000));
            } catch (error) {
                console.error(`  ❌ Failed to generate for topic "${topic}":`, error);
                markdownOutput += `### Topic ${i+1}: ${topic}\n*Generation Failed*\n\n`;
            }
        }
    }

    const outputPath = path.join(process.cwd(), "variant_benchmark_results.md");
    fs.writeFileSync(outputPath, markdownOutput);
    console.log(`\n✅ Benchmark Complete. Results saved to: ${outputPath}`);
}

runBenchmark();
