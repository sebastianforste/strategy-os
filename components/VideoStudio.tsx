"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Film, Video, Scissors, Play, Download, Share2, Sparkles, MessageSquare, History, Bookmark, Hash, Quote, ChevronRight, Activity, Filter, Settings2, Clapperboard, MonitorPlay, Waves } from "lucide-react";

interface VideoScript {
    id: string;
    title: string;
    hook: string;
    duration: string;
    vibe: string;
    status: 'Draft' | 'Final' | 'Storyboarded';
}

const SCRIPTS: VideoScript[] = [
    { id: 'v1', title: 'The Agentic Era Manifesto', hook: 'The mouse is dead. Commands are everything...', duration: '58s', vibe: 'Cinematic / Authoritative', status: 'Storyboarded' },
    { id: 'v2', title: 'Micro-SaaS to Macro-Engine', hook: 'How I scaled my logic without scaling my team...', duration: '45s', vibe: 'High-Energy / Minimalist', status: 'Draft' },
    { id: 'v3', title: 'Prompting as a High-Art', hook: 'Why your AI is failing (Hint: It is your input)...', duration: '62s', vibe: 'Documentary / Noir', status: 'Final' },
];

export default function VideoStudio() {
    const [scripts] = useState<VideoScript[]>(SCRIPTS);
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
                    <div className="p-3 rounded-2xl bg-brand-500/10 text-brand-400 border border-brand-500/20">
                        <Film className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white uppercase tracking-tight">Video Architect</h2>
                        <p className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-mono mt-1">High-Status Video Scripting & Storyboards</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button 
                        onClick={handleSynthesize}
                        disabled={isSynthesizing}
                        className="px-6 py-2.5 bg-brand-500 text-white rounded-xl text-[10px] font-black tracking-widest hover:scale-105 transition-all shadow-lg shadow-brand-500/20 uppercase flex items-center gap-2"
                    >
                        {isSynthesizing ? <RefreshCcw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                        <span>{isSynthesizing ? "Composing..." : "Generate Script"}</span>
                    </button>
                    <button className="p-2.5 bg-white/5 border border-white/10 rounded-xl text-white/40 hover:text-white transition-all">
                        <Clapperboard className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* STUDIO OPS */}
                <div className="space-y-8">
                    <div className="grid grid-cols-2 gap-4">
                        <StudioPhase icon={<MonitorPlay />} label="Talking Head" active />
                        <StudioPhase icon={<Waves />} label="B-Roll Engine" />
                        <StudioPhase icon={<Scissors />} label="Auto-Cutter" />
                        <StudioPhase icon={<Video />} label="Cinema 4D Sync" />
                    </div>

                    <div className="p-10 bg-white/[0.02] border border-white/5 rounded-3xl relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-1 h-full bg-brand-500" />
                        <div className="flex items-center gap-3 mb-6">
                            <Play className="w-4 h-4 text-brand-400" />
                            <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Active Draft: Manifesto V2</h4>
                        </div>
                        <p className="text-sm text-white/40 leading-relaxed italic mb-8">
                            "Visual: Close up on user’s eye. Reflection of code scrolling. Deep bass hit. Voiceover: The mouse is a relic. Your thoughts are the cursor..."
                        </p>
                        <div className="flex gap-4">
                            <button className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg text-[9px] font-black text-white uppercase tracking-widest transition-all">
                                View Full Script
                            </button>
                            <button className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg text-[9px] font-black text-white uppercase tracking-widest transition-all">
                                Export Storyboard
                            </button>
                        </div>
                    </div>

                    <div className="p-6 border border-white/5 rounded-2xl flex items-center justify-between cursor-pointer hover:bg-white/5 transition-all">
                        <div className="flex items-center gap-3">
                            <Activity className="w-4 h-4 text-emerald-400" />
                            <span className="text-[10px] font-bold text-white uppercase tracking-tight">Audio Waveform Mastered</span>
                        </div>
                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                    </div>
                </div>

                {/* ARCHIVE */}
                <div className="space-y-6">
                    <h3 className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-4">Production Archive</h3>
                    
                    <div className="space-y-4">
                        {scripts.map((script) => (
                            <motion.div
                                key={script.id}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="p-6 bg-white/5 border border-white/5 rounded-3xl group hover:border-brand-500/20 transition-all cursor-pointer relative overflow-hidden"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-[9px] font-mono text-white/20 uppercase tracking-tighter">{script.duration}</span>
                                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${
                                        script.status === 'Storyboarded' ? 'bg-brand-500 text-black' : 'bg-white/10 text-white/40'
                                    }`}>
                                        {script.status}
                                    </span>
                                </div>
                                <h4 className="text-sm font-bold text-white uppercase tracking-tight mb-2 group-hover:text-brand-400 transition-colors">{script.title}</h4>
                                <p className="text-[11px] text-white/40 italic leading-relaxed line-clamp-1 mb-4">"{script.hook}"</p>
                                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                    <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">{script.vibe}</span>
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button className="p-2 text-white/40 hover:text-white"><Download className="w-3.5 h-3.5" /></button>
                                        <button className="p-2 text-white/40 hover:text-white"><Share2 className="w-3.5 h-3.5" /></button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <button className="w-full py-4 border border-dashed border-white/10 hover:border-brand-500/20 hover:bg-white/5 rounded-2xl text-[10px] font-black text-white/20 hover:text-white uppercase tracking-[0.2em] transition-all">
                        Load More Scenes
                    </button>
                </div>
            </div>
        </div>
    );
}

function StudioPhase({ icon, label, active }: { icon: React.ReactNode, label: string, active?: boolean }) {
    return (
        <button className={`p-6 rounded-3xl border flex flex-col items-center gap-3 transition-all ${
            active ? "bg-white/10 border-white/20 text-white" : "bg-white/[0.02] border-white/5 text-white/20 hover:text-white hover:bg-white/10"
        }`}>
            <div className="p-2">{icon}</div>
            <span className="text-[9px] font-black uppercase tracking-widest">{label}</span>
        </button>
    );
}

function RefreshCcw(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
            <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
            <path d="M16 16h5v5" />
        </svg>
    );
}

function CheckCircle(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
    );
}
