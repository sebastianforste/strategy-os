
/**
 * Helper: Count syllables in a word (Approximation)
 */
function countSyllables(word: string): number {
  word = word.toLowerCase();
  if (word.length <= 3) return 1;
  word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
  word = word.replace(/^y/, '');
  return word.match(/[aeiouy]{1,2}/g)?.length || 1;
}

/**
 * Helper: Calculate Flesch-Kincaid Grade Level
 */
export function calculateReadability(text: string): number {
  if (!text) return 0;
  const words = text.trim().split(/\s+/);
  const wordCount = words.length;
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0).length || 1;
  const syllables = words.reduce((acc, w) => acc + countSyllables(w), 0);

  if (wordCount === 0) return 0;
  
  // Flesch-Kincaid Grade Level
  return (0.39 * (wordCount / sentences)) + (11.8 * (syllables / wordCount)) - 15.59;
}

/**
 * Helper: Check signature phrases
 */
const SIGNATURE_PHRASES: Record<string, string[]> = {
  cso: ["advantage", "strategic", "equity", "trajectory", "stakeholder"],
  contrarian: ["dead", "wrong", "fail", "lie", "trap"],
  storyteller: ["journey", "remember", "connect", "felt", "moment"],
  colleague: ["excited", "team", "proud", "work", "together"]
};

export function analyzeSignaturePhrases(text: string, personaId: string): number {
  if (!text) return 0;
  const phrases = SIGNATURE_PHRASES[personaId.split('_')[0]] || SIGNATURE_PHRASES['cso'];
  const lowerText = text.toLowerCase();
  return phrases.reduce((count, phrase) => {
    return count + (lowerText.split(phrase).length - 1);
  }, 0);
}
