/**
 * DEEP RESEARCH ENGINE
 * --------------------
 * A recursive, autonomous research agent that explores a topic in breadth and depth.
 * Inspired by "DeepSeek" / OpenAI Deep Research.
 */

import { GoogleGenAI } from "@google/genai";
import { AI_CONFIG } from "./config";
import { fetchTrendingNews } from "./trend-service";
import { searchGrounding } from "./search-service";

const PRIMARY_MODEL = AI_CONFIG.primaryModel; // Use centralized config

export interface ResearchNode {
    id: string;
    query: string;
    depth: number;
    status: 'pending' | 'searching' | 'analyzing' | 'completed';
    findings: string[];
    children: ResearchNode[];
}

export interface ResearchReport {
    topic: string;
    markdown: string;
    sources: string[];
    nodesVisited: number;
}

/**
 * RECURSIVE RESEARCH LOOP
 * -----------------------
 * 1. Generates 'breadth' queries for the topic.
 * 2. Executes searches.
 * 3. Analyzes results to find 'depth' areas.
 * 4. Recursively searches those areas.
 * 5. Synthesizes a final report.
 */
export async function performDeepRecursiveResearch(
    topic: string, 
    apiKey: string, 
    serperKey?: string,
    maxDepth: number = 2,
    breadth: number = 3,
    onProgress?: (node: ResearchNode) => void
): Promise<ResearchReport> {
    console.log(`[DeepResearch] Starting recursive loop for: "${topic}"`);
    
    const rootNode: ResearchNode = {
        id: "root",
        query: topic,
        depth: 0,
        status: 'searching',
        findings: [],
        children: []
    };
    
    const allSources: Set<string> = new Set();
    const genAI = new GoogleGenAI({ apiKey });

    // Recursive Function
    async function processNode(node: ResearchNode) {
        if (node.depth > maxDepth) return;
        
        onProgress?.({ ...node, status: 'searching' });
        
        // 1. Search
        let results: any[] = [];
        try {
            if (serperKey) {
                // Use Serper for web results
                 // We use a broader search for finding sub-topics
                results = await searchGrounding(node.query, apiKey); 
            } else {
                // Fallback to Gemini Grounding (if no Serper, though searchGrounding usually handles this)
                results = await searchGrounding(node.query, apiKey);
            }
        } catch (e) {
            console.error(`[DeepResearch] Search failed for ${node.query}`, e);
        }

        const snippets = results.map(r => r.snippet).filter(s => s);
        const sources = results.map(r => r.link).filter(s => s);
        sources.forEach(s => allSources.add(s));
        
        node.findings = snippets;
        onProgress?.({ ...node, status: 'analyzing' });

        // 2. Determine Sub-Queries (Breadth)
        if (node.depth < maxDepth && snippets.length > 0) {
            const subQueries = await generateFollowUpQueries(node.query, snippets, breadth, apiKey);
            
            node.children = subQueries.map((q, i) => ({
                id: `${node.id}-${i}`,
                query: q,
                depth: node.depth + 1,
                status: 'pending',
                findings: [],
                children: []
            }));

            // Process Children (Parallel)
            await Promise.all(node.children.map(child => processNode(child)));
        }
        
        onProgress?.({ ...node, status: 'completed' });
    }

    // Start Recursion
    await processNode(rootNode);

    // Final Synthesis
    const reportMarkdown = await synthesizeReport(topic, rootNode, apiKey);

    return {
        topic,
        markdown: reportMarkdown,
        sources: Array.from(allSources),
        nodesVisited: countNodes(rootNode)
    };
}

// --- HELPERS ---

async function generateFollowUpQueries(parentQuery: string, findings: string[], count: number, apiKey: string): Promise<string[]> {
    const genAI = new GoogleGenAI({ apiKey });
    const prompt = `
        Based on these findings about "${parentQuery}", generate ${count} specific follow-up search queries to dig deeper into the most interesting or unclear aspects.
        Focus on specific details, contrarian evidence, or "why" questions.
        
        FINDINGS:
        ${findings.slice(0, 5).join("\n")}
        
        RETURN ONLY A JSON ARRAY OF STRINGS.
    `;

    try {
        const result = await genAI.models.generateContent({
            model: PRIMARY_MODEL,
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });
        return JSON.parse(result.text || "[]");
    } catch (e) {
        return [];
    }
}

async function synthesizeReport(topic: string, rootNode: ResearchNode, apiKey: string): Promise<string> {
    const genAI = new GoogleGenAI({ apiKey });
    
    // Flatten findings for context window
    const allFindings = extractFindings(rootNode);
    
    const prompt = `
        You are a Deep Research Agent. Write a comprehensive, report-style answer for: "${topic}".
        Use the following researched findings. Cite sources if possible (referenced in the text, you don't have URLs but know the info exists).
        
        Make the report structured with:
        - Executive Summary
        - Key Pillars (Deep Dive)
        - Contrarian/Niche Angles
        - Conclusion
        
        FINDINGS DATABASE:
        ${allFindings.slice(0, 50).join("\n")} // Limit to avoid context overflow
    `;

    const result = await genAI.models.generateContent({
        model: PRIMARY_MODEL,
        contents: prompt
    });

    return result.text || "Report generation failed.";
}

function extractFindings(node: ResearchNode): string[] {
    let findings = [...node.findings];
    for (const child of node.children) {
        findings = [...findings, ...extractFindings(child)];
    }
    return findings;
}

function countNodes(node: ResearchNode): number {
    let count = 1;
    for (const child of node.children) {
        count += countNodes(child);
    }
    return count;
}
