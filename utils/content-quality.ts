import type { Persona } from "./personas";
import { BANNED_PHRASES, BANNED_WORDS } from "./text-processor";
import { LinkedInAdapter } from "./platforms/linkedin";
import { TwitterAdapter } from "./platforms/twitter";

type QualityDimension = {
  name: string;
  score: number;
  pass: boolean;
  reasons: string[];
};

export type QualityMode = "draft" | "revise" | "publish";
export type QualityPlatform = "linkedin" | "twitter";

export interface QualityReport {
  pass: boolean;
  totalScore: number;
  dimensions: {
    personaFidelity: QualityDimension;
    factualStability: QualityDimension;
    novelty: QualityDimension;
    readability: QualityDimension;
    platformFit: QualityDimension;
  };
  reasons: string[];
}

export interface EvaluateContentQualityInput {
  content: string;
  persona: Persona;
  platform: QualityPlatform;
  mode: QualityMode;
  sourceText?: string;
}

function extractNumbers(text: string): string[] {
  return (text.match(/\$?\d[\d,]*(?:\.\d+)?%?/g) || []).map((n) => n.replace(/,/g, ""));
}

function splitSentences(text: string): string[] {
  return text
    .split(/[.!?]+/g)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
}

function splitParagraphs(text: string): string[] {
  return text
    .split(/\n{2,}/g)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

function judgePersonaFidelity(content: string, persona: Persona): QualityDimension {
  const lower = content.toLowerCase();
  const antiPatterns = (persona.antiPatterns || [])
    .map((item) => item.replace(/^never\s+/i, "").replace(/^-\s*/, "").trim().toLowerCase())
    .filter(Boolean);

  const antiPatternHits = antiPatterns.filter((item) => item.length > 3 && lower.includes(item));
  const signatureHits = (persona.signaturePhrases || []).filter((phrase) =>
    lower.includes(phrase.toLowerCase().replace(/\[[^\]]+\]/g, "").trim())
  ).length;

  let score = 80;
  if (signatureHits > 0) score += Math.min(20, signatureHits * 8);
  if (antiPatternHits.length > 0) score -= antiPatternHits.length * 20;

  const reasons: string[] = [];
  if (antiPatternHits.length > 0) {
    reasons.push(`Persona anti-patterns detected: ${antiPatternHits.slice(0, 2).join(", ")}`);
  }
  if (signatureHits === 0) {
    reasons.push("Persona signature is weak; output sounds generic.");
  }

  return {
    name: "persona-fidelity",
    score: Math.max(0, Math.min(100, score)),
    pass: antiPatternHits.length === 0 && score >= 60,
    reasons,
  };
}

function judgeFactualStability(content: string, sourceText?: string): QualityDimension {
  if (!sourceText || !sourceText.trim()) {
    return {
      name: "factual-stability",
      score: 100,
      pass: true,
      reasons: [],
    };
  }

  const sourceNumbers = new Set(extractNumbers(sourceText));
  const outputNumbers = new Set(extractNumbers(content));

  let changed = 0;
  sourceNumbers.forEach((value) => {
    if (!outputNumbers.has(value)) changed += 1;
  });
  outputNumbers.forEach((value) => {
    if (!sourceNumbers.has(value)) changed += 1;
  });

  const score = Math.max(0, 100 - changed * 25);
  const reasons: string[] = [];
  if (changed > 1) {
    reasons.push("Numbers/metrics changed beyond allowed tolerance.");
  }

  return {
    name: "factual-stability",
    score,
    pass: changed <= 1,
    reasons,
  };
}

function judgeNovelty(content: string): QualityDimension {
  const lower = content.toLowerCase();
  const bannedHits = [...BANNED_WORDS, ...BANNED_PHRASES].filter((token) =>
    lower.includes(token.toLowerCase())
  );
  const openerPatternHit = /^(in this post|i'm excited to share|let's dive in)/i.test(content.trim());

  const words = lower.split(/\s+/).filter(Boolean);
  let repeatedTokens = 0;
  for (let index = 0; index < words.length - 2; index += 1) {
    const trigram = `${words[index]} ${words[index + 1]} ${words[index + 2]}`;
    const repeats = lower.split(trigram).length - 1;
    if (repeats > 2) {
      repeatedTokens += 1;
      break;
    }
  }

  let score = 100;
  score -= bannedHits.length * 15;
  if (openerPatternHit) score -= 20;
  if (repeatedTokens > 0) score -= 15;

  const reasons: string[] = [];
  if (bannedHits.length > 0) reasons.push("Contains banned AI-isms/cliche phrases.");
  if (openerPatternHit) reasons.push("Weak generic opener.");
  if (repeatedTokens > 0) reasons.push("Repetitive phrasing detected.");

  return {
    name: "novelty",
    score: Math.max(0, score),
    pass: score >= 65,
    reasons,
  };
}

