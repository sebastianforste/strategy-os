
const { GoogleGenerativeAI } = require("@google/generative-ai");
const API_KEY = "AIzaSyCjdqsYkIJEcQEi9LRV4H0v_GwXtjUeNSg"; 

async function verifyService(name, prompt) {
    console.log(`\n🧪 Verifying Service: ${name}...`);
    try {
        const genAI = new GoogleGenerativeAI(API_KEY);
        // Using "gemini-flash-latest" as updated in the codebase
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
        
        const result = await model.generateContent(prompt);
        console.log(`✅ Success! Length: ${result.response.text().length}`);
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
