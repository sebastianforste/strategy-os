import { getHistory, PerformanceRating } from "./history-service";

export interface AnalyticsStats {
  totalPosts: number;
  ratedPosts: number;
  avgRating: number;
  topPersona: string | null;
  topHooks: string[];
  personaStats: { [key: string]: { total: number; avgRating: number } };
  ratingDistribution: { [key in Exclude<PerformanceRating, null>]: number };
}

export interface ViralityScore {
  score: number; //  0-100
  factors: {
    hookType: number; // 0-25
    length: number; // 0-25
    structure: number; // 0-25
    engagement: number; // 0-25
  };
  suggestions: string[];
}

// ==================== Analytics Computation ====================

export function getAnalyticsStats(): AnalyticsStats {
  const history = getHistory();
  const ratedPosts = history.filter((item) => item.performance?.rating);

  const ratingDistribution = {
    viral: 0,
    good: 0,
    meh: 0,
    flopped: 0,
  };

  ratedPosts.forEach((item) => {
    const rating = item.performance!.rating!;
    ratingDistribution[rating]++;
  });

  // Calculate average rating (viral=4, good=3, meh=2, flopped=1)
  const ratingValues = { viral: 4, good: 3, meh: 2, flopped: 1 };
  const avgRating =
    ratedPosts.length > 0
      ? ratedPosts.reduce(
          (sum, item) => sum + ratingValues[item.performance!.rating!],
          0
        ) / ratedPosts.length
      : 0;

  // Get top hooks from viral/good posts
  const topRatedPosts = history
    .filter(
      (item) =>
        item.performance?.rating === "viral" ||
        item.performance?.rating === "good"
    )
    .sort((a, b) => {
      const aVal = a.performance!.rating === "viral" ? 4 : 3;
      const bVal = b.performance!.rating === "viral" ? 4 : 3;
      return bVal - aVal;
    })
    .slice(0, 5);

  const topHooks = topRatedPosts.map((item) => {
    const firstLine = item.assets.textPost.split("\n")[0];
    return firstLine.substring(0, 100);
  });

  // Persona statistics (would need to track persona in history)
  // For now, returning placeholder
  const personaStats = {};

  return {
    totalPosts: history.length,
    ratedPosts: ratedPosts.length,
    avgRating,
    topPersona: null,
    topHooks,
    personaStats,
    ratingDistribution,
  };
}

// ==================== Virality Prediction ====================

export function predictVirality(text: string): ViralityScore {
  const factors = {
    hookType: 0,
    length: 0,
    structure: 0,
    engagement: 0,
  };

  const suggestions: string[] = [];

  // Factor 1: Hook Type (25 points)
  const firstLine = text.split("\n")[0].trim();
  const lowerFirst = firstLine.toLowerCase();

  if (lowerFirst.includes("?")) {
    factors.hookType = 25; // Questions perform well
  } else if (
    lowerFirst.startsWith("most") ||
    lowerFirst.startsWith("everyone") ||
    lowerFirst.startsWith("nobody")
  ) {
    factors.hookType = 20; // Contrarian statements
  } else if (lowerFirst.startsWith("i ")) {
    factors.hookType = 18; // Personal stories
  } else if (/\d/.test(firstLine)) {
    factors.hookType = 15; // Numbers/stats
  } else {
    factors.hookType = 10;
    suggestions.push("Consider starting with a question or contrarian statement");
  }

  // Factor 2: Length (25 points)
  const charCount = text.length;
  if (charCount >= 200 && charCount <= 500) {
    factors.length = 25; // Sweet spot
  } else if (charCount >= 150 && charCount < 200) {
    factors.length = 20;
  } else if (charCount >= 500 && charCount <= 700) {
    factors.length = 20;
  } else if (charCount < 150) {
    factors.length = 10;
    suggestions.push("Post is too short. Aim for 200-500 characters.");
  } else {
    factors.length = 15;
    suggestions.push("Post might be too long. Consider splitting into parts.");
  }

  // Factor 3: Structure (25 points)
  const lines = text.split("\n").filter((l) => l.trim().length > 0);
  const hasShortLines = lines.some((l) => l.length <= 80);
  const hasLineBreaks = lines.length >= 5;
  const hasBullets = text.includes("-") || text.includes("•");

  let structureScore = 0;
  if (hasShortLines) structureScore += 10;
  if (hasLineBreaks) structureScore += 10;
  if (hasBullets) structureScore += 5;

  factors.structure = structureScore;

  if (structureScore < 15) {
    suggestions.push("Break text into shorter lines for better readability");
  }

  // Factor 4: Engagement Triggers (25 points)
  const engagementWords = [
    "you",
    "your",
    "why",
    "how",
    "secret",
    "mistake",
    "truth",
    "lesson",
  ];
  const lowerText = text.toLowerCase();
  const triggersFound = engagementWords.filter((word) =>
    lowerText.includes(word)
  ).length;

  factors.engagement = Math.min(triggersFound * 5, 25);

  if (factors.engagement < 15) {
    suggestions.push('Add engagement triggers like "you", "why", "secret"');
  }

  // Calculate total score
  const score = Object.values(factors).reduce((sum, val) => sum + val, 0);

  return {
    score,
    factors,
    suggestions,
  };
}

