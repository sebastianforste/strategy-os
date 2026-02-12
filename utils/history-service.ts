import { GeneratedAssets } from "./ai-service";

export type PerformanceRating = "viral" | "good" | "meh" | "flopped" | null;

export interface PerformanceData {
  rating: PerformanceRating;
  engagement?: {
    likes: number;
    comments: number;
    shares: number;
    impressions: number;
  };
  markedAt: number;
  notes?: string;
}

import { getActiveWorkspaceId } from "./workspace-service";

export interface HistoryItem {
  id: string;
  workspaceId: string;
  createdAt: number;
  input: string;
  personaId: string; // Added for analytics
  assets: GeneratedAssets;
  performance?: PerformanceData;
}

const STORAGE_KEY = "strategyos_history";
const SESSION_CACHE_TTL_MS = 30_000;

let authSessionState: boolean | null = null;
let authSessionCheckedAt = 0;
let sessionProbePromise: Promise<boolean> | null = null;

let isSaving = false;
const historyQueue: (() => Promise<void>)[] = [];

async function processQueue() {
  if (isSaving || historyQueue.length === 0) return;
  isSaving = true;
  const next = historyQueue.shift();
  if (next) await next();
  isSaving = false;
  processQueue();
}

async function hasAuthenticatedSession(): Promise<boolean> {
  if (typeof window === "undefined") return false;

  const now = Date.now();
  if (authSessionState !== null && now - authSessionCheckedAt < SESSION_CACHE_TTL_MS) {
    return authSessionState;
  }

  if (sessionProbePromise) {
    return sessionProbePromise;
  }

  sessionProbePromise = fetch("/api/auth/session", { cache: "no-store" })
    .then(async (response) => {
      if (!response.ok) return false;
      const data = await response.json();
      return Boolean(data?.user);
    })
    .catch(() => false)
    .finally(() => {
      sessionProbePromise = null;
    });

  const isAuthenticated = await sessionProbePromise;
  authSessionState = isAuthenticated;
  authSessionCheckedAt = now;
  return isAuthenticated;
}

function getLocalHistory(workspaceId?: string): HistoryItem[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];

  const allHistory: HistoryItem[] = JSON.parse(raw);
  const targetWorkspace = workspaceId || getActiveWorkspaceId();

  return allHistory.filter(item => {
      if (!item.workspaceId) return targetWorkspace === "default";
      return item.workspaceId === targetWorkspace;
  });
}

export async function saveHistory(input: string, assets: GeneratedAssets, personaId: string = "cso"): Promise<string> {
  return new Promise((resolve) => {
    historyQueue.push(async () => {
      try {
        const workspaceId = getActiveWorkspaceId();
        const newItem: HistoryItem = {
          id: crypto.randomUUID(),
          workspaceId,
          createdAt: Date.now(),
          input,
          personaId,
          assets,
        };

        const raw = localStorage.getItem(STORAGE_KEY);
        const existing = raw ? JSON.parse(raw) : [];
        const updated = [newItem, ...existing].slice(0, 200);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        
        // Trigger background migration without blocking resolve.
        hasAuthenticatedSession().then((isAuthenticated) => {
          if (!isAuthenticated) return;
          migrateHistoryToCloud().catch(err => console.warn("[History] Background migration failed", err));
        });

        resolve(newItem.id);
      } catch (e) {
        console.error("Failed to save history:", e);
        resolve("");
      }
    });
    processQueue();
  });
}

export async function getHistory(workspaceId?: string): Promise<HistoryItem[]> {
  try {
    // 1. Try to get from cloud/Prisma first (only when authenticated)
    if (await hasAuthenticatedSession()) {
      const response = await fetch("/api/history");
      if (response.ok) {
          const data = await response.json();
          if (data.history && data.history.length > 0) return data.history;
      } else if (response.status === 401) {
          authSessionState = false;
          authSessionCheckedAt = Date.now();
      }
    }

    // 2. Fallback to LocalStorage (Legacy)
    return getLocalHistory(workspaceId);
  } catch (e) {
    console.error("Failed to load history:", e);
    return [];
  }
}

export async function updateHistoryPerformance(
  id: string,
  performance: PerformanceData
): Promise<void> {
  try {
    const history = await getHistory();
    const updated = history.map((item: HistoryItem) =>
      item.id === id ? { ...item, performance } : item
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error("Failed to update performance:", e);
  }
}

export function clearHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error("Failed to clear history:", e);
  }
}

/**
 * Get top-rated posts for few-shot prompting.
 * Returns posts rated "viral" or "good" sorted by rating then recency.
 */
export async function getTopRatedPosts(personaId?: string, limit: number = 3): Promise<HistoryItem[]> {
  try {
    const history = await getHistory();
    
    // Filter to only rated posts
    const rated = history.filter((item: HistoryItem) => {
      const isTopRated = item.performance?.rating === "viral" || item.performance?.rating === "good";
      const matchesPersona = personaId ? item.personaId === personaId : true;
      return isTopRated && matchesPersona;
    });
    
    // Sort: viral first, then by recency
    rated.sort((a, b) => {
      const ratingOrder: Record<string, number> = { viral: 2, good: 1, meh: 0, flopped: -1 };
      const aScore = ratingOrder[a.performance?.rating || "meh"] || 0;
      const bScore = ratingOrder[b.performance?.rating || "meh"] || 0;
      if (bScore !== aScore) return bScore - aScore;
      return b.createdAt - a.createdAt;
    });
    
    return rated.slice(0, limit);
  } catch (e) {
    console.error("Failed to get top rated posts:", e);
    return [];
  }
}

export async function migrateHistoryToCloud(): Promise<{ success: boolean; migrated: number; failed: number; message: string }> {
  try {
    if (!(await hasAuthenticatedSession())) {
      return {
        success: true,
        migrated: 0,
        failed: 0,
        message: "Skipped migration: user is not signed in.",
      };
    }

    const history = getLocalHistory();
    if (history.length === 0) {
      return { success: true, migrated: 0, failed: 0, message: "No history to migrate." };
    }

    const response = await fetch("/api/migrate-history", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ historyItems: history }),
    });

    const data = await response.json();

    if (response.status === 401) {
      authSessionState = false;
      authSessionCheckedAt = Date.now();
      return {
        success: true,
        migrated: 0,
        failed: 0,
        message: "Skipped migration: session is no longer authenticated.",
      };
    }

    if (!response.ok) {
      throw new Error(data.error || "Migration failed");
    }

    // SUCCESS - Clear local history to prevent duplication
    if (data.success && data.migrated > 0) {
        localStorage.removeItem(STORAGE_KEY);
    }

    return {
      success: true,
      migrated: data.migrated,
      failed: data.failed,
      message: `Successfully migrated ${data.migrated} items. ${data.failed > 0 ? `(${data.failed} failed)` : ""}`
    };
  } catch (error) {
    console.error("Migration error:", error);
    return {
      success: false,
      migrated: 0,
      failed: 0,
      message: error instanceof Error ? error.message : "Unknown error occurred"
    };
  }
}

// Test helper: reset auth-session cache between unit tests.
export function __resetHistoryAuthCacheForTests(): void {
  authSessionState = null;
  authSessionCheckedAt = 0;
  sessionProbePromise = null;
}
