"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Globe, Link, TrendingUp, Target, BarChart3, ChevronRight, Activity, Zap, Layers, RefreshCw, Shield, Database, MousePointer2, FileText, Share2, Eye, Server, Cpu } from "lucide-react";

interface SEOMetric {
    id: string;
    keyword: string;
    intent: 'Transactional' | 'Informational' | 'Navigational';
    volume: string;
    difficulty: number;
}

const METRICS: SEOMetric[] = [
    { id: 'm1', keyword: 'Agentic Content OS', intent: 'Transactional', volume: '12.4k', difficulty: 42 },
    { id: 'm2', keyword: 'AI Ghostwriting High Status', intent: 'Informational', volume: '4.2k', difficulty: 12 },
    { id: 'm3', keyword: 'StrategyOS pricing', intent: 'Navigational', volume: '1.2k', difficulty: 8 },
];

export default function NeuralSEO() {
    const [metrics] = useState<SEOMetric[]>(METRICS);
    const [isOptimizing, setIsOptimizing] = useState(false);

    const handleOptimize = () => {
        setIsOptimizing(true);
        setTimeout(() => setIsOptimizing(false), 2500);
    };

    return (
        <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-8 min-h-[700px]">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12">
                <div className="flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-[0_0_20px_rgba(99,102,241,0.1)]">
                        <Search className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white uppercase tracking-tight">Neural SEO V3</h2>
                        <p className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-mono mt-1">Zero-Click Search Intent Optimization & Autonomous Link Scouting</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button 
                        onClick={handleOptimize}
                        disabled={isOptimizing}
                        className="px-6 py-2.5 bg-indigo-500 text-white rounded-xl text-[10px] font-black tracking-widest hover:shadow-[0_0_30px_rgba(99,102,241,0.3)] transition-all uppercase flex items-center gap-2"
                    >
                        {isOptimizing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
                        <span>{isOptimizing ? "Optimizing..." : "Inject Semantic Logic"}</span>
                    </button>
                    <div className="p-2.5 bg-white/5 border border-white/10 rounded-xl text-white/40">
                        <Globe className="w-4 h-4" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* SEO ANALYTICS */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Target Keyword Intelligence</h3>
                        <div className="flex items-center gap-4 text-[10px] font-black text-white/40 uppercase tracking-widest">
                            <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> SERP Coverage: 100%</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {metrics.map((m) => (
                            <motion.div
                                key={m.id}
                                whileHover={{ y: -4 }}
                                className="p-6 bg-white/[0.02] border border-white/5 rounded-[32px] hover:border-indigo-500/20 transition-all group"
                            >
                                <div className="flex items-center justify-between mb-8">
                                    <div className="p-3 bg-white/5 rounded-2xl text-white/20 group-hover:text-indigo-400 transition-colors">
                                        <Target className="w-4 h-4" />
                                    </div>
                                    <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${
                                        m.intent === 'Transactional' ? 'bg-indigo-500/10 text-indigo-400' : 
                                        m.intent === 'Informational' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-500'
                                    }`}>
                                        {m.intent}
                                    </span>
                                </div>
                                <h4 className="text-sm font-bold text-white uppercase tracking-tight mb-2 truncate">{m.keyword}</h4>
                                <div className="flex items-baseline gap-2 mb-4">
                                    <span className="text-xl font-black text-white tracking-tighter">{m.volume}</span>
                                    <span className="text-[9px] font-mono text-white/20">Monthly</span>
                                </div>
                                
                                <div className="space-y-2">
                                    <div className="flex justify-between text-[9px] font-black text-white/20 uppercase">
                                        <span>Difficulty</span>
                                        <span className="text-white">{m.difficulty}%</span>
                                    </div>
                                    <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                                        <motion.div initial={{ width: 0 }} animate={{ width: `${m.difficulty}%` }} className="h-full bg-indigo-500" />
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-8 bg-white/[0.01] border border-white/5 rounded-[40px] space-y-4">
                            <div className="flex items-center gap-3">
                                <Link className="w-4 h-4 text-indigo-400" />
                                <h3 className="text-[10px] font-black text-white uppercase tracking-widest">Autonomous Backlink Scout</h3>
                            </div>
                            <div className="space-y-4 font-mono text-[11px]">
                                <div className="flex justify-between text-white/40">
                                    <span>High-Affinity Sites Found</span>
                                    <span className="text-white">12</span>
                                </div>
                                <div className="flex justify-between text-white/40">
                                    <span>Outreach Threads Active</span>
                                    <span className="text-indigo-400">4</span>
                                </div>
                                <div className="p-3 bg-white/5 rounded-2xl border border-white/5 text-[9px] uppercase tracking-tighter text-white/20">
                                    Latest: Pitching guest strategy to `future_of_work.eth`
                                </div>
                            </div>
                        </div>
                        <div className="p-8 bg-white/[0.01] border border-white/5 rounded-[40px] space-y-4">
                            <div className="flex items-center gap-3">
                                <Eye className="w-4 h-4 text-indigo-400" />
                                <h3 className="text-[10px] font-black text-white uppercase tracking-widest">Zero-Click Snippet Shield</h3>
                            </div>
                            <p className="text-[10px] text-white/40 leading-relaxed uppercase font-black tracking-tighter">
                                Optimizing for direct-answer dominance. Current schema coverage: 98.2%. Logic-rich structural headers injected.
                            </p>
                            <div className="flex gap-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                <div className="w-2 h-2 rounded-full bg-emerald-500/20" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* SEO VITALS */}
                <div className="space-y-6">
                    <h3 className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-4">Semantic Vitals</h3>
                    
                    <div className="p-8 bg-indigo-500/5 border border-indigo-500/10 rounded-3xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-700">
                           <Server className="w-32 h-32 text-indigo-400" />
                        </div>
                        <div className="flex items-center gap-3 mb-8">
                            <Activity className="w-5 h-5 text-indigo-400" />
                            <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Authority Flow</h4>
                        </div>
                        <div className="text-4xl font-black text-white tracking-tighter mb-2">84.2%</div>
                        <p className="text-[10px] text-white/40 uppercase font-black tracking-widest mb-8">Domain Authority Vector</p>

                        <div className="space-y-4">
                            <div className="flex justify-between text-[10px] font-bold text-white/20 uppercase">
                                <span>Organic Reach Prob</span>
                                <span className="text-emerald-400">92%</span>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl space-y-4">
                        <div className="flex items-center gap-3">
                            <Cpu className="w-4 h-4 text-indigo-400" />
                            <h4 className="text-[10px] font-bold text-white uppercase tracking-widest">Neural Indexing HUD</h4>
                        </div>
                        <p className="text-[10px] text-white/40 leading-relaxed uppercase font-black tracking-tighter">
                            Real-time indexing signals sent to Google Search Console and Bing. Latency: 4s. StrategyOS Sitemap v4.2 active.
                        </p>
                    </div>

                    <div className="p-6 border border-white/5 rounded-2xl flex items-center justify-between cursor-pointer hover:bg-white/5 transition-all group">
                        <div className="flex items-center gap-3">
                            <Database className="w-4 h-4 text-white/20 group-hover:text-white" />
                            <span className="text-[10px] font-bold text-white uppercase tracking-tight">Access Content Library</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-white/20" />
                    </div>
                </div>
            </div>
        </div>
    );
}
