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

export function saveHistory(input: string, assets: GeneratedAssets, personaId: string = "cso"): string {
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

    // Load ALL history (raw)
    const raw = localStorage.getItem(STORAGE_KEY);
    const existing = raw ? JSON.parse(raw) : [];
    
    const updated = [newItem, ...existing].slice(0, 200); // Increased limit due to multiple workspaces

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return newItem.id;
  } catch (e) {
    console.error("Failed to save history:", e);
    return "";
  }
}

export function getHistory(workspaceId?: string): HistoryItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    
    const allHistory: HistoryItem[] = JSON.parse(raw);
    
    // Filter by workspace
    const targetWorkspace = workspaceId || getActiveWorkspaceId();
    
    // Legacy items (no workspaceId) go to "default" list if we are in default workspace
    return allHistory.filter(item => {
        if (!item.workspaceId) return targetWorkspace === "default";
        return item.workspaceId === targetWorkspace;
    });
  } catch (e) {
    console.error("Failed to load history:", e);
    return [];
  }
}

export function updateHistoryPerformance(
  id: string,
  performance: PerformanceData
): void {
  try {
    const history = getHistory();
    const updated = history.map((item) =>
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
export function getTopRatedPosts(personaId?: string, limit: number = 3): HistoryItem[] {
  try {
    const history = getHistory();
    
    // Filter to only rated posts
    const rated = history.filter(item => {
      const isTopRated = item.performance?.rating === "viral" || item.performance?.rating === "good";
      const matchesPersona = personaId ? item.personaId === personaId : true;
      return isTopRated && matchesPersona;
    });
    
    // Sort: viral first, then by recency
    rated.sort((a, b) => {
      const ratingOrder = { viral: 2, good: 1, meh: 0, flopped: -1 };
      const aScore = ratingOrder[a.performance?.rating || "meh"];
      const bScore = ratingOrder[b.performance?.rating || "meh"];
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
    const history = getHistory();
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

    if (!response.ok) {
      throw new Error(data.error || "Migration failed");
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
