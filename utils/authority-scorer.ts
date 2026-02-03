
/**
 * AUTHORITY SCORER 📈
 * -------------------
 * Analyzes content to determine the "Executive Presence" and seniority level.
 * High authority content features:
 * - Rhythmic variance (mixed sentence lengths)
 * - High lexical density (meat over fluff)
 * - Active voice
 * - Data anchors (numbers/evidence)
 */

export interface AuthorityScore {
  score: number; // 0-100
  level: string; // e.g., "CSO", "Director", "Manager"
  breakdown: {
    rhythm: number;
    density: number;
    activity: number;
    anchors: number;
  };
  suggestions: string[];
}

const STOP_WORDS = new Set(["the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for", "with", "is", "are", "was", "were", "of", "it", "this", "that"]);

export function calculateAuthorityScore(text: string): AuthorityScore {
  if (!text || text.length < 10) {
    return { score: 0, level: "N/A", breakdown: { rhythm: 0, density: 0, activity: 0, anchors: 0 }, suggestions: ["Write more to get a score."] };
  }

  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const words = text.toLowerCase().match(/\w+/g) || [];
  const totalWords = words.length;

  if (totalWords === 0) return { score: 0, level: "N/A", breakdown: { rhythm: 0, density: 0, activity: 0, anchors: 0 }, suggestions: [] };

  // 1. Rhythmic Variance (Sentence Length Std Dev)
  const sentenceLens = sentences.map(s => s.trim().split(/\s+/).length);
  const avgLen = sentenceLens.reduce((a, b) => a + b, 0) / (sentenceLens.length || 1);
  const variance = sentenceLens.reduce((a, b) => a + Math.pow(b - avgLen, 2), 0) / (sentenceLens.length || 1);
  const stdDev = Math.sqrt(variance);
  // Normalize rhythm: stdDev of 5-10 is good. We'll cap at 15.
  const rhythmScore = Math.min(100, (stdDev / 10) * 100);

  // 2. Lexical Density
  const contentWords = words.filter(w => !STOP_WORDS.has(w));
  const uniqueWords = new Set(contentWords).size;
  const densityScore = Math.min(100, (uniqueWords / totalWords) * 150); // Factor of 150 for normalization

  // 3. Active Voice vs Passive Voice (Simple Regex Check)
  const passivePatterns = /\b(is|are|was|were|be|been|being)\s+\w+ed\b/gi;
  const passiveMatches = text.match(passivePatterns) || [];
  const activityScore = Math.max(0, 100 - (passiveMatches.length * 15));

  // 4. Data Anchors (Numbers, Percentages, Dollars)
  const anchorPatterns = /\b\d+(\.\d+)?%?|\$\d+|\b(increase|decrease|growth|revenue|profit|margin)\b/gi;
  const anchorMatches = text.match(anchorPatterns) || [];
  const anchorScore = Math.min(100, (anchorMatches.length / Math.sqrt(totalWords)) * 100);

  // Final Weighted Score
  const finalScore = Math.round(
    (rhythmScore * 0.3) +
    (densityScore * 0.3) +
    (activityScore * 0.2) +
    (anchorScore * 0.2)
  );

  let level = "Junior";
  if (finalScore > 85) level = "CSO / CEO";
  else if (finalScore > 70) level = "VP / Head of";
  else if (finalScore > 50) level = "Director";
  else if (finalScore > 30) level = "Manager";

  const suggestions: string[] = [];
  if (stdDev < 3) suggestions.push("Vary your sentence lengths to create rhythm.");
  if (densityScore < 40) suggestions.push("Reduce fluff words and use more specific nouns.");
  if (passiveMatches.length > 2) suggestions.push("Convert passive voice to active voice for more punch.");
  if (anchorMatches.length < 1) suggestions.push("Anchor your claims with data or specific evidence.");

  return {
    score: finalScore,
    level,
    breakdown: {
      rhythm: Math.round(rhythmScore),
      density: Math.round(densityScore),
      activity: Math.round(activityScore),
      anchors: Math.round(anchorScore)
    },
    suggestions
  };
}

