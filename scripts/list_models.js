
const { GoogleGenerativeAI } = require("@google/generative-ai");

const API_KEY = "AIzaSyCjdqsYkIJEcQEi9LRV4H0v_GwXtjUeNSg"; // Hardcoded for diagnostic

async function list() {
    console.log("Listing models...");
    try {
        const genAI = new GoogleGenerativeAI(API_KEY);
        // We can't list models directly via the helper easily without a model instance, 
        // but we can try to hit the API url manually or use the model manager if available.
        // Actually, the SDK has a 'getGenerativeModel' but not 'listModels' on the main class in some versions.
        // Let's rely on fetch for the management API which is standard.
        
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`);
        const data = await response.json();
        
        if (data.error) {
            console.error("Error:", data.error);
        } else {
            console.log("Available Models:");
            data.models.forEach(m => {
                if (m.name.includes("gemini")) {
                    console.log(`- ${m.name} (Supported: ${m.supportedGenerationMethods})`);
                }
            });
        }

    } catch (e) {
        console.error("Failed:", e);
    }
}

list();
