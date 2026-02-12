"use server";

import type { CanvasNodeState } from '../utils/archive-service';
import { runSwarmDebate, SwarmResult } from '../utils/swarm-service';
import { GoogleGenAI } from "@google/genai";
import { AI_CONFIG } from "../utils/config";

export type AICanvasSuggestion = {
    title: string;
    content: string;
};

export async function aiOptimizerAction(
    nodes: CanvasNodeState[],
    personaDNA: string,
    geminiKey: string
): Promise<{ suggestions: AICanvasSuggestion[] }> {
    if (!geminiKey) {
        throw new Error("API key required");
    }

    const sanitizedNodes = (nodes || [])
        .filter((n) => Boolean(n?.content && n.content.trim()))
        .slice(0, 12)
        .map((n) => ({
            id: n.id,
            type: n.type,
            content: (n.content || "").trim().slice(0, 2000),
        }));

    if (geminiKey.trim().toLowerCase() === "demo") {
        return {
            suggestions: [
                {
                    title: "Synthesis Node",
                    content:
                        "Combine the strongest claim from each node into one decisive through-line.\n\nThen add one measurable business outcome and one falsifiable prediction.",
                },
            ],
        };
    }

    const genAI = new GoogleGenAI({ apiKey: geminiKey.trim() });
    const prompt = `
You are an AI collaborator inside a strategy canvas.

PERSONA DNA (tone + lens):
${personaDNA || "(none provided)"}

CANVAS NODES (raw material):
${sanitizedNodes.map((n) => `- [${n.id}] (${n.type}) ${JSON.stringify(n.content)}`).join("\n")}

TASK:
Propose 1-3 *new nodes to add* that increase strategic clarity and decision usefulness.

Rules:
1. Each suggestion must have a short, high-status title.
2. Content must be plain text, short paragraphs, no emojis.
3. No meta commentary about being an AI.

Return JSON only in this schema:
{ "suggestions": [ { "title": "string", "content": "string" } ] }
`.trim();

    const result = await genAI.models.generateContent({
        model: AI_CONFIG.staticPrimaryModel,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
        },
    });

    const raw = (result.text || "").trim().replace(/```json\n?|\n?```/g, "");
    let parsed: any = null;
    try {
        parsed = JSON.parse(raw);
    } catch {
        parsed = null;
    }

    const suggestions = Array.isArray(parsed?.suggestions) ? parsed.suggestions : [];
    const normalized: AICanvasSuggestion[] = suggestions
        .map((s: any) => ({
            title: typeof s?.title === "string" ? s.title.trim().slice(0, 120) : "",
            content: typeof s?.content === "string" ? s.content.trim().slice(0, 8000) : "",
        }))
        .filter((s: AICanvasSuggestion) => s.title && s.content)
        .slice(0, 3);

    return { suggestions: normalized };
}

/**
 * BOARDROOM DEBATE ACTION
 * Triggers a multi-agent adversarial audit of a strategic concept.
 */
export async function boardroomDebateAction(
    content: string, 
    apiKey: string,
    topic: string = "Strategy Refinement"
): Promise<SwarmResult | null> {
    if (!content || !apiKey) return null;

    try {
        return await runSwarmDebate(topic, content, apiKey);
    } catch (e) {
        console.error("Boardroom Debate failed:", e);
        return null;
    }
}
