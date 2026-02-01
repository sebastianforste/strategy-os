"use client";

import { useEffect, useRef } from "react";
import { Download, RefreshCw, Wand2 } from "lucide-react";

interface ThumbnailFactoryProps {
  title: string;
  prompt: string;
}

export default function ThumbnailFactory({ title, prompt }: ThumbnailFactoryProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const drawThumbnail = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, 1280, 720);

    // Background Gradient (Randomized)
    const gradients = [
        ["#4f46e5", "#000000"], // Cobalt
        ["#dc2626", "#000000"], // Red
        ["#ea580c", "#000000"], // Orange
    ];
    const picked = gradients[Math.floor(Math.random() * gradients.length)];
    const grad = ctx.createLinearGradient(0, 0, 1280, 720);
    grad.addColorStop(0, picked[0]);
    grad.addColorStop(1, picked[1]);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1280, 720);

    // Brutalist Grid Overlay
    ctx.strokeStyle = "rgba(255,255,255,0.1)";
    ctx.lineWidth = 2;
    for(let i=0; i<1280; i+=100) {
        ctx.beginPath(); ctx.moveTo(i,0); ctx.lineTo(i,720); ctx.stroke();
    }
    for(let i=0; i<720; i+=100) {
        ctx.beginPath(); ctx.moveTo(0,i); ctx.lineTo(1280,i); ctx.stroke();
    }

    // Text Rendering (Split into lines roughly)
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 120px 'Inter', sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    
    // Very simple wrapping logic for 1280px width
    const words = title.toUpperCase().split(" ");
    let line1 = "";
    let line2 = "";
    
    // Try to split mostly evenly
    const mid = Math.ceil(words.length / 2);
    line1 = words.slice(0, mid).join(" ");
    line2 = words.slice(mid).join(" ");

    ctx.fillText(line1, 100, 300);
    ctx.fillText(line2, 100, 440);

    // Sticker/Arrow (Mock)
    ctx.fillStyle = "#FFE600"; // Bright Yellow
    ctx.beginPath();
    ctx.arc(1100, 360, 100, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = "#000";
    ctx.font = "bold 40px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("VS", 1100, 360);
  };

  useEffect(() => {
    drawThumbnail();
  }, [title]);

  return (
    <div className="w-full flex flex-col items-center gap-6">
        <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-2xl border border-white/20 group">
            <canvas 
                ref={canvasRef} 
                width={1280} 
                height={720} 
                className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 backdrop-blur-sm">
                <button onClick={drawThumbnail} className="bg-white text-black px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:scale-105 transition-transform">
                    <RefreshCw className="w-5 h-5" /> REGENERATE
                </button>
                <button className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-500 hover:scale-105 transition-transform">
                    <Download className="w-5 h-5" /> DOWNLOAD PNG
                </button>
            </div>
        </div>
        
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 w-full flex items-center gap-4">
            <Wand2 className="w-5 h-5 text-indigo-400" />
            <p className="text-xs text-neutral-400 flex-1 font-mono">{prompt || "Generating optimal prompt..."}</p>
        </div>
    </div>
  );
}
