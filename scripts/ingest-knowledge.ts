import { getEmbedding } from "../utils/gemini-embedding";
import type { KnowledgeChunk } from "../utils/rag-service";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

// Load environment variables from .env.local
dotenv.config({ path: ".env.local" });

const GEMINI_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
// The folder is actually adjacent to the project root in the workspace
// /Users/sebastian/Developer/gunnercooke marketing
const SOURCE_DIR = path.resolve(process.cwd(), "../gunnercooke marketing");
const OUTPUT_FILE = path.join(process.cwd(), "data", "knowledge_index.json");

async function ingest() {
    if (!GEMINI_KEY) {
        console.error("Missing NEXT_PUBLIC_GEMINI_API_KEY in .env.local");
        process.exit(1);
    }

    if (!fs.existsSync(SOURCE_DIR)) {
        console.error(`Source directory not found: ${SOURCE_DIR}`);
        process.exit(1);
    }

    console.log(`Scanning ${SOURCE_DIR}...`);
    const files = fs.readdirSync(SOURCE_DIR).filter(f => f.endsWith(".md") && !f.startsWith("."));
    
    const chunks: KnowledgeChunk[] = [];
    
    for (const file of files) {
        console.log(`Processing ${file}...`);
        const content = fs.readFileSync(path.join(SOURCE_DIR, file), "utf-8");
        
        // Simple Chunking Strategy: Split by "###" (Headers)
        const rawSections = content.split("\n### ");
        
        for (let i = 0; i < rawSections.length; i++) {
            const section = rawSections[i];
            if (section.trim().length < 50) continue; // Skip tiny sections

            // Extract title (first line)
            const lines = section.split("\n");
            const title = lines[0].replace(/^###\s*/, "").trim(); 
            const body = lines.slice(1).join("\n").trim();
            
            // Clean filename for source
            const source = file.replace(/-/g, " ").replace(".md", "");

            // Generate Embedding
            // Combine source + title + body for full semantic context
            const textToEmbed = `Source: ${source}\nTopic: ${title}\n\n${body}`;
            
            // Artificial delay to avoid Rate Limits
            await new Promise(r => setTimeout(r, 3000));
            
            try {
                const vector = await getEmbedding(textToEmbed, GEMINI_KEY);
                if (vector.length > 0) {
                     chunks.push({
                        id: `${file}-${i}`,
                        source: source,
                        title: title, // First chunk might be title of book
                        content: body.substring(0, 1000), // Store snippets to keep size down
                        embedding: vector
                    });
                     process.stdout.write(".");
                }
            } catch {
                console.error(`Failed to embed chunk in ${file}`);
            }
        }
        console.log(" Done.");
    }

    console.log(`\nWriting index with ${chunks.length} chunks...`);
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(chunks, null, 2));
    console.log(`Saved to ${OUTPUT_FILE}`);
}

ingest();