function judgeReadability(content: string): QualityDimension {
  const sentences = splitSentences(content);
  const words = content.split(/\s+/).filter(Boolean);
  const paragraphs = splitParagraphs(content);

  if (sentences.length === 0 || words.length === 0) {
    return {
      name: "readability",
      score: 0,
      pass: false,
      reasons: ["Empty output."],
    };
  }

  const averageSentenceLength = words.length / sentences.length;
  const longSentences = sentences.filter((sentence) => sentence.split(/\s+/).length > 30).length;
  const longSentenceShare = longSentences / sentences.length;
  const paragraphDensity = paragraphs.length > 0 ? words.length / paragraphs.length : words.length;

  let score = 100;
  if (averageSentenceLength < 5) score -= 10;
  if (averageSentenceLength > 24) score -= 25;
  if (longSentenceShare > 0.2) score -= 20;
  if (paragraphDensity > 40) score -= 20;

  const reasons: string[] = [];
  if (averageSentenceLength > 24) reasons.push("Sentences are too long.");
  if (longSentenceShare > 0.2) reasons.push("Too many long sentences reduce retention.");
  if (paragraphDensity > 40) reasons.push("Paragraph blocks are too dense.");

  return {
    name: "readability",
    score: Math.max(0, score),
    pass: score >= 65,
    reasons,
  };
}

function judgePlatformFit(content: string, platform: QualityPlatform): QualityDimension {
  const adapter = platform === "twitter" ? TwitterAdapter : LinkedInAdapter;
  const validation = adapter.validate(content);
  const wordCount = content.split(/\s+/).filter(Boolean).length;

  let score = 100;
  if (validation.errors.length > 0) score -= validation.errors.length * 35;
  if (validation.warnings.length > 0) score -= validation.warnings.length * 10;

  if (platform === "linkedin") {
    if (wordCount < 35) score -= 15;
    if (wordCount > 700) score -= 15;
  }

  const reasons: string[] = [];
  reasons.push(...validation.errors);
  if (platform === "linkedin" && wordCount < 35) {
    reasons.push("Too short for high-value LinkedIn delivery.");
  }

  return {
    name: "platform-fit",
    score: Math.max(0, score),
    pass: validation.errors.length === 0 && score >= 65,
    reasons,
  };
}

export function evaluateContentQuality(input: EvaluateContentQualityInput): QualityReport {
  const personaFidelity = judgePersonaFidelity(input.content, input.persona);
  const factualStability = judgeFactualStability(input.content, input.sourceText);
  const novelty = judgeNovelty(input.content);
  const readability = judgeReadability(input.content);
  const platformFit = judgePlatformFit(input.content, input.platform);

  const totalScore = Math.round(
    personaFidelity.score * 0.25 +
      factualStability.score * 0.2 +
      novelty.score * 0.2 +
      readability.score * 0.2 +
      platformFit.score * 0.15
  );

  const reasons = [
    ...personaFidelity.reasons,
    ...factualStability.reasons,
    ...novelty.reasons,
    ...readability.reasons,
    ...platformFit.reasons,
  ];

  return {
    pass:
      personaFidelity.pass &&
      factualStability.pass &&
      novelty.pass &&
      readability.pass &&
      platformFit.pass &&
      totalScore >= 75,
    totalScore,
    dimensions: {
      personaFidelity,
      factualStability,
      novelty,
      readability,
      platformFit,
    },
    reasons,
  };
}

export function summarizeQualityFailures(report: QualityReport): string {
  if (report.pass) return "Quality checks passed.";
  return report.reasons.slice(0, 3).join(" ");
}
