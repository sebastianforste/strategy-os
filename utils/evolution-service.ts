/**
 * EVOLUTION SERVICE - Project Darwin
 * -----------------------------------
 * Analyzes high-performing strategies and "mutates" personas to optimize for engagement.
 */

import { GoogleGenAI } from "@google/genai";
import { ArchivedStrategy } from "./archive-service";
import { Persona } from "./personas";
import { AI_CONFIG } from "./config";

const PRIMARY_MODEL = AI_CONFIG.primaryModel;

export interface EvolutionReport {
    id: string;
    personaId: string;
    originalPrompt: string;
    mutatedPrompt: string;
    improvements: string[];
    analysis: string;
    timestamp: string;
}

/**
 * ANALYZE AND EVOLVE
 * Takes a persona and a set of high-performing strategies to generate a "Mutated" (evolved) prompt.
 */
export async function evolvePersona(
    persona: Persona,
    topStrategies: ArchivedStrategy[],
    apiKey: string
): Promise<EvolutionReport> {
    const genAI = new GoogleGenAI({ apiKey });
    
    // 1. Prepare the DNA (Content + Performance)
    const dnaSnapshot = topStrategies.map(s => ({
        content: s.content,
        metrics: s.performance,
        topic: s.topic
    }));

    const prompt = `
        SYSTEM ROLE: Stylistic Auditor & Prompt Engineer
        
        OBJECTIVE: Analyze the provided "Winning Content" (high engagement) and evolve the "Base Persona Instructions" to better replicate this success.
        
        BASE PERSONA:
        Name: ${persona.name}
        Current Description: ${persona.description}
        Current Instructions: ${persona.basePrompt || 'None'}
        
        WINNING CONTENT SNAPSHOT:
        ${JSON.stringify(dnaSnapshot, null, 2)}
        
        TASK:
        1. Identify stylistic patterns in the winning content (Hook structure, Sentence length, Tone, CTA style).
        2. "Mutate" the Base Persona Instructions to incorporate these traits. 
        3. Maintain the core identity but optimize for the algorithm that rewarded this content.
        
        OUTPUT FORMAT (JSON ONLY):
        {
            "analysis": "Detailed breakdown of what made the content win",
            "improvements": ["trait 1", "trait 2", "..."],
            "mutatedPrompt": "The full, ready-to-use NEW Base Persona Instructions"
        }
    `;

    try {
        const response = await genAI.models.generateContent({
            model: PRIMARY_MODEL,
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });

        const result = JSON.parse(response.text || "{}");
        
        return {
            id: `evo-${Date.now()}`,
            personaId: (persona as any).id || persona.name.toLowerCase().replace(/\s+/g, '-'),
            originalPrompt: persona.basePrompt || "",
            mutatedPrompt: result.mutatedPrompt || persona.basePrompt || "",
            improvements: result.improvements || [],
            analysis: result.analysis || "Evolution completed based on performance data.",
            timestamp: new Date().toISOString()
        };
    } catch (e) {
        console.error("[ProjectDarwin] Evolution failed:", e);
        throw new Error("Persona evolution failed: Unable to audit stylistic patterns.");
    }
}

/**
 * PERSIST EVOLUTION
 * Saves the mutated prompt to the persona store.
 */
export async function savePersonaEvolution(report: EvolutionReport) {
    const { updatePersonaPrompt } = await import("./persona-store");
    const { saveEvolutionReport } = await import("./archive-service");

    console.log(`[ProjectDarwin] Persisting evolution for ${report.personaId}...`);
    
    // 1. Update the persona prompt in IDB
    await updatePersonaPrompt(report.personaId, report.mutatedPrompt);

    // 2. Save the report to archive history
    await saveEvolutionReport(report);
}
