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
  assets: GeneratedAssets;
  performance?: PerformanceData;
}

const STORAGE_KEY = "strategyos_history";

export function saveHistory(input: string, assets: GeneratedAssets): void {
  try {
    const workspaceId = getActiveWorkspaceId();
    
    const newItem: HistoryItem = {
      id: crypto.randomUUID(),
      workspaceId,
      createdAt: Date.now(),
      input,
      assets,
    };

    // Load ALL history (raw)
    const raw = localStorage.getItem(STORAGE_KEY);
    const existing = raw ? JSON.parse(raw) : [];
    
    const updated = [newItem, ...existing].slice(0, 200); // Increased limit due to multiple workspaces

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error("Failed to save history:", e);
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
