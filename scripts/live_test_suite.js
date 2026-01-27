
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Load API Key (Hardcoded from .env.local for this script context)
const API_KEY = "AIzaSyCjdqsYkIJEcQEi9LRV4H0v_GwXtjUeNSg"; 

async function researchPrompts() {
    console.log("🕵️  Step 1: Researching 10 Topics via App's AI Model...");
    
    try {
        const genAI = new GoogleGenerativeAI(API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

        const prompt = `
            You are the "StrategyOS" research engine.
            Generate 10 specific, contrarian, and high-status topics for LinkedIn posts.
            Focus on: Corporate Strategy, AI adoption, Leadership, and startup culture.
            
            Return ONLY a raw JSON array of strings. Example: ["Topic 1", "Topic 2"]
        `;

        const result = await model.generateContent(prompt);
        const text = result.response.text();
        
        // cleanup json
        const cleanJson = text.replace(/```json/g, "").replace(/```/g, "").trim();
        const topics = JSON.parse(cleanJson);
        
        console.log(`✅ Generated ${topics.length} topics:`);
        topics.forEach((t, i) => console.log(`   ${i+1}. ${t}`));
        
        return topics;

    } catch (e) {
        console.error("❌ Research Phase Failed. Is the API Key valid?");
        console.error(e.message);
        // Fallback topics just in case, so we can still test the "Live" API connection logic
        return [
            "The ROI of Silence in Boardrooms",
            "Why Agile is Dead",
            "Efficiency is the Enemy of Innovation"
        ];
    }
}

async function testGeneration(topics) {
    console.log("\n🧪 Step 2: Testing Live Generation API with Topics...");
    
    for (let i = 0; i < topics.length; i++) {
        const topic = topics[i];
        process.stdout.write(`   [${i + 1}/${topics.length}] "${topic.substring(0, 30)}..." `);
        
        try {
            const response = await fetch("http://localhost:3000/api/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    input: topic,
                    apiKeys: { gemini: API_KEY }, // LIVE KEY
                    personaId: "cso",
                    platform: "linkedin",
                    useRAG: false,
                    useFewShot: false
                })
            });

            if (!response.ok) {
                const errText = await response.text();
                console.log(`❌ FAILED (${response.status}): ${errText.substring(0, 50)}...`);
                continue;
            }

            // Stream reader
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let accumulated = "";
            
            while(true) {
                const { done, value } = await reader.read();
                if (done) break;
                accumulated += decoder.decode(value, { stream: true });
            }

            if (accumulated.includes("[DEMO MODE]")) {
                console.log("⚠️  WARNING: Got Demo Mode response (Key might be invalid or logic fell back?)");
            } else if (accumulated.length < 50) {
                 console.log(`⚠️  Weak Response (${accumulated.length} chars)`);
            } else {
                console.log(`✅ Success (${accumulated.length} chars)`);
            }

        } catch (e) {
            console.log(`❌ Error: ${e.message}`);
        }
        
        // Rate limit protection
        await new Promise(r => setTimeout(r, 1000));
    }
}

(async () => {
    const topics = await researchPrompts();
    if (topics.length > 0) {
        await testGeneration(topics);
    }
})();
