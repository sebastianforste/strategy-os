
import { generateText } from "ai";
import { google } from "@ai-sdk/google";

export interface CompetitorAnalysis {
    hookFrameworks: string[];
    dominantTone: string;
    topicClusters: string[];
    contentGaps: string[];
    structuralTemplates: string[];
}

export class CompetitorService {
    private apiKey: string;

    constructor(apiKey: string) {
        this.apiKey = apiKey;
    }

    private getModel() {
        return google("gemini-1.5-flash");
    }

    async analyzeBrutally(competitorPosts: string[], userNiche: string): Promise<CompetitorAnalysis> {
        const prompt = `
        You are a high-level Strategic Consultant. Analyze these posts from a competitor in the niche: "${userNiche}".
        
        POSTS:
        ${competitorPosts.map((p, i) => `--- POST ${i + 1} ---\n${p}`).join("\n")}
        
        TASK:
        1. Identify the "Hook Frameworks" (e.g., "The Negative Callout", "The Curiosity Gap").
        2. Determine the "Dominant Tone" (e.g., "Aggressive Growth", "Philosophical Empathetic").
        3. Identify "Topic Clusters" they talk about most.
        4. Find "Content Gaps": High-value topics in the "${userNiche}" niche they are COMPELTELY IGNORING.
        5. Extract "Structural Templates": Generate 3 reusable hook/post structures based on their most viral-looking patterns.
        
        OUTPUT JSON ONLY:
        {
            "hookFrameworks": ["string"],
            "dominantTone": "string",
            "topicClusters": ["string"],
            "contentGaps": ["string"],
            "structuralTemplates": ["string"]
        }
        `;

        try {
            const { text } = await generateText({
                model: this.getModel(),
                prompt,
                temperature: 0.7,
            });

            const jsonStr = text.replace(/```json\n?|\n?```/g, "").trim();
            return JSON.parse(jsonStr);
        } catch (error) {
            console.error("Competitor analysis failed:", error);
            return {
                hookFrameworks: [],
                dominantTone: "Unknown",
                topicClusters: [],
                contentGaps: [],
                structuralTemplates: []
            };
        }
    }
}
