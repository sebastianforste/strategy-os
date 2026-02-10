"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Brain, Wand2, Type, RefreshCw, Layers, ShieldCheck, Zap, ChevronRight, CheckCircle, SearchCode, Database, Cpu, MessageSquare, AlertCircle } from "lucide-react";

interface StyleProfile {
    id: string;
    label: string;
    intensity: number;
    description: string;
}

const PROFILES: StyleProfile[] = [
    { id: 'p1', label: 'Billionaire Founder', intensity: 85, description: 'Direct, focused, authoritative, low-context.' },
    { id: 'p2', label: 'Technical Visionary', intensity: 70, description: 'Futuristic, data-driven, complex but clear.' },
    { id: 'p3', label: 'Philanthropic Elite', intensity: 92, description: 'Empathetic, high-status, world-building.' },
];

export default function StyleTransformer() {
    const [profiles] = useState<StyleProfile[]>(PROFILES);
    const [selectedId, setSelectedId] = useState('p1');
    const [isTransforming, setIsTransforming] = useState(false);

    const handleTransform = () => {
        setIsTransforming(true);
        setTimeout(() => setIsTransforming(false), 2500);
    };

    return (
        <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-8 min-h-[700px]">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12">
                <div className="flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-[0_0_20px_rgba(99,102,241,0.1)]">
                        <Wand2 className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white uppercase tracking-tight">Style Transformer</h2>
                        <p className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-mono mt-1">Neural Narrative Blending & Linguistic Filtering</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button 
                        onClick={handleTransform}
                        disabled={isTransforming}
                        className="px-6 py-2.5 bg-indigo-500 text-white rounded-xl text-[10px] font-black tracking-widest hover:shadow-[0_0_30px_rgba(99,102,241,0.3)] transition-all uppercase flex items-center gap-2"
                    >
                        {isTransforming ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                        <span>{isTransforming ? "Processing..." : "Infuse Style"}</span>
                    </button>
                    <div className="p-2.5 bg-white/5 border border-white/10 rounded-xl text-white/40">
                        <Type className="w-4 h-4" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* TRANSFORMER ENGINE */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="space-y-4">
                        <h3 className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Neural Profiles</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {profiles.map((p) => (
                                <button
                                    key={p.id}
                                    onClick={() => setSelectedId(p.id)}
                                    className={`p-6 rounded-3xl border transition-all text-left group relative overflow-hidden ${
                                        selectedId === p.id ? 'bg-indigo-500/5 border-indigo-500/30' : 'bg-white/5 border-white/5 hover:border-white/10'
                                    }`}
                                >
                                    <div className="relative z-10">
                                        <h4 className={`text-[10px] font-black uppercase tracking-widest mb-2 ${selectedId === p.id ? 'text-indigo-400' : 'text-white/60'}`}>{p.label}</h4>
                                        <div className="text-2xl font-black text-white mb-2 tracking-tighter">{p.intensity}%</div>
                                        <p className="text-[9px] text-white/40 uppercase font-bold leading-tight">{p.description}</p>
                                    </div>
                                    {selectedId === p.id && (
                                        <motion.div layoutId="profile-glow" className="absolute inset-0 bg-indigo-500/5 blur-2xl rounded-full" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="p-8 bg-white/[0.02] border border-white/5 rounded-[40px] space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Linguistic Buffer</h3>
                            <span className="text-[9px] font-mono text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded uppercase font-bold tracking-tighter">Verified</span>
                        </div>
                        <div className="space-y-4">
                            <p className="text-sm font-mono text-rose-400/40 line-through">"We use AI to help people work faster and better."</p>
                            <div className="flex justify-center p-2 opacity-20"><Zap className="w-4 h-4 text-indigo-400" /></div>
                            <p className="text-lg font-bold text-white tracking-tight leading-relaxed italic">
                                "We synthesize intelligence to architect a high-authority operational future."
                            </p>
                        </div>
                    </div>
                </div>

                {/* STYLE VITALS */}
                <div className="space-y-6">
                    <h3 className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-4">Linguistic Vitals</h3>
                    
                    <div className="p-8 bg-indigo-500/5 border border-indigo-500/10 rounded-3xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-700">
                            <Brain className="w-32 h-32 text-indigo-400" />
                        </div>
                        
                        <div className="flex items-center gap-3 mb-8">
                            <Layers className="w-5 h-5 text-indigo-400" />
                            <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Aura Alignment</h4>
                        </div>
                        
                        <div className="text-4xl font-black text-white tracking-tighter mb-2">Elite<span className="text-indigo-500">.</span>04</div>
                        <p className="text-[10px] text-white/40 uppercase font-black tracking-widest mb-8">Status Variance Score</p>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                                <div className="text-[9px] font-black text-white/20 uppercase mb-2">Authority</div>
                                <div className="text-lg font-black text-indigo-400">98%</div>
                            </div>
                            <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                                <div className="text-[9px] font-black text-white/20 uppercase mb-2">Simplicity</div>
                                <div className="text-lg font-black text-emerald-400">12%</div>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl space-y-4">
                        <div className="flex items-center gap-3">
                            <ShieldCheck className="w-4 h-4 text-emerald-400" />
                            <h4 className="text-[10px] font-bold text-white uppercase tracking-widest">Banned Lexicon Filter</h4>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <LexiconChip label="Delve" active />
                            <LexiconChip label="Leverage" active />
                            <LexiconChip label="Unleash" active />
                            <LexiconChip label="Exciting" active />
                        </div>
                    </div>

                    <div className="p-6 border border-white/5 rounded-2xl flex items-center justify-between cursor-pointer hover:bg-white/5 transition-all group">
                        <div className="flex items-center gap-3">
                            <Database className="w-4 h-4 text-white/20 group-hover:text-white" />
                            <span className="text-[10px] font-bold text-white uppercase tracking-tight">Sync Persona Brain</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-white/20" />
                    </div>
                </div>
            </div>
        </div>
    );
}

function LexiconChip({ label, active }: { label: string, active?: boolean }) {
    return (
        <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border ${
            active ? "bg-rose-500/10 border-rose-500/20 text-rose-400" : "bg-white/5 border-white/10 text-white/30"
        }`}>
            {label}
        </span>
    );
}
