"use server";

import { generateText } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { CanvasNodeState } from '../utils/archive-service';

export async function aiOptimizerAction(nodes: CanvasNodeState[], personaDNA: string, geminiKey: string) {
    if (!nodes || nodes.length === 0) return null;

    const nodesContext = nodes.map(n => `ID: ${n.id} | Content: ${n.content?.substring(0, 200)}`).join('\n');

    const prompt = `
    DASHBOARD CONTEXT (Nodes on Canvas):
    ${nodesContext}

    YOUR STRATEGIC DNA:
    ${personaDNA}

    OBJECTIVE: 
    Analyze these nodes and suggest a "Strategic Cluster" arrangement. 
    Group related nodes together. 
    
    RETURN JSON FORMAT ONLY:
    {
        "clusters": [
            { "name": "Cluster Name", "nodeIds": ["id1", "id2"], "suggestedColor": "#hex" }
        ],
        "strategicConnectors": [
            { "from": "id1", "to": "id3", "label": "Strategic Pivot" }
        ]
    }

    CONSTRAINTS:
    - NO ROBOT WORDS: Do not use "Leverage", "Delve", "Synergy", "Optimize", "Facilitate".
    - BE SPECIFIC: Use concrete terms (e.g., "Cost Reduction" instead of "Optimization").
    `;

    const google = createGoogleGenerativeAI({ apiKey: geminiKey });

    try {
        const { text } = await generateText({
            model: google('gemini-1.5-flash'),
            prompt,
        });

        // Clean up markdown markers if AI adds them
        const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleaned);
    } catch (e) {
        console.error("AI Collaboration failed:", e);
        return null;
    }
}
