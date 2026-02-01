"use client";

import { useState } from "react";
import { GoogleGenAI } from "@google/genai";
import { Loader2, Download, RefreshCw, Image as ImageIcon } from "lucide-react";

interface VisualGeneratorProps {
  concept: string;
  apiKey: string;
}

export default function VisualGenerator({ concept, apiKey }: VisualGeneratorProps) {
  const [svgCode, setSvgCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentConcept, setCurrentConcept] = useState(concept);

  const generateVisual = async () => {
    if (!currentConcept || !apiKey) return;
    setLoading(true);

    const prompt = `
      You are a minimalist graphic designer (Jack Butcher / Visualize Value style).
      Create an SVG visualization for the concept: "${currentConcept}".
      
      RULES:
      1. Minimalist white lines on black background (or transparent with white strokes).
      2. Use simple geometric shapes (circles, squares, arrows, lines).
      3. No text inside the SVG unless absolutely necessary for labels.
      4. Aspect Ratio: 1:1 (Square).
      5. Output ONLY the raw <svg>...</svg> code. No code blocks, no markdown.
      6. Ensure it is valid SVG.
      
      EXAMPLE CONCEPTS:
      - "Compound Interest": A curve going up.
      - "Focus": Many scattered dots vs aligned dots.
      - "Leverage": A fulcrum and lever.
    `;

    try {
        const genAI = new GoogleGenAI({ apiKey });
        const result = await genAI.models.generateContent({
            model: "models/gemini-flash-latest",
            contents: prompt
        });
        
        let code = result.text || "";
        // Clean markdown if present
        code = code.replace(/```svg/g, "").replace(/```/g, "").trim();
        
        // Basic validation
        if (!code.startsWith("<svg")) {
            const start = code.indexOf("<svg");
            const end = code.indexOf("</svg>");
            if (start !== -1 && end !== -1) {
                code = code.substring(start, end + 6);
            }
        }
        
        setSvgCode(code);
    } catch (e) {
        console.error("Visual generation failed", e);
    } finally {
        setLoading(false);
    }
  };

  const downloadSvg = () => {
      if (!svgCode) return;
      const blob = new Blob([svgCode], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `strategy-os-visual-${Date.now()}.svg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4 bg-black/40 border border-white/10 rounded-xl">
        <div className="flex items-center gap-2 mb-4">
             <div className="p-1.5 bg-indigo-500/10 rounded border border-indigo-500/30">
                 <ImageIcon className="w-4 h-4 text-indigo-400" />
             </div>
             <h4 className="text-sm font-bold text-white">Visual Factory</h4>
        </div>

        <div className="flex gap-2 mb-4">
            <input 
                type="text" 
                value={currentConcept}
                onChange={(e) => setCurrentConcept(e.target.value)}
                className="flex-1 bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-indigo-500/50 outline-none"
                placeholder="Enter concept (e.g. 'Consistency')..."
            />
            <button 
                onClick={generateVisual}
                disabled={loading || !currentConcept}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-2 rounded-lg text-xs font-bold transition-colors disabled:opacity-50 flex items-center gap-2"
            >
                {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                GENERATE
            </button>
        </div>

        {svgCode ? (
            <div className="relative group">
                <div 
                    className="w-full aspect-square bg-[#111] border border-white/10 rounded-lg p-8 flex items-center justify-center overflow-hidden"
                    dangerouslySetInnerHTML={{ __html: svgCode }} 
                />
                <button 
                    onClick={downloadSvg}
                    className="absolute top-2 right-2 bg-white/10 hover:bg-white/20 text-white p-2 rounded-lg backdrop-blur-sm transition-colors opacity-0 group-hover:opacity-100"
                    title="Download SVG"
                >
                    <Download className="w-4 h-4" />
                </button>
            </div>
        ) : (
            <div className="w-full aspect-square bg-white/5 border border-white/10 border-dashed rounded-lg flex items-center justify-center text-neutral-500 text-xs">
                Visual Output Area
            </div>
        )}
    </div>
  );
}
