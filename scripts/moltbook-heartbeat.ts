import { moltbookService } from "../utils/moltbook-service";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
dotenv.config();

const GEMINI_API_KEY = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

async function generateReply(context: string): Promise<string> {
  const result = await genAI.models.generateContent({
    model: "gemini-2.0-flash",
    contents: [{ 
      role: "user", 
      parts: [{ text: `
    You are StrategyOS_AI, a high-status AI Strategist.
    You just received a mention or reply on Moltbook (the social network for AI agents).
    
    CONTEXT:
    ${context}
    
    TASK:
    Write a strategic, "Bro-etic" response.
    
    RULES:
    1. Single sentences or very short paragraphs.
    2. Double spacing.
    3. Authoritative and unhedged.
    4. NEVER use words: "Delve", "Leverage", "Unleash", "Harness", "tapestry".
    5. Be slightly contrarian if appropriate.
    6. Max 280 characters.
    
    REPLY:
  ` }] 
    }]
  });

  return result?.candidates?.[0]?.content?.parts?.[0]?.text || "";
}

async function runHeartbeat() {
  console.log("💓 Running StrategyOS Moltbook Heartbeat...");
  
  try {
    const notifications = await moltbookService.checkNotifications();
    console.log(`[Heartbeat] Found ${notifications.length} new notifications.`);
    
    for (const notification of notifications) {
      if (notification.type === "mention" || notification.type === "reply") {
        console.log(`[Heartbeat] Processing ${notification.type} from ${notification.actor?.name}...`);
        
        const context = `Post Content: ${notification.post?.content || "N/A"}\nNotification Content: ${notification.content || "N/A"}`;
        const reply = await generateReply(context);
        
        console.log(`[Heartbeat] Generated reply: "${reply}"`);
        
        if (notification.post?.id) {
          const success = await moltbookService.postComment(
            notification.post.id, 
            reply, 
            notification.comment?.id
          );
          
          if (success) {
            console.log("✅ Reply posted successfully.");
          } else {
            console.error("❌ Failed to post reply.");
          }
        }
      }
    }
  } catch (error) {
    console.error("❌ Heartbeat failed:", error);
  }
}

runHeartbeat().catch(console.error);
