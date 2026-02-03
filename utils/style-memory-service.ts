
import { generateText } from "ai";
import { google } from "@ai-sdk/google";

export interface StyleDelta {
    vocabulary: string[];
    tone: string;
    structuralRules: string[];
}

export class StyleMemoryService {
    private apiKey: string;
    private STORAGE_KEY = "strategy_os_style_memory";

    constructor(apiKey: string) {
        this.apiKey = apiKey;
    }

    private getModel() {
        return google("gemini-1.5-flash");
    }

    async calculateStyleDelta(original: string, edited: string): Promise<StyleDelta> {
        const prompt = `
        Compare the ORIGINAL generated content with the USER'S EDITED version.
        Identify the stylistic preferences the user is expressing through their edits.
        
        ORIGINAL:
        "${original}"
        
        EDITED:
        "${edited}"
        
        TASK:
        1. Extract "Vocabulary Shifts": Specific words the user seems to prefer or avoid.
        2. Identify "Tone Adjustments": How did the vibe change? (e.g., "more aggressive", "shorter sentences").
        3. Identify "Structural Rules": Did the user change the layout or formatting consistently?
        
        OUTPUT JSON ONLY:
        {
            "vocabulary": ["string"],
            "tone": "string",
            "structuralRules": ["string"]
        }
        `;

        try {
            const { text } = await generateText({
                model: this.getModel(),
                prompt,
                temperature: 0,
            });

            const jsonStr = text.replace(/```json\n?|\n?```/g, "").trim();
            return JSON.parse(jsonStr);
        } catch (error) {
            console.error("Failed to calculate style delta:", error);
            return { vocabulary: [], tone: "", structuralRules: [] };
        }
    }

    saveDelta(personaId: string, delta: StyleDelta) {
        const memory = this.getAllMemories();
        const existing = memory[personaId] || { vocabulary: [], tone: "", structuralRules: [] };

        // Merging logic
        existing.vocabulary = Array.from(new Set([...existing.vocabulary, ...delta.vocabulary])).slice(-20);
        
        if (delta.tone) {
            existing.tone = delta.tone + (existing.tone ? " | Previously: " + existing.tone : "");
            existing.tone = existing.tone.split(" | ").slice(0, 3).join(" | ");
        }

        existing.structuralRules = Array.from(new Set([...existing.structuralRules, ...delta.structuralRules])).slice(-10);

        memory[personaId] = existing;
        if (typeof window !== "undefined") {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(memory));
        }
    }

    getPersonaInstructions(personaId: string): string {
        const memory = this.getAllMemories()[personaId];
        if (!memory) return "";

        return `
        ### USER STYLE PREFERENCES (ADAPT TO THESE):
        - TONE SHIFTS: ${memory.tone}
        - RECURRING VOCABULARY: ${memory.vocabulary.join(", ")}
        - STRUCTURAL PREFERENCES: ${memory.structuralRules.join("; ")}
        
        Integrate these preferences into your persona logic without breaking the core character.
        `;
    }

    private getAllMemories(): Record<string, StyleDelta> {
        if (typeof window === "undefined") return {};
        try {
            const stored = localStorage.getItem(this.STORAGE_KEY);
            return stored ? JSON.parse(stored) : {};
        } catch (e) {
            return {};
        }
    }
}
