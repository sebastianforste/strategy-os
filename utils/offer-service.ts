/**
 * OFFER SERVICE - The Monetization Engine
 * ---------------------------------------
 * Based on the "Grand Slam Offer" framework by Alex Hormozi.
 * Transforms attention into high-ticket revenue.
 */

import { GoogleGenAI } from "@google/genai";
import { AI_CONFIG } from "./config";

const PRIMARY_MODEL = AI_CONFIG.primaryModel;

export interface GrandSlamOffer {
    dreamOutcome: string;
    perceivedLikelihood: string;
    timeDelayReduction: string;
    effortAndSacrificeRemoval: string;
    theOffer: {
        name: string;
        price: string;
        valueProposition: string;
        bonuses: string[];
        guarantee: string;
        scarcity: string;
        urgency: string;
    };
    cta: string; // The specific string to at the end of the post
}

/**
 * GENERATE GRAND SLAM OFFER
 * Analyzes the strategy and builds an irresistible offer.
 */
export async function generateGrandSlamOffer(strategyContent: string, apiKey: string): Promise<GrandSlamOffer> {
    const genAI = new GoogleGenAI({ apiKey });
    
    const prompt = `
        You are Alex Hormozi. Analyze the following business strategy and generate an "Irresistible Grand Slam Offer" that makes the reader feel stupid saying 'no'.
        
        STATEGY CONTENT:
        """
        ${strategyContent}
        """
        
        Apply the Value Equation: (Dream Outcome x Likelihood) / (Time Delay x Effort).
        
        Generate:
        - dreamOutcome: What is the specific result they want?
        - perceivedLikelihood: How do we prove they will get it?
        - timeDelayReduction: How do they get a win in 24 hours?
        - effortAndSacrificeRemoval: What do we do FOR them?
        
        Structure "The Offer":
        - name: High-status name for the service/product.
        - price: Premium pricing strategy.
        - valueProposition: 1-sentence value statement.
        - bonuses: 3 high-value bonuses that solve the 'next' problem.
        - guarantee: A risk-reversal that puts the pressure on us.
        - scarcity: Why this isn't available to everyone.
        - urgency: Why they must act NOW.
        
        Return ONLY valid JSON with keys matching the GrandSlamOffer interface.
    `;

    try {
        const response = await genAI.models.generateContent({
            model: PRIMARY_MODEL,
            contents: prompt
        });

        const text = response.text || "{}";
        const jsonText = text.replace(/```json|```/g, "").trim();
        return JSON.parse(jsonText);
    } catch (e) {
        console.error("[OfferService] Failed to generate offer:", e);
        return {
            dreamOutcome: "Success",
            perceivedLikelihood: "Proven",
            timeDelayReduction: "Immediate",
            effortAndSacrificeRemoval: "Hands-off",
            theOffer: {
                name: "Alpha Implementation",
                price: "$5,000",
                valueProposition: "We build your strategy.",
                bonuses: ["Bonus 1", "Bonus 2"],
                guarantee: "Results or 100% back.",
                scarcity: "3 slots only.",
                urgency: "Closes on Friday."
            },
            cta: "DM 'ALPHA' to start."
        };
    }
}
