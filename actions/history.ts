"use server";

import { prisma } from "@/utils/db";
import { GeneratedAssets } from "@/utils/ai-service";
import { revalidatePath } from "next/cache";
import type { StrategyRating } from "@prisma/client";

// Type definition for what we receive from the client
export interface CreateStrategyParams {
    input: string;
    assets: GeneratedAssets;
    personaId: string;
    workspaceId?: string; // For future multi-tenancy
    createdAt?: Date;      // Optional historical timestamp
    rating?: string;       // Optional historical rating
}

function toStrategyRating(input?: string | null): StrategyRating | null {
  const value = (input || "").trim().toLowerCase();
  if (!value) return null;
  if (value === "viral") return "VIRAL";
  if (value === "good") return "GOOD";
  if (value === "meh") return "MEH";
  if (value === "flopped") return "FLOPPED";
  return null;
}

export async function saveStrategy(params: CreateStrategyParams) {
    try {
        // For now, we hardcode the user/author association until full auth is wired up
        const placeholderAuthorEmail = "user@example.com"; 

        // Ensure a user exists
        const author = await prisma.user.upsert({
            where: { email: placeholderAuthorEmail },
            update: {},
            create: {
                email: placeholderAuthorEmail,
                name: "StrategyOS User",
                role: "ADMIN"
            }
        });

        const strategy = await prisma.strategy.create({
            data: {
                content: params.assets.textPost,
                input: params.input,
                assets: params.assets as any,
                persona: params.personaId,
                authorId: author.id,
                platform: "LINKEDIN", 
                isPublished: false,
                createdAt: params.createdAt || new Date(),
                rating: toStrategyRating(params.rating),
            }
        });

        return { success: true, id: strategy.id };
    } catch (error) {
        console.error("Failed to save strategy:", error);
        return { success: false, error: "Failed to save to database" };
    }
}

export async function getStrategies(limit = 20, offset = 0) {
    try {
        const strategies = await prisma.strategy.findMany({
            take: limit,
            skip: offset,
            orderBy: { createdAt: "desc" },
            include: {
                author: {
                    select: { name: true, image: true }
                }
            }
        });

        return strategies.map((s) => ({
          ...s,
          assets: (s.assets || null) as GeneratedAssets | null,
        }));
    } catch (error) {
        console.error("Failed to fetch strategies:", error);
        return [];
    }
}

export async function updateStrategyPerformance(id: string, rating: string, metrics?: any) {
    try {
        await prisma.strategy.update({
            where: { id },
            data: {
                rating: toStrategyRating(rating),
                // Map other metrics if needed, e.g., view count, likes
                // For now, simple rating string
            }
        });
        revalidatePath("/dashboard");
        return { success: true };
    } catch (error) {
        console.error("Failed to update performance:", error);
        return { success: false, error: "Failed to update" };
    }
}
