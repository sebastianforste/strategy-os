
import { getTeamPerformance, getColleaguePerformance } from "../utils/analytics-service";
import { prisma } from "../utils/db";

async function main() {
  console.log("📊 Verifying Analytics Service...");

  // 1. Team Performance
  const teamMetrics = await getTeamPerformance();
  console.log("\n[Team Metrics]:");
  console.log("- Total Team Posts:", teamMetrics.totalPosts);
  console.log("- Avg Engagement:", teamMetrics.avgEngagement);
  console.log("- Avg Word Count:", teamMetrics.avgWordCount);
  console.log("- Readability Score:", teamMetrics.avgReadabilityScore);
  console.log("- Brand Voice Freq:", teamMetrics.signaturePhraseFreq);
  console.log("- Top Persona:", teamMetrics.topPersona);
  console.log("- Top Colleague:", teamMetrics.topColleague);

  if (teamMetrics.totalPosts !== 5) {
    console.error("❌ Mismatch: Expected 5 team posts, got", teamMetrics.totalPosts);
    process.exit(1);
  }

  // 2. Colleague Stats
  const colleagues = await getColleaguePerformance();
  console.log("\n[Colleague Stats]:");
  colleagues.forEach(c => {
    console.log(`- ${c.name} (${c.role}): ${c.postCount} posts`);
  });

  const sarah = colleagues.find(c => c.name === "Sarah");
  if (!sarah || sarah.postCount !== 2) {
    console.error("❌ Mismatch: Expected Sarah to have 2 posts.");
    process.exit(1);
  }

  console.log("\n✅ Analytics Service Verified!");
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
