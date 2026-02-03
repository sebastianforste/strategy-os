
import { getTeamPerformance, getColleaguePerformance, generateTeamRecommendations } from "../../utils/analytics-service";
import { prisma } from "../../utils/db";

async function verifyAnalytics() {
  console.log("🧪 Verifying Team Analytics Service...");

  try {
    // 1. Fetch Team Performance
    console.log("Fetching Team Performance...");
    const performance = await getTeamPerformance();
    console.log("✅ Team Performance:", JSON.stringify(performance, null, 2));

    if (typeof performance.totalPosts !== 'number') throw new Error("Invalid structure: totalPosts missing");

    // 2. Fetch Colleague Stats
    console.log("\nFetching Colleague Stats...");
    const colleagues = await getColleaguePerformance();
    console.log("✅ Colleagues:", JSON.stringify(colleagues, null, 2));

    // 3. Generate Recommendations
    console.log("\nGenerating Recommendations...");
    const recs = generateTeamRecommendations(performance);
    console.log("✅ Recommendations:", recs);

    console.log("\n✨ Verification Successful!");
  } catch (error) {
    console.error("❌ Verification Failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

verifyAnalytics();
