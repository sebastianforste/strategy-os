
import { PlatformAdapter, ValidationResult } from "./types";

export const TwitterAdapter: PlatformAdapter = {
    id: "twitter",
    name: "X (Twitter)",
    maxLength: 280,

    validate(content: string): ValidationResult {
        // Twitter validation is tricky because of Threads.
        // We validate *per tweet* in a thread ideally, but here we valid the whole block.
        // If content > 280, it MUST be threadable (split by double newlines).
        
        const errors: string[] = [];
        const tweets = content.split("\n\n").filter(t => t.trim().length > 0);
        
        tweets.forEach((tweet, index) => {
            if (tweet.length > 280) {
                errors.push(`Tweet #${index + 1} exceeds 280 chars (${tweet.length}).`);
            }
        });

        return { isValid: errors.length === 0, errors, warnings: [] };
    },

    differentiate(content: string): string {
        // Twitter needs to be threaded.
        // We ensure it looks like a thread.
        // We also strip bold/italic markdown because Twitter doesn't support them natively 
        // (unless using unicode hacks, which we avoid for generic accessibility).
        
        const processed = content
            .replace(/\*\*(.*?)\*\*/g, "$1") // Remove bold
            .replace(/\*(.*?)\*/g, "$1")     // Remove italic
            .replace(/__(.*?)__/g, "$1")     // Remove underline
            .replace(/_(.*?)_/g, "$1");      // Remove italic

        // Add thread counters if multiple paragraphs
        const tweets = processed.split("\n\n").filter(t => t.trim().length > 0);
        if (tweets.length > 1) {
             return tweets.map((t, i) => `${i + 1}/${tweets.length} ${t}`).join("\n\n");
        }
        
        return processed;
    },

    getAIInstructions(): string {
        return `
        PLATFORM: TWITTER / X
        - Generate a THREAD.
        - Each paragraph MUST be under 280 characters.
        - Punchy, short, aggressive.
        - No hashtags necessary.
        - Use "👇" to indicate threading.
        `;
    }
};
