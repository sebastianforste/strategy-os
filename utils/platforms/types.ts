
import { GeneratedAssets } from "../../utils/ai-service";

export interface ValidationResult {
    isValid: boolean;
    errors: string[];
    warnings: string[];
}

export interface PlatformAdapter {
    id: "linkedin" | "twitter";
    name: string;
    maxLength: number;
    
    /**
     * validates the content against platform rules
     */
    validate(content: string): ValidationResult;

    /**
     * Optimizes the content for the platform (formatting, etc)
     */
    differentiate(content: string): string;
    
    /**
     * Instructions for the AI to generate content for this platform
     */
    getAIInstructions(): string;
}
