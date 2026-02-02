/**
 * SWARM SERVICE - The Council of Agents & Audience Simulator
 * -----------------------------------------------------------
 * Orchestrates multi-agent interactions for both strategic hardening
 * and audience simulation.
 */

import { GoogleGenAI } from "@google/genai";

const PRIMARY_MODEL = process.env.NEXT_PUBLIC_GEMINI_PRIMARY_MODEL || "models/gemini-2.0-flash-exp";

// --- TYPES ---

export interface SwarmMessage {
    agent: string;
    role: "pessimist" | "futurist" | "realist" | "synthesizer" | "contrarian";
    content: string;
    timestamp: string;
}

export interface SwarmResult {
    debate: SwarmMessage[];
    hardenedConcept: string;
    risksIdentified: string[];
    opportunitiesIdentified: string[];
}

export interface CouncilMember {
    id: string;
    name: string;
    role: string;
    avatar: string;
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
    isCustom?: boolean;
}

export interface SimulationFeedback {
    memberId: string;
    reaction: "love" | "hate" | "intrigued" | "bored";
    comment: string;
}

export interface AutonomousProgress {
    message: string;
    iteration: number;
    score?: number;
    audit_log?: SwarmMessage;
}

export interface AutonomousCouncilResult {
    finalPost: string;
    finalScore: number;
    iterations: number;
    history: { iteration: number; score: number; feedback: string }[];
}

// --- CONSTANTS ---

export const COUNCIL: CouncilMember[] = [
    { id: "visionary", name: "Elara", role: "Exponential Futurist", avatar: "🌌" },
    { id: "skeptic", name: "Marcus", role: "Red Team Lead", avatar: "🛡️" },
    { id: "realist", name: "Chen", role: "Ops Architect", avatar: "🏗️" },
    { id: "editor", name: "The Prime", role: "Strategic Weaver", avatar: "🧠" }
];

export const AUDIENCE: AudienceMember[] = [
    { id: "tech-exec", name: "Silas", role: "Fortune 500 CTO", avatar: "👔" },
    { id: "vc", name: "Veda", role: "Growth Equity Partner", avatar: "💰" },
    { id: "founder", name: "Leo", role: "Seed-stage Founder", avatar: "🚀" },
    { id: "dev", name: "Mina", role: "Staff Engineer", avatar: "💻" }
];

// --- CORE LOGIC: THE COUNCIL (PHASE 15 SWARM) ---

const AGENT_PROMPTS = {
    pessimist: `ACT AS: The Red Team Auditor. 
        GOAL: Attack the proposed strategy. Find logical gaps, legal risks, reputational hazards, and reasons why it will FAIL.
        TONE: Hostile, skeptical, rigorous.`,
    
    futurist: `ACT AS: The Exponential Futurist.
        GOAL: Think 10 years out. How does this strategy impact the long-term? What hidden emerging trends are we missing?
        TONE: Visionary, expansive, abstract.`,
    
    realist: `ACT AS: The Operations Manager (COO).
        GOAL: Focus on execution. Is this feasible? What are the immediate costs? Will it actually convert today?
        TONE: Pragmatic, data-driven, grounded.`,
    
    contrarian: `ACT AS: The Market Provocateur.
        GOAL: Dislocate assumptions. If everyone says X, find why NOT X. Focus on shifting power dynamics and incumbents' blind spots.
        TONE: Sharp, analytical, unconventional.`,
    
    synthesizer: `ACT AS: The Grand Strategist.
        GOAL: Review the debate from the Council (Pessimist, Futurist, Realist, Contrarian). Merge their perspectives into a single "Battle-Hardened" core strategic concept.
        TONE: Authority, wisdom, synthesis.`
};

/**
 * PHASE 15: RUN COUNCIL DEBATE
 */
