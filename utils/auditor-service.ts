
import { generateText } from "ai";
import { google } from "@ai-sdk/google";

export interface AdversarialReview {
    persona: 'skeptic' | 'competitor' | 'bored';
    feedback: string;
    score: number; // 0-10 (Severity of weakness)
    suggestion: string;
}

export interface AuditReport {
    overallRisk: number; // 0-100
    reviews: AdversarialReview[];
    summary: string;
}

export class AuditorService {
    private apiKey: string;

    constructor(apiKey: string) {
        this.apiKey = apiKey;
    }

    private getModel() {
        return google("gemini-1.5-flash");
    }

    async auditContent(content: string): Promise<AuditReport> {
        const prompt = `
        You are an AI Red Team performing a "Strategy Audit" on this social media post.
        
        POST: "${content}"
        
        Perform 3 adversarial reviews:
        1. THE SKEPTIC: Find logical gaps, lack of proof, or "too good to be true" claims.
        2. THE COMPETITOR: How would a rival coach/competitor mock this or point out its flaws to their own audience?
        3. THE BORED USER: Where does the post get repetitive? Why would someone scroll past it?
        
        OUTPUT JSON ONLY:
        {
            "overallRisk": Number (0-100, 100 being highly vulnerable),
            "summary": "One sentence summary of the biggest strategic threat.",
            "reviews": [
                {
                    "persona": "skeptic",
                    "feedback": "...",
                    "score": 0-10,
                    "suggestion": "How to fix the logic"
                },
                {
                    "persona": "competitor",
                    "feedback": "...",
                    "score": 0-10,
                    "suggestion": "How to defensibly position against rivals"
                },
                {
                    "persona": "bored",
                    "feedback": "...",
                    "score": 0-10,
                    "suggestion": "How to increase hook retention or impact"
                }
            ]
        }
        `;

        try {
            const { text } = await generateText({
                model: this.getModel(),
                prompt,
                temperature: 0.7,
            });

            // Clean JSON response
            const jsonStr = text.replace(/```json\n?|\n?```/g, "").trim();
            return JSON.parse(jsonStr);
        } catch (error) {
            console.error("Audit failed:", error);
            return {
                overallRisk: 0,
                summary: "Error performing audit.",
                reviews: []
            };
        }
    }
}
