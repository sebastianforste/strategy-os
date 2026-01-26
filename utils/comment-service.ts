"use client";

export interface Comment {
  id: string;
  assetId: string; // Since we don't have real asset IDs yet, we might link to the timestamp or hash
  author: string;
  text: string;
  timestamp: number;
}

const STORAGE_KEY = "strategyos_comments";

export function getComments(assetId: string): Comment[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const allComments: Comment[] = JSON.parse(raw);
    return allComments.filter(c => c.assetId === assetId).sort((a, b) => b.timestamp - a.timestamp);
  } catch (e) {
    console.error("Failed to load comments:", e);
    return [];
  }
}

export function addComment(assetId: string, text: string, author: string = "You"): Comment {
  const newComment: Comment = {
    id: crypto.randomUUID(),
    assetId,
    author,
    text,
    timestamp: Date.now(),
  };

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const allComments: Comment[] = raw ? JSON.parse(raw) : [];
    const updated = [newComment, ...allComments];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return newComment;
  } catch (e) {
    console.error("Failed to save comment:", e);
    return newComment;
  }
}