export async function runSwarmDebate(
    topic: string,
    inputContext: string,
    apiKey: string,
    onProgress?: (msg: SwarmMessage) => void
): Promise<SwarmResult> {
    const genAI = new GoogleGenAI({ apiKey });
    
    const agents: ("pessimist" | "futurist" | "realist" | "contrarian")[] = ["pessimist", "futurist", "realist", "contrarian"];
    
    const audits = await Promise.all(agents.map(async (role) => {
        const response = await genAI.models.generateContent({
            model: PRIMARY_MODEL,
            contents: `
                ${AGENT_PROMPTS[role]}
                TOPIC: ${topic}
                CONTEXT: ${inputContext}
                Provide a 2-paragraph audit. Be extreme in your specific role.
            `
        });

        const msg: SwarmMessage = {
            agent: role.charAt(0).toUpperCase() + role.slice(1),
            role,
            content: response.text || "No audit provided.",
            timestamp: new Date().toISOString()
        };

        if (onProgress) onProgress(msg);
        return msg;
    }));

    const synthesisPrompt = `
        ${AGENT_PROMPTS.synthesizer}
        ORIGINAL TOPIC: ${topic}
        COUNCIL DEBATE LOGS:
        ${audits.map(a => `[${a.agent.toUpperCase()}]: ${a.content}`).join("\n\n")}
        TASK: Create a "Hardened Strategic Concept" (JSON ONLY).
        Output format: { "hardenedConcept": "...", "risksIdentified": ["..."], "opportunitiesIdentified": ["..."] }
    `;

    const synthesisResponse = await genAI.models.generateContent({
        model: PRIMARY_MODEL,
        contents: synthesisPrompt,
        config: { responseMimeType: "application/json" }
    });

    const synthesisResult = JSON.parse(synthesisResponse.text || "{}");

    const finalMsg: SwarmMessage = {
        agent: "Grand Strategist",
        role: "synthesizer",
        content: synthesisResult.hardenedConcept || "Synthesis complete.",
        timestamp: new Date().toISOString()
    };
    if (onProgress) onProgress(finalMsg);

    return {
        debate: audits.concat(finalMsg),
        hardenedConcept: synthesisResult.hardenedConcept || topic,
        risksIdentified: synthesisResult.risksIdentified || [],
        opportunitiesIdentified: synthesisResult.opportunitiesIdentified || []
    };
}

// --- AGENTIC MODE LOGIC ---

export async function runAutonomousCouncil(
    topic: string,
    apiKey: string,
    options: { threshold?: number, maxIterations?: number, onProgress?: (p: AutonomousProgress) => void }
): Promise<AutonomousCouncilResult> {
    const threshold = options.threshold || 75;
    const maxIterations = options.maxIterations || 3;
    
    let currentPost = "";
    let currentScore = 0;
    let iterations = 0;
    const history: { iteration: number; score: number; feedback: string }[] = [];

    // Step 1: Initial Draft
    if (options.onProgress) options.onProgress({ message: `Drafting initial strategy...`, iteration: 0 });
    
    while (iterations < maxIterations && currentScore < threshold) {
        iterations++;
        if (options.onProgress) options.onProgress({ message: `Council Iteration ${iterations}: Adversarial Audit...`, iteration: iterations });

        // Run full council debate
        const swarmResult = await runSwarmDebate(topic, currentPost || "Initial concept phase", apiKey, (msg) => {
            if (options.onProgress) {
                options.onProgress({ 
                    message: `${msg.agent} is auditing...`, 
                    iteration: iterations,
                    audit_log: msg
                });
            }
        });
        
        // We evaluate the synthesis
        const genAI = new GoogleGenAI({ apiKey });
        const evalResponse = await genAI.models.generateContent({
            model: PRIMARY_MODEL,
            contents: `
                TOPIC: ${topic}
                DRAFT: """${swarmResult.hardenedConcept}"""
                TASK: Act as an elite editor. Score this post for:
                1. Virality Potential (0-100)
                2. Strategic Depth (0-100)
                3. Anti-Robot Quality (0-100)
                Provide an average score and feedback (JSON ONLY).
                Output format: { "score": number, "feedback": "..." }
            `,
            config: { responseMimeType: "application/json" }
        });

        const evalResult = JSON.parse(evalResponse.text || "{}");
        currentPost = swarmResult.hardenedConcept;
        currentScore = evalResult.score || 0;
        
        history.push({
            iteration: iterations,
            score: currentScore,
            feedback: evalResult.feedback || `Risks: ${swarmResult.risksIdentified.join(", ")}`
        });

        if (options.onProgress) options.onProgress({ message: `Quality Score: ${currentScore}%`, iteration: iterations, score: currentScore });
    }

    return {
        finalPost: currentPost,
        finalScore: currentScore,
        iterations,
        history
    };
}

