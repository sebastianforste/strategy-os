/**
 * DIAGRAM SERVICE - 2028 Visualize Value Pillar
 * 
 * Extracts structural concepts from text to generate SVG diagrams.
 */

import { GoogleGenAI } from "@google/genai";

const PRIMARY_MODEL = process.env.NEXT_PUBLIC_GEMINI_PRIMARY_MODEL || "models/gemini-flash-latest";

export type DiagramType = "venn" | "cycle" | "ladder" | "split";

export interface DiagramData {
  type: DiagramType;
  nodes: string[];
  title: string;
}

/**
 * GENERATE DIAGRAM DATA
 * --------------------
 * Uses Gemini to determine the best diagram type and content from text.
 */
export async function generateDiagramData(content: string, apiKey: string): Promise<DiagramData> {
  const genAI = new GoogleGenAI({ apiKey });
  
  const prompt = `
    Analyze this text and extract a core intellectual concept that can be visualized.
    
    TEXT:
    """
    ${content}
    """
    
    DIAGRAM TYPES:
    1. "venn": Intersection of 3 concepts. Output 3 nodes.
    2. "cycle": A repeating process or feedback loop. Output 3-4 nodes.
    3. "ladder": A progression or hierarchy. Output 3 nodes.
    4. "split": A choice or divergence. Output 2 nodes.
    
    OUTPUT (JSON):
    {
      "type": "venn | cycle | ladder | split",
      "nodes": ["Point A", "Point B", ...],
      "title": "Short title (3 words max)"
    }
  `;
  
  try {
    const result = await genAI.models.generateContent({
      model: PRIMARY_MODEL,
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });
    
    return JSON.parse(result.text || "{}") as DiagramData;
  } catch (e) {
    console.error("Diagram data extraction failed:", e);
    return { type: "split", nodes: ["Input", "Output"], title: "Concept Evolution" };
  }
}
