export const BANNED_WORDS = [
  "Delve",
  "Leverage",
  "Unleash",
  "Unlock",
  "Embark",
  "Navigate",
  "Foster",
  "Facilitate",
  "Optimize",
  "Revolutionize",
  "Revolutionary",
  "Transform",
  "Spearhead",
  "Tapestry",
  "Game-changer",
  "Seamless",
  "Robust",
  "Dynamic",
  "Intricate",
  "Myriad",
  "Plethora",
  "Crucial",
];

export const BANNED_PHRASES = [
  "In this post",
  "It is important to note",
  "A testament to",
  "Let's dive in",
  "In conclusion",
  "I'm excited to share",
];

export const REPLACEMENTS: Record<string, string> = {
  leverage: "use",
  delve: "dig",
  optimize: "fix",
  facilitate: "help",
  utilize: "use",
  demonstrate: "show",
  commence: "start",
};

/**
 * Applies the "Anti-Robot" filter to the input text.
 * 1. Removes banned words/phrases (case-insensitive).
 * 2. Applies replacements (correction mechanism).
 * 3. Enforces "Atomic Sentences" (double line breaks) and specific formatting.
 */
export function applyAntiRobotFilter(text: string): string {
  let processed = text;

  // 1. Remove Banned Phrases
  BANNED_PHRASES.forEach((phrase) => {
    // Escape special regex characters if any (not strictly needed for this list but good practice)
    const escapedPhrase = phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // For phrases, strict word boundaries can be tricky if they contain punctuation.
    // Let's use a simpler replacement for phrases or ensure boundaries where appropriate.
    // Given the list, standard space-separated words are fine.
    
    // Using a slightly more permissive regex for phrases to catch "In this post," etc.
    const phraseRegex = new RegExp(escapedPhrase, "gi");
    processed = processed.replace(phraseRegex, "");
  });

  // 2. Remove / Replace Banned Words
  // We prioritize REPLACEMENTS first, then Deletions for anything else in BANNED_WORDS
  
  // Apply Replacements first
  Object.entries(REPLACEMENTS).forEach(([target, replacement]) => {
    const regex = new RegExp(`\\b${target}\\b`, "gi");
    processed = processed.replace(regex, replacement);
  });

  // Then DELETE remaining banned words that didn't have a replacement
  BANNED_WORDS.forEach((word) => {
    // If we already replaced it, it won't be there.
    // If it's in BANNED_WORDS but NOT in REPLACEMENTS, we delete it.
    const lowerWord = word.toLowerCase();
    if (!REPLACEMENTS[lowerWord]) { 
       const regex = new RegExp(`\\b${word}\\b`, "gi");
       processed = processed.replace(regex, "");
    }
  });


  // 3. Formatting & Viral Syntax Enforcements (Bro-etry)
  
  // Normalize line breaks: Windows \r\n -> \n
  processed = processed.replace(/\r\n/g, "\n");
  
  // Enforce "Atomic Sentences": Split paragraphs into individual sentences if they aren't already.
  // We use a regex that looks for sentence-ending punctuation followed by a space or end of line.
  // This helps turn blocks of text into "Bro-etry".
  processed = processed.replace(/([.!?])\s+(?=[A-Z0-9])/g, "$1\n\n");

  // Clean up extra spaces created by deletions (Target only horizontal space, NOT newlines)
  processed = processed.replace(/[ \t]+/g, " "); 
  
  // Enforce Double Line Breaks
  // 1. Ensure all existing newlines or single line breaks become double newlines
  processed = processed.replace(/(\n\s*)+/g, "\n\n");
  
  // 2. Clean up any punctuation weirdness created by removals (e.g. "word .")
  processed = processed.replace(/\s+([.,!?;])/g, "$1");
  processed = processed.replace(/([.,!?;])\s*([.,!?;])/g, "$1"); // Resolve double punctuation

  return processed.trim();
}
