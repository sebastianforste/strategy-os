
const topics = [
    "The end of traditional consulting",
    "Why AI won't replace strategy",
    "The fallacy of data-driven decisions",
    "Remote work is killing innovation",
    "Digital transformation failures",
    "Return of the generalist",
    "Bootstrapping vs VC 2026",
    "Death of the pitch deck",
    "Culture eats strategy lie",
    "Chief AI Officer future"
];

async function testTopic(topic, index) {
    console.log(`\n[${index + 1}/10] Testing Topic: "${topic}"...`);
    try {
        const response = await fetch("http://localhost:3000/api/generate", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                input: topic,
                apiKeys: { gemini: "demo" },
                personaId: "cso",
                forceTrends: false,
                platform: "linkedin",
                useRAG: false,
                useFewShot: false
            })
        });

        if (!response.ok) {
            const text = await response.text();
            console.error(`❌ FAILED (Status: ${response.status}): ${text}`);
            return;
        }

        // Read the stream
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let result = "";

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value, { stream: true });
            result += chunk;
        }
        
        console.log(`✅ SUCCESS. Output Length: ${result.length} chars.`);
        console.log(`Preview: ${result.substring(0, 100)}...`);

    } catch (e) {
        console.error(`❌ ERROR: ${e.message}`);
    }
}

async function runTests() {
    console.log("🚀 Starting StrategyOS API Tests (Demo Mode)...\n");
    for (let i = 0; i < topics.length; i++) {
        await testTopic(topics[i], i);
        // Add a small delay
        await new Promise(r => setTimeout(r, 1000));
    }
    console.log("\n🏁 All tests completed.");
}

runTests();
