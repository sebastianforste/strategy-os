"use server";

import { prisma } from "@/utils/db";
import { GeneratedAssets } from "@/utils/ai-service";
import { revalidatePath } from "next/cache";

// Type definition for what we receive from the client
export interface CreateStrategyParams {
    input: string;
    assets: GeneratedAssets;
    personaId: string;
    workspaceId?: string; // For future multi-tenancy
}

export async function saveStrategy(params: CreateStrategyParams) {
    try {
        // For now, we hardcode the user/author association until full auth is wired up
        // In a real app, we'd use auth() from NextAuth to get the session
        const placeholderAuthorEmail = "user@example.com"; 

        // Ensure a user exists (simple upsert for dev velocity)
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
                assets: JSON.stringify(params.assets),
                persona: params.personaId,
                authorId: author.id,
                platform: "LINKEDIN", // Default
                isPublished: false,
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

        // Parse assets JSON back to object for the client
        return strategies.map(s => ({
            ...s,
            assets: JSON.parse(s.assets) as GeneratedAssets
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
                rating,
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
