
import { generateHooks } from "../utils/hook-lab";
import dotenv from "dotenv";
dotenv.config({ path: '.env.local' });
dotenv.config(); // Fallback to .env if needed (dotenv won't overwrite existing keys)

const GEMINI_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY || process.env.GEMINI_KEY;

async function main() {
  if (!GEMINI_KEY) {
      console.error("❌ No GEMINI_API_KEY found.");
      process.exit(1);
  }

  console.log("🪝 Testing Hook Lab...");
  const topic = "Remote Work Productivity";

  const hooks = await generateHooks(topic, GEMINI_KEY);

  console.log(`\nTopic: "${topic}"\n`);
  if (hooks.length === 0) {
      console.error("❌ Failed to generate hooks");
      process.exit(1);
  }

  hooks.forEach((hook, i) => {
      console.log(`${i+1}. [${hook.style}] "${hook.text}" (CTR: ${hook.ctr}%, Attention: ${hook.attention}%)`);
  });

  if (hooks.length !== 5) {
      console.warn("⚠️ Warning: Expected 5 hooks, got", hooks.length);
  } else {
      console.log("\n✅ Hook Lab Verified!");
  }
}

main().catch(console.error);
