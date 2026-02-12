import { NextResponse } from "next/server";
import { getTeamPerformance, getColleaguePerformance, generateTeamRecommendations } from "@/utils/analytics-service";
import { authOptions } from "@/utils/auth";
import { HttpError, jsonError, rateLimit, requireSessionForRequest } from "@/utils/request-guard";

export async function GET(req: Request) {
  try {
    const session = await requireSessionForRequest(req, authOptions);
    await rateLimit({ key: `analytics_team:${session.user.id}`, limit: 60, windowMs: 60_000 });

    const teamId = (session.user as any)?.teamId ?? null;
    const [performance, colleagues] = await Promise.all([
      getTeamPerformance({ teamId, authorId: session.user.id }),
      getColleaguePerformance({ teamId, authorId: session.user.id })
    ]);

    // Generate AI insights
    const recommendations = generateTeamRecommendations(performance);

    return NextResponse.json({
      metrics: performance,
      colleagues,
      recommendations
    });
  } catch (error) {
    if (error instanceof HttpError) {
      return jsonError(error.status, error.message, error.code);
    }
    console.error("Team analytics error:", error);
    return NextResponse.json(
      { error: "Failed to fetch team analytics" },
      { status: 500 }
    );
  }
}
