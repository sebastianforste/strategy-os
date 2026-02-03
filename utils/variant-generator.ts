/**
 * VARIANT GENERATOR - High-Volume Scale
 * --------------------------------------
 * Pivots a single strategy into multiple emotional/tactical angles.
 * Based on the "100x Volume" principle.
 */

import { GoogleGenAI } from "@google/genai";
import { AI_CONFIG } from "./config";

const PRIMARY_MODEL = AI_CONFIG.primaryModel;

export type StrategyAngle = 'contrarian' | 'educational' | 'story' | 'checklist' | 'aggressive' | 'philosophical';

export interface StrategyVariant {
    angle: StrategyAngle;
    hook: string;
    content: string;
    platform: string;
}

/**
 * GENERATE VARIANTS
 * Takes a core strategy and creates N variations with different angles.
 */
export async function generateStrategyVariants(
    coreStrategy: string, 
    angles: StrategyAngle[], 
    apiKey: string,
    platform: string = 'linkedin'
): Promise<StrategyVariant[]> {
    const genAI = new GoogleGenAI({ apiKey });
    
    const prompt = `
        You are a World-Class Content Strategist. Take the following CORE STRATEGY and rewrite it into ${angles.length} distinct variants.
        Each variant must focus on a DIFFERENT angle: ${angles.join(", ")}.
        
        CORE STRATEGY:
        """
        ${coreStrategy}
        """
        
        PLATFORM: ${platform}
        
        RULES:
        - Do not just rephrase. Change the PERSPECTIVE and the HOOK.
        - 'contrarian': Attack a common industry belief.
        - 'educational': Step-by-step 'how-to'.
        - 'story': Use a narrative arc (Conflict -> Pivot -> Resolution).
        - 'checklist': Bullet points for easy consumption.
        - 'aggressive': High-stakes, punchy, and urgent.
        - 'philosophical': Focus on first principles and long-term thinking.
        
        Return ONLY valid JSON array matching the StrategyVariant interface.
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
        console.error("[VariantGenerator] Generation failed:", e);
        return [];
    }
}
