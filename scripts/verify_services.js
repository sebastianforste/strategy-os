
const { GoogleGenAI } = require("@google/genai");
const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY; 

async function verifyService(name, prompt) {
    console.log(`\n🧪 Verifying Service: ${name}...`);
    try {
        const genAI = new GoogleGenAI({ apiKey: API_KEY });
        const result = await genAI.models.generateContent({
            model: "models/gemini-flash-latest",
            contents: prompt
        });
        const text = result.text || "";
        console.log(`✅ Success! Length: ${text.length}`);
    } catch (e) {
        console.error(`❌ Failed: ${e.message}`);
    }
}

async function run() {
    // Mimicking Suggestion Service
    await verifyService("Suggestion Service (Mock)", "Suggest 3 LinkedIn topics about AI.");
    
    // Mimicking Trend Service
    await verifyService("Trend Service (Mock)", "Analyze the trend of 'DeepSeek' in strategy.");
    
    // Mimicking Explainer Service
    await verifyService("Explainer Service (Mock)", "Explain why this works: 'Don't sell features, sell benefits.'");

    // Mimicking Remix Service
    await verifyService("Remix Service (Mock)", "Remix this: 'AI is the future.'");
}

run();
