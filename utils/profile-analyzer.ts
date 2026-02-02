import { GoogleGenAI } from "@google/genai";
import { Persona } from "./personas";

const PRIMARY_MODEL = process.env.NEXT_PUBLIC_GEMINI_PRIMARY_MODEL || "models/gemini-1.5-flash";

/**
 * PROFILE ANALYZER (THE CLONE ENGINE)
 * Extract persona traits from raw profile text.
 */
export async function analyzeProfile(
  profileText: string, 
  apiKey: string,
  baseId: string = "custom"
): Promise<Persona | null> {
  if (!profileText || !apiKey) return null;

  const genAI = new GoogleGenAI({ apiKey });
  
  const prompt = `
    Analyze the following social media profile text / bio / posts to reconstruct the author's "Persona".
    
    PROFILE DATA:
    """
    ${profileText.substring(0, 5000)}
    """
    
    EXTRACT THE FOLLOWING JSON:
    {
      "name": "Short descriptive name (e.g. 'The Growth Hacker')",
      "role": "Professional Role",
      "voice": "3-word description of tone (e.g. 'Punchy, Direct, Contrarian')",
      "instructions": "Specific writing instructions based on their style (max 2 sentences). Mention formatting quirks or phrase habits.",
      "topics": ["Topic 1", "Topic 2", "Topic 3"]
    }
  `;

  try {
    const result = await genAI.models.generateContent({
      model: PRIMARY_MODEL,
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });

    const data = JSON.parse(result.text || "{}");
    
    if (!data.name) return null;

    return {
      id: `${baseId}-${Date.now()}`,
      name: data.name,
      role: data.role,
      description: data.voice,
      systemPrompt: `You are ${data.name}, a ${data.role}. Your voice is ${data.voice}. ${data.instructions}. Focus on these topics: ${data.topics.join(", ")}.`,
      topics: data.topics
    };
  } catch (e) {
    console.error("Profile analysis failed:", e);
    return null;
  }
}
