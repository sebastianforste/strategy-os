import { NextResponse } from "next/server";
import { getTeamPerformance, getColleaguePerformance, generateTeamRecommendations } from "@/utils/analytics-service";

export async function GET() {
  try {
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
    console.error("Team analytics error:", error);
    return NextResponse.json(
      { error: "Failed to fetch team analytics" },
      { status: 500 }
    );
  }
}
