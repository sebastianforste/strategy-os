import { GoogleGenAI } from "@google/genai";
import { AI_CONFIG } from "./config";

export interface SmartReply {
  id: string;
  text: string;
  style: "supporter" | "contrarian" | "extender";
  confidence: number;
}

const PRIMARY_MODEL = AI_CONFIG.primaryModel;

export async function generateSmartReplies(postContent: string, personaId: string, apiKey?: string): Promise<SmartReply[]> {
  if (!apiKey || apiKey === "demo") {
      // Fallback for demo mode
      return [
        { id: "1", text: "Spot on. Execution beats strategy every time.", style: "supporter", confidence: 0.95 },
        { id: "2", text: "I'd argue effectiveness matters more than efficiency here.", style: "contrarian", confidence: 0.88 },
        { id: "3", text: "This also applies heavily to remote teams.", style: "extender", confidence: 0.92 }
      ];
  }

  const prompt = `
    Task: Generate 3 deeply strategic, high-status LinkedIn/X replies to the following post.
    
    POST: "${postContent}"
    
    PERSONA ID: ${personaId} (Act as a Senior Strategy Consultant)
    
    OUTPUT REQUIREMENTS:
    1. Reply 1 (Supporter): Agree but upgrade the insight.
    2. Reply 2 (Contrarian): Politely challenge a premise or add nuance.
    3. Reply 3 (Extender): Connect the idea to a broader trend.
    
    Format: JSON Array with keys: "text", "style" (must be "supporter", "contrarian", or "extender"), "confidence" (0-1).
    Keep replies under 280 characters. No hashtags.
  `;

  try {
      const genAI = new GoogleGenAI({ apiKey });
      const result = await genAI.models.generateContent({
          model: PRIMARY_MODEL,
          contents: prompt,
          config: {
             responseMimeType: "application/json"
          }
      });

      const jsonText = result.text || "[]";
      const data = JSON.parse(jsonText);
      
      return data.map((item: any, i: number) => ({
          id: `reply-${Date.now()}-${i}`,
          text: item.text,
          style: item.style,
          confidence: item.confidence
      }));

  } catch (e) {
      console.error("Failed to generate smart replies", e);
      return [
        { id: "err1", text: "Great insight!", style: "supporter", confidence: 0.5 },
        { id: "err2", text: "Interesting perspective.", style: "contrarian", confidence: 0.5 },
        { id: "err3", text: "Thanks for sharing.", style: "extender", confidence: 0.5 }
      ];
  }
}
