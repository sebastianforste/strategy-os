
import { getHistory, HistoryItem } from "./history-service";
import { PERSONAS } from "./personas";

export interface PersonaStats {
  id: string;
  name: string;
  totalPosts: number;
  successRate: number; // Percentage of "good" or "viral"
  viralCount: number;
}

export interface FeedbackSummary {
  totalRated: number;
  globalSuccessRate: number;
  personaStats: PersonaStats[];
}

export function getFeedbackStats(): FeedbackSummary {
    const history = getHistory();
    const ratedItems = history.filter(item => item.performance?.rating);
    
    if (ratedItems.length === 0) {
        return {
            totalRated: 0,
            globalSuccessRate: 0,
            personaStats: []
        };
    }

    // Global Stats
    const successful = ratedItems.filter(i => 
        i.performance?.rating === "viral" || i.performance?.rating === "good"
    );
    const globalSuccessRate = (successful.length / ratedItems.length) * 100;

    // Persona Stats
    const personaMap: Record<string, { total: number; success: number; viral: number }> = {};
    
    // Initialize map
    Object.values(PERSONAS).forEach(p => {
        personaMap[p.id] = { total: 0, success: 0, viral: 0 };
    });

    ratedItems.forEach(item => {
        const pid = item.personaId || "cso";
        if (!personaMap[pid]) {
             personaMap[pid] = { total: 0, success: 0, viral: 0 };
        }
        
        personaMap[pid].total++;
        if (item.performance?.rating === "viral") {
            personaMap[pid].viral++;
            personaMap[pid].success++;
        } else if (item.performance?.rating === "good") {
             personaMap[pid].success++;
        }
    });

    const personaStats: PersonaStats[] = Object.entries(personaMap).map(([id, stats]) => {
        const name = PERSONAS[id as keyof typeof PERSONAS]?.name || id;
        return {
            id,
            name,
            totalPosts: stats.total,
            successRate: stats.total > 0 ? (stats.success / stats.total) * 100 : 0,
            viralCount: stats.viral
        };
    }).sort((a, b) => b.successRate - a.successRate);
    
    return {
        totalRated: ratedItems.length,
        globalSuccessRate,
        personaStats
    };
}
