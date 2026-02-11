import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/utils/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/auth";
import { HistoryItem } from "@/utils/history-service";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { historyItems } = await req.json() as { historyItems: HistoryItem[] };

    if (!historyItems || !Array.isArray(historyItems)) {
      return NextResponse.json({ error: "Invalid history items" }, { status: 400 });
    }

    let migrated = 0;
    let failed = 0;

    for (const item of historyItems) {
      try {
        await prisma.strategy.create({
          data: {
            id: item.id,
            content: item.assets.textPost || "Untitled Strategy",
            title: item.input.substring(0, 50) + (item.input.length > 50 ? "..." : ""),
            platform: "LINKEDIN",
            persona: item.personaId || "cso",
            input: item.input,
            assets: JSON.stringify(item.assets),
            rating: item.performance?.rating || null,
            impressions: item.performance?.engagement?.impressions || 0,
            engagement: (item.performance?.engagement?.likes || 0) + (item.performance?.engagement?.comments || 0),
            saves: 0,
            shares: item.performance?.engagement?.shares || 0,
            status: "DRAFT",
            isPublished: false,
            authorId: session.user.id,
            createdAt: new Date(item.createdAt),
          },
        });
        migrated++;
      } catch (e) {
        console.error("Failed to migrate item:", item.id, e);
        failed++;
      }
    }

    return NextResponse.json({
      success: true,
      migrated,
      failed,
      message: `Migrated ${migrated} items, ${failed} failed.`
    });
  } catch (error) {
    console.error("Migration API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
