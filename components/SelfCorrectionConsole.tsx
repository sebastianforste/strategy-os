"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCcw, Shield, Zap, Search, Activity, ChevronRight, CheckCircle, Brain, Terminal, Cpu, Database, Command, AlertCircle, History, Sparkles, Filter, MoreHorizontal, Code2, Clock } from "lucide-react";

interface CorrectionLog {
    id: string;
    original: string;
    corrected: string;
    reason: string;
    timestamp: string;
}

const LOGS: CorrectionLog[] = [
    { id: 'sc1', original: 'The mouse is dead.', corrected: 'The era of the mouse has concluded.', reason: 'Tone shift: Original too blunt for high-status persona.', timestamp: '12m ago' },
    { id: 'sc2', original: 'Leverage our tools.', corrected: 'Architect with our engine.', reason: 'Banned word "Leverage" detected and replaced.', timestamp: '42m ago' },
    { id: 'sc3', original: 'Unleash your potential.', corrected: 'Synthesize your strategy.', reason: 'Banned word "Unleash" detected and replaced.', timestamp: '1h ago' },
];

export default function SelfCorrectionConsole() {
    const [logs] = useState<CorrectionLog[]>(LOGS);
    const [isThinking, setIsThinking] = useState(false);

    const handleThinking = () => {
        setIsThinking(true);
        setTimeout(() => setIsThinking(false), 3000);
    };

    return (
        <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-8 min-h-[700px]">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12">
                <div className="flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-brand-400/10 text-brand-400 border border-brand-400/20">
                        <Brain className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white uppercase tracking-tight">Recursive Logic</h2>
                        <p className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-mono mt-1">Autonomous AI Self-Correction & Prompt Refinement</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button 
                        onClick={handleThinking}
                        disabled={isThinking}
                        className="px-6 py-2.5 bg-brand-500 text-white rounded-xl text-[10px] font-black tracking-widest hover:scale-105 transition-all shadow-lg shadow-brand-500/20 uppercase flex items-center gap-2"
                    >
                        {isThinking ? <RefreshCcw className="w-3.5 h-3.5 animate-spin" /> : <Terminal className="w-3.5 h-3.5" />}
                        <span>{isThinking ? "Refining..." : "Initialize Correction"}</span>
                    </button>
                    <div className="p-2.5 bg-white/5 border border-white/10 rounded-xl text-white/40 hover:text-white transition-all">
                        <History className="w-4 h-4" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* CORRECTION LOGS */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Autonomy Logs</h3>
                        <div className="flex items-center gap-2">
                            <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest px-2 py-1 bg-white/5 rounded">Real-time Validation</span>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {logs.map((log) => (
                            <motion.div
                                key={log.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-8 bg-white/5 border border-white/5 rounded-[32px] hover:border-brand-500/20 transition-all group"
                            >
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3 text-[9px] font-black uppercase text-white/20 tracking-widest">
                                        <Clock className="w-3.5 h-3.5" /> {log.timestamp}
                                    </div>
                                    <span className="text-[8px] font-mono text-brand-400 bg-brand-400/10 px-2 py-0.5 rounded border border-brand-400/20 uppercase">RECURSIVE_OP_{log.id}</span>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                                    <div className="space-y-3">
                                        <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">Input Logic</p>
                                        <p className="text-sm font-mono text-rose-400/60 line-through">"{log.original}"</p>
                                    </div>
                                    <div className="space-y-3">
                                        <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">Refined Logic</p>
                                        <p className="text-sm font-bold text-emerald-400">"{log.corrected}"</p>
                                    </div>
                                </div>
                                
                                <div className="p-4 bg-black/40 border border-white/5 rounded-2xl flex items-start gap-3">
                                    <AlertCircle className="w-4 h-4 text-brand-400 mt-0.5" />
                                    <div>
                                        <p className="text-[10px] font-bold text-white uppercase tracking-tight">Refinement Rationale</p>
                                        <p className="text-[9px] text-white/40 italic leading-relaxed">{log.reason}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* SELF-MODEL OPS */}
                <div className="space-y-6">
                    <h3 className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-4">Meta-Intelligence</h3>
                    
                    <div className="p-8 bg-brand-500/5 border border-brand-500/10 rounded-3xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-700">
                            <Cpu className="w-32 h-32 text-brand-400" />
                        </div>
                        
                        <div className="flex items-center gap-3 mb-8">
                            <Zap className="w-5 h-5 text-brand-400" />
                            <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Recursive Cycles</h4>
                        </div>
                        
                        <div className="text-4xl font-black text-white tracking-tighter mb-2">1,242</div>
                        <p className="text-[10px] text-white/40 uppercase font-black tracking-widest mb-8">System-Wide Self-Audit Cycles</p>

                        <div className="space-y-4">
                            <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                                <motion.div initial={{ width: 0 }} animate={{ width: '84%' }} className="h-full bg-brand-500" />
                            </div>
                            <div className="flex justify-between text-[8px] font-black uppercase text-white/40">
                                <span>Optimization</span>
                                <span className="text-white">84%</span>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl space-y-4">
                        <div className="flex items-center justify-between">
                            <h4 className="text-[10px] font-bold text-white uppercase tracking-widest">Active Constraints</h4>
                            <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded text-[8px] font-black uppercase">Enforced</span>
                        </div>
                        <div className="space-y-3">
                            <ConstraintItem label="Anti-Robot Filter" safe />
                            <ConstraintItem label="High-Status Lexicon" safe />
                            <ConstraintItem label="Viral Structure Map" safe />
                        </div>
                    </div>

                    <div className="p-6 border border-white/5 rounded-2xl flex items-center justify-between cursor-pointer hover:bg-white/5 transition-all group">
                        <div className="flex items-center gap-3">
                            <Code2 className="w-4 h-4 text-white/20 group-hover:text-white" />
                            <span className="text-[10px] font-bold text-white uppercase tracking-tight">System Prompt Sandbox</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-white/20" />
                    </div>
                </div>
            </div>
        </div>
    );
}

function ConstraintItem({ label, safe }: { label: string, safe?: boolean }) {
    return (
        <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
            <span className="text-[10px] font-bold text-white uppercase tracking-tight">{label}</span>
            {safe ? <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> : <AlertCircle className="w-3.5 h-3.5 text-rose-500" />}
        </div>
    );
}

