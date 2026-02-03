import { WebSocketServer, WebSocket } from "ws";
import dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env.local" });

const PORT = 8080;
const GEMINI_API_KEY = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_API_KEY;

if (!GEMINI_API_KEY) {
  console.error("❌ GOOGLE_GENERATIVE_AI_API_KEY is missing in .env.local");
  process.exit(1);
}

const wss = new WebSocketServer({ port: PORT });

console.log(`🎙️ StrategyOS Voice Relay running on ws://localhost:${PORT}`);

wss.on("connection", (clientWs) => {
  console.log("Client connected");

  // Connect to Gemini Multimodal Live API
  // Using the v1alpha BidiGenerateContent endpoint
  // Model: gemini-2.0-flash-exp (or gemini-1.5-pro-latest depending on availability)
  // Note: "gemini-2.5-flash-native-audio-latest" is the current recommendation for Live
  const MODEL = "gemini-2.5-flash-native-audio-latest"; 
  const HOST = "generativelanguage.googleapis.com";
  const PATH = `/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent?key=${GEMINI_API_KEY}`;
  
  const geminiWs = new WebSocket(`wss://${HOST}${PATH}`);

  geminiWs.on("open", () => {
    console.log("Connected to Gemini Live API");
    // We wait for the client to send the first message which should be the setup or the first audio chunk
  });

  geminiWs.on("message", (data) => {
    // Relay message from Gemini -> Client
    if (clientWs.readyState === WebSocket.OPEN) {
      clientWs.send(data);
    }
  });

  geminiWs.on("close", () => {
    console.log("Gemini connection closed");
    clientWs.close();
  });

  geminiWs.on("error", (error) => {
    console.error("Gemini WebSocket error:", error);
    clientWs.close();
  });

  // Relay messages from Client -> Gemini
  clientWs.on("message", (data) => {
    const message = JSON.parse(data.toString());
    
    // If client sends setup, we ensure it has the right model and robust instructions
    if (message.setup) {
        message.setup.model = `models/${MODEL}`;
        
        // Inject / Enhance system instructions to handle "STRATEGIC PULSE" requests
        const existingInstruction = message.setup.generationConfig?.systemInstruction?.parts?.[0]?.text || "";
        const enhancedInstruction = `${existingInstruction}
        
        CRITICAL OPERATING RULE:
        When the user asks for a "STRATEGIC PULSE", you must immediately shift from 'Listening' mode to 'Synthesis' mode. 
        Provide a bulleted list of the top 3-5 strategic insights, decisions, or pivots. 
        Start your response with the prefix "STRATEGIC PULSE:" so the UI can route it to the insights panel. 
        Be cold, objective, and focus on leverage.
        `;
        
        if (message.setup.generationConfig) {
            message.setup.generationConfig.systemInstruction = {
                parts: [{ text: enhancedInstruction }]
            };
        }
    }

    if (geminiWs.readyState === WebSocket.OPEN) {
      geminiWs.send(JSON.stringify(message));
    }
  });

  clientWs.on("close", () => {
    console.log("Client disconnected");
    geminiWs.close();
  });
});
