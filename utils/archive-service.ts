/**
 * ARCHIVE SERVICE - 2028 Strategy Vault
 * 
 * Persistent storage for high-status assets using IndexedDB.
 */

import { openDB, IDBPDatabase } from 'idb';

export interface PerformanceData {
  impressions: number;
  likes: number;
  comments: number;
  reposts: number;
  saves: number;
  shares: number;
  reach: number;
  dwellScore: number;
  capturedAt: string;
}

export interface ArchivedStrategy {
  id: string;
  timestamp: string;
  topic: string;
  content: string;
  type: 'post' | 'pdf' | 'svg';
  persona?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata?: any;
  performance?: PerformanceData;
}

const DB_NAME = "strategy-os-vault";
const ARCHIVE_STORE = "archives";
const CANVAS_STORE = "canvas-state";

export interface CanvasNodeState {
  id: string; // matches ArchivedStrategy.id
  x: number;
  y: number;
  type: 'post' | 'pdf' | 'svg';
  content?: string; // Optional cached content
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  warRoomReport?: any; // Cached adversarial report
}

export interface ScheduledPost {
  id: string;
  content: string;
  topic: string;
  scheduledFor: string; // ISO timestamp
  platform: 'linkedin' | 'twitter' | 'substack';
  status: 'pending' | 'published' | 'failed';
  createdAt: string;
}

const SCHEDULE_STORE = "schedule";
const EVOLUTION_STORE = "evolution";

async function getDB(): Promise<IDBPDatabase> {
  return openDB(DB_NAME, 4, {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    upgrade(db, oldVersion, _newVersion, _transaction) {
      if (oldVersion < 1) {
        db.createObjectStore(ARCHIVE_STORE, { keyPath: "id" });
      }
      if (oldVersion < 2) {
        db.createObjectStore(CANVAS_STORE, { keyPath: "id" });
      }
      if (oldVersion < 3) {
        db.createObjectStore(SCHEDULE_STORE, { keyPath: "id" });
      }
      if (oldVersion < 4) {
        db.createObjectStore(EVOLUTION_STORE, { keyPath: "id" });
      }
    },
  });
}

/**
 * SAVE STRATEGY
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function archiveStrategy(topic: string, content: string, type: 'post' | 'pdf' | 'svg', metadata?: any) {
  const db = await getDB();
  const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const archive: ArchivedStrategy = {
    id,
    timestamp: new Date().toISOString(),
    topic,
    content,
    type,
    metadata
  };
  
  await db.put(ARCHIVE_STORE, archive);
  return id;
}

/**
 * GET ALL STRATEGIES
 */
export async function getArchivedStrategies(): Promise<ArchivedStrategy[]> {
  const db = await getDB();
  const all = await db.getAll(ARCHIVE_STORE);
  return all.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

/**
 * DELETE STRATEGY
 */
export async function deleteArchivedStrategy(id: string) {
  const db = await getDB();
  await db.delete(ARCHIVE_STORE, id);
}

/**
 * CANVAS PERSISTENCE
 */
export async function saveCanvasNodePosition(node: CanvasNodeState) {
    const db = await getDB();
    await db.put(CANVAS_STORE, node);
}

export async function getCanvasNodes(): Promise<CanvasNodeState[]> {
    const db = await getDB();
    return await db.getAll(CANVAS_STORE);
}

export async function removeCanvasNode(id: string) {
    const db = await getDB();
    await db.delete(CANVAS_STORE, id);
}

/**
 * PERFORMANCE TRACKING
 */
export async function updateStrategyPerformance(id: string, performance: PerformanceData) {
    const db = await getDB();
    const strategy = await db.get(ARCHIVE_STORE, id);
    if (strategy) {
        strategy.performance = performance;
        await db.put(ARCHIVE_STORE, strategy);
    }
}

export async function getTopPerformers(limit: number = 5): Promise<ArchivedStrategy[]> {
    const all = await getArchivedStrategies();
    // Filter to only those with performance data
    const withPerformance = all.filter(s => s.performance);
    // Sort by engagement (likes + comments + reposts)
    withPerformance.sort((a, b) => {
        const aScore = (a.performance?.likes || 0) + (a.performance?.comments || 0) + (a.performance?.reposts || 0);
        const bScore = (b.performance?.likes || 0) + (b.performance?.comments || 0) + (b.performance?.reposts || 0);
        return bScore - aScore;
    });
    return withPerformance.slice(0, limit);
}

/**
 * SCHEDULING QUEUE
 */
export async function schedulePost(post: Omit<ScheduledPost, 'id' | 'createdAt' | 'status'>): Promise<string> {
    const db = await getDB();
    const id = `sched-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const scheduled: ScheduledPost = {
        ...post,
        id,
        status: 'pending',
        createdAt: new Date().toISOString()
    };
    await db.put(SCHEDULE_STORE, scheduled);
    return id;
}

export async function getScheduledPosts(): Promise<ScheduledPost[]> {
    const db = await getDB();
    const all = await db.getAll(SCHEDULE_STORE);
    return all.sort((a, b) => new Date(a.scheduledFor).getTime() - new Date(b.scheduledFor).getTime());
}

export async function updateScheduledPost(id: string, updates: Partial<ScheduledPost>) {
    const db = await getDB();
    const post = await db.get(SCHEDULE_STORE, id);
    if (post) {
        Object.assign(post, updates);
        await db.put(SCHEDULE_STORE, post);
    }
}

export async function deleteScheduledPost(id: string) {
    const db = await getDB();
    await db.delete(SCHEDULE_STORE, id);
}

export async function getUpcomingPosts(windowMinutes: number = 60): Promise<ScheduledPost[]> {
    const all = await getScheduledPosts();
    const now = Date.now();
    const windowMs = windowMinutes * 60 * 1000;
    return all.filter(p => 
        p.status === 'pending' && 
        new Date(p.scheduledFor).getTime() <= now + windowMs &&
        new Date(p.scheduledFor).getTime() >= now
    );
}

/**
 * EVOLUTION HISTORY
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function saveEvolutionReport(report: any) {
    const db = await getDB();
    const id = `evo-${Date.now()}`;
    await db.put(EVOLUTION_STORE, { ...report, id });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getEvolutionHistory(): Promise<any[]> {
    const db = await getDB();
    return db.getAll(EVOLUTION_STORE);
}
