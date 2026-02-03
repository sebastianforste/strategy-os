/**
 * AUTONOMOUS AGENT - The Ghost in the Machine
 * -------------------------------------------
 * Decides whether to auto-post content based on thresholds.
 */

import { dispatchToPlatform, DistributionPlatform } from "./distribution-agent";
import { MastermindBriefing } from "./mastermind-briefing";

export interface AutonomousDecision {
    postId: string;
    action: 'POSTED' | 'HELD';
    reason: string;
    timestamp: Date;
    platform: DistributionPlatform;
    score: number;
}

/**
 * EVALUATE AND EXECUTE
 * The core loop for autonomous operations.
 */
export async function evaluateAutoPilot(
    content: string, 
    scores: { integrity: number, authority: number },
    platforms: DistributionPlatform[],
    briefing: MastermindBriefing,
    threshold: number = 85
): Promise<AutonomousDecision[]> {
    const decisions: AutonomousDecision[] = [];

    for (const platform of platforms) {
        const isQualified = scores.integrity >= threshold && scores.authority >= threshold;
        const averageScore = Math.round((scores.integrity + scores.authority) / 2);
        
        if (isQualified) {
            try {
                const result = await dispatchToPlatform({
                    platform,
                    content: content,
                    title: "Auto-Pilot Deployment"
                });

                decisions.push({
                    postId: result.postId || `auto_${Date.now()}`,
                    platform,
                    action: result.success ? 'POSTED' : 'HELD',
                    timestamp: new Date(),
                    reason: result.success 
                        ? `AUTONOMOUS DEPLOYMENT: Integrity ${scores.integrity}%, Authority ${scores.authority}% (Threshold: ${threshold}%)`
                        : `DISTRIBUTION FAILURE: ${result.error || 'Unknown error'}`,
                    score: averageScore
                });
            } catch (e: any) {
                decisions.push({
                    postId: 'error',
                    platform,
                    action: 'HELD',
                    timestamp: new Date(),
                    reason: `SYSTEM ERROR: ${e.message}`,
                    score: averageScore
                });
            }
        } else {
            decisions.push({
                postId: 'n/a',
                platform,
                action: 'HELD',
                timestamp: new Date(),
                reason: `HELD FOR REVIEW: Score delta detected. Integrity ${scores.integrity}%, Authority ${scores.authority}% (Req: ${threshold}%)`,
                score: averageScore
            });
        }
    }

    return decisions;
}
