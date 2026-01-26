"use client";

import { GeneratedAssets } from "./ai-service";

export interface ScheduledPost {
  id: string;
  assets: GeneratedAssets;
  scheduledAt: number;
  platform: "linkedin" | "twitter";
  status: "scheduled" | "posted" | "failed";
}

const STORAGE_KEY = "strategyos_schedule";

export function getScheduledPosts(): ScheduledPost[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error("Failed to load schedule:", e);
    return [];
  }
}

export function schedulePost(assets: GeneratedAssets, scheduledAt: number, platform: "linkedin" | "twitter" = "linkedin"): ScheduledPost {
  const newPost: ScheduledPost = {
    id: crypto.randomUUID(),
    assets,
    scheduledAt,
    platform,
    status: "scheduled",
  };

  try {
    const existing = getScheduledPosts();
    const updated = [...existing, newPost].sort((a, b) => a.scheduledAt - b.scheduledAt);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return newPost;
  } catch (e) {
    console.error("Failed to schedule post:", e);
    return newPost;
  }
}

export function deleteScheduledPost(id: string): void {
  try {
    const existing = getScheduledPosts();
    const updated = existing.filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error("Failed to delete scheduled post:", e);
  }
}

export function updateScheduledPostDate(id: string, newDate: number): void {
  try {
    const existing = getScheduledPosts();
    const updated = existing.map(p => 
      p.id === id ? { ...p, scheduledAt: newDate } : p
    ).sort((a, b) => a.scheduledAt - b.scheduledAt);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error("Failed to reschedule post:", e);
  }
}
