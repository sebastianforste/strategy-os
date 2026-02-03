import { VaultAsset } from "./vault-service";

export interface NewsletterSynthesis {
    executiveSummary: string;
    keyDecisions: string[];
    marketImplications: string;
    nextActions: string[];
}

/**
 * Aggregates a selection of Vault assets into a structured prompt for newsletter generation.
 */
export function aggregateAssetsForNewsletter(assets: VaultAsset[]): string {
    if (assets.length === 0) return "";

    const context = assets.map(asset => {
        let contentStr = "";
        if (asset.type === 'meeting_summary') {
            contentStr = `TRANSCRIPT: ${asset.content.transcript?.substring(0, 1000) || "N/A"}\nSUMMARIES: ${asset.content.summaries?.join("\n") || "N/A"}`;
        } else {
            contentStr = JSON.stringify(asset.content);
        }

        return `--- ASSET: ${asset.title} (Type: ${asset.type}) ---\n${contentStr}`;
    }).join("\n\n");

    return `
    OBJECTIVE: Synthesize the following strategic assets into a high-fidelity "StrategyOS Newsletter".
    
    COLLECTED INTELLIGENCE:
    ${context}
    
    NEWSLETTER STRUCTURE:
    1. EXECUTIVE SUMMARY: A 2-sentence punchy overview of the most critical theme.
    2. KEY DECISIONS/PIVOTS: Bullet points of what was actually decided.
    3. STRATEGIC IMPLICATIONS: How this affects our market position or fiscal quarter.
    4. NEXT ACTIONS: Concrete, owners-ready tasks.
    
    TONE: Direct, high-stakes, analytical. Discard all platitudes.
    `;
}
