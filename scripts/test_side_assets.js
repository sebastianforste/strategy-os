
const { GoogleGenAI } = require("@google/genai");
require("dotenv").config({ path: ".env.local" });

async function testSideAssets() {
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
        console.error("No API key found in .env.local");
        return;
    }

    const genAI = new GoogleGenAI({ apiKey });
    const textPost = "The future of strategy is not about better plans, but about faster decision cycles. Operational velocity is the only moat left.";
    
    const prompt = `
    Based on this LinkedIn post text, generate:
    1. A "Visualize Value" Image Prompt.
    2. A 60s Video Script.

    POST TEXT:
    "${textPost}"

    Ensure the response is valid JSON.
    `;

    console.log("Testing Side Asset Generation...");
    try {
        const result = await genAI.models.generateContent({
            model: "models/gemini-2.5-flash-native-audio-latest",
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });
        
        console.log("RAW RESPONSE:", JSON.stringify(result, null, 2));
        console.log("TEXT CONTENT:", result.text);
        
        if (result.text) {
            const parsed = JSON.parse(result.text);
            console.log("PARSED SUCCESS:", parsed);
        }
    } catch (e) {
        console.error("TEST FAILED:", e);
    }
}

testSideAssets();
