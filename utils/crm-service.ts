/**
 * CRM SERVICE
 * -----------
 * Handles lead capture, qualification, and relationship management.
 * Integrates with the "Listening Radar" to identify potential high-value leads.
 */

import { GoogleGenAI } from "@google/genai";
import { AI_CONFIG } from "./config";
import { SocialMention } from "./engagement-service";

export interface Lead {
    id: string;
    author: string;
    description: string;
    sentiment: string;
    intent: 'buyer' | 'skeptic' | 'fan' | 'competitor';
    score: number; // 0-100 LTV probability
    suggestedNextAction: string;
    avatar?: string;
}

/**
 * QUALIFY LEAD
 * Uses AI to assess the value and intent of a social mention.
 */
export async function qualifyLead(mention: SocialMention, apiKey: string): Promise<Lead> {
    const genAI = new GoogleGenAI({ apiKey });
    
    const prompt = `
        You are StrategyOS Lead Intelligence Agent.
        
        TASK: Qualify the following social mention as a potential lead.
        
        AUTHOR: ${mention.author}
        CONTENT: "${mention.text}"
        SENTIMENT: ${mention.sentiment}
        
        RETURN JSON ONLY:
        {
            "intent": "buyer" | "skeptic" | "fan" | "competitor",
            "score": number (0-100),
            "description": "Brief summary of the lead's profile",
            "suggestedNextAction": "Concrete next step for sales/engagement"
        }
    `;

    try {
        const result = await genAI.models.generateContent({
            model: AI_CONFIG.fallbackModel,
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });
        
        const data = JSON.parse(result.text || "{}");
        return {
            id: mention.id,
            author: mention.author,
            description: data.description || "Active social engager.",
            sentiment: mention.sentiment,
            intent: data.intent || "fan",
            score: data.score || 50,
            suggestedNextAction: data.suggestedNextAction || "Respond with high-status reframe."
        };
    } catch (e) {
        console.error("[CRMService] Lead qualification failed:", e);
        return {
            id: mention.id,
            author: mention.author,
            description: "Unable to qualify lead profile.",
            sentiment: mention.sentiment,
            intent: "fan",
            score: 0,
            suggestedNextAction: "Manual review required."
        };
    }
}

/**
 * FETCH CRM PIPELINE
 * Simulates a collection of qualified leads.
 */
export async function fetchCRMPipeline(): Promise<Lead[]> {
    return [
        {
            id: 'l1',
            author: 'Marc Andreessen',
            description: 'Venture Capitalist interested in enterprise scale.',
            sentiment: 'neutral',
            intent: 'buyer',
            score: 92,
            suggestedNextAction: 'Send Whitepaper on StrategyOS Scalability.'
        },
        {
            id: 'l2',
            author: 'Naval',
            description: 'Philosopher-investor focused on leverage.',
            sentiment: 'positive',
            intent: 'fan',
            score: 75,
            suggestedNextAction: 'Invite to exclusive StrategyOS Inner Circle.'
        },
        {
            id: 'l3',
            author: 'Skeptical CMO',
            description: 'Traditional marketer questioning AI efficacy.',
            sentiment: 'negative',
            intent: 'skeptic',
            score: 45,
            suggestedNextAction: 'Deploy Case Study on 10x ROI for B2B Tech.'
        }
    ];
}
