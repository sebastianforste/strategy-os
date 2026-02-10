/**
 * TRANSLATION SERVICE
 * -------------------
 * Handles multi-language support and cultural adaptation.
 * Uses Gemini Pro for high-fidelity localization (transcreation).
 */

import { GoogleGenAI } from "@google/genai";
import { AI_CONFIG } from "./config";

export type SupportedLanguage = 'en' | 'es' | 'fr' | 'de' | 'pt' | 'zh' | 'ja';

export interface TranslationOptions {
    targetLang: SupportedLanguage;
    adaptTone?: boolean;
    culturalContext?: string;
}

/**
 * TRANSLATE STRATEGY
 * Performs a "transcreation" - a creative translation that preserves intent and tone.
 */
export async function translateStrategy(
    text: string, 
    options: TranslationOptions,
    apiKey: string
) {
    const genAI = new GoogleGenAI({ apiKey });
    const model = genAI.models.get(AI_CONFIG.primaryModel);

    const prompt = `
        You are a world-class translation and cultural adaptation expert.
        
        TASK: Translate the following social media post into ${options.targetLang}.
        
        RULES:
        1. Maintain the "Bro-etry" style (short sentences, double spacing).
        2. Adapt metaphors to fit the target culture ${options.culturalContext ? `(Context: ${options.culturalContext})` : ''}.
        3. Do NOT use overly formal language. Keep it high-status but accessible.
        4. If it's for LinkedIn, ensure the "hook" remains powerful in the target language.
        
        SOURCE TEXT:
        ${text}
    `;

    try {
        const result = await model.generateContent(prompt);
        return result.response.text();
    } catch (e) {
        console.error("[TranslationService] Translation failed:", e);
        return text; // Return original as fallback
    }
}
