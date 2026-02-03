/**
 * ADVERSARIAL SERVICE - War Room Engine
 * --------------------------------------
 * Simulates high-status rebuttals and audits content for strategic weaknesses.
 */

import { GoogleGenAI } from "@google/genai";
import { AI_CONFIG } from "./config";

const PRIMARY_MODEL = AI_CONFIG.primaryModel;

export interface Rebuttal {
    personaName: string;
    description: string;
    argument: string;
    weaknessIdentified: string;
    vulnerabilityScore: number; // 1-100
}

export interface AntiFragilityReport {
    originalContent: string;
    rebuttals: Rebuttal[];
    suggestedFixes: string[];
    resilienceScore: number;
}

/**
 * SIMULATE REBUTTALS
 * Generates 2-3 high-status adversarial responses to a post.
 */
export async function simulateAdversaries(content: string, apiKey: string): Promise<Rebuttal[]> {
    const genAI = new GoogleGenAI({ apiKey });
    
    const prompt = `
        You are a Strategic Adversary. Your goal is to find the logical flaws, hidden assumptions, or strategic weaknesses in the following post.
        
        POST CONTENT:
        """
        ${content}
        """
        
        Generate 3 distinct adversarial rebuttals from the following personas:
        1. "The Skeptical VC" (Focuses on unit economics, scalability, and market reality)
        2. "The Industry Incumbent" (Defends the status quo, points out operational complexity)
        3. "The Radical Disruptor" (Claims the idea is too conservative or missing the real shift)
        
        For each, provide:
        - Persona Name
        - Brief Persona Description
        - The technical or strategic Argument against the post
        - The specific Weakness Identified
        - A Vulnerability Score (1-100, where 100 is "fatally flawed")
        
        Return ONLY a JSON array of objects with keys: personaName, description, argument, weaknessIdentified, vulnerabilityScore.
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
        console.error("[AdversarialService] Rebuttal simulation failed:", e);
        return [];
    }
}

/**
 * AUDIT FOR ANTI-FRAGILITY
 * Suggests ways to make the post harder to attack.
 */
export async function auditAntiFragility(content: string, rebuttals: Rebuttal[], apiKey: string): Promise<AntiFragilityReport> {
    const genAI = new GoogleGenAI({ apiKey });
    
    const prompt = `
        Analyze the following content and the rebuttals it received. Provide specific "Anti-Fragility" fixes to make the content more resilient to these attacks.
        
        CONTENT: ${content}
        REBUTTALS: ${JSON.stringify(rebuttals)}
        
        Return a report with:
        1. suggestedFixes: Array of actionable edits.
        2. resilienceScore: A final score from 1-100 of how well the post stands up to scrutiny.
        
        Return ONLY valid JSON with keys: suggestedFixes (array), resilienceScore (number).
    `;

    try {
        const response = await genAI.models.generateContent({
            model: PRIMARY_MODEL,
            contents: prompt
        });

        const text = response.text || "{}";
        const jsonText = text.replace(/```json|```/g, "").trim();
        const data = JSON.parse(jsonText);
        
        return {
            originalContent: content,
            rebuttals,
            suggestedFixes: data.suggestedFixes || [],
            resilienceScore: data.resilienceScore || 50
        };
    } catch (e) {
        console.error("[AdversarialService] Anti-fragility audit failed:", e);
        return {
            originalContent: content,
            rebuttals,
            suggestedFixes: [],
            resilienceScore: 0
        };
    }
}
