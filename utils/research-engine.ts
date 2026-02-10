
import { GoogleGenAI } from "@google/genai";
import { AI_CONFIG } from "./config";

const PRIMARY_MODEL = AI_CONFIG.primaryModel;

export interface Citation {
    url: string;
    title?: string;
    snippet?: string;
}

export interface VerificationResult {
    segment: string;
    verdict: "True" | "False" | "Unverified";
    confidence: number;
    citation?: Citation;
    correction?: string;
}

export async function verifyClaims(content: string, apiKey: string): Promise<VerificationResult[]> {
    const genAI = new GoogleGenAI({ apiKey });
    
    // We break content into checkable claims first? 
    // Or we ask the model to process the whole text and identify claims + verify them in one go with grounding?
    // Grounding is best for "Search for X", but for "Verify this text", we can use the prompt to guide it.

    const prompt = `
    You are a Fact-Checking Engine.
    Analyze the following text. Identify specific factual claims.
    For each claim, verify its accuracy using Google Search.

    TEXT:
    "${content}"

    OUTPUT:
    Return a valid JSON array of objects with strict structure:
    [
      {
        "segment": "The exact substring from the text that corresponds to the claim",
        "verdict": "True", "False", or "Unverified",
        "confidence": 0-100,
        "citation": { "url": "https://source...", "title": "Page Title", "snippet": "Evidence..." },
        "correction": "Correction if false, otherwise null"
      }
    ]
    
    If no factual claims are found or text is subjective, return an empty array.
    `;

    try {
        const result = await genAI.models.generateContent({
            model: PRIMARY_MODEL,
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }],
                responseMimeType: "application/json"
            }
        });

        // With responseMimeType json, we might get clean json directly
        // But the schema isn't enforced unless we use responseSchema (future).
        // For now, parse text.
        
        const text = result.text || "[]";
        
        // Return parsed JSON
        return JSON.parse(text);
    } catch (e) {
        console.error("Verification failed", e);
        return [];
    }
}
