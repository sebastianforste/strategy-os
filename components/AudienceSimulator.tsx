"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Play, RotateCcw, MessageSquare, AlertCircle, CheckCircle, Brain, Shield, Zap, Info, TrendingUp, Search, Sliders, ChevronRight, Activity, Cpu, Database, Command } from "lucide-react";

interface MockComment {
    id: string;
    persona: string;
    text: string;
    sentiment: 'Positive' | 'Critical' | 'Skeptical';
}

const COMMENTS: MockComment[] = [
    { id: 'c1', persona: 'The VC Skeptic', text: "What's the actual retention on these agentic loops? Seems like a hype cycle.", sentiment: 'Critical' },
    { id: 'c2', persona: 'The Optimist Founder', text: "Finally someone building for the sovereign developer. Sending this to my team.", sentiment: 'Positive' },
    { id: 'c3', persona: 'The Tech Lead', text: "Interesting approach to LanceDB scaling. How are you handling vector drift?", sentiment: 'Skeptical' },
];

export default function AudienceSimulator() {
    const [comments] = useState<MockComment[]>(COMMENTS);
    const [isRunning, setIsRunning] = useState(false);

    const handleRunSim = () => {
        setIsRunning(true);
        setTimeout(() => setIsRunning(false), 3000);
    };

    return (
        <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-8 min-h-[700px]">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12">
                <div className="flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-[0_0_20px_rgba(99,102,241,0.1)]">
                        <Users className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white uppercase tracking-tight">Behavioral Sim</h2>
                        <p className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-mono mt-1">Synthetic Audience Simulation & Controversy Stress Testing</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button 
                        onClick={handleRunSim}
                        disabled={isRunning}
                        className="px-6 py-2.5 bg-indigo-500 text-white rounded-xl text-[10px] font-black tracking-widest hover:shadow-[0_0_30px_rgba(99,102,241,0.3)] transition-all uppercase flex items-center gap-2"
                    >
                        {isRunning ? <RotateCcw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                        <span>{isRunning ? "Simulating..." : "Run Stress Test"}</span>
                    </button>
                    <div className="p-2.5 bg-white/5 border border-white/10 rounded-xl text-white/40">
                        <Info className="w-4 h-4" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* SIMULATION FEED */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Synthetic Commentary</h3>
                        <div className="flex items-center gap-4 text-[10px] font-black text-white/40 uppercase tracking-widest">
                            <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Latency: 42ms</span>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {comments.map((comment) => (
                            <motion.div
                                key={comment.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="p-6 bg-white/[0.02] border border-white/5 rounded-[32px] hover:border-white/10 transition-all group"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-white/20 group-hover:text-indigo-400 transition-colors uppercase font-black text-[9px]">
                                            {comment.persona.charAt(0)}
                                        </div>
                                        <div>
                                            <h4 className="text-[10px] font-black text-white uppercase tracking-widest">{comment.persona}</h4>
                                            <p className={`text-[8px] font-bold uppercase ${
                                                comment.sentiment === 'Positive' ? 'text-emerald-400' : 
                                                comment.sentiment === 'Critical' ? 'text-rose-400' : 'text-amber-400'
                                            }`}>
                                                {comment.sentiment} Vector
                                            </p>
                                        </div>
                                    </div>
                                    <MessageSquare className="w-4 h-4 text-white/10" />
                                </div>
                                <p className="text-[11px] text-white/60 leading-relaxed italic">"{comment.text}"</p>
                            </motion.div>
                        ))}
                    </div>

                    <div className="p-8 bg-white/[0.01] border border-white/5 rounded-[40px] space-y-4">
                        <div className="flex items-center gap-3">
                            <AlertCircle className="w-4 h-4 text-rose-400" />
                            <h3 className="text-[10px] font-black text-white uppercase tracking-widest">Potential Friction Points</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FrictionPoint label="High Status alienation" score={12} />
                            <FrictionPoint label="Technical complexity gap" score={64} />
                            <FrictionPoint label="Sentiment volatility" score={28} />
                            <FrictionPoint label="Authority resonance" score={92} />
                        </div>
                    </div>
                </div>

                {/* SIM METRICS */}
                <div className="space-y-6">
                    <h3 className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-4">Audience Vitals</h3>
                    
                    <div className="p-8 bg-indigo-500/5 border border-indigo-500/10 rounded-3xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-700">
                            <Brain className="w-32 h-32 text-indigo-400" />
                        </div>
                        
                        <div className="flex items-center gap-3 mb-8">
                            <TrendingUp className="w-5 h-5 text-indigo-400" />
                            <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Engagement Prob</h4>
                        </div>
                        
                        <div className="text-4xl font-black text-white tracking-tighter mb-2">82.4%</div>
                        <p className="text-[10px] text-white/40 uppercase font-black tracking-widest mb-8">Viral Success Probability</p>

                        <div className="space-y-4">
                            <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                                <motion.div initial={{ width: 0 }} animate={{ width: '82%' }} className="h-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                            </div>
                        </div>
                    </div>

                    <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl space-y-4">
                        <div className="flex items-center gap-3">
                            <Shield className="w-4 h-4 text-brand-400" />
                            <h4 className="text-[10px] font-bold text-white uppercase tracking-widest">Controversy Shield</h4>
                        </div>
                        <p className="text-[10px] text-white/40 leading-relaxed uppercase font-black tracking-tighter">
                            Autonomous reply agent primed for skepticism. Deflection strategies: 84. Validation strategies: 12.
                        </p>
                    </div>

                    <div className="p-6 border border-white/5 rounded-2xl flex items-center justify-between cursor-pointer hover:bg-white/5 transition-all group">
                        <div className="flex items-center gap-3">
                            <Database className="w-4 h-4 text-white/20 group-hover:text-white" />
                            <span className="text-[10px] font-bold text-white uppercase tracking-tight">Access Persona Repository</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-white/20" />
                    </div>
                </div>
            </div>
        </div>
    );
}

function FrictionPoint({ label, score }: { label: string, score: number }) {
    return (
        <div className="p-4 bg-white/5 rounded-2xl border border-white/10 group hover:border-indigo-500/20 transition-all">
            <div className="flex justify-between items-center mb-2">
                <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">{label}</span>
                <span className={`text-[9px] font-mono ${score > 50 ? 'text-rose-400' : 'text-emerald-400'}`}>{score}%</span>
            </div>
            <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${score}%` }} className={`h-full ${score > 50 ? 'bg-rose-500' : 'bg-emerald-500'}`} />
            </div>
        </div>
    );
}
