"use client";

/**
 * SVG DIAGRAM GENERATOR - 2028 Visualize Value Pillar
 * 
 * Renders minimalist "Visualize Value" style diagrams as SVGs.
 */

import React from "react";
import { Download, Sparkles } from "lucide-react";
import { DiagramData } from "../utils/diagram-service";

interface SVGDiagramGeneratorProps {
  data: DiagramData;
}

export default function SVGDiagramGenerator({ data }: SVGDiagramGeneratorProps) {
  const downloadSVG = () => {
    const svg = document.getElementById("visualize-value-svg");
    if (!svg) return;
    
    const serializer = new XMLSerializer();
    const source = serializer.serializeToString(svg);
    const url = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(source);
    
    const link = document.createElement("a");
    link.href = url;
    link.download = `${data.title.replace(/\s+/g, "_")}_diagram.svg`;
    link.click();
  };

  return (
    <div className="bg-neutral-900 border border-white/10 rounded-3xl overflow-hidden">
      <div className="p-6 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-widest">{data.title}</h3>
        </div>
        <button 
            onClick={downloadSVG}
            className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-neutral-400 hover:text-white transition-all"
            title="Download SVG"
        >
            <Download className="w-4 h-4" />
        </button>
      </div>

      <div className="p-12 flex justify-center bg-black aspect-square">
        <svg
          id="visualize-value-svg"
          width="400"
          height="400"
          viewBox="0 0 400 400"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="max-w-full h-auto"
        >
          <rect width="400" height="400" fill="black" />
          
          {data.type === "venn" && (
            <g>
              <circle cx="200" cy="160" r="70" stroke="white" strokeWidth="2" />
              <circle cx="160" cy="240" r="70" stroke="white" strokeWidth="2" />
              <circle cx="240" cy="240" r="70" stroke="white" strokeWidth="2" />
              
              <text x="200" y="150" fill="white" fontSize="10" textAnchor="middle" className="font-mono">{data.nodes[0]}</text>
              <text x="150" y="250" fill="white" fontSize="10" textAnchor="middle" className="font-mono">{data.nodes[1]}</text>
              <text x="250" y="250" fill="white" fontSize="10" textAnchor="middle" className="font-mono">{data.nodes[2]}</text>
            </g>
          )}

          {data.type === "cycle" && (
            <g>
              <circle cx="200" cy="200" r="100" stroke="white" strokeWidth="2" strokeDasharray="5,5" />
              {data.nodes.map((node, i) => {
                const angle = (i * 360) / data.nodes.length;
                const x = 200 + 100 * Math.cos((angle * Math.PI) / 180);
                const y = 200 + 100 * Math.sin((angle * Math.PI) / 180);
                return (
                  <g key={i}>
                    <circle cx={x} cy={y} r="40" fill="black" stroke="white" strokeWidth="2" />
                    <text x={x} y={y} fill="white" fontSize="8" textAnchor="middle" dominantBaseline="middle" className="font-mono">{node}</text>
                  </g>
                );
              })}
            </g>
          )}

          {data.type === "ladder" && (
            <g>
              {data.nodes.map((node, i) => (
                <g key={i} transform={`translate(100, ${100 + i * 80})`}>
                  <rect width="200" height="60" stroke="white" strokeWidth="2" />
                  <text x="100" y="35" fill="white" fontSize="12" textAnchor="middle" dominantBaseline="middle" className="font-mono">{node}</text>
                  {i < data.nodes.length - 1 && (
                    <line x1="100" y1="60" x2="100" y2="80" stroke="white" strokeWidth="2" />
                  )}
                </g>
              ))}
            </g>
          )}

          {data.type === "split" && (
            <g>
              <line x1="200" y1="100" x2="200" y2="150" stroke="white" strokeWidth="2" />
              <line x1="200" y1="150" x2="100" y2="250" stroke="white" strokeWidth="2" />
              <line x1="200" y1="150" x2="300" y2="250" stroke="white" strokeWidth="2" />
              
              <text x="100" y="270" fill="white" fontSize="12" textAnchor="middle" className="font-mono">{data.nodes[0]}</text>
              <text x="300" y="270" fill="white" fontSize="12" textAnchor="middle" className="font-mono">{data.nodes[1]}</text>
            </g>
          )}

          <text x="20" y="380" fill="#333" fontSize="8" className="font-mono">STRATEGYOS // VISUALIZE VALUE ENGINE</text>
        </svg>
      </div>
    </div>
  );
}
