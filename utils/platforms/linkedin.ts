
import { PlatformAdapter, ValidationResult } from "./types";

export const LinkedInAdapter: PlatformAdapter = {
    id: "linkedin",
    name: "LinkedIn",
    maxLength: 3000,

    validate(content: string): ValidationResult {
        const errors: string[] = [];
        const warnings: string[] = [];

        if (content.length > 3000) {
            errors.push(`Content exceeds 3000 characters (Current: ${content.length})`);
        }
        
        // Soft check for hashtag overuse
        const hashtagCount = (content.match(/#/g) || []).length;
        if (hashtagCount > 5) {
            warnings.push("More than 5 hashtags is usually detrimental on LinkedIn.");
        }

        return { isValid: errors.length === 0, errors, warnings };
    },

    differentiate(content: string): string {
        // LinkedIn handles most unicode/formatting well.
        // Ensure double line breaks are preserved (Strategy OS style)
        return content.replace(/\n(?!\n)/g, '\n\n'); 
    },

    getAIInstructions(): string {
        return `
        PLATFORM: LINKEDIN
        - Use "Bro-etry" formatting (double spacing).
        - No emojis allowed.
        - Focus on "Business Impact" and "Leadership".
        - Length: medium-long (200-500 words).
        `;
    }
};
