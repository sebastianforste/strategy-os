"use server";

/**
 * MEDIA ACTIONS
 * ----------------
 * Dedicated Server Actions for generating media assets (Images, Video Scripts).
 * Separated from main generation logic to prevent circular dependencies.
 */

import type { PersonaId } from "../utils/personas";

export async function generateSideAssetsAction(
    textPost: string,
    apiKeys: { gemini: string },
    personaId: PersonaId
) {
    if (!apiKeys.gemini) throw new Error("API Key missing");
    // Dynamic import to isolate server-only dependencies
    const { generateSideAssetsFromText } = await import("../utils/ai-service-server");
    return await generateSideAssetsFromText(textPost, apiKeys.gemini, personaId);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function generateVideoVisualsAction(storyboard: any[], apiKey: string) {
    if (!apiKey) throw new Error("API Key required");
    const { generateImage } = await import("../utils/image-service");
    
    // Generate in parallel
    const promises = storyboard.map(scene => 
        generateImage(`Cinematic, high-impact background for social video. Mood: ${scene.visual}. Focus: ${scene.text}.`, apiKey)
    );
    return await Promise.all(promises);
}
