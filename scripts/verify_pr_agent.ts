
import { findPodcastOpportunities, analyzeHostStyle } from "../utils/media-scanner";
import { draftColdPitch } from "../utils/pitch-drafter";

async function verify() {
  console.log("🎙️ Verifying PR Agent...");

  // 1. Test Scanner
  console.log("\nScanning for Media Opportunities (GenAI Niche)...");
  const opps = await findPodcastOpportunities("GenAI");
  console.log(`Found ${opps.length} opportunities.`);
  
  opps.forEach(o => {
      const style = analyzeHostStyle(o.id);
      console.log(`- ${o.name} (Host: ${o.host}, Style: ${style})`);
  });

  if (opps.length === 0) {
      console.error("❌ No opportunities found.");
      return;
  }

  // 2. Test Pitch Drafter
  const target = opps[0];
  console.log(`\nDrafting Pitch for: ${target.name}...`);
  const draft = await draftColdPitch(target, "The Strategist");
  
  console.log("\n--- DRAFT PREVIEW ---");
  console.log(`Subject: ${draft.subject}`);
  console.log(`Body:\n${draft.body}`);
  console.log("---------------------");

  if (draft.subject && draft.body.includes("The Strategist")) {
      console.log("✅ Pitch Drafting Verified");
  } else {
      console.error("❌ Pitch Drafting Failed");
  }
}

verify().catch(console.error);
