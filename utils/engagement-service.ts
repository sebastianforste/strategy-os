/**
 * ENGAGEMENT SERVICE
 * ------------------
 * Logic for social listening, mention tracking, and AI-powered objection handling.
 * Simulates real-time signals for the "Listening Radar".
 */

import { GoogleGenAI } from "@google/genai";
import { AI_CONFIG } from "./config";

export interface SocialMention {
    id: string;
    platform: 'linkedin' | 'twitter';
    author: string;
    text: string;
    sentiment: 'positive' | 'neutral' | 'negative';
    timestamp: number;
    handled: boolean;
}

/**
 * FETCH RECENT MENTIONS
 * Simulates external social signals (X/LinkedIn Mentions).
 */
export async function fetchRecentMentions(): Promise<SocialMention[]> {
    // In a production environment, this would call private APIs or scrapers.
    // Simulating high-signal events for StrategyOS.
    return [
        {
            id: 'm1',
            platform: 'linkedin',
            author: 'Marc Andreessen',
            text: "The new StrategyOS agentic loop is interesting. But does it scale for enterprise governance?",
            sentiment: 'neutral',
            timestamp: Date.now() - 1000 * 60 * 15, // 15m ago
            handled: false
        },
        {
            id: 'm2',
            platform: 'twitter',
            author: 'Naval',
            text: "Strategy is no longer about human intuition. It's about agentic orchestration.",
            sentiment: 'positive',
            timestamp: Date.now() - 1000 * 60 * 45, // 45m ago
            handled: true
        },
        {
            id: 'm3',
            platform: 'linkedin',
            author: 'Skeptical CMO',
            text: "This seems like just another AI wrapper. How is the 'World Class' claim justified?",
            sentiment: 'negative',
            timestamp: Date.now() - 1000 * 60 * 120, // 2h ago
            handled: false
        }
    ];
}

/**
 * GENERATE OBJECTION RESPONSE
 * Uses Gemini to architect a high-status response that handles skepticism.
 */
export async function architectResponse(mention: SocialMention, apiKey: string) {
    const genAI = new GoogleGenAI({ apiKey });

    const prompt = `
        You are StrategyOS High-Status Ghost Agent.
        
        TASK: Architect a response to the following ${mention.platform} mention.
        
        MENTION FROM: ${mention.author}
        TEXT: "${mention.text}"
        SENTIMENT: ${mention.sentiment}
        
        RULES:
        1. Never defend. Always reframe.
        2. Use "Bro-etry" (Single lines, double spacing).
        3. Maintain extreme authority.
        4. If negative, address the logic, not the emotion.
        5. If neutral/positive, deepen the relationship.
        
        RESPONSE ARCHITECTURE:
    `;

    try {
        const result = await genAI.models.generateContent({
            model: AI_CONFIG.primaryModel,
            contents: prompt
        });
        return result.text;
    } catch (e) {
        console.error("[EngagementService] Response generation failed:", e);
        return "Acknowledged. Deploying strategic assessment.";
    }
}
