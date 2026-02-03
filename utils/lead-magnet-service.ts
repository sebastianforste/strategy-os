
import { generateText } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { AI_CONFIG } from "./config";

export type MagnetType = 'audit' | 'swipe_file' | 'roadmap';

export interface MagnetSection {
    title: string;
    content: string;
    actionItem?: string;
}

export interface LeadMagnet {
    type: MagnetType;
    title: string;
    headline: string;
    hook: string;
    sections: MagnetSection[];
    landingPage: {
        headline: string;
        subheadline: string;
        bullets: string[];
        cta: string;
    };
    emailSequence: {
        subject: string;
        body: string;
        delay: string; // e.g. "Immediate", "Day 1"
    }[];
}

const MAGNET_TEMPLATES: Record<MagnetType, string> = {
    audit: `
    STRUCTURE: The 7-Point Inspection
    GOAL: Help the reader self-assess a specific problem.
    FORMAT: 
    - 7 specific criteria to rate (0-10 or Yes/No).
    - For each criterion, explain WHY it matters and WHAT good looks like.
    `,
    swipe_file: `
    STRUCTURE: The Copy-Paste Collection
    GOAL: Save the reader time by giving them ready-to-use templates.
    FORMAT:
    - 5-10 specific templates/scripts/prompts.
    - Context for when to use each.
    `,
    roadmap: `
    STRUCTURE: The Zero-to-One Roadmap
    GOAL: Show the step-by-step path to a specific outcome.
    FORMAT:
    - Day-by-Day or Step-by-Step breakdown.
    - Focus on "Quick Wins" early on.
    `
};

export class LeadMagnetService {
    private google: any;

    constructor(apiKey: string) {
        this.google = createGoogleGenerativeAI({ apiKey });
    }

    async generateMagnet(topic: string, audience: string, type: MagnetType): Promise<LeadMagnet> {
        const model = this.google(AI_CONFIG.primaryModel);

        const prompt = `
        You are a world-class direct response marketer (Alex Hormozi style).
        
        GOAL: Create a "Grand Slam Offer" lead magnet.
        TOPIC: ${topic}
        TARGET AUDIENCE: ${audience}
        TYPE: ${type.toUpperCase().replace('_', ' ')}
        
        ${MAGNET_TEMPLATES[type]}
        
        REQUIREMENTS:
        1. TITLE: Must be high-value, specific, and promise a result processes.
        2. CONTENT: specific, actionable, no fluff.
        3. LANDING PAGE: High-converting copy (Headline, Bullets, CTA).
        4. EMAILS: A 3-email nurture sequence (Delivery, Value Add, Soft Pitch).
        
        OUTPUT FORMAT (JSON ONLY):
        {
            "type": "${type}",
            "title": "String",
            "headline": "String",
            "hook": "String",
            "sections": [
                { "title": "String", "content": "String", "actionItem": "String" }
            ],
            "landingPage": {
                "headline": "String",
                "subheadline": "String",
                "bullets": ["String", "String", "String"],
                "cta": "String"
            },
            "emailSequence": [
                { "subject": "String", "body": "String", "delay": "String" }
            ]
        }
        `;

        try {
            const { text } = await generateText({
                model,
                prompt,
                temperature: 0.7,
            });

            // Clean markdown code blocks if present
            const cleanText = text.replace(/```json\n?|\n?```/g, "").trim();
            return JSON.parse(cleanText) as LeadMagnet;
        } catch (error) {
            console.error("Lead Magnet Generation Error:", error);
            throw new Error("Failed to generate lead magnet");
        }
    }
}
