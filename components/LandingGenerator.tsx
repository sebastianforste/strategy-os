"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Layout, Palette, Code2, Globe, Sparkles, ChevronRight, CheckCircle, Smartphone, Monitor, Tablet, MousePointer2, Zap, Rocket, Layers, Share2, Eye, Filter, Search, MoreHorizontal } from "lucide-react";

interface LandingPage {
    id: string;
    name: string;
    url: string;
    conversions: string;
    status: 'Live' | 'Draft' | 'Archived';
    leads: number;
}

const PAGES: LandingPage[] = [
    { id: 'p1', name: 'Agentic Strategy Summit', url: 'strategy.os/summit', conversions: '18.4%', status: 'Live', leads: 424 },
    { id: 'p2', name: 'The AI Lead gen Course', url: 'strategy.os/training', conversions: '12.2%', status: 'Live', leads: 812 },
    { id: 'p3', name: 'Mastermind Application', url: 'strategy.os/apply', conversions: '4.2%', status: 'Draft', leads: 0 },
];

export default function LandingGenerator() {
    const [pages] = useState<LandingPage[]>(PAGES);
    const [isGenerating, setIsGenerating] = useState(false);

    const handleGenerate = () => {
        setIsGenerating(true);
        setTimeout(() => setIsGenerating(false), 3000);
    };

    return (
        <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-8 min-h-[700px]">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12">
                <div className="flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        <Layout className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white uppercase tracking-tight">Funnel Architect</h2>
                        <p className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-mono mt-1">Dynamic High-Status Landing Page Generation</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button 
                        onClick={handleGenerate}
                        disabled={isGenerating}
                        className="px-6 py-2.5 bg-indigo-500 text-white rounded-xl text-[10px] font-black tracking-widest hover:scale-105 transition-all shadow-lg shadow-indigo-500/20 uppercase flex items-center gap-2"
                    >
                        {isGenerating ? <RefreshCcw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                        <span>{isGenerating ? "Manifesting..." : "Forge Page"}</span>
                    </button>
                    <div className="p-2.5 bg-white/5 border border-white/10 rounded-xl text-white/40 hover:text-white transition-all">
                        <Globe className="w-4 h-4" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* PAGE ARCHIVE */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Active Assets</h3>
                        <div className="flex items-center gap-2 p-1 bg-white/5 rounded-xl border border-white/10">
                            <button className="p-2 text-white/40 hover:text-white transition-colors"><Search className="w-4 h-4" /></button>
                            <button className="p-2 text-white/40 hover:text-white transition-colors"><Filter className="w-4 h-4" /></button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {pages.map((page) => (
                            <motion.div
                                key={page.id}
                                whileHover={{ scale: 1.02 }}
                                className="p-8 bg-white/5 border border-white/5 rounded-[40px] group hover:border-indigo-500/20 transition-all cursor-pointer relative overflow-hidden"
                            >
                                <div className="flex items-start justify-between mb-8">
                                    <div className="p-4 rounded-3xl bg-white/5 border border-white/10 text-white/20 group-hover:text-white transition-colors">
                                        <Monitor className="w-6 h-6" />
                                    </div>
                                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${
                                        page.status === 'Live' ? 'bg-emerald-500 text-black shadow-[0_0_10px_rgba(16,185,129,0.4)]' : 'bg-white/10 text-white/40'
                                    }`}>
                                        {page.status}
                                    </span>
                                </div>
                                <h4 className="text-lg font-black text-white uppercase tracking-tight mb-2 group-hover:text-indigo-400 transition-colors">{page.name}</h4>
                                <p className="text-[10px] font-mono text-white/20 uppercase tracking-tighter mb-8">{page.url}</p>
                                
                                <div className="grid grid-cols-2 gap-4 py-6 border-t border-white/5">
                                    <div>
                                        <p className="text-[9px] font-black text-white/20 uppercase mb-1">Conv. Rate</p>
                                        <p className="text-xl font-black text-white tracking-tighter">{page.conversions}</p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black text-white/20 uppercase mb-1">Net Leads</p>
                                        <p className="text-xl font-black text-emerald-400 tracking-tighter">{page.leads}</p>
                                    </div>
                                </div>
                                
                                <div className="flex items-center justify-between pt-6 border-t border-white/5">
                                    <div className="flex gap-4">
                                        <Smartphone className="w-4 h-4 text-white/10" />
                                        <Tablet className="w-4 h-4 text-white/10" />
                                    </div>
                                    <button className="flex items-center gap-2 text-[9px] font-black text-white/40 hover:text-white uppercase tracking-widest transition-colors">
                                        View Analytics <ChevronRight className="w-3 h-3" />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* ARCHITECT OPS */}
                <div className="space-y-6">
                    <h3 className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-4">Design Systems</h3>
                    
                    <div className="p-8 bg-indigo-500/5 border border-indigo-500/10 rounded-[32px] relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:rotate-12 transition-transform duration-700">
                            <Palette className="w-32 h-32 text-indigo-400" />
                        </div>
                        
                        <div className="flex items-center gap-3 mb-8">
                            <Layers className="w-5 h-5 text-indigo-400" />
                            <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Global Tokens</h4>
                        </div>
                        
                        <p className="text-xs text-white/60 leading-relaxed italic mb-8">
                            "Currently applying `Elite-Dark-Glass` aesthetic to all generation buffers. Syncing Typography from Google Fonts (Inter/Outfit)."
                        </p>

                        <button className="w-full py-3 bg-white text-black rounded-xl text-[9px] font-black uppercase tracking-widest hover:scale-[1.02] transition-all">
                            Customize UI System
                        </button>
                    </div>

                    <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl space-y-4">
                        <div className="flex items-center gap-3">
                            <Zap className="w-4 h-4 text-brand-400" />
                            <h4 className="text-[10px] font-bold text-white uppercase tracking-widest">Conversion Boost</h4>
                        </div>
                        <p className="text-[9px] text-white/40 leading-relaxed italic">
                            Agent `Visual Alchemist` is currently A/B testing 4 distinct hero section layouts for the `Summit` page.
                        </p>
                        <div className="flex items-center gap-2 text-[10px] font-black text-white uppercase tracking-widest">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Active Testing
                        </div>
                    </div>

                    <div className="p-6 border border-white/5 rounded-2xl flex items-center justify-between cursor-pointer hover:bg-white/5 transition-all group">
                        <div className="flex items-center gap-3">
                            <Code2 className="w-4 h-4 text-white/20 group-hover:text-white" />
                            <span className="text-[10px] font-bold text-white uppercase tracking-tight">Export React Components</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-white/20" />
                    </div>
                </div>
            </div>
        </div>
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
