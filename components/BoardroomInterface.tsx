"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Zap, Ghost, Brain, Scale, TrendingUp, Info } from "lucide-react";
import { boardroomDebateAction } from "../actions/collaborative-actions";

interface AgentMessage {
    id: string;
    agentName: string;
    role: "pessimist" | "futurist" | "realist" | "contrarian" | "synthesizer";
    content: string;
    timestamp: string;
}

interface BoardroomInterfaceProps {
    strategyContent: string;
    apiKey: string;
    onFinalize?: (optimizedContent: string) => void;
}

export default function BoardroomInterface({ strategyContent, apiKey, onFinalize }: BoardroomInterfaceProps) {
    const [messages, setMessages] = useState<AgentMessage[]>([]);
    const [isDebating, setIsDebating] = useState(false);
    const [consensusScore, setConsensusScore] = useState(0);

    const startDebate = async () => {
        if (isDebating || !strategyContent) return;
        setIsDebating(true);
        setMessages([]);
        setConsensusScore(0);

        try {
            const result = await boardroomDebateAction(strategyContent, apiKey);
            if (result && result.debate) {
                // Simulate chronological reveal for cinematic effect
                for (let i = 0; i < result.debate.length; i++) {
                    const msg = result.debate[i];
                    await new Promise(r => setTimeout(r, 800)); // Cinematic pacing
                    
                    const uiMsg: AgentMessage = {
                        id: `msg-${i}-${Date.now()}`,
                        agentName: msg.agent,
                        role: msg.role,
                        content: msg.content,
                        timestamp: msg.timestamp
                    };
                    
                    setMessages(prev => [...prev, uiMsg]);
                    setConsensusScore(Math.floor(((i + 1) / result.debate.length) * 100));
                }
            }
        } catch (e) {
            console.error("Boardroom debate failed:", e);
        } finally {
            setIsDebating(false);
        }
    };

    return (
        <div className="w-full bg-[#080a0f]/80 backdrop-blur-3xl border border-white/10 rounded-[2rem] overflow-hidden shadow-[0_24px_80px_rgba(0,0,0,0.6)] group">
            <div className="p-8 border-b border-white/5 bg-gradient-to-br from-indigo-500/10 via-transparent to-black/40 flex items-center justify-between">
                <div className="flex items-center gap-5">
                    <div className="relative">
                        <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full animate-pulse" />
                        <div className="relative p-4 bg-indigo-500/10 rounded-2xl border border-indigo-500/30 backdrop-blur-md">
                            <Users className="w-7 h-7 text-indigo-400" />
                        </div>
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-white tracking-tightest uppercase italic">The Sovereign Council</h2>
                        <p className="text-[9px] text-indigo-300 font-mono tracking-[0.4em] uppercase opacity-60">Multi-Agent Adversarial Synthesis</p>
                    </div>
                </div>
                
                <div className="flex items-center gap-8">
                    <div className="hidden md:flex flex-col items-end gap-1">
                        <span className="text-[10px] text-neutral-500 uppercase font-mono tracking-widest font-black">Consensus Engine</span>
                        <div className="flex items-center gap-3">
                            <div className="h-2 w-32 bg-white/5 rounded-full overflow-hidden border border-white/5 p-[1px]">
                                <motion.div 
                                    className="h-full bg-gradient-to-r from-indigo-600 to-violet-400 rounded-full"
                                    animate={{ width: `${consensusScore}%` }}
                                    transition={{ type: "spring", stiffness: 50 }}
                                />
                            </div>
                            <span className="text-xs font-black text-white tabular-nums">{consensusScore}%</span>
                        </div>
                    </div>
                    
                    <button 
                        onClick={startDebate}
                        disabled={isDebating || !strategyContent}
                        className="relative group/btn overflow-hidden px-8 py-3 bg-white text-black rounded-2xl text-[11px] font-black tracking-widest uppercase transition-all hover:scale-105 active:scale-95 disabled:opacity-20 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                        <span className="relative flex items-center gap-3">
                            {isDebating ? <Brain className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4 fill-black" />}
                            {isDebating ? "Synthesizing..." : "Convene Council"}
                        </span>
                    </button>
                </div>
            </div>

            <div className="p-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 min-h-[500px] bg-white/[0.01]">
                <AnimatePresence mode="popLayout">
                    {messages.length === 0 && !isDebating && (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="col-span-full flex flex-col items-center justify-center text-neutral-600 space-y-4"
                        >
                            <div className="p-8 rounded-full bg-white/[0.02] border border-white/[0.05]">
                                <Ghost className="w-16 h-16 opacity-5" />
                            </div>
                            <p className="text-[10px] font-mono uppercase tracking-[0.5em] opacity-40">Awaiting Strategic Input</p>
                        </motion.div>
                    )}
                    
                    {messages.map((msg, i) => (
                        <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 30, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
                            className={`group/card p-8 rounded-[2rem] border transition-all duration-500 hover:shadow-2xl flex flex-col gap-6 relative overflow-hidden backdrop-blur-xl ${
                                msg.role === 'futurist' ? 'bg-indigo-500/[0.03] border-indigo-500/20 hover:border-indigo-500/40' :
                                msg.role === 'pessimist' ? 'bg-red-500/[0.03] border-red-500/20 hover:border-red-500/40' :
                                msg.role === 'realist' ? 'bg-emerald-500/[0.03] border-emerald-500/20 hover:border-emerald-500/40' :
                                msg.role === 'contrarian' ? 'bg-amber-500/[0.03] border-amber-500/20 hover:border-amber-500/40' :
                                'bg-white/[0.05] border-white/20 col-span-full lg:col-span-3'
                            }`}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-lg ${
                                        msg.role === 'futurist' ? 'bg-indigo-600 text-white' :
                                        msg.role === 'pessimist' ? 'bg-red-600 text-white' :
                                        msg.role === 'realist' ? 'bg-emerald-600 text-white' :
                                        msg.role === 'contrarian' ? 'bg-amber-600 text-white' :
                                        'bg-white text-black'
                                    }`}>
                                        {msg.agentName[0]}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-xs font-black text-white uppercase tracking-tighter">{msg.agentName}</span>
                                        <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest">{msg.role}</span>
                                    </div>
                                </div>
                                <div className="p-2 bg-white/5 rounded-lg opacity-0 group-hover/card:opacity-100 transition-opacity">
                                    <Info className="w-4 h-4 text-neutral-600" />
                                </div>
                            </div>

                            <p className="text-[13px] text-neutral-300 leading-relaxed font-medium selection:bg-indigo-500/30">
                                {msg.content}
                            </p>

                            <div className="mt-auto pt-6 flex items-center justify-between border-t border-white/5">
                                <div className="flex flex-col gap-1.5 w-1/2">
                                    <span className="text-[8px] text-neutral-600 uppercase font-black tracking-widest">Authority Weight</span>
                                    <div className="flex gap-1">
                                        {[...Array(5)].map((_, i) => (
                                            <div key={i} className={`h-1 flex-1 rounded-full ${i < 4 ? 
                                                (msg.role === 'synthesizer' ? 'bg-white' : 'bg-indigo-500') : 'bg-white/5'}`} />
                                        ))}
                                    </div>
                                </div>
                                <button className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-colors">
                                    <TrendingUp className="w-5 h-5 text-neutral-400 group-hover/card:text-white transition-colors" />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            <div className="p-6 bg-[#040508]/60 border-t border-white/5 flex items-center justify-between backdrop-blur-md">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <p className="text-[9px] text-neutral-500 font-mono tracking-widest uppercase">Encryption: High-fidelity Swarm Consensus Active</p>
                </div>
                <div className="flex gap-4">
                    <button className="px-6 py-2 border border-white/5 rounded-xl text-[10px] font-black text-neutral-500 hover:text-white hover:border-white/20 transition-all uppercase tracking-widest">Reject Path</button>
                    <button 
                        onClick={() => onFinalize?.(messages.filter(m => m.role === 'synthesizer')[0]?.content || "")}
                        disabled={!messages.some(m => m.role === 'synthesizer')}
                        className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-20 text-white rounded-xl text-[10px] font-black transition-all uppercase tracking-widest shadow-xl shadow-indigo-600/20"
                    >
                        Hardened Deployment
                    </button>
                </div>
            </div>
        </div>
    );
}
