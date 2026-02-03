/**
 * TRUTH ENGINE - Fact Verification System
 * ----------------------------------------
 * Extracts and verifies specific claims to prevent hallucinations.
 */

import { GoogleGenAI } from "@google/genai";
import { findTrends } from "./search-service"; // Re-using search capability
import { AI_CONFIG } from "./config";

const PRIMARY_MODEL = AI_CONFIG.primaryModel;

export interface FactCheckResult {
    claim: string;
    verdict: 'verified' | 'debunked' | 'unverified';
    sourceUrl?: string;
    correction?: string;
    confidence: number;
}

/**
 * CHECK FACTS
 * Orchestrates the extraction and verification of claims.
 */
export async function checkFacts(content: string, apiKey: string, serperKey: string): Promise<FactCheckResult[]> {
    const genAI = new GoogleGenAI({ apiKey });

    // 1. Extract Claims
    const extractionPrompt = `
        You are a Fact Check Scanner. Analyze the following text and extract 3-5 specific, verifiable claims.
        Focus on: Statistics, Dates, Quotes, and Historical Events.
        Ignore: Opinions, Generic statements ("AI is growing").
        
        TEXT:
        """
        ${content.substring(0, 1500)}
        """
        
        Return ONLY a JSON array of strings (the claims).
    `;

    try {
        const extractionResponse = await genAI.models.generateContent({
            model: PRIMARY_MODEL,
            contents: extractionPrompt
        });
        
        const claimsText = extractionResponse.text || "[]";
        const claims: string[] = JSON.parse(claimsText.replace(/```json|```/g, "").trim());

        if (claims.length === 0) return [];

        // 2. Verify each claim (Parallel)
        const results = await Promise.all(claims.map(claim => verifyClaim(claim, apiKey, serperKey)));
        return results;

    } catch (e) {
        console.error("[FactChecker] Extraction failed", e);
        return [];
    }
}

/**
 * VERIFY SINGLE CLAIM
 * Searches for evidence and judges the claim's accuracy.
 */
async function verifyClaim(claim: string, apiKey: string, serperKey: string): Promise<FactCheckResult> {
    // A. Search for evidence
    const searchResults = await findTrends(claim, serperKey);
    const context = searchResults.slice(0, 3).map(r => `${r.title}: ${r.snippet}`).join("\n");

    if (!context) {
        return { claim, verdict: 'unverified', confidence: 0 };
    }

    // B. Judge Verification
    const judgePrompt = `
        You are a Truth Arbiter. Verify the following CLAIM based on the SEARCH EVIDENCE.
        
        CLAIM: "${claim}"
        
        EVIDENCE:
        ${context}
        
        Return ONLY a JSON object:
        {
            "verdict": "verified" | "debunked" | "unverified",
            "correction": "Correction if debunked, else null",
            "confidence": 0-100,
            "sourceUrl": "URL from evidence if verified"
        }
    `;

    const genAI = new GoogleGenAI({ apiKey });
    try {
        const response = await genAI.models.generateContent({
            model: PRIMARY_MODEL,
            contents: judgePrompt
        });
        
        const verdict = JSON.parse(response.text?.replace(/```json|```/g, "").trim() || "{}");
        
        return {
            claim,
            verdict: verdict.verdict || 'unverified',
            correction: verdict.correction,
            confidence: verdict.confidence || 0,
            sourceUrl: verdict.sourceUrl || searchResults[0]?.url
        };
    } catch (e) {
        return { claim, verdict: 'unverified', confidence: 0 };
    }
}
