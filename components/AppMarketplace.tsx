"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Grid, Sparkles, Zap, ShieldCheck, Target, Video, Mic, Brain, Globe, Database, ArrowRight, Star, ShoppingBag, Download, Info } from "lucide-react";

interface StrategyModule {
    id: string;
    name: string;
    description: string;
    icon: React.ReactNode;
    category: 'Core' | 'Intelligence' | 'Distribution' | 'Enterprise';
    status: 'Installed' | 'Available' | 'Enterprise Only';
    color: string;
}

const MODULES: StrategyModule[] = [
    {
        id: 'radar',
        name: 'Listening Radar',
        description: 'Real-time social signal interception and objection handling.',
        icon: <Target className="w-5 h-5" />,
        category: 'Intelligence',
        status: 'Installed',
        color: 'text-rose-400 bg-rose-500/10'
    },
    {
        id: 'compliance',
        name: 'compliance Guard',
        description: 'AI-driven auditing for legal, brand, and authority safety.',
        icon: <ShieldCheck className="w-5 h-5" />,
        category: 'Enterprise',
        status: 'Installed',
        color: 'text-emerald-400 bg-emerald-500/10'
    },
    {
        id: 'avatars',
        name: 'Avatar Synthesis',
        description: 'Direct pipeline to HeyGen and ElevenLabs for multi-modal output.',
        icon: <Video className="w-5 h-5" />,
        category: 'Distribution',
        status: 'Installed',
        color: 'text-violet-400 bg-violet-500/10'
    },
    {
        id: 'crm',
        name: 'Lead Gen CRM',
        description: 'Convert social engagement into high-status sales pipelines.',
        icon: <Grid className="w-5 h-5" />,
        category: 'Enterprise',
        status: 'Installed',
        color: 'text-blue-400 bg-blue-500/10'
    },
    {
        id: 'oracle',
        name: 'The Oracle',
        description: 'Predictive ROI modeling for multi-channel strategy deployment.',
        icon: <Sparkles className="w-5 h-5" />,
        category: 'Intelligence',
        status: 'Available',
        color: 'text-amber-400 bg-amber-500/10'
    },
    {
        id: 'global',
        name: 'World Localizer',
        description: 'Transcrete your strategy into 10+ languages with cultural nuance.',
        icon: <Globe className="w-5 h-5" />,
        category: 'Distribution',
        status: 'Available',
        color: 'text-sky-400 bg-sky-500/10'
    }
];

export default function AppMarketplace() {
    const [selectedCategory, setSelectedCategory] = useState<string>('All');

    const categories = ['All', 'Core', 'Intelligence', 'Distribution', 'Enterprise'];
    const filteredModules = selectedCategory === 'All' 
        ? MODULES 
        : MODULES.filter(m => m.category === selectedCategory);

    return (
        <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-8 min-h-[700px]">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12">
                <div className="flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-indigo-500/20 text-indigo-400 shadow-xl shadow-indigo-500/10">
                        <ShoppingBag className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">StrategyOS Marketplace</h2>
                        <p className="text-xs text-white/40 uppercase tracking-[0.2em] mt-1">Operational Module Discovery</p>
                    </div>
                </div>
                
                <div className="flex p-1.5 bg-white/5 border border-white/5 rounded-2xl gap-1">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-4 py-2 rounded-xl text-[10px] font-bold transition-all uppercase tracking-tighter ${
                                selectedCategory === cat 
                                    ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/20" 
                                    : "text-white/40 hover:text-white hover:bg-white/5"
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredModules.map((module) => (
                    <motion.div
                        key={module.id}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="group relative bg-white/5 border border-white/5 rounded-3xl p-6 hover:border-indigo-500/40 hover:bg-black/40 transition-all duration-500 overflow-hidden flex flex-col justify-between h-[280px]"
                    >
                        <div className="absolute top-0 right-0 p-4">
                             {module.status === 'Installed' ? (
                                <span className="text-[8px] font-black text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-2 py-1 rounded-full border border-emerald-500/20">Operational</span>
                             ) : (
                                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500/20" />
                             )}
                        </div>

                        <div>
                            <div className={`p-3 rounded-2xl w-fit mb-5 group-hover:scale-110 transition-transform duration-500 ${module.color}`}>
                                {module.icon}
                            </div>
                            <h3 className="text-lg font-bold text-white mb-2 group-hover:text-indigo-200 transition-colors uppercase tracking-tight">{module.name}</h3>
                            <p className="text-[11px] text-white/40 leading-relaxed line-clamp-3">
                                {module.description}
                            </p>
                        </div>

                        <div className="mt-6 flex items-center justify-between pt-4 border-t border-white/5">
                            <span className="text-[9px] font-mono text-white/20 uppercase tracking-widest">{module.category}</span>
                            <button className={`p-2 rounded-xl transition-all ${
                                module.status === 'Installed' 
                                    ? "bg-white/5 text-white/20 hover:text-white" 
                                    : "bg-indigo-500 text-white hover:scale-110 shadow-lg shadow-indigo-500/20"
                            }`}>
                                {module.status === 'Installed' ? <Info className="w-4 h-4" /> : <Download className="w-4 h-4" />}
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="mt-12 p-8 bg-indigo-500/10 border border-indigo-500/20 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
                <div className="absolute -top-12 -right-12 w-48 h-48 bg-indigo-500/10 blur-[80px]" />
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
                    <div className="p-4 bg-indigo-500 rounded-2xl shadow-2xl shadow-indigo-500/40">
                        <Zap className="w-8 h-8 text-white" />
                    </div>
                    <div className="text-center md:text-left">
                        <h3 className="text-xl font-bold text-white mb-1">Scale to Enterprise Mode</h3>
                        <p className="text-sm text-indigo-300/60 max-w-sm font-medium">Unlock private module development, custom LLM fine-tuning, and global team permissions.</p>
                    </div>
                </div>
                <button className="relative z-10 px-8 py-4 bg-white text-black rounded-2xl text-[10px] font-black tracking-[0.2em] hover:scale-105 transition-all shadow-xl shadow-white/5 uppercase flex items-center gap-3">
                    <span>Contact StrategyOS Elite</span>
                    <ArrowRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
