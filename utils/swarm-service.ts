/**
 * SWARM SERVICE - 2027 Agentic Intelligence
 * 
 * Handles multi-agent interactions:
 * 1. The Council: Sequential debate between diverse AI personas.
 * 2. The Simulator: Parallel feedback from synthetic audience members.
 */

import { GoogleGenerativeAI } from "@google/generative-ai";

// --- TYPES ---

export interface CouncilMember {
  id: "visionary" | "skeptic" | "editor";
  name: string;
  role: string;
  avatar: string; // Emoji
  systemPrompt: string;
}

export interface CouncilMessage {
  memberId: string;
  content: string;
}

export interface AudienceMember {
  id: string;
  name: string;
  role: string;
  avatar: string;
  bias: string;
}

export interface SimulationFeedback {
  memberId: string;
  reaction: "love" | "hate" | "confused" | "bored";
  comment: string;
}

// --- CONFIG ---

const COUNCIL: CouncilMember[] = [
  {
    id: "visionary",
    name: "Atlas",
    role: "The Visionary",
    avatar: "🔭",
    systemPrompt: "You are Atlas. You think in decades, not days. You love big ideas, paradigm shifts, and ambition. You ignore feasibility constraints. Your goal is to maximize the impact/potential of the idea."
  },
  {
    id: "skeptic",
    name: "Kratos",
    role: "The Skeptic",
    avatar: "🛡️",
    systemPrompt: "You are Kratos. You destroy weak arguments. You demand proof, logic, and data. You hate fluff, buzzwords, and vague promises. You are brutally honest and risk-averse."
  },
  {
    id: "editor",
    name: "Hemingway",
    role: "The Editor",
    avatar: "✍️",
    systemPrompt: "You are Hemingway. You care about clarity, punchiness, and viral mechanics. You synthesize the arguments into a single, killer outcome. You cut the fat. You make it readable."
  }
];

const AUDIENCE: AudienceMember[] = [
  { id: "vc", name: "Marc", role: "Busy VC", avatar: "💸", bias: "Short attention span. Wants alpha. hates generic advice." },
  { id: "dev", name: "Linus", role: "Cynical Engineer", avatar: "💻", bias: "Hates marketing fluff. Wants technical depth and truth." },
  { id: "genz", name: "Zoe", role: "Gen Z Founder", avatar: "🛹", bias: "Values authenticity and vibes. Hates corporate speak." },
];

/**
 * Run a SINGLE TURN of the Council Debate
 * (We call this iteratively from the UI to simulate conversation)
 */
export async function runCouncilTurn(
  topic: string,
  history: CouncilMessage[],
  nextSpeakerId: string,
  apiKey: string
): Promise<string> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const speaker = COUNCIL.find(m => m.id === nextSpeakerId);
  if (!speaker) throw new Error("Unknown speaker");

  const context = history.map(h => {
    const m = COUNCIL.find(x => x.id === h.memberId);
    return `${m?.name} (${m?.role}): ${h.content}`;
  }).join("\n\n");

  const prompt = `
    THE DEBATE TOPIC: "${topic}"

    PREVIOUS CONVERSATION:
    ${context}

    YOUR ROLE:
    ${speaker.systemPrompt}

    INSTRUCTION:
    Respond to the conversation. Keep it under 50 words. Be in character.
    If you are the Editor, synthesize the previous points into a final recommendation.
  `;

  try {
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (e) {
    console.warn("Council Agent failed, using mock", e);
    // Mock responses based on persona
    if (nextSpeakerId === "visionary") return `I see massive potential here. The market is shifting towards ${topic} and we can ride that wave. Think bigger!`;
    if (nextSpeakerId === "skeptic") return `Hold on. Everyone says ${topic} is the future, but where's the ROI? This sounds like hype without substance.`;
    if (nextSpeakerId === "editor") return `Let's strip the buzzwords. The core value is speed. Focus on that. Cut the rest.`;
    return "I agree.";
  }
}

/**
 * Run 'The Simulator' - Parallel feedback generation
 */
export async function runSimulation(draft: string, apiKey: string): Promise<SimulationFeedback[]> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  // In a real app, we'd Promise.all() these. For rate limits, we might mock or batch.
  // Let's do a single batch call asking for JSON to save tokens/requests.
  
  const prompt = `
    CONTENT TO REVIEW:
    "${draft}"

    SIMULATED AUDIENCE:
    ${AUDIENCE.map(a => `- ${a.name} (${a.role}): ${a.bias}`).join("\n")}

    INSTRUCTION:
    Act as EACH of these audience members. Provide a reaction (love/hate/confused/bored) and a 1-sentence comment for each.
    
    OUTPUT JSON FORMAT:
    [
      { "memberId": "vc", "reaction": "bored", "comment": "..." },
      ...
    ]
  `;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    // Clean code blocks if present
    const jsonStr = text.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(jsonStr) as SimulationFeedback[];
  } catch (e) {
    console.warn("Simulation failed, using mocks", e);
    // Fallback mocks
    return [
      { memberId: "vc", reaction: "bored", comment: "Too long. I stopped reading after line 2." },
      { memberId: "dev", reaction: "hate", comment: "This is technically incorrect. The premise is flawed." },
      { memberId: "genz", reaction: "confused", comment: "This feels AI generated. No soul." }
    ];
  }
}

export { COUNCIL, AUDIENCE };