// ==================== Pattern Analysis ====================

export function getSuccessPatterns(): {
  bestHookTypes: string[];
  bestLength: { min: number; max: number };
  bestTimes: string[];
} {
  const history = getHistory();
  const viralPosts = history.filter(
    (item) => item.performance?.rating === "viral"
  );

  // Analyze hooks
  const hookTypes: { [key: string]: number } = {};
  viralPosts.forEach((item) => {
    const firstLine = item.assets.textPost.split("\n")[0].toLowerCase();
    if (firstLine.includes("?")) {
      hookTypes["question"] = (hookTypes["question"] || 0) + 1;
    } else if (firstLine.startsWith("most") || firstLine.startsWith("everyone")) {
      hookTypes["contrarian"] = (hookTypes["contrarian"] || 0) + 1;
    } else if (firstLine.startsWith("i ")) {
      hookTypes["personal"] = (hookTypes["personal"] || 0) + 1;
    }
  });

  const bestHookTypes = Object.entries(hookTypes)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([type]) => type);

  // Analyze length
  const lengths = viralPosts.map((item) => item.assets.textPost.length);
  const avgLength =
    lengths.length > 0
      ? lengths.reduce((sum, len) => sum + len, 0) / lengths.length
      : 300;

  const bestLength = {
    min: Math.floor(avgLength * 0.8),
    max: Math.floor(avgLength * 1.2),
  };

  // Placeholder for timing analysis (would need real post timestamps)
  const bestTimes = ["9:00 AM", "12:00 PM", "5:00 PM"];

  return {
    bestHookTypes,
    bestLength,
    bestTimes,
  };
}

// ==================== Performance Insights ====================

export function getPerformanceInsights(): string[] {
  const stats = getAnalyticsStats();
  const insights: string[] = [];

  if (stats.ratedPosts === 0) {
    insights.push("Start rating your posts to unlock insights!");
    return insights;
  }

  // Insight 1: Overall performance
  if (stats.avgRating >= 3.5) {
    insights.push("🔥 Your content is performing excellently!");
  } else if (stats.avgRating >= 2.5) {
    insights.push("📈 Your content is performing well. Keep experimenting!");
  } else {
    insights.push("💡 Try different approaches to boost performance.");
  }

  // Insight 2: Rating distribution
  const { viral, good, meh, flopped } = stats.ratingDistribution;
  if (viral > good + meh + flopped) {
    insights.push("✨ You're creating viral content consistently!");
  } else if (flopped > viral + good) {
    insights.push("⚠️ Many posts are underperforming. Review top hooks for patterns.");
  }

  // Insight 3: Sample size
  if (stats.ratedPosts < 10) {
    insights.push(
      `📊 Rate ${10 - stats.ratedPosts} more posts for better insights.`
    );
  }

  return insights;
}
