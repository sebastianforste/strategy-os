"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, PenTool, BookOpen, Wand2, Zap, Send, MessageSquare, History, Bookmark, Hash, Quote, ChevronRight, Activity, Filter, Settings2 } from "lucide-react";

interface NarrativeAsset {
    id: string;
    title: string;
    hook: string;
    type: 'Story' | 'Insight' | 'Framework';
    timestamp: string;
    score: number;
}

const RECENT_ASSETS: NarrativeAsset[] = [
    { id: 'n1', title: 'The Silent Shift in Agentic UX', hook: 'Interfaces are dying. Intent is the new UI...', type: 'Insight', timestamp: '2h ago', score: 94 },
    { id: 'n2', title: 'Post-SaaS Survival Guide', hook: 'The next decade belongs to the orchestrators...', type: 'Framework', timestamp: '5h ago', score: 88 },
    { id: 'n3', title: 'From Code to Cognition', hook: 'Why writing code is becoming a legacy skill...', type: 'Story', timestamp: '1d ago', score: 91 },
];

export default function NarrativeEngine() {
    const [assets] = useState<NarrativeAsset[]>(RECENT_ASSETS);
    const [prompt, setPrompt] = useState("");
    const [isSynthesizing, setIsSynthesizing] = useState(false);

    const handleSynthesize = () => {
        if (!prompt) return;
        setIsSynthesizing(true);
        setTimeout(() => setIsSynthesizing(false), 3000);
    };

    return (
        <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-8 min-h-[700px]">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12">
                <div className="flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-brand-500/10 text-brand-400 border border-brand-500/20">
                        <PenTool className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white uppercase tracking-tight">Narrative Architect</h2>
                        <p className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-mono mt-1">AI-Powered Strategic Storytelling</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
                        <button className="p-2 text-white/40 hover:text-white transition-colors"><Bookmark className="w-4 h-4" /></button>
                        <button className="p-2 text-white/40 hover:text-white transition-colors"><Settings2 className="w-4 h-4" /></button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* COMPOSER */}
                <div className="space-y-8">
                    <div className="relative">
                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="Describe the strategic insight or data point to transform into a narrative..."
                            className="w-full h-64 bg-white/5 border border-white/10 rounded-3xl p-8 text-white placeholder:text-white/10 text-sm focus:outline-none focus:border-brand-500/50 transition-all resize-none font-medium leading-relaxed"
                        />
                        <div className="absolute bottom-6 right-6 flex items-center gap-4">
                            <span className="text-[10px] font-mono text-white/20 uppercase">Tokens: {prompt.length}</span>
                            <button 
                                onClick={handleSynthesize}
                                disabled={isSynthesizing || !prompt}
                                className="p-4 bg-brand-500 text-white rounded-2xl shadow-xl shadow-brand-500/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100"
                            >
                                {isSynthesizing ? <RefreshCcw className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <SynthesisOption icon={<Quote />} label="Hook First" active />
                        <SynthesisOption icon={<BookOpen />} label="Story Map" />
                        <SynthesisOption icon={<Zap />} label="Contrarian" />
                    </div>

                    <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center gap-4 group cursor-pointer hover:bg-white/5 transition-all">
                        <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400"><History className="w-4 h-4" /></div>
                        <div className="flex-1">
                            <p className="text-[10px] font-black text-white/60 uppercase tracking-widest">Context Harvesting</p>
                            <p className="text-[9px] text-white/20 uppercase italic mt-0.5">Using context from 12 ingested documents.</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-white/10 group-hover:text-white transition-all" />
                    </div>
                </div>

                {/* ASSET LIBRARY */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Generated Artifacts</h3>
                        <div className="flex items-center gap-2 px-2 py-1 bg-white/5 rounded-lg border border-white/10">
                            <Filter className="w-3 h-3 text-white/40" />
                            <span className="text-[9px] font-bold text-white/40 uppercase">All Types</span>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <AnimatePresence>
                            {assets.map((asset) => (
                                <motion.div
                                    key={asset.id}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="p-6 bg-white/5 border border-white/5 rounded-3xl hover:border-brand-500/20 transition-all group cursor-pointer relative overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <div className="p-2 bg-brand-500/10 rounded-xl text-brand-400"><Send className="w-4 h-4" /></div>
                                    </div>
                                    
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${
                                            asset.type === 'Story' ? 'bg-blue-500/10 text-blue-400' :
                                            asset.type === 'Framework' ? 'bg-purple-500/10 text-purple-400' : 'bg-brand-400/10 text-brand-400'
                                        }`}>
                                            {asset.type}
                                        </span>
                                        <span className="text-[9px] font-mono text-white/20 uppercase">{asset.timestamp}</span>
                                    </div>
                                    
                                    <h4 className="text-sm font-bold text-white uppercase tracking-tight mb-2 group-hover:text-brand-400 transition-colors">{asset.title}</h4>
                                    <p className="text-[11px] text-white/40 leading-relaxed italic mb-4 line-clamp-1">"{asset.hook}"</p>
                                    
                                    <div className="flex items-center gap-4 pt-4 border-t border-white/5">
                                        <div className="flex items-center gap-1.5">
                                            <Activity className="w-3 h-3 text-emerald-400" />
                                            <span className="text-[10px] font-black text-white/60">{asset.score}%</span>
                                            <span className="text-[8px] font-bold text-white/20 uppercase">Aura Score</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 ml-auto">
                                            <MessageSquare className="w-3 h-3 text-white/20" />
                                            <span className="text-[10px] font-black text-white/60">4</span>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>

                    <button className="w-full py-4 border border-dashed border-white/10 hover:border-white/20 hover:bg-white/5 rounded-2xl text-[10px] font-black text-white/20 hover:text-white uppercase tracking-[0.2em] transition-all">
                        Load Archive
                    </button>
                </div>
            </div>
        </div>
    );
}

function SynthesisOption({ icon, label, active }: { icon: React.ReactNode, label: string, active?: boolean }) {
    return (
        <button className={`p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all ${
            active ? "bg-white/10 border-white/20 text-white" : "bg-white/5 border-white/5 text-white/20 hover:text-white hover:bg-white/[0.08]"
        }`}>
            <div className="p-2 bg-black/40 rounded-xl">{icon}</div>
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
