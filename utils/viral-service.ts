
import { generateText } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { AI_CONFIG } from "./config";
import { TrendOpportunity } from "./trend-surfer";

export interface ViralHook {
    original: string;
    optimized: string;
    framework: string; // e.g., "Negativity Bias", "Curiosity Gap"
    score: number; // 0-100 prediction
    explanation: string;
}

export interface ReplyStrategy {
    angle: 'contrarian' | 'supportive' | 'question';
    content: string;
    reasoning: string;
}

export interface ViralScore {
    score: number;
    triggers: {
        name: string;
        detected: boolean;
        suggestion?: string;
    }[];
    feedback: string;
}

export class ViralService {
    private google: any;

    constructor(apiKey: string) {
        this.google = createGoogleGenerativeAI({ apiKey });
    }

    private getModel() {
        return this.google(AI_CONFIG.primaryModel);
    }

    async optimizeHook(currentHook: string, context?: string): Promise<ViralHook[]> {
        const prompt = `
        You are a Viral Content Engineer (MrBeast / Jake Thomas style).
        
        TASK: Optimize this hook for maximum click-through rate (CTR).
        CURRENT HOOK: "${currentHook}"
        CONTEXT: ${context || "LinkedIn business content"}
        
        Generate 3 variations using these frameworks:
        1. Negativity Bias ("Why X is killing your Y")
        2. Specificity/Proof ("How I did X in Y days")
        3. Curiosity Gap ("The one thing nobody tells you about X")
        
        OUTPUT JSON ONLY:
        [
            {
                "original": "${currentHook}",
                "optimized": "String",
                "framework": "String",
                "score": Number (0-100 prediction),
                "explanation": "Why this works better"
            }
        ]
        `;

        try {
            const { text } = await generateText({
                model: this.getModel(),
                prompt,
                temperature: 0.8,
            });
            return JSON.parse(text.replace(/```json\n?|\n?```/g, "").trim());
        } catch (error) {
            console.error("Hook optimization failed:", error);
            return [];
        }
    }

    async generateReplyStrategy(postContent: string, authorName: string): Promise<ReplyStrategy[]> {
        const prompt = `
        You are a master of "Reply Guy" strategy.
        
        TASK: Generate 3 high-value replies to this post.
        AUTHOR: ${authorName}
        POST: "${postContent}"
        
        ANGLES:
        1. CONTRARIAN: Respectfully disagree or offer a counter-point (starts debate).
        2. SUPPORTIVE: Amplify the core point with a specific addition (builds relationship).
        3. QUESTION: Ask a deeply insightful question that forces a response (boosts comments).
        
        OUTPUT JSON ONLY:
        [
            {
                "angle": "contrarian" | "supportive" | "question",
                "content": "String (the actual comment)",
                "reasoning": "String"
            }
        ]
        `;

        try {
            const { text } = await generateText({
                model: this.getModel(),
                prompt,
                temperature: 0.7,
            });
            return JSON.parse(text.replace(/```json\n?|\n?```/g, "").trim());
        } catch (error) {
            console.error("Reply generation failed:", error);
            return [];
        }
    }

    async calculateViralScore(content: string): Promise<ViralScore> {
        const prompt = `
        Analyze this post for Viral Potential (0-100).
        
        POST: "${content}"
        
        CHECKLIST:
        1. Is the first line under 12 words?
        2. Is there a "Pattern Interrupt"?
        3. Is the readability approx Grade 5 level?
        4. Is there a clear "Payoff" or "Aha Moment"?
        5. formatting: ample white space?
        
        OUTPUT JSON ONLY:
        {
            "score": Number,
            "triggers": [
                { "name": "Short Hook", "detected": boolean, "suggestion": "String" },
                { "name": "Pattern Interrupt", "detected": boolean, "suggestion": "String" },
                { "name": "Readability", "detected": boolean, "suggestion": "String" },
                { "name": "Payoff", "detected": boolean, "suggestion": "String" }
            ],
            "feedback": "One sentence summary of how to improve."
        }
        `;

        try {
            // Using a lighter model for scoring if possible, but primary is fine
            const { text } = await generateText({
                model: this.getModel(),
                prompt,
                temperature: 0.5,
            });
            return JSON.parse(text.replace(/```json\n?|\n?```/g, "").trim());
        } catch (error) {
            console.error("Scoring failed:", error);
            return { score: 0, triggers: [], feedback: "Error calculating score" };
        }
    }

    async newsjackMatch(trends: TrendOpportunity[], niche: string): Promise<TrendOpportunity[]> {
        // Simple client-side filtering or AI matching if needed. 
        // For now, let's just return the top trends that might match the niche keywords.
        // In a real implementation, this would use semantic similarity.
        const keywords = niche.toLowerCase().split(' ');
        return trends.filter(t => 
            keywords.some(k => t.topic.toLowerCase().includes(k) || t.context.toLowerCase().includes(k))
        ).slice(0, 3);
    }
}
