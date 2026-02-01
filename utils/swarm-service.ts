/**
 * SWARM SERVICE - 2027 Agentic Intelligence
 * 
 * Handles multi-agent interactions:
 * 1. The Council: Sequential debate between diverse AI personas.
 * 2. The Simulator: Parallel feedback from synthetic audience members.
 */

import { GoogleGenAI } from "@google/genai";

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
  isCustom?: boolean; // Added to track custom personas
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
  const genAI = new GoogleGenAI({ apiKey });
  const member = COUNCIL.find(m => m.id === nextSpeakerId);
  if (!member) throw new Error("Agent not found");

  const conversation = history.map(msg => {
    const speaker = COUNCIL.find(m => m.id === msg.memberId);
    return `${speaker?.name} (${speaker?.role}): ${msg.content}`;
  }).join("\n\n");

  const prompt = `
    THE COUNCIL CHAMBER
    Topic: ${topic}
    
    PERSONA:
    ${member.systemPrompt}
    
    PREVIOUS ARGUMENTS:
    ${conversation || "No arguments yet. You are starting the debate."}
    
    INSTRUCTIONS:
    1. Stay in character.
    2. Be concise (max 3 sentences).
    3. If you are Hemingway (The Editor), your goal is to synthesize the best points into a final, high-status "Master Draft".
    4. Respond as ${member.name}.
    `;

  try {
    const result = await genAI.models.generateContent({
        model: "models/gemini-flash-latest",
        contents: prompt
    });

    return result.text || "";
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
/**
 * Generate a dynamic persona based on user description
 */
export async function createDynamicPersona(description: string, apiKey: string): Promise<AudienceMember | null> {
  const genAI = new GoogleGenAI({ apiKey });
  const prompt = `
    Create a detailed USER PERSONA based on this description: "${description}".
    
    Return a JSON object:
    {
      "id": "custom_${Date.now()}",
      "name": "First Name Only",
      "role": "Job Title / Role",
      "avatar": "Single Emoji",
      "bias": "What they hate, what they love, their attention span."
    }
  `;

  try {
    const result = await genAI.models.generateContent({
        model: "models/gemini-flash-latest",
        contents: prompt,
        config: { responseMimeType: "application/json" }
    });
    
    const text = result.text || "";
    const member = JSON.parse(text);
    return { ...member, isCustom: true };
  } catch (e) {
    console.error("Persona generation failed", e);
    return null;
  }
}

/**
 * Run 'The Simulator' - Parallel feedback generation
 */
export async function runSimulation(
  draft: string, 
  apiKey: string, 
  customAudience: AudienceMember[] = []
): Promise<SimulationFeedback[]> {
  const genAI = new GoogleGenAI({ apiKey });
  
  // Use custom audience if provided, otherwise default
  const targetAudience = customAudience.length > 0 ? customAudience : AUDIENCE;

  // Build the persona list string
  const audienceList = targetAudience.map((m, i) => 
    `${i+1}. ${m.name} (${m.role}): ${m.bias} (ID: ${m.id})`
  ).join("\n    ");

  const prompt = `
    AUDIENCE SIMULATOR (Closed Testing)
    Draft: "${draft}"
    
    AUDIENCE MEMBERS:
    ${audienceList}
    
    TASK:
    Generate a reaction for each member. 
    Format as JSON array: [{"memberId": "ID", "reaction": "love/hate/confused/bored", "comment": "..."}, ...]
    `;

  try {
    const result = await genAI.models.generateContent({
        model: "models/gemini-flash-latest", 
        contents: prompt,
        config: { responseMimeType: "application/json" }
    });
    
    const text = result.text || "";
    // Clean code blocks if present (though responseMimeType usually handles it)
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
