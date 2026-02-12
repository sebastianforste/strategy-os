import { BANNED_WORDS, BANNED_PHRASES } from "./text-processor";
import type { Persona } from "./personas";

export type PersonaTask = "draft" | "revise" | "comment";

export interface PersonaContract {
  id: string;
  name: string;
  voiceAxes: string[];
  signaturePhrases: string[];
  antiPatterns: string[];
  bannedLexicon: string[];
  cadence: {
    hookMaxWords: number;
    preferredSentenceRange: [number, number];
    shortSentenceShare: number;
    paragraphMode: "single-sentence" | "mixed";
  };
  requiredMoves: string[];
}

function normalizeClause(value: string): string {
  return value
    .replace(/^never\s+/i, "")
    .replace(/^always\s+/i, "")
    .replace(/^-/i, "")
    .trim();
}

function inferCadence(personaId: string): PersonaContract["cadence"] {
  switch (personaId) {
    case "storyteller":
      return {
        hookMaxWords: 8,
        preferredSentenceRange: [6, 20],
        shortSentenceShare: 0.7,
        paragraphMode: "mixed",
      };
    case "contrarian":
      return {
        hookMaxWords: 10,
        preferredSentenceRange: [4, 16],
        shortSentenceShare: 0.85,
        paragraphMode: "single-sentence",
      };
    case "colleague":
      return {
        hookMaxWords: 12,
        preferredSentenceRange: [6, 20],
        shortSentenceShare: 0.75,
        paragraphMode: "mixed",
      };
    default:
      return {
        hookMaxWords: 10,
        preferredSentenceRange: [5, 18],
        shortSentenceShare: 0.8,
        paragraphMode: "single-sentence",
      };
  }
}

const TASK_MOVES: Record<PersonaTask, string[]> = {
  draft: [
    "Lead with a high-tension hook and strong point of view.",
    "Use concrete evidence (specific examples, numbers, constraints).",
    "End with a forcing question or decision-oriented close.",
  ],
  revise: [
    "Preserve meaning while tightening cadence and clarity.",
    "Upgrade lexical precision without adding filler.",
    "Remove passive constructions and AI-cliche wording.",
  ],
  comment: [
    "Start with substance immediately; no generic praise opener.",
    "Add one specific second-order insight or challenge.",
    "Keep concise and peer-level in tone.",
  ],
};

export function getPersonaContract(persona: Persona, task: PersonaTask): PersonaContract {
  const voiceAxes = persona.voice
    ? persona.voice.split(",").map((item) => item.trim()).filter(Boolean)
    : ["Direct", "High-signal", "Specific"];

  const signaturePhrases = (persona.signaturePhrases || []).slice(0, 5).map((item) => item.trim());
  const antiPatterns = (persona.antiPatterns || []).map(normalizeClause).filter(Boolean);
  const bannedLexicon = [...BANNED_WORDS, ...BANNED_PHRASES].map((item) => item.toLowerCase());

  return {
    id: persona.id,
    name: persona.name,
    voiceAxes,
    signaturePhrases,
    antiPatterns,
    bannedLexicon,
    cadence: inferCadence(persona.id),
    requiredMoves: TASK_MOVES[task],
  };
}

export function buildPersonaContractInstructions(
  contract: PersonaContract,
  options?: { preserveFacts?: boolean }
): string {
  const preserveFacts = options?.preserveFacts !== false;
  const factualRule = preserveFacts
    ? "Do not change factual claims, named entities, dates, metrics, or commitments."
    : "You may rephrase strongly, but do not invent unsupported facts.";

  return `
PERSONA CONTRACT (ENFORCED):
- Persona: ${contract.name} (${contract.id})
- Voice Axes: ${contract.voiceAxes.join(", ")}
- Required Moves: ${contract.requiredMoves.join(" | ")}
- Signature Phrases: Use at most 1-2 when natural: ${contract.signaturePhrases.join(" | ")}
- Anti-Patterns: ${contract.antiPatterns.join(" | ")}
- Banned Lexicon: ${contract.bannedLexicon.join(", ")}
- Cadence Targets:
  - Hook max words: ${contract.cadence.hookMaxWords}
  - Preferred sentence range: ${contract.cadence.preferredSentenceRange[0]}-${contract.cadence.preferredSentenceRange[1]} words
  - Share of short sentences: >= ${Math.round(contract.cadence.shortSentenceShare * 100)}%
  - Paragraph mode: ${contract.cadence.paragraphMode}
- Factual Rule: ${factualRule}

Before final output, self-audit against this contract and rewrite if violated.
`.trim();
}
