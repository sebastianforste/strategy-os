/**
 * SYNC SERVICE - Real-time Collaboration Engine
 * 
 * Uses BroadcastChannel for local cross-tab sync.
 * Designed to be swapped for WebSockets/WebRTC for remote collaboration.
 */

export type SyncMessageType = 'node_move' | 'node_add' | 'node_remove' | 'collaborator_join' | 'collaborator_leave' | 'ai_suggest_start' | 'ai_suggest_end';

export interface SyncMessage {
    type: SyncMessageType;
    payload: any;
    senderId: string;
    timestamp: number;
}

export interface Collaborator {
    id: string;
    name: string;
    avatar?: string;
    isAI: boolean;
    lastActive: number;
}

const CHANNEL_NAME = 'strategy-os-canvas-sync';

class SyncService {
    private channel: BroadcastChannel | null = null;
    private listeners: ((msg: SyncMessage) => void)[] = [];
    private userId: string;

    constructor() {
        this.userId = `user-${Math.random().toString(36).substr(2, 9)}`;
        if (typeof window !== 'undefined') {
            this.channel = new BroadcastChannel(CHANNEL_NAME);
            this.channel.onmessage = (event) => {
                this.listeners.forEach(l => l(event.data));
            };
        }
    }

    public subscribe(callback: (msg: SyncMessage) => void) {
        this.listeners.push(callback);
        return () => {
            this.listeners = this.listeners.filter(l => l !== callback);
        };
    }

    public broadcast(type: SyncMessageType, payload: any) {
        if (!this.channel) return;
        
        const message: SyncMessage = {
            type,
            payload,
            senderId: this.userId,
            timestamp: Date.now()
        };
        
        this.channel.postMessage(message);
    }

    public getUserId() {
        return this.userId;
    }
}

export const syncService = new SyncService();
