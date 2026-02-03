/**
 * SCHEDULING SERVICE - The Temporal Engine
 * ----------------------------------------
 * Manages autonomous queue optimization and gap detection.
 */

import { 
    getScheduledPosts, 
    ScheduledPost, 
    VIRAL_SLOTS, 
    ScheduleGap,
    findScheduleGaps 
} from "./archive-service";

export const schedulingService = {
    /**
     * Get the next logical gap in the schedule.
     */
    async getNextGap(): Promise<ScheduleGap | null> {
        const gaps = await findScheduleGaps();
        return gaps.length > 0 ? gaps[0] : null;
    },

    /**
     * Calculate the "Algorithm Fit Score" for a post.
     * High score means the post matches the current platform trends and slot timing.
     */
    calculateFitScore(post: ScheduledPost): number {
        const scheduledDate = new Date(post.scheduledFor);
        const day = scheduledDate.getDay();
        const hour = scheduledDate.getHours();

        const matchingSlot = VIRAL_SLOTS.find(s => s.day === day && Math.abs(s.hour - hour) < 2);
        
        // Base score
        let score = 70;

        // Slot match bonus
        if (matchingSlot) score += 20;

        // Platform-specific algorithm weights
        if (post.platform === 'linkedin' && hour >= 8 && hour <= 10) score += 10;
        if (post.platform === 'twitter' && hour >= 18) score += 5;

        return Math.min(score, 100);
    },

    /**
     * Propose an optimized time for a new post based on gaps.
     */
    async proposeTime(platform: string): Promise<Date> {
        const gaps = await findScheduleGaps();
        if (gaps.length > 0) {
            return gaps[0].date;
        }

        // Default to 1 hour from now if no gaps found
        const date = new Date();
        date.setHours(date.getHours() + 1, 0, 0, 0);
        return date;
    }
};
