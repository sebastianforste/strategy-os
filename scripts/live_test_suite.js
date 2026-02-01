
const { GoogleGenAI } = require("@google/genai");
const fs = require('fs');
const path = require('path');

// Load API key from environment
const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY; 

const OUTPUT_FILE = path.join(__dirname, '..', 'comprehensive_test_report.md');

const SCENARIOS = [
    { type: 'topic', value: "The death of middle management", persona: "cso" },
    { type: 'topic', value: "Why excessive hiring is a red flag", persona: "skeptic" },
    { type: 'topic', value: "The future of bio-computing in 2030", persona: "visionary" },
    { type: 'url', value: "https://example.com/legal-ruling-tech-antitrust", persona: "expert" }, // Mock URL for translator mode
    { type: 'topic', value: "DeepSeek vs OpenAI", persona: "cso" } // Trending topic
];

async function runTests() {
    console.log("🚀 Starting Comprehensive Test Suite...");
    
    let reportContent = `# StrategyOS Comprehensive Test Report
**Date:** ${new Date().toISOString()}

## Executive Summary
This report analyzes the output of the StrategyOS generation engine across various personas and modes.

---

`;

    console.log(`📝 Writing results to: ${OUTPUT_FILE}`);

    for (let i = 0; i < SCENARIOS.length; i++) {
        const scenario = SCENARIOS[i];
        console.log(`\n🧪 [${i+1}/${SCENARIOS.length}] Testing: "${scenario.value.substring(0, 30)}..." (${scenario.persona})`);
        
        try {
            const startTime = Date.now();
            const response = await fetch("http://localhost:3000/api/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    input: scenario.value,
                    apiKeys: { gemini: API_KEY },
                    personaId: scenario.persona,
                    platform: "linkedin",
                    useRAG: true, // Enable RAG to test retrieval
                    forceTrends: scenario.type === 'topic', // Force trend hunt for topics
                })
            });

            if (!response.ok) {
                const errText = await response.text();
                throw new Error(`API Error (${response.status}): ${errText}`);
            }

            // Stream reader
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let accumulated = "";
            
            while(true) {
                const { done, value } = await reader.read();
                if (done) break;
                // SSE streams usually have 'data: ' prefix but this simplified endpoint might just return raw text or chunks
                // The current API route returns a stream of text directly.
                const chunk = decoder.decode(value, { stream: true });
                accumulated += chunk;
            }

            const duration = Date.now() - startTime;
            const status = accumulated.length > 50 ? "✅ PASS" : "⚠️ WEAK";
            console.log(`   Result: ${status} (${accumulated.length} chars)`);

            // Append to Report
            reportContent += `## Test Case ${i+1}: ${scenario.type === 'topic' ? 'Newsjacker' : 'Translator'} Mode
**Input:** "${scenario.value}"
**Persona:** \`${scenario.persona}\`
**Status:** ${status}
**Duration:** ${duration}ms

### Generated Output:
\`\`\`markdown
${accumulated.trim()}
\`\`\`

---
`;

        } catch (e) {
            console.error(`   ❌ FAIL: ${e.message}`);
            reportContent += `## Test Case ${i+1}: FAILED
**Input:** "${scenario.value}"
**Error:** ${e.message}

---
`;
        }
        
        // Rate limit pause
        await new Promise(r => setTimeout(r, 2000));
    }


    // ... (Previous tests)

    // ==========================================
    // TEST 6: COMMENT GENERATION (Direct Model Call)
    // ==========================================
    console.log(`\n🧪 [6/6] Testing: Comment Generation (Reply to "Hustle Culture")`);
    
    const samplePost = `
    If you're not waking up at 4AM, you're already behind.
    Success isn't given. It's taken.
    While you sleep, I grind.
    While you eat, I build.
    #Hustle #Grindset #Motivation
    `;
    
    const commentPrompt = `
        ACT AS: Chief Strategy Officer
        CONTEXT: You are a high-level strategist who values leverage over effort. You believe in working smart, not just hard.
        
        TASK:
        You are NOT creating a new post. You are RESPONDING to someone else's post.
        Your goal is to be the "Smartest Person in the Comments" while maintaining the StrategyOS voice.
        
        POST CONTENT TO REPLY TO:
        """
        ${samplePost}
        """
        
        COMMENT TONE/GOAL: Contrarian
        
        GUIDELINES FOR A REPLIER:
        1. ACKNOWLEDGE: Briefly acknowledge a specific point from the post.
        2. ADD VALUE: Provide a strategic pivot, a contrarian angle, or a clarifying framework that the author missed.
        3. INTERACT: Treat the author as a peer. Challenge them or support them with logic.
        4. BREVITY: Keep it under 50 words. No "I hope this helps" or fluff.
        5. NO ROBOT SPEAK: Follow the "Anti-Robot Filter" (No 'Delve', 'Unleash', 'Game-changer').
        
        The comment should feel like it's part of a high-level executive conversation.
        
        COMMENT:
    `;

    try {
        const genAI = new GoogleGenAI({ apiKey: API_KEY });
        // Using fallback/faster model for comments as per ai-service
        
        const result = await genAI.models.generateContent({
            model: "models/gemini-2.5-flash-preview-09-2025",
            contents: commentPrompt
        });
        const comment = result.text || "";
        
        console.log(`   Result: ✅ PASS (${comment.length} chars)`);
        
        reportContent += `## Test Case 6: Comment Generation
**Input Post:** "Hustle Culture (4AM Club)"
**Tone:** Contrarian
**Status:** ✅ PASS

### Generated Comment:
> ${comment.trim()}

---
`;

    } catch (e) {
        console.error(`   ❌ FAIL: ${e.message}`);
        reportContent += `## Test Case 6: Comment Generation FAILED
**Error:** ${e.message}
---
`;
    }

    // Write final file
    fs.writeFileSync(OUTPUT_FILE, reportContent);
    console.log(`\n✅ Testing Complete. Report saved to ${OUTPUT_FILE}`);
}

runTests();

