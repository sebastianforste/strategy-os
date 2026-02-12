import { NextResponse } from "next/server";
import { getTeamPerformance, getColleaguePerformance, generateTeamRecommendations } from "@/utils/analytics-service";
import { authOptions } from "@/utils/auth";
import { HttpError, jsonError, rateLimit, requireSession } from "@/utils/request-guard";

export async function GET() {
  try {
    await requireSession(authOptions);
    rateLimit({ key: "analytics_team", limit: 60, windowMs: 60_000 });

    const [performance, colleagues] = await Promise.all([
      getTeamPerformance(),
      getColleaguePerformance()
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
