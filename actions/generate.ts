import { generateContent, GeneratedAssets } from "../utils/ai-service";
import { applyAntiRobotFilter } from "../utils/text-processor";
import { findTrends } from "../utils/search-service";
import { generateImage } from "../utils/image-service";
import { PersonaId } from "../utils/personas";
import { searchCompetitorContent, generateTrendReport, CompetitorContent, TrendReport } from "../utils/trend-service";

export async function analyzeCompetitorAction(
    name: string, 
    serperKey?: string
): Promise<CompetitorContent[]> {
    if (!serperKey) return [];
    return await searchCompetitorContent(name, serperKey);
}

export async function deepDiveAction(
    topic: string, 
    geminiKey: string
): Promise<TrendReport> {
    if (!geminiKey) throw new Error("API Key missing");
    return await generateTrendReport(topic, geminiKey);
}


export async function processInput(
  input: string,
  apiKeys: { gemini: string; serper?: string; openai?: string },
  personaId: PersonaId = "cso",
  forceTrends: boolean = false
): Promise<GeneratedAssets> { // GeneratedAssets is { textPost, imagePrompt, videoScript, imageUrl? }
  if (!input) throw new Error("Input required");
  if (!apiKeys.gemini) throw new Error("Gemini API Key required");

  // Sanitize key (trim whitespace)
  const geminiKey = apiKeys.gemini.trim();
  console.log(`[Server Action] Key length: ${geminiKey.length}`);
  console.log(`[Server Action] Persona: ${personaId}, Newsjack: ${forceTrends}`);

  let enrichedInput = input;

  // 1. Trend Hunting Check
  // If Force Trends is ON OR input is short (< 100 chars)
  if (forceTrends || (input.length < 100 && !input.includes("\n"))) {
    try {
      const trends = await findTrends(input, apiKeys.serper);
      if (trends.length > 0) {
        const primaryTrend = trends[0];
        enrichedInput = `
        TOPIC: ${input}
        CONTEXT FROM NEWS: "${primaryTrend.title}" - ${primaryTrend.snippet} (${primaryTrend.source})
        
        Using this news, generate the assets linking it to a timeless business principle.
        `;
      }
    } catch (e) {
      console.warn("Trend hunting failed or skipped:", e);
      // Fallback to treating input as the prompt directly
    }
  }

  // 2. AI Generation
  const rawAssets = await generateContent(enrichedInput, geminiKey, personaId, apiKeys.openai);

  // 2b. Image Generation (Optional if OpenAI key present)
  let imageUrl = "";
  if (apiKeys.openai && rawAssets.imagePrompt) {
    try {
        console.log("Generating Real Image with DALL-E 3...");
        imageUrl = await generateImage(rawAssets.imagePrompt, apiKeys.openai.trim());
    } catch (e) {
        console.error("Image generation failed:", e);
        // We don't fail the whole request, just leave imageUrl empty
    }
  }

  // 3. Anti-Robot Filter
  // Apply strictly to the text post.
  const filteredText = applyAntiRobotFilter(rawAssets.textPost);

  return {
    ...rawAssets,
    textPost: filteredText,
    imageUrl // Return the URL (or empty string)
  };
}
