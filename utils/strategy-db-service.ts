/**
 * STRATEGY SERVICE - Database Operations
 * ---------------------------------------
 * CRUD operations for strategies with team support.
 * Replaces IndexedDB persistence with Cloud SQL.
 */

import { prisma } from "./db";
import type { Strategy, Platform } from "@prisma/client";

// --- Types ---

export interface CreateStrategyInput {
  content: string;
  title?: string;
  platform?: Platform;
  persona?: string;
  mode?: string;
  authorId: string;
  teamId?: string;
}

export interface UpdateStrategyInput {
  id: string;
  content?: string;
  title?: string;
  score?: number;
  impressions?: number;
  engagement?: number;
  isPublished?: boolean;
  externalId?: string;
}

// --- CRUD Operations ---

/**
 * Create a new strategy
 */
export async function createStrategy(input: CreateStrategyInput): Promise<Strategy> {
  const strategy = await prisma.strategy.create({
    data: {
      content: input.content,
      title: input.title || generateTitle(input.content),
      platform: input.platform || "LINKEDIN",
      persona: input.persona || "cso",
      mode: input.mode || "standard",
      authorId: input.authorId,
      teamId: input.teamId,
    },
  });

  // Create initial version
  await prisma.strategyVersion.create({
    data: {
      strategyId: strategy.id,
      content: input.content,
      version: 1,
      changeNote: "Initial version",
    },
  });

  return strategy;
}

/**
 * Get strategies for a user (includes team strategies)
 */
export async function getStrategies(
  userId: string,
  options?: { teamId?: string; limit?: number; offset?: number }
): Promise<Strategy[]> {
  const { teamId, limit = 50, offset = 0 } = options || {};

  return prisma.strategy.findMany({
    where: {
      OR: [
        { authorId: userId },
        { teamId: teamId || undefined },
      ],
    },
    orderBy: { createdAt: "desc" },
    take: limit,
    skip: offset,
  });
}

/**
 * Get a single strategy by ID
 */
export async function getStrategy(id: string): Promise<Strategy | null> {
  return prisma.strategy.findUnique({
    where: { id },
    include: {
      author: { select: { name: true, email: true, image: true } },
      versions: { orderBy: { version: "desc" }, take: 5 },
    },
  });
}

/**
 * Update a strategy (creates new version)
 */
export async function updateStrategy(input: UpdateStrategyInput): Promise<Strategy> {
  const current = await prisma.strategy.findUnique({
    where: { id: input.id },
    include: { versions: { orderBy: { version: "desc" }, take: 1 } },
  });

  if (!current) throw new Error("Strategy not found");

  // If content changed, create new version
  if (input.content && input.content !== current.content) {
    const lastVersion = current.versions[0]?.version || 0;
    await prisma.strategyVersion.create({
      data: {
        strategyId: input.id,
        content: input.content,
        version: lastVersion + 1,
        changeNote: "Updated content",
      },
    });
  }

  return prisma.strategy.update({
    where: { id: input.id },
    data: {
      content: input.content,
      title: input.title,
      score: input.score,
      impressions: input.impressions,
      engagement: input.engagement,
      isPublished: input.isPublished,
      publishedAt: input.isPublished ? new Date() : undefined,
      externalId: input.externalId,
    },
  });
}

/**
 * Delete a strategy
 */
export async function deleteStrategy(id: string): Promise<void> {
  await prisma.strategy.delete({ where: { id } });
}

/**
 * Mark strategy as published
 */
export async function markPublished(
  id: string,
  externalId: string,
  platform: Platform
): Promise<Strategy> {
  return prisma.strategy.update({
    where: { id },
    data: {
      isPublished: true,
      publishedAt: new Date(),
      externalId,
      platform,
    },
  });
}

// --- Helpers ---

function generateTitle(content: string): string {
  // Extract first line or first 50 chars
  const firstLine = content.split("\n")[0];
  return firstLine.length > 50 ? firstLine.substring(0, 50) + "..." : firstLine;
}

// --- Analytics ---

export async function getStrategyStats(userId: string) {
  const [total, published, avgScore] = await Promise.all([
    prisma.strategy.count({ where: { authorId: userId } }),
    prisma.strategy.count({ where: { authorId: userId, isPublished: true } }),
    prisma.strategy.aggregate({
      where: { authorId: userId, score: { not: null } },
      _avg: { score: true },
    }),
  ]);

  return {
    total,
    published,
    avgScore: avgScore._avg.score || 0,
  };
}
