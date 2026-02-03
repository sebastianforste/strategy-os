/**
 * VISUAL ENGINE - Automated Design System
 * ----------------------------------------
 * Analyzes strategy content and generates code-based visuals.
 * Support: Mermaid.js (Diagrams), SVG (Stat Cards).
 */

import { GoogleGenAI } from "@google/genai";
import { AI_CONFIG } from "./config";

const PRIMARY_MODEL = AI_CONFIG.primaryModel;

export interface DesignAsset {
    type: 'mermaid' | 'stat-card' | 'quote-card';
    code: string;
    description: string;
}

/**
 * GENERATE VISUAL ASSETS
 * Creates a visual representation of the strategy.
 */
export async function generateVisualAssets(content: string, apiKey: string): Promise<DesignAsset[]> {
    const genAI = new GoogleGenAI({ apiKey });
    
    const prompt = `
        You are a Data Visualization Expert. Analyze the following STRATEGY and create 2 distinct visual assets to represent it.
        
        STRATEGY:
        """
        ${content.substring(0, 1500)}...
        """
        
        ASSET 1: A Mermaid.js DIAGRAM (Flowchart or Graph) that explains the core logic/process.
        ASSET 2: A 'Stat Card' description (JSON) containing the key number/fact to highlight.
        
        Return ONLY valid JSON array with objects:
        {
            "type": "mermaid" | "stat-card",
            "code": "The mermaid code OR the JSON data for the card",
            "description": "Short caption"
        }
        
        Example Mermaid:
        graph TD; A[Start] --> B{Decision};
        
        Example Stat Card JSON (in 'code' field):
        { "label": "Retention Rate", "value": "45%", "detail": "Increase over 30 days" }
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
        console.error("[VisualEngine] Generation failed:", e);
        return [
            {
                type: 'mermaid',
                code: 'graph TD;\nA[Strategy] --> B[Implementation];\nB --> C[Results];',
                description: 'Process Flow'
            }
        ];
    }
}
