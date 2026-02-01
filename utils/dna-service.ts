import { GoogleGenAI } from "@google/genai";

export interface ContentDNA {
  tone: string;
  syntax: string;
  keywords: string[];
  antiKeywords: string[];
  description: string;
}

export interface CommentStrategy {
  type: "mirror" | "question" | "debate";
  content: string;
  reasoning: string;
}

const STORAGE_KEY = "strategyos_dna";

/**
 * DNA SERVICE
 * -----------
 * "You Are Your Archive."
 * Analyzes a corpus of past content to extract a unique "Voice DNA" signature.
 */

export async function analyzeCorpus(corpus: string[], apiKey: string): Promise<ContentDNA | null> {
  if (!corpus || corpus.length === 0 || !apiKey) return null;

  const combinedText = corpus.join("\n\n---\n\n");

  const prompt = `
    You are a Linguistic Forensic Analyst.
    Analyze the following corpus of 5-10 high-performing posts from a single author.
    EXTRACT their "Content DNA" so another AI can perfectly mimic their voice.

    CORPUS:
    """
    ${combinedText}
    """

    TASK:
    Return a JSON object capturing:
    1. Tone: 3 adjectives describing the vibe (e.g., "Cynical, Punchy, Authoritative").
    2. Syntax Rule: The specific structural pattern (e.g., "Short sentences. No adverbs. Fragmented thoughts.").
    3. Keywords: 5 words they use often.
    4. Anti-Keywords: 5 generic words they NEVER use (e.g., "Delve, Unlock, Leverage").
    5. Description: A 1-sentence prompt instruction to act as this person.

    OUTPUT FORMAT (JSON ONLY):
    {
      "tone": "...",
      "syntax": "...",
      "keywords": ["..."],
      "antiKeywords": ["..."],
      "description": "..."
    }
  `;

  try {
    const genAI = new GoogleGenAI({ apiKey });
    const result = await genAI.models.generateContent({
        model: "models/gemini-flash-latest",
        contents: prompt,
        config: { responseMimeType: "application/json" }
    });

    const text = result.text || "";
    return JSON.parse(text) as ContentDNA;
  } catch (e) {
    console.error("DNA extraction failed", e);
    return null;
  }
}

export function saveDNA(dna: ContentDNA): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dna));
  } catch (e) {
    console.warn("Failed to save DNA", e);
  }
}

export function getDNA(): ContentDNA | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

/**
 * Generates a System Prompt injection based on the DNA
 */
export function buildDNAPrompt(dna: ContentDNA): string {
    return `
    VOICE INJECTION (STRICT):
    - Tone: ${dna.tone}
    - Syntax Rules: ${dna.syntax}
    - Keywords to Use: ${dna.keywords.join(", ")}
    - BANNED Words: ${dna.antiKeywords.join(", ")}
    - Core Identity: ${dna.description}
    `;
}

/**
 * STRATEGIC COMMENTING ENGINE
 * ---------------------------
 * Uses the Target's DNA to craft high-status replies.
 */
export async function generateCommentStrategy(
  targetDNA: ContentDNA, 
  postContent: string, 
  apiKey: string
): Promise<CommentStrategy[]> {
    if (!apiKey) return [];

    const prompt = `
      You are a Strategic Communications Analyst.
      
      TARGET PROFILE (DNA):
      - Tone: ${targetDNA.tone}
      - Syntax: ${targetDNA.syntax}
      - Core Identity: ${targetDNA.description}
      
      THEIR POST:
      "${postContent}"
      
      TASK:
      Draft 3 distinct comments to engage this specific person.
      
      1. THE MIRROR (Rapport): Match their tone and syntax perfectly. Validate them.
      2. THE QUESTION (Curiosity): Ask the one specific, high-level question they didn't answer. (Status Gap).
      3. THE DEBATE (Status): Respectfully challenge a core premise using their own logic.
      
      OUTPUT FORMAT (JSON ARRAY):
      [
        { "type": "mirror", "content": "...", "reasoning": "Matches their cynical tone..." },
        { "type": "question", "content": "...", "reasoning": "Identifies gap in logic..." },
        { "type": "debate", "content": "...", "reasoning": "Challenges premise..." }
      ]
    `;

    try {
        const genAI = new GoogleGenAI({ apiKey });
        const result = await genAI.models.generateContent({
            model: "models/gemini-flash-latest",
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });
        
        const text = result.text || "";
        return JSON.parse(text) as CommentStrategy[];
    } catch (e) {
        console.error("Comment strategy generation failed", e);
        return [];
    }
}
