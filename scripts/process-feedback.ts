
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { processPostFeedback } from "../utils/feedback-loop";
import { moltbookService } from "../utils/moltbook-service";
import { upsertToVoiceMemory } from "../utils/vector-store";

dotenv.config();

interface LocalPost {
    filename: string;
    content: string;
    persona: string;
    date: string;
}

const GENERATED_DIR = path.join(process.cwd(), 'generated_posts');

// Helper to read local posts
function getLocalPosts(): LocalPost[] {
    if (!fs.existsSync(GENERATED_DIR)) return [];
    
    const files = fs.readdirSync(GENERATED_DIR).filter(f => f.endsWith('.md'));
    const posts: LocalPost[] = [];

    for (const file of files) {
        const content = fs.readFileSync(path.join(GENERATED_DIR, file), 'utf-8');
        // Simple Frontmatter parsing
        const personaMatch = content.match(/persona: "(.*?)"/);
        const dateMatch = content.match(/date: (.*?)\n/);
        const bodyMatch = content.split('# Generated Post')[1];

        if (personaMatch && bodyMatch) {
            posts.push({
                filename: file,
                content: bodyMatch.trim(),
                persona: personaMatch[1],
                date: dateMatch ? dateMatch[1] : ""
            });
        }
    }
    return posts;
}

async function main() {
    console.log("🧬 Starting Moltbook Performance Loop (RLHF)...");
    
    // 1. Load Local Generation History
    const localPosts = getLocalPosts();
    console.log(`📂 Loaded ${localPosts.length} local posts from history.`);

    // 2. Fetch Recent Moltbook Activity
    console.log("📡 Fetching recent posts from Moltbook...");
    const recentPosts = await moltbookService.getRecentPosts(50);
    console.log(`Received ${recentPosts.length} posts from API.`);

    let processedCount = 0;
    let reinforcedCount = 0;

    // 3. Match and Process
    for (const moltPost of recentPosts) {
        // Simple fuzzy match: check if the first 50 characters match
        // Or if the full text is contained
        // Normalize newlines and spaces
        const normalizedMolt = moltPost.content.replace(/\s+/g, ' ').substring(0, 100);
        
        const match = localPosts.find(p => {
            const normalizedLocal = p.content.replace(/\s+/g, ' ').substring(0, 100);
            return normalizedLocal.includes(normalizedMolt) || normalizedMolt.includes(normalizedLocal);
        });

        if (match) {
            console.log(`✅ Matched Local Post: ${match.filename} to Moltbook ID: ${moltPost.id}`);
            
            const feedback = await processPostFeedback(moltPost);
            console.log(`   Action: ${feedback.action} (${feedback.reason})`);

            if (feedback.action === "REINFORCE") {
                console.log(`   🚀 REINFORCING Persona: ${match.persona}`);
                await upsertToVoiceMemory(
                    match.persona, 
                    `moltbook_success_${moltPost.id}`, 
                    moltPost.content, 
                    { 
                        source: 'moltbook_rlhf', 
                        likes: 0, // In V1 scraper we fetch via API so we pass 0 here or actual metrics if we pipe it
                        // Wait, processPostFeedback fetched metrics internally but didn't return them.
                        // Let's blindly upsert for now, as the vector store just needs the text.
                        metric_context: feedback.reason
                    }
                );
                reinforcedCount++;
            }
            processedCount++;
        } else {
            // console.log(`Skipping unmatched post ${moltPost.id}`);
        }
    }

    console.log("-----------------------------------------");
    console.log(`🎉 RLHF Cycle Complete.`);
    console.log(`Checked: ${recentPosts.length} Moltbook Posts`);
    console.log(`Matched: ${processedCount} Local Files`);
    console.log(`Reinforced: ${reinforcedCount} High Performers`);
}

main().catch(console.error);
