"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Image as ImageIcon, Wand2, RefreshCw, Layers, ShieldCheck, Zap, ChevronRight, CheckCircle, Database, Cpu, Palette, Sliders, Box, Maximize2, Download } from "lucide-react";

interface StyleLORA {
    id: string;
    label: string;
    intensity: number;
    description: string;
}

const LORAS: StyleLORA[] = [
    { id: 'l1', label: 'StrategyOS Dark', intensity: 92, description: 'Deep blacks, neon accents, high-contrast UI.' },
    { id: 'l2', label: 'Ethereal Tech', intensity: 74, description: 'Soft gradients, glassmorphism, floating elements.' },
    { id: 'l3', label: 'Cyber-Brutalist', intensity: 68, description: 'Raw grids, bold serif, mono-weight textures.' },
];

export default function VisualAlchemistV3() {
    const [loras] = useState<StyleLORA[]>(LORAS);
    const [selectedId, setSelectedId] = useState('l1');
    const [isSynthesizing, setIsSynthesizing] = useState(false);

    const handleSynthesize = () => {
        setIsSynthesizing(true);
        setTimeout(() => setIsSynthesizing(false), 3000);
    };

    return (
        <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-8 min-h-[700px]">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12">
                <div className="flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-brand-400/10 text-brand-400 border border-brand-400/20 shadow-[0_0_20px_rgba(34,211,238,0.1)]">
                        <Wand2 className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white uppercase tracking-tight">Visual Alchemist V3</h2>
                        <p className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-mono mt-1">Fine-Tuned Content-to-Visual Generation & LORA Injection</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button 
                        onClick={handleSynthesize}
                        disabled={isSynthesizing}
                        className="px-6 py-2.5 bg-brand-500 text-white rounded-xl text-[10px] font-black tracking-widest hover:shadow-[0_0_30px_rgba(34,211,238,0.3)] transition-all uppercase flex items-center gap-2"
                    >
                        {isSynthesizing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                        <span>{isSynthesizing ? "Synthesizing..." : "Transmute Logic"}</span>
                    </button>
                    <div className="p-2.5 bg-white/5 border border-white/10 rounded-xl text-white/40">
                        <Palette className="w-4 h-4" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* STUDIO CANVAS */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Flux Pipeline Output</h3>
                        <div className="flex items-center gap-4 text-[10px] font-black text-white/40 uppercase tracking-widest">
                            <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> GPU Availability: 100%</span>
                        </div>
                    </div>

                    <div className="relative group overflow-hidden rounded-[40px] aspect-video border border-white/5 bg-white/[0.01]">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700" />
                        
                        {/* Mock Image Content */}
                        <div className="absolute inset-0 flex items-center justify-center p-12">
                           <div className="w-full h-full border border-white/5 rounded-3xl relative overflow-hidden flex items-center justify-center bg-[#0d0d0d]">
                                <ImageIcon className="w-16 h-16 text-white/5 group-hover:text-brand-400 group-hover:scale-110 transition-all duration-700" />
                                <div className="absolute bottom-8 left-8 right-8">
                                    <h4 className="text-lg font-black text-white tracking-tighter opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-0 duration-500">Visual Meta-Strategy</h4>
                                    <p className="text-[10px] text-white/40 uppercase font-black tracking-[0.2em] opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-0 duration-500 delay-75">Concept: Neural Orchestration</p>
                                </div>
                           </div>
                        </div>

                        <div className="absolute top-6 right-6 flex flex-col gap-2 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-500">
                            <button className="p-3 bg-black/80 backdrop-blur-xl border border-white/10 rounded-xl text-white hover:bg-white hover:text-black transition-all"><Maximize2 className="w-4 h-4" /></button>
                            <button className="p-3 bg-black/80 backdrop-blur-xl border border-white/10 rounded-xl text-white hover:bg-white hover:text-black transition-all"><Download className="w-4 h-4" /></button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-8 bg-white/[0.01] border border-white/5 rounded-[40px] space-y-4">
                            <div className="flex items-center gap-3">
                                <Sliders className="w-4 h-4 text-brand-400" />
                                <h3 className="text-[10px] font-black text-white uppercase tracking-widest">Composition Meta</h3>
                            </div>
                            <div className="space-y-3 font-mono text-[10px] text-white/40 uppercase">
                                <div className="flex justify-between"><span>Resolution</span><span className="text-white">2048x2048</span></div>
                                <div className="flex justify-between"><span>Guidance Scale</span><span className="text-white">7.5</span></div>
                                <div className="flex justify-between"><span>Steps</span><span className="text-white">50</span></div>
                            </div>
                        </div>
                        <div className="p-8 bg-white/[0.01] border border-white/5 rounded-[40px] space-y-4">
                            <div className="flex items-center gap-3">
                                <Box className="w-4 h-4 text-brand-400" />
                                <h3 className="text-[10px] font-black text-white uppercase tracking-widest">Prompt Injections</h3>
                            </div>
                            <div className="flex flex-wrap gap-2 text-[9px] font-black text-brand-400 uppercase tracking-tighter bg-brand-400/5 p-4 rounded-2xl border border-brand-400/10 italic">
                                "Cyber-Brutalist architectural strategy overview, high-fidelity dark mode UI assets, octane render, unreal engine 5 style blending"
                            </div>
                        </div>
                    </div>
                </div>

                {/* STYLE INVENTORY */}
                <div className="space-y-6">
                    <h3 className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-4">Branded LORAs</h3>
                    
                    <div className="space-y-4">
                        {loras.map((lora) => (
                            <button
                                key={lora.id}
                                onClick={() => setSelectedId(lora.id)}
                                className={`w-full p-6 rounded-3xl border transition-all text-left relative overflow-hidden group ${
                                    selectedId === lora.id ? 'bg-brand-500/5 border-brand-500/30' : 'bg-white/5 border-white/5 hover:border-white/10'
                                }`}
                            >
                                <div className="relative z-10 flex items-center justify-between">
                                    <div>
                                        <h4 className={`text-[10px] font-black uppercase tracking-widest mb-1 ${selectedId === lora.id ? 'text-brand-400' : 'text-white/60'}`}>{lora.label}</h4>
                                        <div className="text-lg font-black text-white tracking-tighter mb-1">{lora.intensity}% Influence</div>
                                        <p className="text-[9px] text-white/40 uppercase font-bold leading-tight line-clamp-1">{lora.description}</p>
                                    </div>
                                    <CheckCircle className={`w-4 h-4 transition-all ${selectedId === lora.id ? 'text-brand-400 scale-100' : 'text-white/5 scale-0'}`} />
                                </div>
                            </button>
                        ))}
                    </div>

                    <div className="p-8 bg-brand-500/5 border border-brand-500/10 rounded-3xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-700">
                           <Cpu className="w-32 h-32 text-brand-400" />
                        </div>
                        <div className="flex items-center gap-3 mb-6">
                            <Zap className="w-4 h-4 text-brand-400" />
                            <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Injection Depth</h4>
                        </div>
                        <div className="text-4xl font-black text-white tracking-tighter">0.824</div>
                        <p className="text-[9px] text-white/20 uppercase font-black tracking-widest mt-2">Neural Alignment Variance</p>
                    </div>

                    <div className="p-6 border border-white/5 rounded-2xl flex items-center justify-between cursor-pointer hover:bg-white/5 transition-all group">
                        <div className="flex items-center gap-3">
                            <Database className="w-4 h-4 text-white/20 group-hover:text-white" />
                            <span className="text-[10px] font-bold text-white uppercase tracking-tight">Access Render History</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-white/20" />
                    </div>
                </div>
            </div>
        </div>
    );
}
