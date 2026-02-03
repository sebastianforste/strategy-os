import { GoogleGenAI } from "@google/genai";
import * as dotenv from "dotenv";

dotenv.config({ path: "/Users/sebastian/Developer/strategy-os/.env.local" });

const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY || "";
const genAI = new GoogleGenAI({ apiKey: API_KEY });

async function listModels() {
  try {
    const response = await genAI.models.list();
    console.log("AVAILABLE MODELS:");
    // The SDK returns a Pager that is directly iterable
    for await (const m of response) {
      console.log(`- ${m.name} (${m.supportedActions?.join(", ")})`);
    }
  } catch (e) {
    console.error("Error listing models:", e);
  }
}

listModels();
