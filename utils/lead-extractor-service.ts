/**
 * LEAD EXTRACTOR SERVICE - The Bounty Hunter
 * -------------------------------------------
 * Transforms social engagement into qualified business leads.
 */

export interface Lead {
    id: string;
    name: string;
    title: string;
    company: string;
    linkedinUrl?: string;
    score: number;  // 0-100
    tier: 'hot' | 'warm' | 'cold';
    context: string; // What they commented on
    timestamp: string;
}

export interface OutreachDraft {
    subject: string;
    body: string;
    channel: 'linkedin_dm' | 'email';
}

// Mock leads for demo
const MOCK_LEADS: Lead[] = [
    {
        id: 'lead-1',
        name: 'Sarah Chen',
        title: 'VP of Growth',
        company: 'Acme Tech',
        linkedinUrl: 'https://linkedin.com/in/sarahchen',
        score: 92,
        tier: 'hot',
        context: 'Commented on your AI Strategy post: "This is exactly what we need to implement."',
        timestamp: new Date().toISOString()
    },
    {
        id: 'lead-2',
        name: 'Marcus Rivera',
        title: 'Director of Engineering',
        company: 'InnovateCo',
        linkedinUrl: 'https://linkedin.com/in/marcusrivera',
        score: 78,
        tier: 'warm',
        context: 'Liked and reshared your "Autonomous Operations" post.',
        timestamp: new Date(Date.now() - 86400000).toISOString()
    },
    {
        id: 'lead-3',
        name: 'Priya Sharma',
        title: 'Product Manager',
        company: 'StartupXYZ',
        linkedinUrl: 'https://linkedin.com/in/priyasharma',
        score: 55,
        tier: 'cold',
        context: 'Viewed your profile 3 times.',
        timestamp: new Date(Date.now() - 172800000).toISOString()
    }
];

export const leadExtractorService = {
    /**
     * Get leads from recent engagement (mock implementation).
     */
    async getLeadsFromEngagement(): Promise<Lead[]> {
        // In production, this would integrate with LinkedIn API
        await new Promise(r => setTimeout(r, 500)); // Simulate API delay
        return MOCK_LEADS;
    },

    /**
     * Score a lead based on their profile data.
     */
    scoreLead(title: string, company: string, engagementLevel: number): number {
        let score = 50; // Base score

        // Title scoring
        const highValueTitles = ['VP', 'Director', 'Head of', 'Chief', 'CEO', 'CTO', 'CMO', 'COO'];
        if (highValueTitles.some(t => title.toLowerCase().includes(t.toLowerCase()))) {
            score += 30;
        } else if (title.toLowerCase().includes('manager')) {
            score += 15;
        }

        // Company scoring (would use external API for real data)
        if (company.toLowerCase().includes('tech') || company.toLowerCase().includes('ai')) {
            score += 10;
        }

        // Engagement level boost
        score += Math.min(engagementLevel * 5, 20);

        return Math.min(score, 100);
    },

    /**
     * Generate a personalized outreach draft for a lead.
     */
    generateOutreachDraft(lead: Lead): OutreachDraft {
        const subject = `Quick thought on ${lead.context.substring(0, 50)}...`;

        const body = `Hi ${lead.name.split(' ')[0]},

I noticed your engagement on one of my recent posts${lead.context.includes('commented') ? ' – your comment resonated' : ''}.

Given your role as ${lead.title} at ${lead.company}, I thought you might find value in a deeper conversation about how we're applying these strategies at scale.

Would you be open to a 15-minute call next week?

Best,
[Your Name]`;

        return {
            subject,
            body,
            channel: 'linkedin_dm'
        };
    },

    /**
     * Get tier based on score.
     */
    getTier(score: number): 'hot' | 'warm' | 'cold' {
        if (score >= 80) return 'hot';
        if (score >= 60) return 'warm';
        return 'cold';
    }
};
