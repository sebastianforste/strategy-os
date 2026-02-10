"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GitBranch, TrendingUp, BarChart3, Target, Zap, Play, Pause, RefreshCw, Layers, CheckCircle, ChevronRight, AlertCircle, Split } from "lucide-react";

interface ABTest {
    id: string;
    title: string;
    description: string;
    variantA: { impressions: number, engagement: number };
    variantB: { impressions: number, engagement: number };
    status: 'Running' | 'Completed' | 'Draft';
    winner?: 'A' | 'B';
}

const ACTIVE_TESTS: ABTest[] = [
    {
        id: 't1',
        title: 'Headline Hook: Fear vs Logic',
        description: 'Testing emotional vs rational hooks for Agentic Workflow post.',
        variantA: { impressions: 4200, engagement: 4.8 },
        variantB: { impressions: 3800, engagement: 6.2 },
        status: 'Running'
    },
    {
        id: 't2',
        title: 'Call to Action: Link vs DM',
        description: 'Testing lead gen conversion via direct link vs "Comment for DM".',
        variantA: { impressions: 12400, engagement: 2.1 },
        variantB: { impressions: 10200, engagement: 8.4 },
        status: 'Completed',
        winner: 'B'
    }
];

export default function ABTestingEngine() {
    const [tests] = useState<ABTest[]>(ACTIVE_TESTS);
    const [selectedTest, setSelectedTest] = useState<ABTest | null>(ACTIVE_TESTS[0]);

    return (
        <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-8 min-h-[700px]">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12">
                <div className="flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-brand-500/10 text-brand-400 border border-brand-500/20">
                        <Split className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white uppercase tracking-tight">Strategy Labs</h2>
                        <p className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-mono mt-1">Automated A/B Testing Engine</p>
                    </div>
                </div>

                <button className="px-6 py-2.5 bg-brand-500 text-white rounded-xl text-[10px] font-black tracking-widest hover:scale-105 transition-all shadow-lg shadow-brand-500/20 uppercase">
                    New Experiment
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* ACTIVE EXPERIMENTS */}
                <div className="space-y-4">
                    <h3 className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-4">Live Experiments</h3>
                    {tests.map((test) => (
                        <button
                            key={test.id}
                            onClick={() => setSelectedTest(test)}
                            className={`w-full p-6 bg-white/5 border rounded-3xl transition-all text-left group relative overflow-hidden ${
                                selectedTest?.id === test.id ? 'border-brand-500/40 bg-white/[0.08]' : 'border-white/5 hover:border-white/10'
                            }`}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <div className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${
                                        test.status === 'Running' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/10 text-white/40'
                                    }`}>
                                        {test.status}
                                    </div>
                                    <span className="text-[9px] font-mono text-white/20 uppercase">ID: {test.id}</span>
                                </div>
                                {test.winner && (
                                    <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-500 text-black rounded text-[8px] font-black uppercase tracking-widest">
                                        <CheckCircle className="w-3 h-3" />
                                        <span>Winner variant {test.winner}</span>
                                    </div>
                                )}
                            </div>
                            
                            <h4 className="text-sm font-bold text-white uppercase tracking-tight mb-2">{test.title}</h4>
                            <p className="text-[10px] text-white/40 leading-relaxed italic mb-6 line-clamp-1">{test.description}</p>
                            
                            <div className="flex items-center gap-4">
                                <div className="flex-1 space-y-1">
                                    <div className="flex justify-between text-[8px] font-black text-white/20 uppercase">
                                        <span>Variant A</span>
                                        <span className={test.winner === 'A' ? 'text-emerald-400' : ''}>{test.variantA.engagement}%</span>
                                    </div>
                                    <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                                        <div className={`h-full ${test.winner === 'A' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-white/20'}`} style={{ width: `${(test.variantA.engagement / 10) * 100}%` }} />
                                    </div>
                                </div>
                                <div className="flex-1 space-y-1">
                                    <div className="flex justify-between text-[8px] font-black text-white/20 uppercase">
                                        <span>Variant B</span>
                                        <span className={test.winner === 'B' ? 'text-emerald-400' : ''}>{test.variantB.engagement}%</span>
                                    </div>
                                    <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                                        <div className={`h-full ${test.winner === 'B' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-white/20'}`} style={{ width: `${(test.variantB.engagement / 10) * 100}%` }} />
                                    </div>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>

                {/* LAB CONSOLE */}
                <div className="relative">
                    <AnimatePresence mode="wait">
                        {selectedTest ? (
                            <motion.div
                                key={selectedTest.id}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="bg-white/5 border border-white/10 rounded-3xl p-8 h-full relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 p-8 opacity-5">
                                    <BarChart3 className="w-48 h-48" />
                                </div>

                                <div className="flex items-center justify-between mb-8">
                                    <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                                        <Layers className="w-4 h-4 text-brand-400" />
                                        <span>Synthesis Panel</span>
                                    </h3>
                                    <button className="p-2 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
                                        {selectedTest.status === 'Running' ? <Pause className="w-4 h-4 text-white" /> : <Play className="w-4 h-4 text-brand-400" />}
                                    </button>
                                </div>

                                <div className="space-y-8 mb-12">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-6 bg-black/40 border border-white/5 rounded-2xl relative overflow-hidden">
                                            <div className="absolute top-0 right-0 p-2 text-[8px] font-black text-white/10 uppercase">vA</div>
                                            <p className="text-[11px] font-bold text-white/40 uppercase mb-2">Impressions</p>
                                            <p className="text-2xl font-black text-white tracking-widest">{selectedTest.variantA.impressions.toLocaleString()}</p>
                                        </div>
                                        <div className="p-6 bg-black/40 border border-white/5 rounded-2xl relative overflow-hidden">
                                            <div className="absolute top-0 right-0 p-2 text-[8px] font-black text-white/10 uppercase">vB</div>
                                            <p className="text-[11px] font-bold text-white/40 uppercase mb-2">Impressions</p>
                                            <p className="text-2xl font-black text-white tracking-widest">{selectedTest.variantB.impressions.toLocaleString()}</p>
                                        </div>
                                    </div>

                                    <div className="p-6 bg-brand-500/5 border border-brand-500/10 rounded-2xl">
                                        <div className="flex items-start gap-4">
                                            <TrendingUp className="w-5 h-5 text-brand-400" />
                                            <div>
                                                <h4 className="text-[10px] font-black text-white uppercase tracking-widest mb-1">Statistical Significance</h4>
                                                <p className="text-[10px] text-white/40 leading-relaxed italic">
                                                    Confidence level is currently 92.4%. Variant B shows a clear lead in qualitative engagement signals.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <button className="w-full py-4 bg-white text-black rounded-xl text-[10px] font-black tracking-widest uppercase hover:scale-[1.02] transition-all flex items-center justify-center gap-2">
                                        <span>Deploy Winner Instantly</span>
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                    <button className="w-full py-4 border border-white/10 hover:bg-white/5 rounded-xl text-[10px] font-black text-white uppercase tracking-widest transition-all">
                                        Recalculate Tokens
                                    </button>
                                </div>
                            </motion.div>
                        ) : (
                            <div className="h-full border-2 border-dashed border-white/5 rounded-3xl flex flex-col items-center justify-center p-12 text-center text-white/20">
                                <GitBranch className="w-12 h-12 mb-6 opacity-20" />
                                <p className="text-[10px] font-bold uppercase tracking-widest max-w-[200px] leading-relaxed">
                                    Select an experiment to view real-time attribution and significance.
                                </p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
