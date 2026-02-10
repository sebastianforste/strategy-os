"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Map, ArrowRight, Sparkles, Wand2, CheckCircle2, Layout, Layers, Box, History } from "lucide-react";

interface NarrativeStep {
    id: string;
    stage: string;
    title: string;
    content: string;
    status: "pending" | "generating" | "completed";
}

const ARC_STAGES = [
    { stage: "The Hook", desc: "Introduce the problem and the current status quo." },
    { stage: "The Inciting Incident", desc: "What changed? Why is the old way dying?" },
    { stage: "The Struggle", desc: "The mistakes people make when trying to solve it." },
    { stage: "The Breakthrough", desc: "The 'World Class' insight that changes everything." },
    { stage: "The Payoff", desc: "The transformation and high-status outcome." },
    { stage: "The Call to Action", desc: "How the reader can achieve this too." }
];

export default function NarrativeArchitect({ initialTheme }: { initialTheme?: string }) {
    const [steps, setSteps] = useState<NarrativeStep[]>(
        ARC_STAGES.map((s, i) => ({
            id: `step-${i}`,
            stage: s.stage,
            title: `Post ${i + 1}`,
            content: "",
            status: "pending"
        }))
    );
    const [isGenerating, setIsGenerating] = useState(false);

    const generateArc = async () => {
        setIsGenerating(true);
        // Simulate batch generation of the narrative arc
        for (let i = 0; i < steps.length; i++) {
            setSteps(prev => prev.map((s, idx) => idx === i ? { ...s, status: "generating" } : s));
            await new Promise(r => setTimeout(r, 800));
            setSteps(prev => prev.map((s, idx) => idx === i ? { ...s, status: "completed", content: `Generated content for ${s.stage} based on "${initialTheme || 'StrategyOS'}"...` } : s));
        }
        setIsGenerating(false);
    };

    return (
        <div className="w-full bg-[#05060a] border border-white/10 rounded-[2rem] overflow-hidden shadow-3xl">
            <div className="p-8 border-b border-white/5 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-indigo-900/20 via-black to-black">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-5">
                        <div className="p-4 bg-indigo-600/10 rounded-2xl border border-indigo-500/30">
                            <BookOpen className="w-8 h-8 text-indigo-400" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-white tracking-tighter uppercase italic">Narrative Architect</h2>
                            <p className="text-[10px] text-neutral-500 font-mono tracking-[0.3em] uppercase mt-1">Multi-Post Story Arc Planner</p>
                        </div>
                    </div>
                    <button 
                        onClick={generateArc}
                        disabled={isGenerating}
                        className="px-8 py-3 bg-white text-black font-black rounded-2xl text-xs hover:scale-105 transition-all shadow-xl shadow-white/5 flex items-center gap-3 uppercase tracking-widest"
                    >
                        {isGenerating ? <History className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                        {isGenerating ? "Mapping Arc..." : "Generate Full Arc"}
                    </button>
                </div>
            </div>

            <div className="p-8">
                <div className="relative flex flex-col gap-4">
                    <div className="absolute left-6 top-10 bottom-10 w-px bg-gradient-to-b from-indigo-500/50 via-white/5 to-transparent pointer-events-none" />
                    
                    {steps.map((step, i) => (
                        <motion.div 
                            key={step.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="relative pl-16 group"
                        >
                            <div className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 z-10 transition-all ${
                                step.status === 'completed' ? 'bg-indigo-500 border-indigo-400 scale-125 shadow-[0_0_15px_rgba(99,102,241,0.5)]' :
                                step.status === 'generating' ? 'bg-amber-500 border-amber-400 animate-pulse' :
                                'bg-[#0f111a] border-white/10'
                            }`} />

                            <div className="bg-[#0f111a] border border-white/5 rounded-3xl p-6 hover:border-indigo-500/30 transition-all group-hover:bg-[#1a1c25]/40">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <span className="text-[10px] font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded uppercase tracking-widest">{step.stage}</span>
                                        <h3 className="text-sm font-black text-white uppercase tracking-tight">{step.title}</h3>
                                    </div>
                                    {step.status === 'completed' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                                </div>
                                
                                {step.status === 'pending' ? (
                                    <p className="text-xs text-neutral-600 italic">Awaiting tactical data...</p>
                                ) : (
                                    <p className="text-xs text-neutral-400 leading-relaxed max-w-2xl">
                                        {step.content || "Generating deep narrative consistency..."}
                                    </p>
                                )}

                                <div className="mt-4 flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest hover:text-white">Edit Draft</button>
                                    <button className="text-[9px] font-bold text-neutral-600 uppercase tracking-widest hover:text-white">Regenerate</button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            <div className="p-4 bg-black/60 border-t border-white/5 flex items-center justify-between px-8">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <Map className="w-3 h-3 text-neutral-500" />
                        <span className="text-[10px] text-neutral-500 font-mono uppercase">Path: Journey v1.4</span>
                    </div>
                </div>
                <div className="flex gap-4">
                    <button className="px-6 py-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black rounded-xl hover:bg-indigo-500/20 transition-all uppercase tracking-widest">Archive Arc</button>
                    <button className="px-6 py-2 bg-indigo-600 text-white text-[10px] font-black rounded-xl hover:bg-indigo-500 transition-all uppercase tracking-widest shadow-lg shadow-indigo-600/20">Sync to Calendar</button>
                </div>
            </div>
        </div>
    );
}
