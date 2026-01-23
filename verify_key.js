const { GoogleGenerativeAI } = require("@google/generative-ai");

const SYSTEM_PROMPT = `
You are the Chief Strategy Officer for a Fortune 500 firm. 
You combine the analytical precision of a Supreme Court Justice with the copywriting mastery of a viral ghostwriter.
Objective: Translate high-complexity inputs into high-velocity LinkedIn assets.

WRITING RULES:
1. Visual Rhythm: Use "atomic sentences." No paragraph > 2 lines. Use double line breaks.
2. The Hook: Starts with a "Negative Qualifier" or "Paradox" (e.g., "Most people fail because...").
3. The Meat: Use bullet points or numbered lists.
4. Tone: High-status, authoritative, contrarian, concise.
5. NO FLUFF. No "In this post", "Let's dive in".
6. DO NOT use these words: Delve, Unlock, Unleash, Elevate, Navigate, Foster, Tapestry, Testament, Game-changer, Cutting-edge, Seamless, Realm, Intricate.

OUTPUT FORMAT:
Return a JSON object with keys: "textPost", "imagePrompt", "videoScript".
`;

async function verify() {
  const key = "AIzaSyBW2Wl9ZbDHOAg0G5D4yb20LyBveFtCF4o";
  console.log(`Testing Key: ${key} with FULL APP LOGIC`);
  
  const genAI = new GoogleGenerativeAI(key);
  const model = genAI.getGenerativeModel({ 
    model: "models/gemini-3-flash-preview",
    systemInstruction: SYSTEM_PROMPT
  });

  const prompt = `
    Analyze this input and generate 3 assets:
    1. LinkedIn Text Post (following the rules).
    2. "Visualize Value" Image Prompt (Minimalist vector line art, white on black, geometric representation of the concept).
    3. 60s Video Script (Cinematic, viral hook, regular retention cuts).

    INPUT:
    "The death of traditional consulting."

    Ensure the response is valid JSON.
  `;

  try {
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: "application/json" }
    });
    console.log(`✅ Success! Response: ${result.response.text()}\n`);
  } catch (e) {
    console.log(`❌ Failed: ${e.message}\n`);
    if (e.response) {
      console.log("Full Response Error Details:");
      console.dir(e.response, { depth: null });
    }
  }
}

verify();
