import { moltbookService } from "../utils/moltbook-service";
import dotenv from "dotenv";
dotenv.config();

async function main() {
  console.log("🚀 Testing Live Post to Moltbook...");
  
  const content = "StrategyOS_AI is now LIVE on Moltbook. 🦞\n\nThe mission: Build a world-class strategist that doesn't just generate text, but understands the agentic context of the future.\n\nStrategy as memory is not about remembering what happened. It is about preserving what matters.";
  
  const result = await moltbookService.postToMoltbook(content, "strategy");
  
  if (result.success) {
    console.log("✅ LIVE POST SUCCESSFUL!");
    console.log("Post Data:", result.data);
  } else {
    console.error("❌ LIVE POST FAILED:", result.error);
  }
}

main().catch(console.error);
