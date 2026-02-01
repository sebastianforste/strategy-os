import { GoogleGenAI } from "@google/genai";

const key = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY || "";

async function list() {
  console.log("Checking models for key ending in:", key.slice(-4));
  try {
      // Use fetch directly to avoid SDK abstraction hiding raw list
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
      const data = await res.json();
      
      if (data.models) {
          console.log("AVAILABLE MODELS:");
          interface ModelInfo {
            name: string;
            supportedGenerationMethods: string[];
          }
          data.models.forEach((m: ModelInfo) => {
             console.log(`- ${m.name}`);
             console.log(`  Methods: ${m.supportedGenerationMethods}`);
          });
      } else {
          console.error("No models found:", data);
      }

  } catch {
      console.error("Error: Fetching models failed.");
  }
}

list();
