/**
 * HIVE MIND SERVICE - Cross-Platform Synchronization
 * ---------------------------------------------------
 * Creates a unified intelligence loop that tracks performance
 * across all connected platforms and triggers cross-pollination.
 */

import { getArchivedStrategies, ArchivedStrategy, PerformanceData } from "./archive-service";

export interface HiveStatus {
    linkedin: 'connected' | 'disconnected' | 'syncing';
    x: 'connected' | 'disconnected' | 'syncing';
    substack: 'connected' | 'disconnected' | 'syncing';
}

export interface CrossPollinationOpportunity {
    originalPost: ArchivedStrategy;
    sourcePlatform: string;
    targetPlatforms: string[];
    reason: string;
    score: number;
}

const VIRAL_THRESHOLD = 150; // Likes + Comments + Reposts

export const hiveMindService = {
    /**
     * Get the current connection status for all platforms.
     */
    getHiveStatus(): HiveStatus {
        // In production, this would check live OAuth tokens
        return {
            linkedin: 'connected',
            x: 'connected',
            substack: 'disconnected' // Mock: Substack not connected
        };
    },

    /**
     * Calculate a unified engagement score.
     */
    calculateEngagementScore(performance?: PerformanceData): number {
        if (!performance) return 0;
        return (performance.likes || 0) + (performance.comments || 0) * 2 + (performance.reposts || 0) * 3;
    },

    /**
     * Identify high-performing content that should be cross-pollinated.
     */
    async proposeCrossPollination(): Promise<CrossPollinationOpportunity[]> {
        const strategies = await getArchivedStrategies();
        const opportunities: CrossPollinationOpportunity[] = [];

        for (const strategy of strategies) {
            const score = this.calculateEngagementScore(strategy.performance);
            
            if (score >= VIRAL_THRESHOLD) {
                // This post is viral - propose for other platforms
                const status = this.getHiveStatus();
                const targets: string[] = [];

                // Assume content was posted to LinkedIn, propose X and Substack
                if (status.x === 'connected') targets.push('x');
                if (status.substack === 'connected') targets.push('substack');

                if (targets.length > 0) {
                    opportunities.push({
                        originalPost: strategy,
                        sourcePlatform: 'linkedin', // Mock source
                        targetPlatforms: targets,
                        reason: `High engagement score (${score}). Cross-pollinate for maximum reach.`,
                        score
                    });
                }
            }
        }

        return opportunities.slice(0, 5); // Top 5 opportunities
    },

    /**
     * Get the combined network reach.
     */
    async getUnifiedReach(): Promise<{ total: number; byPlatform: Record<string, number> }> {
        const strategies = await getArchivedStrategies();
        let total = 0;
        const byPlatform: Record<string, number> = { linkedin: 0, x: 0, substack: 0 };

        for (const s of strategies) {
            if (s.performance) {
                const reach = s.performance.reach || 0;
                total += reach;
                // Mock: Assign all to LinkedIn for now
                byPlatform['linkedin'] += reach;
            }
        }

        return { total, byPlatform };
    }
};
