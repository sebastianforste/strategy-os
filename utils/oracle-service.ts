/**
 * ORACLE SERVICE - Predictive Analytics Engine
 * ---------------------------------------------
 * Analyzes historical performance to forecast trends and optimal timing.
 */

import { getArchivedStrategies, ArchivedStrategy, PerformanceData } from "./archive-service";

export interface TimeSeriesPoint {
    timestamp: Date;
    engagement: number;
    topic: string;
    platform: string;
}

import { findTrends } from "./search-service";

export interface TrendForecast {
    topic: string;
    velocity: number; // Rate of growth
    momentum: number; // Weighted score
    confidence: number; // 0-100
    predictedPeak: Date;
    reasoning: string;
    source: "Internal" | "External";
}

export interface OptimalWindow {
    dayOfWeek: number; // 0-6
    hour: number; // 0-23
    platform: string;
    avgEngagement: number;
    confidence: number;
}

export interface OpportunityAlert {
    id: string;
    type: 'trending_topic' | 'optimal_time' | 'content_gap';
    title: string;
    description: string;
    actionable: boolean;
    confidence: number;
    expiresAt: Date;
}

export const oracleService = {
    /**
     * Analyze historical engagement patterns over time.
     */
    async analyzeHistoricalPatterns(): Promise<TimeSeriesPoint[]> {
        const strategies = await getArchivedStrategies();
        const points: TimeSeriesPoint[] = [];

        for (const strategy of strategies) {
            if (strategy.performance) {
                const engagement = this.calculateEngagement(strategy.performance);
                points.push({
                    timestamp: new Date(strategy.timestamp),
                    engagement,
                    topic: strategy.topic,
                    platform: strategy.metadata?.platform || 'linkedin'
                });
            }
        }

        return points.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    },

    /**
     * Calculate total engagement score.
     */
    calculateEngagement(performance: PerformanceData): number {
        return (
            (performance.likes || 0) +
            (performance.comments || 0) * 2 +
            (performance.reposts || 0) * 3 +
            (performance.saves || 0) * 2
        );
    },

    /**
     * Forecast trending topics based on velocity and momentum (Internal + External).
     */
    async forecastTrendingTopics(apiKey?: string, niche: string = "Tech"): Promise<TrendForecast[]> {
        // 1. Internal Validation (What worked for YOU)
        const timeSeries = await this.analyzeHistoricalPatterns();
        const internalForecasts: TrendForecast[] = [];
        const topicGroups = new Map<string, TimeSeriesPoint[]>();
        
        for (const point of timeSeries) {
            if (!topicGroups.has(point.topic)) topicGroups.set(point.topic, []);
            topicGroups.get(point.topic)!.push(point);
        }

        for (const [topic, points] of topicGroups) {
            if (points.length < 2) continue;
            const recent = points.slice(-3);
            const velocity = this.calculateVelocity(recent);
            const momentum = this.calculateMomentum(recent, velocity);

            if (momentum > 40) {
                const predictedPeak = new Date();
                predictedPeak.setDate(predictedPeak.getDate() + 7);

                internalForecasts.push({
                    topic,
                    velocity,
                    momentum,
                    confidence: Math.min(momentum, 95),
                    predictedPeak,
                    reasoning: this.generateReasoning(velocity, momentum),
                    source: "Internal"
                });
            }
        }

        // 2. External Validation (What is working for the MARKET)
        let externalForecasts: TrendForecast[] = [];
        if (apiKey) {
            const externalTrends = await findTrends(niche, apiKey);
            externalForecasts = externalTrends.map(t => {
                const predictedPeak = new Date();
                predictedPeak.setDate(predictedPeak.getDate() + 5); // Shorter window for news
                return {
                    topic: t.title,
                    velocity: t.momentum, // Map momentum to velocity rough equivalent
                    momentum: t.momentum * 1.2, // Boost external signals slightly
                    confidence: t.sentiment === "Bullish" ? 90 : 70,
                    predictedPeak,
                    reasoning: `Market Signal: ${t.snippet.slice(0, 60)}...`,
                    source: "External"
                };
            });
        }

        // 3. Merge & Sort
        const allForecasts = [...internalForecasts, ...externalForecasts];
        return allForecasts.sort((a, b) => b.momentum - a.momentum).slice(0, 5);
    },

    /**
     * Calculate velocity (rate of change).
     */
    calculateVelocity(points: TimeSeriesPoint[]): number {
        if (points.length < 2) return 0;

        const latest = points[points.length - 1];
        const previous = points[points.length - 2];

        const timeDelta = (latest.timestamp.getTime() - previous.timestamp.getTime()) / (1000 * 60 * 60 * 24); // days
        const engagementDelta = latest.engagement - previous.engagement;

        return timeDelta > 0 ? engagementDelta / timeDelta : 0;
    },

    /**
     * Calculate momentum (weighted velocity with recency bias).
     */
    calculateMomentum(points: TimeSeriesPoint[], velocity: number): number {
        const avgEngagement = points.reduce((sum, p) => sum + p.engagement, 0) / points.length;
        const recencyWeight = 1.5; // Boost recent activity
        const authorityBoost = avgEngagement > 100 ? 1.2 : 1.0;

        return Math.abs(velocity) * recencyWeight * authorityBoost;
    },

    /**
     * Generate human-readable reasoning.
     */
    generateReasoning(velocity: number, momentum: number): string {
        if (velocity > 10 && momentum > 80) {
            return "Explosive growth trajectory. High viral potential.";
        } else if (velocity > 5 && momentum > 60) {
            return "Steady upward trend. Gaining traction.";
        } else if (velocity < 0) {
            return "Declining interest. Consider pivoting.";
        } else {
            return "Moderate momentum. Monitor closely.";
        }
    },

    /**
     * Predict optimal posting times based on historical performance.
     */
    async predictOptimalTimes(): Promise<OptimalWindow[]> {
        const timeSeries = await this.analyzeHistoricalPatterns();
        const windows = new Map<string, { total: number; count: number }>();

        for (const point of timeSeries) {
            const date = point.timestamp;
            const key = `${date.getDay()}-${date.getHours()}-${point.platform}`;

            if (!windows.has(key)) {
                windows.set(key, { total: 0, count: 0 });
            }

            const window = windows.get(key)!;
            window.total += point.engagement;
            window.count += 1;
        }

        const optimal: OptimalWindow[] = [];
        for (const [key, data] of windows) {
            const [dayOfWeek, hour, platform] = key.split('-');
            const avgEngagement = data.total / data.count;

            if (data.count >= 2 && avgEngagement > 50) { // Minimum data points and threshold
                optimal.push({
                    dayOfWeek: parseInt(dayOfWeek),
                    hour: parseInt(hour),
                    platform,
                    avgEngagement,
                    confidence: Math.min((data.count / 5) * 100, 95) // More data = higher confidence
                });
            }
        }

        return optimal.sort((a, b) => b.avgEngagement - a.avgEngagement).slice(0, 10);
    },

    /**
     * Generate actionable opportunity alerts.
     */
    async generateOpportunityAlerts(): Promise<OpportunityAlert[]> {
        const forecasts = await this.forecastTrendingTopics();
        const windows = await this.predictOptimalTimes();
        const alerts: OpportunityAlert[] = [];

        // Trending topic alerts
        for (const forecast of forecasts.slice(0, 3)) {
            alerts.push({
                id: `trend-${Date.now()}-${Math.random()}`,
                type: 'trending_topic',
                title: `Trending: ${forecast.topic}`,
                description: `${forecast.reasoning} Predicted peak in 7 days.`,
                actionable: true,
                confidence: forecast.confidence,
                expiresAt: forecast.predictedPeak
            });
        }

        // Optimal time alerts
        if (windows.length > 0) {
            const topWindow = windows[0];
            const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            alerts.push({
                id: `time-${Date.now()}-${Math.random()}`,
                type: 'optimal_time',
                title: `Peak Window: ${days[topWindow.dayOfWeek]} at ${topWindow.hour}:00`,
                description: `Historical avg: ${Math.round(topWindow.avgEngagement)} engagement on ${topWindow.platform}.`,
                actionable: true,
                confidence: topWindow.confidence,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            });
        }

        return alerts;
    }
};
