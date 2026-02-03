import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";
import { AI_CONFIG } from "./config";

export interface CollaborativeArticle {
  id: string;
  title: string;
  category: string; // e.g., "Leadership", "Technology"
  urgency: "High" | "Medium" | "Low"; // Based on recent activity
  currentContributions: number;
  badgePotential: number; // 0-100
}

export interface ContributionDraft {
  articleId: string;
  insight: string; // <750 chars
  angle: string; // "Contrarian", "Personal", "Data-Driven"
}

import { searchGrounding } from "./search-service";

// MOCK: Kept for fallback if search fails
const FAILSAFE_ARTICLES: CollaborativeArticle[] = [
  { id: "1", title: "How do you handle conflict in remote teams?", category: "Leadership", urgency: "High", currentContributions: 12, badgePotential: 95 },
  { id: "2", title: "What is the future of generative AI in marketing?", category: "Technology", urgency: "High", currentContributions: 45, badgePotential: 88 },
];

/**
 * Finds relevant collaborative articles based on the user's niche.
 */
export async function findCollaborativeArticles(topic: string, apiKey: string): Promise<CollaborativeArticle[]> {
  try {
      // 1. Search for real articles
      const query = `site:linkedin.com/pulse "collaborative article" ${topic}`;
      const results = await searchGrounding(query, apiKey, 4);

      if (results.length === 0) return FAILSAFE_ARTICLES;

      // 2. Map to Interface
      return results.map((r, i) => ({
          id: `collab-${Date.now()}-${i}`,
          title: r.title.replace(" | LinkedIn", "").replace("Collaborative Article", "").trim(),
          category: topic,
          urgency: i === 0 ? "High" : "Medium", // Heuristic based on rank
          currentContributions: Math.floor(Math.random() * 50) + 10, // Simulated count
          badgePotential: 95 - (i * 10) // Heuristic: top results have higher potential
      }));

  } catch (e) {
      console.error("Collaborative search failed, using fallback", e);
      return FAILSAFE_ARTICLES;
  }
}

/**
 * Drafts a "Top Voice" worthy contribution for a specific article.
 */
export async function draftContribution(
  articleTitle: string, 
  userNiche: string, 
  apiKey: string
): Promise<ContributionDraft> {
  const google = createGoogleGenerativeAI({ apiKey });

  const prompt = `
    TASK: Write a contribution for a LinkedIn Collaborative Article to earn a "Top Voice" badge.
    
    ARTICLE TITLE: "${articleTitle}"
    USER NICHE: "${userNiche}"
    
    CONSTRAINTS:
    1. Length: Under 750 characters (Strict).
    2. Tone: Authoritative, experienced, and slightly contrarian.
    3. Structure: 
       - Start with a direct "Hook" (Disagree or reframe).
       - Give ONE specific example or data point.
       - End with a short takeaway.
    4. NO FLUFF. No "It depends". Be specific.
    
    OUTPUT JSON:
    {
      "insight": "...",
      "angle": "Contrarian"
    }
  `;

  try {
    const { text } = await generateText({
      model: google(AI_CONFIG.primaryModel),
      prompt,
    });

    const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const result = JSON.parse(cleaned);
    
    return {
      articleId: "generated",
      insight: result.insight,
      angle: result.angle
    };

  } catch (e) {
    console.error("Contribution drafting failed", e);
    return {
      articleId: "error",
      insight: "Error generating insight. Please try again.",
      angle: "Error"
    };
  }
}
