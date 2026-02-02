/**
 * PREFERENCES SERVICE - 2027 Adaptive UI
 * 
 * Stores user preferences and behavior history in IndexedDB for personalization:
 * - Favorite personas
 * - Frequently used topics
 * - Toggle preferences (RAG, Newsjack, etc.)
 * - Dynamic starter chip suggestions
 */

// --- TYPES ---

export interface UserPreferences {
  favoritePersona: string;
  toggles: {
    rag: boolean;
    newsjack: boolean;
    fewShot: boolean;
    agenticMode: boolean;
  };
  recentTopics: string[];
  topicFrequency: Record<string, number>;
  lastUpdated: number;
}

export interface StarterChip {
  label: string;
  prompt: string;
  icon: "zap" | "brain" | "sparkles" | "trending";
  score: number; // Relevance score
}

const STORAGE_KEY = "strategyos-preferences";
const MAX_RECENT_TOPICS = 20;

// --- PREFERENCES MANAGEMENT ---

/**
 * GET USER PREFERENCES
 * --------------------
 * Retrieves stored preferences from localStorage.
 */
export function getPreferences(): UserPreferences {
  if (typeof localStorage === "undefined") {
    return getDefaultPreferences();
  }
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored) as UserPreferences;
    }
  } catch (e) {
    console.error("[Preferences] Failed to load:", e);
  }
  
  return getDefaultPreferences();
}

/**
 * SAVE PREFERENCES
 * ----------------
 * Saves preferences to localStorage.
 */
export function savePreferences(prefs: Partial<UserPreferences>): void {
  if (typeof localStorage === "undefined") return;
  
  const current = getPreferences();
  const updated = {
    ...current,
    ...prefs,
    lastUpdated: Date.now()
  };
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

/**
 * RECORD TOPIC USAGE
 * ------------------
 * Tracks topic usage for personalization.
 */
export function recordTopicUsage(topic: string): void {
  const prefs = getPreferences();
  
  // Update frequency
  const normalizedTopic = topic.toLowerCase().trim().substring(0, 50);
  prefs.topicFrequency[normalizedTopic] = (prefs.topicFrequency[normalizedTopic] || 0) + 1;
  
  // Update recent topics (dedup and limit)
  prefs.recentTopics = [
    normalizedTopic,
    ...prefs.recentTopics.filter(t => t !== normalizedTopic)
  ].slice(0, MAX_RECENT_TOPICS);
  
  savePreferences(prefs);
}

/**
 * GET TOP TOPICS
 * --------------
 * Returns most frequently used topics.
 */
export function getTopTopics(limit: number = 5): { topic: string; count: number }[] {
  const prefs = getPreferences();
  
  return Object.entries(prefs.topicFrequency)
    .map(([topic, count]) => ({ topic, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

/**
 * GET DYNAMIC STARTER CHIPS
 * -------------------------
 * Generates personalized starter chips based on user history.
 */
export function getDynamicStarterChips(): StarterChip[] {
  const topTopics = getTopTopics(3);
  const prefs = getPreferences();
  
  const chips: StarterChip[] = [];
  
  // Add chips based on top topics
  topTopics.forEach((t, i) => {
    chips.push({
      label: `More on ${t.topic.substring(0, 20)}`,
      prompt: `Share a fresh perspective on ${t.topic}`,
      icon: i === 0 ? "trending" : "sparkles",
      score: t.count * 10
    });
  });
  
  // Add recent topic if different
  if (prefs.recentTopics.length > 0) {
    const lastTopic = prefs.recentTopics[0];
    if (!topTopics.find(t => t.topic === lastTopic)) {
      chips.push({
        label: `Continue: ${lastTopic.substring(0, 15)}...`,
        prompt: `Expand on my previous thoughts about ${lastTopic}`,
        icon: "brain",
        score: 50
      });
    }
  }
  
  // Sort by score and limit
  return chips.sort((a, b) => b.score - a.score).slice(0, 4);
}

/**
 * GET DEFAULT PREFERENCES
 * -----------------------
 */
function getDefaultPreferences(): UserPreferences {
  return {
    favoritePersona: "cso",
    toggles: {
      rag: true,
      newsjack: false,
      fewShot: true,
      agenticMode: false
    },
    recentTopics: [],
    topicFrequency: {},
    lastUpdated: Date.now()
  };
}

/**
 * RESET PREFERENCES
 * -----------------
 */
export function resetPreferences(): void {
  if (typeof localStorage !== "undefined") {
    localStorage.removeItem(STORAGE_KEY);
  }
}
