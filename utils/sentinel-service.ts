/**
 * SENTINEL SERVICE - Brand Safety Monitoring
 * -------------------------------------------
 * Scans all content for reputation risks before publishing.
 * Acts as the final "quality gate" in the autonomous loop.
 */

export type RiskSeverity = 'CLEAR' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface RiskFlag {
    category: 'controversial' | 'tone' | 'legal' | 'competitor';
    description: string;
    severity: RiskSeverity;
    suggestion: string;
    matchedText?: string;
}

export interface SafetyReport {
    overallSeverity: RiskSeverity;
    flags: RiskFlag[];
    isPublishable: boolean;
    timestamp: Date;
}

// Keyword lists for detection
const CONTROVERSIAL_KEYWORDS = [
    'politics', 'political', 'democrat', 'republican', 'left-wing', 'right-wing',
    'religion', 'religious', 'god', 'atheist', 'church', 'mosque', 'synagogue',
    'abortion', 'gun control', 'immigration', 'climate change', 'vaccine',
    'racist', 'sexist', 'homophobic', 'transphobic'
];

const NEGATIVE_TONE_PATTERNS = [
    /\b(hate|despise|loathe|detest)\b/i,
    /\b(stupid|idiotic|moronic|dumb)\b/i,
    /\b(sucks|garbage|trash|worthless)\b/i,
    /\b(attack|destroy|crush|annihilate)\b/i,
    /!{3,}/, // Excessive exclamation marks
    /[A-Z]{10,}/ // Excessive caps (shouting)
];

const LEGAL_RISK_PATTERNS = [
    /\b(guaranteed|100%|proven|scientifically proven)\b/i,
    /\b(cure|treats|prevents disease)\b/i,
    /\b(lawsuit|sue|legal action|lawyer)\b/i,
    /\b(confidential|insider|leaked)\b/i
];

// Add your competitors here
const COMPETITORS = [
    'jasper', 'copy.ai', 'writesonic', 'hubspot', 'hootsuite', 'buffer', 'sprout social'
];

export const sentinelService = {
    /**
     * Scan content for all brand safety risks.
     */
    scanForRisks(content: string): SafetyReport {
        const flags: RiskFlag[] = [];
        const lowerContent = content.toLowerCase();

        // 1. Controversial Topic Detection
        for (const keyword of CONTROVERSIAL_KEYWORDS) {
            if (lowerContent.includes(keyword)) {
                flags.push({
                    category: 'controversial',
                    description: `Contains potentially controversial topic: "${keyword}"`,
                    severity: 'MEDIUM',
                    suggestion: `Consider removing or softening references to "${keyword}" to avoid alienating segments of your audience.`,
                    matchedText: keyword
                });
            }
        }

        // 2. Negative Tone Detection
        for (const pattern of NEGATIVE_TONE_PATTERNS) {
            const match = content.match(pattern);
            if (match) {
                flags.push({
                    category: 'tone',
                    description: `Contains aggressive or negative language: "${match[0]}"`,
                    severity: 'LOW',
                    suggestion: `Rephrase using more professional, constructive language. Replace "${match[0]}" with a neutral alternative.`,
                    matchedText: match[0]
                });
            }
        }

        // 3. Legal Risk Detection
        for (const pattern of LEGAL_RISK_PATTERNS) {
            const match = content.match(pattern);
            if (match) {
                flags.push({
                    category: 'legal',
                    description: `Contains potentially legally risky claim: "${match[0]}"`,
                    severity: 'HIGH',
                    suggestion: `Remove or qualify this claim. Add disclaimers like "in my experience" or "results may vary".`,
                    matchedText: match[0]
                });
            }
        }

        // 4. Competitor Mention Detection
        for (const competitor of COMPETITORS) {
            if (lowerContent.includes(competitor)) {
                flags.push({
                    category: 'competitor',
                    description: `Mentions competitor: "${competitor}"`,
                    severity: 'MEDIUM',
                    suggestion: `Avoid naming competitors directly. Focus on your unique value proposition instead.`,
                    matchedText: competitor
                });
            }
        }

        // Calculate overall severity
        const overallSeverity = this.calculateOverallSeverity(flags);
        const isPublishable = overallSeverity !== 'CRITICAL' && overallSeverity !== 'HIGH';

        return {
            overallSeverity,
            flags,
            isPublishable,
            timestamp: new Date()
        };
    },

    /**
     * Calculate the highest severity from all flags.
     */
    calculateOverallSeverity(flags: RiskFlag[]): RiskSeverity {
        if (flags.length === 0) return 'CLEAR';

        const severityOrder: RiskSeverity[] = ['CLEAR', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
        let maxIndex = 0;

        for (const flag of flags) {
            const index = severityOrder.indexOf(flag.severity);
            if (index > maxIndex) maxIndex = index;
        }

        // If multiple MEDIUM flags, escalate to HIGH
        const mediumCount = flags.filter(f => f.severity === 'MEDIUM').length;
        if (mediumCount >= 3 && maxIndex < severityOrder.indexOf('HIGH')) {
            return 'HIGH';
        }

        return severityOrder[maxIndex];
    },

    /**
     * Get a color code for UI display.
     */
    getSeverityColor(severity: RiskSeverity): string {
        switch (severity) {
            case 'CLEAR': return 'bg-green-500';
            case 'LOW': return 'bg-blue-500';
            case 'MEDIUM': return 'bg-yellow-500';
            case 'HIGH': return 'bg-orange-500';
            case 'CRITICAL': return 'bg-red-500';
            default: return 'bg-neutral-500';
        }
    },

    /**
     * Get human-readable label.
     */
    getSeverityLabel(severity: RiskSeverity): string {
        switch (severity) {
            case 'CLEAR': return 'All Clear';
            case 'LOW': return 'Minor Concerns';
            case 'MEDIUM': return 'Review Recommended';
            case 'HIGH': return 'Publish Blocked';
            case 'CRITICAL': return 'Critical Risk';
            default: return 'Unknown';
        }
    }
};
