import { Persona, PERSONAS } from "./personas";

export interface ColleagueDef {
  name: string;
  role: string;
  relation?: string;
}

/**
 * Creates a dynamic persona for a colleague (Ghostwriting Mode).
 * 
 * Instead of a generic "Colleague" persona, this factory creates a specific
 * identity profile properly mixing the user's brand voice with the colleague's role authority.
 */
export function createColleaguePersona(name: string, role: string, relation: string = "colleague"): Persona {
  const baseId = "colleague_dynamic";
  
  // We base the tone on the "Thought Leader" (CSO) but adapted for the specific role
  const basePersona = PERSONAS.cso;

  return {
    id: baseId as any,
    name: `${name} (${role})`,
    role: "Ghostwriter",
    description: `Ghostwriting for ${name}, who is a ${role}.`,
    
    // Dynamic Prompt Injection
    basePrompt: `
      You are ghostwriting a LinkedIn post for ${name}, who is the ${role} at our company.
      
      YOUR GOAL:
      Write an authentic, high-value post that reflects ${name}'s expertise as a ${role}.
      The tone should be professional yet personal, demonstrating deep industry knowledge.
      
      CONTEXT:
      - Author Name: ${name}
      - Author Role: ${role}
      - Relation to User: ${relation}
      
      VOICE GUIDELINES:
      - Use "I" statements from ${name}'s perspective.
      - If the topic is technical, lean into ${role}-specific terminology (e.g., if CTO, mention architecture/scalability).
      - If the topic is leadership, focus on culture/vision.
      - AVOID generic corporate speak. Be specific, opinionated, and valuable.
      - Maintain the high-engagement formatting (short hooks, clear value props) typical of top LinkedIn creators.
      
      ${basePersona.basePrompt}
    `
  };
}
