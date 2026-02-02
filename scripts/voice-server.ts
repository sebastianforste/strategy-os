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
  // Note: "gemini-2.0-flash-exp" is the current recommendation for Live
  const MODEL = "gemini-2.0-flash-exp"; 
  const HOST = "generativelanguage.googleapis.com";
  const PATH = `/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent?key=${GEMINI_API_KEY}`;
  
  const geminiWs = new WebSocket(`wss://${HOST}${PATH}`);

  geminiWs.on("open", () => {
    console.log("Connected to Gemini Live API");
    
    // Send initial setup message to Gemini
    // We configure it for AUDIO input and AUDIO output
    const setupMessage = {
      setup: {
        model: `models/${MODEL}`,
        generationConfig: {
          responseModalities: ["AUDIO"], 
          speechConfig: {
             voiceConfig: { prebuiltVoiceConfig: { voiceName: "Puck" } } // "Puck", "Charon", "Kore", "Fenrir", "Aoede"
          }
        }
      }
    };
    
    geminiWs.send(JSON.stringify(setupMessage));
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
    if (geminiWs.readyState === WebSocket.OPEN) {
      geminiWs.send(data);
    }
  });

  clientWs.on("close", () => {
    console.log("Client disconnected");
    geminiWs.close();
  });
});
