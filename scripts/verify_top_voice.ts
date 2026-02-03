
import { calculateTopVoiceScore } from "../utils/authority-scorer";
import { findCollaborativeArticles } from "../utils/collaborative-agent";

async function verify() {
  console.log("🔍 Verifying Top Voice Engine...");

  // 1. Test Scorer
  const posts = [
    "AI Strategy is key to growth.",
    "Marketing AI is the future.",
    "Leadership in the age of AI.",
    "Sales AI tools are booming.",
    "AI Agents will replace dashboards."
  ];

  console.log("\nTesting Consistency Score...");
  const score = calculateTopVoiceScore(posts);
  console.log("Score Result:", score);
  
  if (score.consistencyScore > 0 && score.topTopics.length > 0) {
      console.log("✅ Scorer Verified");
  } else {
      console.error("❌ Scorer Failed");
  }

  // 2. Test Collaborative Agent
  console.log("\nTesting Collaborative Agent...");
  const articles = await findCollaborativeArticles("AI");
  console.log("Articles Found:", articles.length);
  articles.forEach(a => console.log(`- ${a.title} (Badge Potential: ${a.badgePotential}%)`));

  if (articles.length > 0) {
      console.log("✅ Agent Verified");
  } else {
      console.error("❌ Agent Failed");
  }
}

verify().catch(console.error);
