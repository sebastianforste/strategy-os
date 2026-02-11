import dotenv from "dotenv";
import path from "path";
import fs from "fs";

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), ".env") });

// Mock server-only
global.Symbol = global.Symbol || (Symbol as any);
(global as any).Symbol.for = (global as any).Symbol.for || (() => ({}));

import { 
    processInput, 
    generateCommentAction, 
    scoreViralityAction, 
    refineAuthorityAction 
} from "../actions/generate";

async function runTests() {
  const geminiKey = process.env.GOOGLE_GEMINI_API_KEY || "";
  if (!geminiKey) {
    console.error("❌ GOOGLE_GEMINI_API_KEY missing from .env");
    process.exit(1);
  }

  const testTopic = "The Future of AI Strategy in 2027: From Copilots to Autonomous Agents";
  console.log(`\n🚀 Testing [processInput] with topic: "${testTopic}"...`);
  
  try {
    const assets = await processInput(
      testTopic,
      { gemini: geminiKey },
      "cso",
      true // force trends
    );

    console.log("✅ processInput SUCCESS");
    console.log("--- TEXT POST PREVIEW ---");
    console.log(assets.textPost.substring(0, 500) + "...");
    console.log("------------------------");

    console.log("\n🚀 Testing [scoreViralityAction]...");
    const virality = await scoreViralityAction(assets.textPost, geminiKey, "cso");
    console.log(`✅ scoreViralityAction SUCCESS. Score: ${virality.score}/100`);

    console.log("\n🚀 Testing [refineAuthorityAction]...");
    const refined = await refineAuthorityAction(assets.textPost, geminiKey, "cso");
    console.log("✅ refineAuthorityAction SUCCESS");
    console.log("--- REFINED TEXT PREVIEW ---");
    console.log(refined.substring(0, 500) + "...");
    console.log("----------------------------");

    console.log("\n🚀 Testing [generateCommentAction]...");
    const mockPost = "AI is just a tool. It will never replace human strategy.";
    const comment = await generateCommentAction(mockPost, "Contrarian", geminiKey, "cso");
    console.log("✅ generateCommentAction SUCCESS");
    console.log(`Reply: "${comment}"`);

    console.log("\n🎉 ALL FUNCTIONAL TESTS COMPLETED SUCCESSFULLY!");
  } catch (error) {
    console.error("❌ Test failed:", error);
    process.exit(1);
  }
}

runTests();
