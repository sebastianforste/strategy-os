
export interface GrowthScenario {
    postsPerDay: number; // 1, 2, 3, etc.
    qualityMix: 'viral' | 'balanced' | 'sales';
    platforms: 'linkedin' | 'x' | 'all';
    currentFollowers: number;
    leadConversionRate: number; // e.g. 0.02 for 2%
}

export interface ProjectionPoint {
    day: number;
    followers: number;
    impressions: number;
    leads: number;
    revenue: number;
}

export interface GrowthProjection {
    scenario: GrowthScenario;
    points: ProjectionPoint[];
    totalFollowerGain: number;
    totalLeads: number;
    totalRevenue: number;
}

export class GrowthSimulatorService {
    
    // Baseline multipliers based on observations
    private readonly PLATFORM_MULTIPLIERS = {
        linkedin: 1.0,
        x: 0.8,
        all: 1.5
    };

    private readonly MIX_MULTIPLIERS = {
        viral: { reach: 2.5, conversion: 0.5 }, // High reach, low trust
        balanced: { reach: 1.0, conversion: 1.0 }, // Standard
        sales: { reach: 0.4, conversion: 3.0 } // Low reach, high intent
    };

    private readonly BASE_REACH_PER_POST = 500; // Conservative baseline
    private readonly FOLLOWER_CONVERSION_RATE = 0.015; // 1.5% of reach becomes followers

    simulate(params: GrowthScenario, days: number = 30): GrowthProjection {
        const points: ProjectionPoint[] = [];
        let runningFollowers = params.currentFollowers;
        let totalLeads = 0;
        let totalRevenue = 0;
        
        // Product Value assumption (can be parameterized later)
        const LTV = 100; // $100 value per lead/customer for simplicity

        for (let day = 1; day <= days; day++) {
            // compound effect: more followers = more baseline reach
            const compoundingFactor = 1 + (runningFollowers / 10000) * 0.1; 
            
            const mixStats = this.MIX_MULTIPLIERS[params.qualityMix];
            const platformStats = this.PLATFORM_MULTIPLIERS[params.platforms];

            // Calculate Daily stats
            const dailyReach = 
                (this.BASE_REACH_PER_POST * params.postsPerDay) * 
                mixStats.reach * 
                platformStats * 
                compoundingFactor;

            const dailyFollowerGain = dailyReach * this.FOLLOWER_CONVERSION_RATE;
            
            // Leads = Reach * Lead Conv Rate * Mix Conversion Modifier
            // (Standard lead conv rate applies to balanced content)
            const dailyLeads = dailyReach * params.leadConversionRate * mixStats.conversion;
            const dailyRevenue = dailyLeads * LTV;

            // Update running totals
            runningFollowers += dailyFollowerGain;
            totalLeads += dailyLeads;
            totalRevenue += dailyRevenue;

            points.push({
                day,
                followers: Math.floor(runningFollowers),
                impressions: Math.floor(dailyReach),
                leads: Math.floor(dailyLeads),
                revenue: Math.floor(dailyRevenue) // Daily revenue? check logic. maybe cumulative
            });
        }

        return {
            scenario: params,
            points: points,
            totalFollowerGain: Math.floor(runningFollowers - params.currentFollowers),
            totalLeads: Math.floor(totalLeads),
            totalRevenue: Math.floor(totalRevenue)
        };
    }
}
