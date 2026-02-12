
"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "../utils/auth";
import { prisma } from "../utils/db";
import { publishStrategy } from "../utils/publish-engine";

export async function publishPostAction(strategyId: string, platform: "linkedin" | "twitter" = "linkedin") {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

    // 1. Fetch Strategy
    const strategy = await prisma.strategy.findUnique({
        where: { id: strategyId }
    });

    if (!strategy) throw new Error("Strategy not found");
    if (strategy.authorId !== session.user.id) throw new Error("Unauthorized access to strategy");

    // 2. Publish
    if (platform === "linkedin") {
        try {
            const result = await publishStrategy({
              strategyId,
              platform: "LINKEDIN",
              userId: session.user.id,
              content: strategy.content,
            });
            if (result.status === "in_progress") return { success: false, error: "Publish in progress." };
            return { success: true, url: result.url };
        } catch (e: any) {
            console.error("Publish Action Failed", e);
            return { success: false, error: e.message };
        }
    }

    if (platform === "twitter") {
        try {
            const result = await publishStrategy({
              strategyId,
              platform: "TWITTER",
              userId: session.user.id,
              content: strategy.content,
            });
            if (result.status === "in_progress") return { success: false, error: "Publish in progress." };
            return { success: true, url: result.url };
        } catch (e: any) {
            console.error("Twitter Publish Action Failed", e);
            return { success: false, error: e.message };
        }
    }

    return { success: false, error: "Platform not supported yet" };
}
