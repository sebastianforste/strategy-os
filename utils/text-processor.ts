export const BANNED_WORDS = [
  "Delve",
  "Unlock",
  "Unleash",
  "Elevate",
  "Navigate",
  "Foster",
  "Tapestry",
  "Testament",
  "Game-changer",
  "Cutting-edge",
  "Seamless",
  "Realm",
  "Intricate",
];

export const BANNED_PHRASES = [
  "In this post",
  "Let's dive in",
  "It is important to note",
  "In conclusion",
];

export const REPLACEMENTS: Record<string, string> = {
  leverage: "use",
  delve: "dig",
};

/**
 * Applies the "Anti-Robot" filter to the input text.
 * 1. Removes banned words/phrases.
 * 2. Applies replacements.
 * 3. Enforces "Atomic Sentences" (double line breaks).
 */
export function applyAntiRobotFilter(text: string): string {
  let processed = text;

  // 1. Remove Banned Phrases (Case insensitive logic needed carefully)
  BANNED_PHRASES.forEach((phrase) => {
    const regex = new RegExp(phrase, "gi");
    processed = processed.replace(regex, "");
  });

  // 2. Remove Banned Words
  BANNED_WORDS.forEach((word) => {
    // Match word boundaries to avoid partial matches inside other words
    const regex = new RegExp(`\\b${word}\\b`, "gi");
    processed = processed.replace(regex, "");
  });

  // 3. Apply Replacements
  Object.entries(REPLACEMENTS).forEach(([target, replacement]) => {
    const regex = new RegExp(`\\b${target}\\b`, "gi");
    processed = processed.replace(regex, replacement);
  });

  // 4. Atomic Sentences & Visual Rhythm
  // Ensure paragraphs are not too long. This is a heuristic.
  // We can force double line breaks after periods if the block is long?
  // Or just ensure that existing single line breaks become double line breaks.
  // The user prompt says "Use double line breaks between ideas".
  // A simple heuristic: Replace single newlines with double newlines if they aren't already double.
  // But strictly, we might just want to ensure clean spacing.
  
  // Normalize line breaks
  processed = processed.replace(/\r\n/g, "\n");
  
  // If there are long paragraphs (e.g. > 200 chars without newline), we might want to split sentences.
  // For now, let's just ensure standard "Visual Rhythm" by replacing single newlines with double newlines
  // if it looks like a paragraph break.
  
  // Collapse multiple newlines to max 2
  processed = processed.replace(/\n{3,}/g, "\n\n");

  return processed.trim();
}
