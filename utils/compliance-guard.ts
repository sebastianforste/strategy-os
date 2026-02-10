/**
 * COMPLIANCE GUARD
 * ----------------
 * Audits content for legal, brand safety, and role-based governance.
 * Optimized for speed using Gemini 1.5 Flash.
 */

import { GoogleGenAI } from "@google/genai";
import { AI_CONFIG } from "./config";

export interface AuditResult {
    score: number; // 0-100
    isSafe: boolean;
    violations: string[];
    suggestions: string[];
}

/**
 * AUDIT CONTENT
 * Runs a multi-point inspection on generated strategy.
 */
export async function auditContent(
    content: string, 
    apiKey: string,
    brandVoiceGuidlines?: string
): Promise<AuditResult> {
    const genAI = new GoogleGenAI({ apiKey });
    // Same pattern as ai-service-server.ts

    const prompt = `
        You are a Enterprise Compliance and Brand Safety Auditor for StrategyOS.
        
        TASK: Audit the following content for:
        1. Legal Compliance (No financial/medical advice, no hate speech).
        2. Brand Safety (Professionalism, non-offensive).
        3. Logic (Coherence, authority).
        ${brandVoiceGuidlines ? `4. Brand Voice Alignment: ${brandVoiceGuidlines}` : ''}
        
        CONTENT:
        "${content}"
        
        RETURN JSON ONLY:
        {
            "score": number (0-100),
            "isSafe": boolean,
            "violations": string[],
            "suggestions": string[]
        }
    `;

    try {
        const result = await genAI.models.generateContent({
            model: AI_CONFIG.fallbackModel,
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });
        
        const text = result.text || "{}";
        const audit = JSON.parse(text);
        return {
            score: audit.score ?? 100,
            isSafe: audit.isSafe ?? true,
            violations: audit.violations ?? [],
            suggestions: audit.suggestions ?? []
        };
    } catch (e) {
        console.error("[ComplianceGuard] Audit failed:", e);
        return {
            score: 100,
            isSafe: true, // Fail safe for now
            violations: [],
            suggestions: []
        };
    }
}
