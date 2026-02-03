/**
 * AUDIO GENERATOR - Deep Dive Engine
 * -----------------------------------
 * Converts text strategies into "deep dive" podcast scripts.
 * Mimics the "NotebookLM" style of two hosts discussing a topic.
 */

import { GoogleGenAI } from "@google/genai";
import { AI_CONFIG } from "./config";

const PRIMARY_MODEL = AI_CONFIG.primaryModel;

export interface DialogueLine {
    speaker: 'Host' | 'Expert';
    text: string;
    emotion: 'excited' | 'skeptical' | 'thoughtful' | 'laughing';
}

export interface PodcastScript {
    title: string;
    duration: string; // e.g. "2 min"
    lines: DialogueLine[];
}

/**
 * GENERATE PODCAST SCRIPT
 * Transmutes a strategy into a conversational 2-way dialogue.
 */
export async function generatePodcastScript(strategyContent: string, apiKey: string): Promise<PodcastScript> {
    const genAI = new GoogleGenAI({ apiKey });
    
    const prompt = `
        You are a Top-Tier Podcast Producer. Convert the following STRATEGY POST into a "Deep Dive" podcast script between two hosts.
        
        HOST 1 ("The Host"): Enthusiastic, curious, frames the topic for the audience.
        HOST 2 ("The Expert"): Analytical, slightly skeptical but deep, provides the "aha" moments.
        
        STRATEGY TO DISCUSS:
        """
        ${strategyContent.substring(0, 2000)}
        """
        
        GUIDELINES:
        - Start with a strong hook from the Host.
        - Have them "debate" the core idea slightly.
        - Keep it punchy (approx 2 minutes reading time).
        - Use natural language (ums, "right?", "totally").
        
        Return ONLY a JSON object matching the PodcastScript interface.
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
        console.error("[AudioGenerator] Generation failed:", e);
        return {
            title: "Audio Generation Failed",
            duration: "0 min",
            lines: [
                { speaker: 'Host', text: "We're having some technical trouble with the script engine.", emotion: 'thoughtful' },
                { speaker: 'Expert', text: "Yeah, looks like the AI took a coffee break.", emotion: 'skeptical' }
            ]
        };
    }
}
