
export interface ClicheViolation {
  word: string;
  index: number;
  length: number;
  replacement: string;
}

const BANNED_WORDS: Record<string, string> = {
  // Foundational Corporate Jargon
  "delve": "dig, investigate, study",
  "robust": "strong, tough, reliable",
  "leverage": "use, exploit, utilize",
  "leveraging": "using",
  "leveraged": "used",
  "utilize": "use",
  "utilizing": "using",
  "utilized": "used",
  "synergy": "teamwork, unity, bond",
  "synergies": "teamwork, unity, bond",
  "paradigm": "model, pattern, style",
  "holistic": "full, whole, entire",
  "streamline": "speed up, simplify",
  "seamless": "smooth, easy",
  "optimization": "fix, improvement",
  "orchestrate": "plan, lead, organize",
  "navigating": "managing, steering",
  "underscore": "highlight, stress",
  "implement": "build, do, start",
  "transformative": "big, changing",
  "landscape": "market, field, world",
  "ecosystem": "network, group",
  "realm": "area, world",
  "beacon": "guide, light",
  "foster": "build, grow",
  "cultivate": "grow, raise",
  "framework": "system, structure",

  // High-Status Cliches (The "Bro-etry" subset)
  "unlock": "release, open, free",
  "elevate": "raise, lift, boost",
  "thought leader": "expert, guide, pro",
  "deep dive": "analysis, study, look",
  "circle back": "return, check later",
  "impactful": "strong, heavy, real",
  "game-changer": "major shift, big deal",
  "pioneering": "first, early, new",
  "unparalleled": "best, top, unique",
  "cutting-edge": "new, modern, latest",
  "revolutionary": "new, radical",
  "disrupt": "change, upset",
  "supercharge": "boost, speed up",
  "catalyst": "cause, spark",
  "groundbreaking": "new, first-ever",
  "top-tier": "best, elite",
  "mission-critical": "vital, key",
  "low-hanging fruit": "easy wins",
  "wheelhouse": "area, field",
  "outside the box": "newly, creatively",
  "bandwidth": "time, capacity",
  "digital transformation": "going tech-first",
  "unleash": "release, open, free",
  "spearhead": "lead, drive, push",
  "testament": "proof, sign, witness",
  "tapestry": "mix, network, system",
  "innovative": "smart, creative"
};

export function detectCliches(text: string): ClicheViolation[] {
  const violations: ClicheViolation[] = [];
  
  Object.keys(BANNED_WORDS).forEach(word => {
    // Case insensitive, whole word match
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    let match;
    while ((match = regex.exec(text)) !== null) {
      violations.push({
        word: match[0],
        index: match.index,
        length: match[0].length,
        replacement: BANNED_WORDS[word]
      });
    }
  });

  return violations.sort((a, b) => a.index - b.index);
}

/**
 * AI DEEP SCAN
 * ------------
 * Uses Gemini to find "contextual fluff" and weak phrasing.
 */
export async function detectClichesAI(text: string, apiKey: string): Promise<ClicheViolation[]> {
  if (!apiKey || apiKey === "demo" || text.length < 50) return [];

  const { GoogleGenAI } = await import("@google/genai");
  const genAI = new GoogleGenAI({ apiKey });
  
  const prompt = `
    Analyze this text for "Corporate Fluff", "Hedging", and "Weak Passive Voice".
    Identify phrases that weaken the authority of the writer.
    
    TEXT: "${text.substring(0, 2000)}"
    
    ACTION:
    For each weak phrase, provide a "Context-Aware Rewrite".
    Do NOT just provide a synonym. Rewrite the phrase to be direct, active, and punchy.
    
    Example:
    Text: "We are leveraging our synergies to facilitate growth."
    Rewrite: "We combine our strengths to grow."
    
    Return a JSON array of objects:
    [
      {
        "word": "exact substring from text",
        "replacement": "context-aware rewrite"
      }
    ]
    
    Return ONLY valid JSON.
  `;

  try {
      const result = await genAI.models.generateContent({
          model: "gemini-2.0-flash-exp",
          contents: prompt
      });

      const json = JSON.parse(result.text?.replace(/```json|```/g, "").trim() || "[]");
      
      // Map back to ClicheViolation format by finding indices
      const violations: ClicheViolation[] = [];
      
      json.forEach((item: any) => {
          // Find all occurrences
          const regex = new RegExp(`\\b${item.word}\\b`, 'gi');
          let match;
          while ((match = regex.exec(text)) !== null) {
              violations.push({
                  word: match[0],
                  index: match.index,
                  length: match[0].length,
                  replacement: item.replacement
              });
          }
      });
      
      return violations;

  } catch (e) {
      console.error("AI Cliche Scan failed", e);
      return [];
  }
}
