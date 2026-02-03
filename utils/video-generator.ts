/**
 * VIDEO GENERATOR - The Cinematic Agent
 * --------------------------------------
 * Transmutes strategies into structured video storyboards.
 */

import { GoogleGenAI } from "@google/genai";
import { AI_CONFIG } from "./config";

const PRIMARY_MODEL = AI_CONFIG.primaryModel;

export interface StoryboardLine {
    scene: number;
    visual: string; // Description for image/video generation
    text: string;   // The caption/overlay text
    duration: number; // in seconds
}

/**
 * GENERATE STORYBOARD
 * Converts a strategy into a cinematic sequence.
 */
export async function generateStoryboard(content: string, apiKey: string): Promise<StoryboardLine[]> {
    const genAI = new GoogleGenAI({ apiKey });
    
    const prompt = `
        You are a Cinematic Director for social media (TikTok/Instagram Reels). 
        Convert the following strategy into a 15-30 second storyboard.
        
        STORYBOARD RULES:
        1. Break into 4-6 scenes.
        2. Visual: Describe a minimalist, high-impact background (Cyberpunk, Noir, or Tech-Futuristic).
        3. Text: Short, punchy hooks (max 10 words per scene).
        4. Duration: 3-5 seconds per scene.
        
        STRATEGY:
        """
        ${content.substring(0, 1000)}
        """
        
        Return ONLY a JSON array of objects with keys: "scene", "visual", "text", "duration".
    `;

    try {
        const response = await genAI.models.generateContent({
            model: PRIMARY_MODEL,
            contents: prompt
        });

        const text = response.text || "[]";
        const jsonText = text.replace(/```json|```/g, "").trim();
        return JSON.parse(jsonText);
    } catch (e) {
        console.error("[VideoGenerator] Storyboard failed", e);
        return [
            { scene: 1, visual: "Static background with glitch effect", text: "STORYBOARD GENERATION FAILED", duration: 5 }
        ];
    }
}
