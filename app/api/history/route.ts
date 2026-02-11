import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/utils/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const strategies = await prisma.strategy.findMany({
      where: {
        authorId: session.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Map back to HistoryItem format for frontend compatibility
    const history = strategies.map(s => ({
      id: s.id,
      createdAt: s.createdAt.getTime(),
      input: s.input,
      personaId: s.persona,
      assets: JSON.parse(s.assets || "{}"),
      performance: {
          rating: s.rating as any,
          engagement: {
              likes: (s.engagement || 0) as number, // Simplified mapping
              comments: 0,
              shares: s.shares || 0,
              impressions: s.impressions || 0,
          },
          markedAt: s.updatedAt.getTime()
      }
    }));

    return NextResponse.json({ success: true, history });
  } catch (error) {
    console.error("History API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
