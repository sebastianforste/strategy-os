"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, MessageSquare, ShieldCheck, Zap, Ghost, Eye, Brain, Scale, TrendingUp } from "lucide-react";

interface AgentMessage {
    id: string;
    agentName: string;
    role: "visionary" | "skeptic" | "strategist";
    content: string;
    timestamp: number;
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
        if (isDebating) return;
        setIsDebating(true);
        setMessages([]);

        const agents = [
            { name: "The Visionary", role: "visionary" as const, prompt: "Amplify the status and high-ticket potential. How does this disrupt the market?" },
            { name: "The Skeptic", role: "skeptic" as const, prompt: "Attack the weak points. Why would this fail? Is it too 'robotic'?" },
            { name: "The Strategist", role: "strategist" as const, prompt: "Synthesize the two. What is the precise tactical move to win?" }
        ];

        // Cumulative debate logic
        let currentContext = strategyContent;
        
        for (const agent of agents) {
            // Mocking the AI call delay for now, would use geminiAction in real impl
            await new Promise(r => setTimeout(r, 1500));
            
            const newMessage: AgentMessage = {
                id: `msg-${Date.now()}`,
                agentName: agent.name,
                role: agent.role,
                content: `Analyzing "${strategyContent.substring(0, 30)}..." - [Simulated Feedback based on ${agent.role} persona]`,
                timestamp: Date.now()
            };
            
            setMessages(prev => [...prev, newMessage]);
            setConsensusScore(prev => Math.min(100, prev + 30));
        }

        setIsDebating(false);
    };

    return (
        <div className="w-full bg-[#0a0c14] border border-white/10 rounded-3xl overflow-hidden shadow-3xl">
            <div className="p-6 border-b border-white/5 bg-gradient-to-r from-indigo-900/40 to-black flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-indigo-500/20 rounded-2xl border border-indigo-500/30">
                        <Users className="w-6 h-6 text-indigo-400" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-white tracking-tighter uppercase">Multi-Agent Boardroom</h2>
                        <p className="text-[10px] text-indigo-300 font-mono tracking-widest uppercase">The Council of Strategists</p>
                    </div>
                </div>
                <div className="flex items-center gap-6">
                    <div className="flex flex-col items-end">
                        <span className="text-[9px] text-neutral-500 uppercase font-mono tracking-tighter">Consensus</span>
                        <div className="flex items-center gap-2">
                            <div className="h-1.5 w-24 bg-neutral-800 rounded-full overflow-hidden">
                                <motion.div 
                                    className="h-full bg-indigo-500"
                                    animate={{ width: `${consensusScore}%` }}
                                />
                            </div>
                            <span className="text-xs font-black text-white">{consensusScore}%</span>
                        </div>
                    </div>
                    <button 
                        onClick={startDebate}
                        disabled={isDebating}
                        className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-indigo-600/20 flex items-center gap-2 uppercase tracking-widest"
                    >
                        {isDebating ? <Brain className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                        {isDebating ? "Debating..." : "Convene Council"}
                    </button>
                </div>
            </div>

            <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-[400px]">
                <AnimatePresence mode="popLayout">
                    {messages.length === 0 && !isDebating && (
                        <div className="col-span-full flex flex-col items-center justify-center text-neutral-700 py-20 border-2 border-dashed border-white/5 rounded-3xl">
                            <Users className="w-12 h-12 mb-4 opacity-10" />
                            <p className="text-xs font-mono uppercase tracking-[0.3em]">Boardroom is Empty</p>
                        </div>
                    )}
                    
                    {messages.map((msg, i) => (
                        <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            className={`p-6 rounded-3xl border ${
                                msg.role === 'visionary' ? 'bg-indigo-500/5 border-indigo-500/20' :
                                msg.role === 'skeptic' ? 'bg-red-500/5 border-red-500/20' :
                                'bg-emerald-500/5 border-emerald-500/20'
                            } relative flex flex-col gap-4 overflow-hidden`}
                        >
                            <div className="absolute top-0 right-0 p-4 opacity-5">
                                {msg.role === 'visionary' ? <Ghost className="w-16 h-16" /> :
                                 msg.role === 'skeptic' ? <Scale className="w-16 h-16" /> :
                                 <Brain className="w-16 h-16" />}
                            </div>

                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                        msg.role === 'visionary' ? 'bg-indigo-500 text-white' :
                                        msg.role === 'skeptic' ? 'bg-red-500 text-white' :
                                        'bg-emerald-500 text-white'
                                    }`}>
                                        {msg.agentName[0]}
                                    </div>
                                    <span className="text-xs font-black text-white uppercase tracking-tight">{msg.agentName}</span>
                                </div>
                                <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${
                                    msg.role === 'visionary' ? 'text-indigo-400 bg-indigo-400/10' :
                                    msg.role === 'skeptic' ? 'text-red-400 bg-red-400/10' :
                                    'text-emerald-400 bg-emerald-400/10'
                                }`}>
                                    {msg.role}
                                </span>
                            </div>

                            <p className="text-sm text-neutral-300 leading-relaxed font-medium">
                                {msg.content}
                            </p>

                            <div className="mt-auto pt-4 flex items-center gap-4">
                                <div className="flex flex-col gap-0.5">
                                    <span className="text-[9px] text-neutral-600 uppercase font-mono">Conviction</span>
                                    <div className="flex gap-1">
                                        {[...Array(5)].map((_, i) => (
                                            <div key={i} className={`h-1 w-3 rounded-full ${i < 4 ? 'bg-indigo-500' : 'bg-neutral-800'}`} />
                                        ))}
                                    </div>
                                </div>
                                <button className="ml-auto p-2 hover:bg-white/5 rounded-xl transition-colors">
                                    <TrendingUp className="w-4 h-4 text-neutral-500" />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            <div className="p-4 bg-black/40 border-t border-white/5 flex items-center justify-between">
                <p className="text-[10px] text-neutral-600 font-mono italic">Collective Intelligence derived from Council Debate.</p>
                <div className="flex gap-2">
                    <button className="px-4 py-1.5 border border-white/10 rounded-lg text-[10px] font-bold text-neutral-500 hover:text-white transition-all uppercase">Discard Insights</button>
                    <button className="px-4 py-1.5 bg-white text-black rounded-lg text-[10px] font-black hover:bg-neutral-200 transition-all uppercase">Apply Optimizations</button>
                </div>
            </div>
        </div>
    );
}