/**
 * DEEP SCAN AUTHORITY (AI Enhanced)
 * ---------------------------------
 * Uses Gemini to analyze tone, uniqueness, and "Thought Leadership" markers
 * that regex cannot catch.
 */
export async function deepScanAuthority(text: string, apiKey: string): Promise<{ aiScore: number; aiAnalysis: string }> {
  if (!apiKey || apiKey === "demo") return { aiScore: 0, aiAnalysis: "AI Analysis unavailable in demo mode." };

  const { GoogleGenAI } = await import("@google/genai"); // Dynamic import
  const genAI = new GoogleGenAI({ apiKey });
  
  const prompt = `
    Analyze the following text for "Executive Presence" and "Thought Leadership".
    Ignore grammar. Focus on:
    1. Uniqueness of insight (not generic advice).
    2. Confidence of tone (no hedging).
    3. Structural logic.
    
    TEXT: "${text.substring(0, 500)}..."
    
    Return JSON:
    {
        "score": 0-100,
        "analysis": "1 sentence critique"
    }
  `;

  try {
      const result = await genAI.models.generateContent({
          model: "gemini-2.0-flash-exp", // Fast model
          contents: prompt
      });
      const json = JSON.parse(result.text?.replace(/```json|```/g, "").trim() || "{}");
      return { aiScore: json.score || 0, aiAnalysis: json.analysis || "Analysis failed." };
  } catch (e) {
      return { aiScore: 0, aiAnalysis: "AI Scan failed." };
  }
}

/**
 * TOP VOICE SCORER 🏅
 * -------------------
 * Calculates eligibility for the "Top Voice" badge based on:
 * 1. Niche Consistency (Are recent posts about the same topics?)
 * 2. Engagement Depth (Mock: Are they detailed?)
 */
export interface TopVoiceScore {
    consistencyScore: number; // 0-100
    topTopics: string[]; // ["Strategy", "AI"]
    badgeEligibility: "Gold" | "Orange" | "None";
    nextSteps: string[];
}

export function calculateTopVoiceScore(posts: string[]): TopVoiceScore {
    if (!posts || posts.length === 0) {
        return { consistencyScore: 0, topTopics: [], badgeEligibility: "None", nextSteps: ["Start posting to track consistency."] };
    }

    // 1. Extract Keywords/Tags (Simple Mock Extraction)
    // In production, use NLP. Here, we just count standard business terms.
    const KEYWORDS = ["strategy", "marketing", "leadership", "sales", "ai", "tech", "finance", "startup", "growth"];
    const allText = posts.join(" ").toLowerCase();
    
    const topicCounts: Record<string, number> = {};
    KEYWORDS.forEach(k => {
        const matches = (allText.match(new RegExp(`\\b${k}\\b`, "gi")) || []).length;
        if (matches > 0) topicCounts[k] = matches;
    });

    const sortedTopics = Object.entries(topicCounts)
        .sort(([, a], [, b]) => b - a)
        .map(([k]) => k);

    // 2. Consistency Score
    // If top topic appears in >50% of posts, high consistency.
    // (Mocking logic based on total keyword density vs post count)
    const topTopicCount = sortedTopics.length > 0 ? topicCounts[sortedTopics[0]] : 0;
    const avgMentions = topTopicCount / posts.length; // e.g., 5 mentions / 5 posts = 1.0
    
    // Cap at 100
    const consistencyScore = Math.min(100, Math.round(avgMentions * 50)); 

    // 3. Badge Logic
    let badge: "Gold" | "Orange" | "None" = "None";
    if (consistencyScore > 80 && posts.length >= 10) badge = "Gold";
    else if (consistencyScore > 50 && posts.length >= 5) badge = "Orange";

    const nextSteps = [];
    if (posts.length < 5) nextSteps.push(`Draft ${5 - posts.length} more posts to establish a baseline.`);
    if (consistencyScore < 60) nextSteps.push(`Focus more strictly on your top topic: "${sortedTopics[0] || 'your niche'}".`);
    else nextSteps.push("You are highly consistent. Maintain this streak.");

    return {
        consistencyScore,
        topTopics: sortedTopics.slice(0, 3),
        badgeEligibility: badge,
        nextSteps
    };
}
