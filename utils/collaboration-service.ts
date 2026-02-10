/**
 * COLLABORATION SERVICE
 * -------------------
 * Handles real-time presence, shared state, and collaborative editing.
 * In a real app, this would use WebSockets (Pusher/Ably) or Supabase Realtime.
 * For StrategyOS, we'll simulate the enterprise "Presence Bar" and basic lock patterns.
 */

export interface PresenceUser {
    id: string;
    name: string;
    avatar: string;
    status: 'online' | 'typing' | 'idle';
    cursorPos?: { x: number; y: number };
    currentView: string;
}

export class CollaborationService {
    private users: PresenceUser[] = [
        {
            id: 'u1',
            name: 'Sebastian',
            avatar: 'S',
            status: 'online',
            currentView: 'Mastermind'
        },
        {
            id: 'u2',
            name: 'Ghost AI',
            avatar: 'G',
            status: 'typing',
            currentView: 'Canvas'
        },
        {
            id: 'u3',
            name: 'Compliance Bot',
            avatar: 'C',
            status: 'idle',
            currentView: 'Settings'
        }
    ];

    /**
     * GET ACTIVE USERS
     * Returns users currently in the workspace.
     */
    async getActiveUsers(): Promise<PresenceUser[]> {
        return this.users;
    }

    /**
     * BROADCAST TYPING
     * Simulates a typing event from another user.
     */
    onUserTyping(callback: (userId: string) => void) {
        // Simulate event every few seconds
        const interval = setInterval(() => {
            const randomUser = this.users[Math.floor(Math.random() * this.users.length)];
            callback(randomUser.id);
        }, 5000);
        return () => clearInterval(interval);
    }

    /**
     * RESOURCE LOCKING
     * Prevents edit conflicts.
     */
    async lockResource(resourceId: string, userId: string): Promise<boolean> {
        console.log(`[Collab] Locked resource ${resourceId} for user ${userId}`);
        return true;
    }
}

export const collabService = new CollaborationService();
