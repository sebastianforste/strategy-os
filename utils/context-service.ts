/**
 * CONTEXT SERVICE - Strategic Awareness
 * -------------------------------------
 * Provides real-world contextual markers to personas to ground their generations.
 */

export interface StrategicContext {
    fiscalQuarter: string;
    marketPhase: 'expansion' | 'contraction' | 'neutral';
    isReportingSeason: boolean;
    significantEvents: string[];
}

/**
 * GET FISCAL CONTEXT
 * Determines current fiscal quarter and major strategic events.
 */
export function getFiscalContext(): StrategicContext {
    const now = new Date();
    const month = now.getMonth(); // 0-indexed
    
    // Simple Q1-Q4 logic for standard fiscal year
    const quarter = Math.floor(month / 3) + 1;
    const isReportingSeason = [0, 3, 6, 9].includes(month); // Jan, Apr, Jul, Oct
    
    const events: string[] = [];
    if (quarter === 4) events.push("Q4 Planning & Budgeting");
    if (isReportingSeason) events.push("Earnings Season Intensifying");
    if (month === 11) events.push("Annual Visioning & Year-End Audits");

    return {
        fiscalQuarter: `Q${quarter}`,
        marketPhase: 'neutral', // Could integrate with a market API in production
        isReportingSeason,
        significantEvents: events
    };
}

/**
 * GET COMPETITOR CONTEXT
 * Injected in prompt to allow personas to "react" to the landscape.
 */
export async function getCompetitorContext(): Promise<string> {
    // In a full implementation, this would query trend-service
    // For now, we provide a placeholder that grounds the persona's "provocateur" instincts.
    return `
    COMPETITOR SIGNALS:
    - High-volume consolidation in the SaaS sector.
    - Widespread adoption of "AI-washing" in corporate comms.
    - Talent flight from legacy consulting firms to boutique AI shops.
    `;
}
