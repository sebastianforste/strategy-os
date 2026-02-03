/**
 * TONE EXTRACTOR - Stylistic Profiling
 * --------------------------------------
 * Analyzes historical successes to distill a unique "Tone-of-Voice".
 */

import { GoogleGenAI } from "@google/genai";
import { AI_CONFIG } from "./config";

const PRIMARY_MODEL = AI_CONFIG.primaryModel;

export interface ToneProfile {
    vocabulary: string[]; // Key technical or stylistic words
    syntax: string;     // Pacing: aggressive, academic, punchy, etc.
    formatting: string; // Usage of line breaks, bolding, emojis
    hookStyle: string;  // Pattern of the opening line
    ctaStyle: string;   // How requests are framed
}

/**
 * EXTRACT TONE PROFILE
 * Analyzes multiple pieces of content to find recurring stylistic signatures.
 */
export async function extractToneProfile(contents: string[], apiKey: string): Promise<ToneProfile> {
    const genAI = new GoogleGenAI({ apiKey });
    
    const combinedContent = contents.join("\n\n---\n\n");
    const prompt = `
        Analyze the following successful social media posts and extract a detailed "Tone of Voice" profile. 
        Focus on the stylistic "DNA" that makes this writing distinctive.
        
        SAMPLES:
        """
        ${combinedContent}
        """
        
        Provide:
        - vocabulary: A list of 5-10 specific words or phrases frequently used.
        - syntax: A description of Sentence structure and pacing (e.g. "Short, aggressive staccato", "Long philosophical build-ups").
        - formatting: Patterns in white space, emojis, or typography.
        - hookStyle: How the first 5 words are structured to grab attention.
        - ctaStyle: How the posts end (Call to Action).
        
        Return ONLY valid JSON with keys matching the ToneProfile interface.
    `;

    try {
        const response = await genAI.models.generateContent({
            model: PRIMARY_MODEL,
            contents: prompt
        });

        const text = response.text || "{}";
        const jsonText = text.replace(/```json|```/g, "").trim();
        return JSON.parse(jsonText);
    } catch (e) {
        console.error("[ToneExtractor] Failed to extract tone:", e);
        return {
            vocabulary: [],
            syntax: "Neutral",
            formatting: "Standard",
            hookStyle: "Direct",
            ctaStyle: "Conversational"
        };
    }
}
