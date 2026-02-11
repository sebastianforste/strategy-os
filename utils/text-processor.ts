export const BANNED_WORDS = [
  "Delve", "Leverage", "Unleash", "Unlock", "Embark", "Navigate", "Foster", 
  "Facilitate", "Optimize", "Revolutionize", "Transform", "Spearhead", 
  "Tapestry", "Game-changer", "Seamless", "Robust", "Dynamic", "Intricate", 
  "Myriad", "Plethora", "Crucial", "Revolutionary", "Groundbreaking"
];

export const BANNED_PHRASES = [
  "In this post",
  "It is important to note",
  "A testament to",
  "Let's dive in",
  "In conclusion",
  "I'm excited to share"
];

export const REPLACEMENTS: Record<string, string> = {
  "delve": "dig",
  "leverage": "use",
  "unleash": "release",
  "unlock": "access",
  "optimize": "fix",
  "revolutionize": "change",
  "transform": "shift",
  "game-changer": "pivot",
  "robust": "strong",
  "dynamic": "active",
  "crucial": "vital",
  "facilitate": "help",
  "utilize": "use",
  "embark": "start",
  "navigate": "handle",
  "foster": "build",
  "spearhead": "lead",
  "tapestry": "mix",
  "myriad": "many",
  "plethora": "too many",
  "seamless": "easy",
  "revolutionary": "new",
  "groundbreaking": "new"
};

export const PHRASE_REPLACEMENTS: Record<string, string> = {
  "in this post": "",
  "it is important to note": "Note:",
  "let's dive in": "",
  "in conclusion": "The bottom line:",
  "i'm excited to share": ""
};

export interface PolishResult {
  polishedText: string;
  replacementCount: number;
  changesLog: { original: string; replacement: string }[];
}

/**
 * Client-Side polisher for instant (0ms) high-status content refinement.
 */
export function polishText(content: string): PolishResult {
  let polishedText = content;
  let replacementCount = 0;
  const changesLog: { original: string; replacement: string }[] = [];

  // 1. Process Phrases
  Object.entries(PHRASE_REPLACEMENTS).forEach(([phrase, replacement]) => {
    const regex = new RegExp(`\\b${phrase}\\b`, "gi");
    if (regex.test(polishedText)) {
      const matches = polishedText.match(regex) || [];
      replacementCount += matches.length;
      matches.forEach(m => changesLog.push({ original: m, replacement }));
      polishedText = polishedText.replace(regex, replacement);
    }
  });

  // 2. Process Words
  Object.entries(REPLACEMENTS).forEach(([word, replacement]) => {
    const regex = new RegExp(`\\b${word}\\b`, "gi");
    if (regex.test(polishedText)) {
      const matches = polishedText.match(regex) || [];
      replacementCount += matches.length;
      matches.forEach(m => changesLog.push({ original: m, replacement }));
      polishedText = polishedText.replace(regex, replacement);
    }
  });

  // 3. Syntax Formatting (Bro-etry) - Optional/Clean-up
  // Note: Aggressive bro-etry (one sentence per paragraph) is now handled 
  // via explicit LLM prompts or dedicated formatting tools to avoid destroying 
  // long-form content in this deterministic filter.
  polishedText = polishedText
    .replace(/(\n\s*){3,}/g, "\n\n") // Prevent excessive newlines
    .trim();

  return {
    polishedText,
    replacementCount,
    changesLog
  };
}

/**
 * Advanced Bro-etry Formatter
 * --------------------------
 * Ensures one sentence per paragraph. High impact for LinkedIn.
 */
export function enforceBroetry(text: string): string {
  if (!text) return "";
  
  // Use regex that captures the delimiters to preserve them
  return text
    .split(/([.!?])\s+/) // Capture the punctuation
    .reduce((acc: string[], val, i, arr) => {
      if (i % 2 === 0) {
        // This is the sentence content
        const punctuation = arr[i + 1] || "";
        acc.push((val + punctuation).trim());
      }
      return acc;
    }, [])
    .filter(Boolean)
    .join("\n\n"); // Rejoin with double spacing
}

/**
 * Applies the "Anti-Robot" filter (Legacy wrapper for server-side compatibility).
 */
export function applyAntiRobotFilter(text: string): string {
  const result = polishText(text);
  return result.polishedText;
}
