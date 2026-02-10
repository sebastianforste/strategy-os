"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Hash, Search, Activity, Target, Zap, ChevronRight, CheckCircle, BarChart3, Globe, Layout, Sparkles, Filter, RefreshCw, Layers, Database, Eye } from "lucide-react";

interface SEOKeyword {
    term: string;
    volume: string;
    difficulty: number;
    intent: 'Informational' | 'Transactional' | 'Commercial';
}

const KEYWORDS: SEOKeyword[] = [
    { term: 'AI Agents for B2B', volume: '12.4k', difficulty: 42, intent: 'Informational' },
    { term: 'Strategy Automation SaaS', volume: '8.2k', difficulty: 68, intent: 'Commercial' },
    { term: 'LinkedIn Content Strategy', volume: '45k', difficulty: 82, intent: 'Transactional' },
];

export default function SEOOptimizer() {
    const [keywords] = useState<SEOKeyword[]>(KEYWORDS);
    const [isOptimizing, setIsOptimizing] = useState(false);

    const handleOptimize = () => {
        setIsOptimizing(true);
        setTimeout(() => setIsOptimizing(false), 2000);
    };

    return (
        <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-8 min-h-[700px]">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12">
                <div className="flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-brand-500/10 text-brand-400 border border-brand-500/20">
                        <Hash className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white uppercase tracking-tight">Authority SEO</h2>
                        <p className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-mono mt-1">Search Intent Mapping & Semantic Optimization</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button 
                        onClick={handleOptimize}
                        disabled={isOptimizing}
                        className="px-6 py-2.5 bg-brand-500 text-white rounded-xl text-[10px] font-black tracking-widest hover:scale-105 transition-all shadow-lg shadow-brand-500/20 uppercase flex items-center gap-2"
                    >
                        {isOptimizing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                        <span>{isOptimizing ? "Optimizing..." : "Inject Keywords"}</span>
                    </button>
                    <div className="p-2.5 bg-white/5 border border-white/10 rounded-xl text-white/40 hover:text-white transition-all">
                        <Globe className="w-4 h-4" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* KEYWORD TABLE */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Target Intel</h3>
                        <div className="flex items-center gap-2 p-1 bg-white/5 rounded-xl border border-white/10">
                            <button className="p-2 text-white/40 hover:text-white transition-colors"><Search className="w-4 h-4" /></button>
                            <button className="p-2 text-white/40 hover:text-white transition-colors"><Filter className="w-4 h-4" /></button>
                        </div>
                    </div>

                    <div className="overflow-hidden border border-white/5 rounded-3xl bg-white/[0.01]">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-white/5 bg-white/[0.02]">
                                    <th className="px-8 py-5 text-[9px] font-black text-white/40 uppercase tracking-widest">Keyword Target</th>
                                    <th className="px-8 py-5 text-[9px] font-black text-white/40 uppercase tracking-widest">Vol/Mo</th>
                                    <th className="px-8 py-5 text-[9px] font-black text-white/40 uppercase tracking-widest">Diff.</th>
                                    <th className="px-8 py-5 text-[9px] font-black text-white/40 uppercase tracking-widest text-right">Intent</th>
                                </tr>
                            </thead>
                            <tbody>
                                {keywords.map((kw, i) => (
                                    <tr key={i} className="border-b border-white/5 last:border-0 hover:bg-white/[0.03] transition-all group cursor-pointer">
                                        <td className="px-8 py-6">
                                            <span className="text-sm font-bold text-white tracking-tight uppercase group-hover:text-brand-400 transition-colors">{kw.term}</span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="text-[10px] font-mono text-white/40 uppercase tracking-tighter">{kw.volume}</span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-16 h-1 bg-white/5 rounded-full overflow-hidden">
                                                    <motion.div initial={{ width: 0 }} animate={{ width: `${kw.difficulty}%` }} className={`h-full ${kw.difficulty > 70 ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                                                </div>
                                                <span className="text-[10px] font-bold text-white/60">{kw.difficulty}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${
                                                kw.intent === 'Informational' ? 'bg-blue-500/10 text-blue-400' : 
                                                kw.intent === 'Commercial' ? 'bg-purple-500/10 text-purple-400' : 'bg-brand-500/10 text-brand-400'
                                            }`}>
                                                {kw.intent}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="p-8 bg-white/[0.02] border border-white/5 rounded-3xl space-y-4">
                        <div className="flex items-center gap-3">
                            <Target className="w-4 h-4 text-brand-400" />
                            <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Semantic Density Report</h4>
                        </div>
                        <p className="text-xs text-white/60 leading-relaxed italic">
                            Your current draft has 0.8% density for `AI Agents`. Increasing this to 1.4% will optimize for broad informational intent. Recommending structural insertion in paragraphs 2 and 4.
                        </p>
                    </div>
                </div>

                {/* SEO VITALS */}
                <div className="space-y-6">
                    <h3 className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-4">Authority Scorecard</h3>
                    
                    <div className="p-8 bg-indigo-500/5 border border-indigo-500/10 rounded-3xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-700">
                            <Eye className="w-32 h-32 text-indigo-400" />
                        </div>
                        
                        <div className="flex items-center gap-3 mb-8">
                            <BarChart3 className="w-5 h-5 text-indigo-400" />
                            <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Visibility Index</h4>
                        </div>
                        
                        <div className="text-4xl font-black text-white tracking-tighter mb-2">94.2</div>
                        <p className="text-[10px] text-white/40 uppercase font-black tracking-widest mb-8">Elite Placement Score</p>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                                <div className="text-[9px] font-black text-white/20 uppercase mb-2">Internal Links</div>
                                <div className="text-lg font-black text-brand-400">14</div>
                            </div>
                            <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                                <div className="text-[9px] font-black text-white/20 uppercase mb-2">Backlinks</div>
                                <div className="text-lg font-black text-emerald-400">122</div>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl space-y-4">
                        <div className="flex items-center gap-3">
                            <Layers className="w-4 h-4 text-emerald-400" />
                            <h4 className="text-[10px] font-bold text-white uppercase tracking-widest">SERP Preview</h4>
                        </div>
                        <div className="space-y-4 border-l-2 border-brand-500/20 pl-4 py-2">
                            <p className="text-[10px] font-black text-brand-400 uppercase tracking-tight">The Future of AI Agents in B2B Strategy</p>
                            <p className="text-[9px] text-white/40 leading-relaxed italic">
                                strategy-os.ai › agency-ops › insights
                                <br />
                                Learn how AI agents are revolutionizing B2B content operations through structural synthesis...
                            </p>
                        </div>
                    </div>

                    <div className="p-6 border border-white/5 rounded-2xl flex items-center justify-between cursor-pointer hover:bg-white/5 transition-all group">
                        <div className="flex items-center gap-3">
                            <Database className="w-4 h-4 text-white/20 group-hover:text-white" />
                            <span className="text-[10px] font-bold text-white uppercase tracking-tight">Crawl Map Visualization</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-white/20" />
                    </div>
                </div>
            </div>
        </div>
    );
}

