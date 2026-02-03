
import { generateSmartReplies } from "../utils/comment-generator";
import { findHighValueCreators, findEngagementOpportunities } from "../utils/network-graph";

async function verify() {
  console.log("🔥 Verifying Viral Engine...");

  // 1. Test Network Graph
  console.log("\nSearching for high-value creators...");
  const creators = await findHighValueCreators("Business");
  console.log(`Found ${creators.length} creators.`);
  creators.forEach(c => console.log(`- ${c.name} (${c.followers} followers)`));

  // 2. Test Engagement Opportunities
  console.log("\nFetching engagement opportunities...");
  const opps = await findEngagementOpportunities();
  console.log(`Found ${opps.length} opportunities.`);
  
  if (opps.length > 0) {
      // 3. Test Reply Generation
      const targetOpp = opps[0];
      console.log(`\nGenerating replies for: "${targetOpp.postSnippet.substring(0, 30)}..."`);
      
      const replies = await generateSmartReplies(targetOpp.postSnippet, "cso");
      console.log(`Generated ${replies.length} replies:`);
      replies.forEach(r => console.log(`[${r.style.toUpperCase()}] ${r.text}`));

      if (replies.length === 3) {
          console.log("✅ Reply Generation Verified");
      } else {
          console.error("❌ Reply Generation Failed");
      }
  } else {
      console.error("❌ No opportunities found");
  }
}

verify().catch(console.error);