// --- LEGACY/LEGACY-INTEROP LOGIC (CouncilModal / SimulatorModal) ---

export async function runCouncilTurn(topic: string, history: CouncilMessage[], speakerId: string, apiKey: string): Promise<string> {
    const genAI = new GoogleGenAI({ apiKey });
    const member = COUNCIL.find(m => m.id === speakerId);
    
    const prompt = `
        Act as ${member?.name}, the ${member?.role}. 
        Topic of debate: "${topic}"
        Previous discussion: ${history.map(m => `[${m.memberId}]: ${m.content}`).join("\n")}
        Your goal: Contribute your unique perspective to the debate. Be concise but insightful.
    `;

    const response = await genAI.models.generateContent({
        model: PRIMARY_MODEL,
        contents: prompt
    });

    return response.text?.trim() || "I have nothing to add.";
}

export async function synthesizeDebate(topic: string, history: CouncilMessage[], apiKey: string): Promise<string> {
    const genAI = new GoogleGenAI({ apiKey });
    
    const prompt = `
        Act as The Prime Strategist. Review the following debate on "${topic}":
        ${history.map(m => `[${m.memberId}]: ${m.content}`).join("\n")}
        
        Synthesize this into a final, battle-hardened strategy post for LinkedIn/Twitter.
    `;

    const response = await genAI.models.generateContent({
        model: PRIMARY_MODEL,
        contents: prompt
    });

    return response.text?.trim() || "No synthesis available.";
}

export async function runSimulation(draft: string, audience: AudienceMember[], apiKey: string): Promise<SimulationFeedback[]> {
    const genAI = new GoogleGenAI({ apiKey });
    
    const simulationPrompt = `
        You are simulating a focus group. 
        CONTENT TO TEST: """${draft}"""
        
        AUDIENCE:
        ${audience.map(a => `${a.name} (${a.role})`).join("\n")}
        
        For each audience member, provide their reaction and a specific comment (JSON ONLY).
        Output format: Array<{ memberId: string, reaction: "love" | "hate" | "intrigued" | "bored", comment: string }>
    `;

    const response = await genAI.models.generateContent({
        model: PRIMARY_MODEL,
        contents: simulationPrompt,
        config: { responseMimeType: "application/json" }
    });

    return JSON.parse(response.text || "[]");
}

export async function createDynamicPersona(description: string, apiKey: string): Promise<AudienceMember | null> {
    const genAI = new GoogleGenAI({ apiKey });
    
    const prompt = `
        Create a detailed audience persona based on: "${description}".
        Provide a name, role, and a single emoji for their avatar.
        JSON format: { "name": "...", "role": "...", "avatar": "..." }
    `;

    const response = await genAI.models.generateContent({
        model: PRIMARY_MODEL,
        contents: prompt,
        config: { responseMimeType: "application/json" }
    });

    const data = JSON.parse(response.text || "{}");
    if (!data.name) return null;
    
    return {
        id: `custom-${Date.now()}`,
        name: data.name,
        role: data.role,
        avatar: data.avatar,
        isCustom: true
    };
}
