import { searchGrounding } from "./search-service";
import { GoogleGenAI } from "@google/genai";
import { AI_CONFIG } from "./config";

const PRIMARY_MODEL = AI_CONFIG.primaryModel;

export interface EngagementTarget {
    title: string;
    snippet: string;
    link: string;
    source: string;
    date: string;
}

export interface StrategicReply {
    type: 'Amplifier' | 'Challenger' | 'Questioner';
    content: string;
    rationale: string;
}

/**
 * SCOUT TARGETS
 * Finds high-value conversations (articles/posts) to engage with.
 */
export async function scoutEngagementTargets(topic: string, apiKey: string): Promise<EngagementTarget[]> {
    // 1. Search for recent, high-traction content
    // Use generic grounding search for discussions
    const rawResults = await searchGrounding(`${topic} discussions site:linkedin.com/pulse OR site:medium.com`, apiKey, 5); 
    
    if (rawResults.length === 0) {
         // Fallback Mock if search fails
         return [
            { title: "Future of " + topic, snippet: "Discussion on the trajectory of " + topic, link: "#", source: "Fallback", date: "Recent" }
         ];
    }

    return rawResults.map(r => ({
        title: r.title,
        snippet: r.snippet,
        link: r.link,
        source: r.source || "Web",
        date: "Recent" // Grounding often lacks exact date, can assume recent due to search
    }));
}

/**
 * GENERATE REPLIES
 * Creates 3 distinct angles for a Reply.
 */
export async function generateReplies(target: EngagementTarget, apiKey: string): Promise<StrategicReply[]> {
    const genAI = new GoogleGenAI({ apiKey });
    
    const prompt = `
        You are a Social Media Strategist. Generate 3 strategic replies to the following content to build authority.
        
        CONTENT TO REPLY TO:
        Title: "${target.title}"
        Snippet: "${target.snippet}"
        
        STRATEGIES:
        1. The Amplifier: Add unique value, agree but expand. "Yes, and..."
        2. The Challenger: Respectfully disagree or offer a counter-point. "True, but..."
        3. The Questioner: Ask a deep, insight-provoking question. "But what about..."
        
        Return ONLY a JSON array of objects with keys: "type", "content" (max 280 chars), "rationale".
    `;

    try {
        const response = await genAI.models.generateContent({
            model: PRIMARY_MODEL,
            contents: prompt
        });

        const text = response.text || "[]";
        // Clean JSON
        const jsonText = text.replace(/```json|```/g, "").trim();
        return JSON.parse(jsonText);
    } catch (e) {
        console.error("[EngagementAgent] Generation failed", e);
        return [
            { type: 'Amplifier', content: "Great insight! Totally agree.", rationale: "Fallback due to error." },
            { type: 'Challenger', content: "I see it differently...", rationale: "Fallback due to error." },
            { type: 'Questioner', content: "Have you considered...?", rationale: "Fallback due to error." }
        ];
    }
}
