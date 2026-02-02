"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ShieldAlert, Zap, Compass, Brain, Terminal, Loader2, CheckCircle2, MessageSquareQuote, Bot } from "lucide-react";
import { SwarmMessage } from "../utils/swarm-service";

interface SwarmConsoleProps {
    messages: SwarmMessage[];
    activeRole: string | null;
    isVisible: boolean;
}

export default function SwarmConsole({ messages, activeRole, isVisible }: SwarmConsoleProps) {
    if (!isVisible) return null;

    const getIcon = (role: string) => {
        switch (role) {
            case "pessimist": return <ShieldAlert className="w-3.5 h-3.5 text-red-400" />;
            case "futurist": return <Zap className="w-3.5 h-3.5 text-purple-400" />;
            case "realist": return <Compass className="w-3.5 h-3.5 text-emerald-400" />;
            case "contrarian": return <Bot className="w-3.5 h-3.5 text-orange-400" />;
            case "synthesizer": return <Brain className="w-3.5 h-3.5 text-indigo-400" />;
            default: return <Terminal className="w-3.5 h-3.5 text-neutral-500" />;
        }
    };

    const getRoleBorder = (role: string) => {
        switch (role) {
            case "pessimist": return "border-red-500/20";
            case "futurist": return "border-purple-500/20";
            case "realist": return "border-emerald-500/20";
            case "contrarian": return "border-orange-500/20";
            case "synthesizer": return "border-indigo-500/20";
            default: return "border-white/5";
        }
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="mt-6 mx-6 p-6 bg-neutral-900/80 border border-white/10 rounded-2xl backdrop-blur-xl shadow-2xl relative overflow-hidden"
        >
            {/* Thinking Progress Bar */}
            <div className="absolute top-0 left-0 h-0.5 bg-gradient-to-r from-red-500 via-purple-500 via-emerald-500 to-indigo-500 w-full animate-gradient-x" />

            <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/5 rounded-lg border border-white/10">
                        <Terminal className="w-4 h-4 text-neutral-400" />
                    </div>
                    <div>
                        <h4 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                            Synthetic Swarm: Council Active
                            <span className="flex gap-1">
                                <span className="w-1 h-1 bg-red-400 rounded-full animate-pulse" />
                                <span className="w-1 h-1 bg-purple-400 rounded-full animate-pulse delay-75" />
                                <span className="w-1 h-1 bg-emerald-400 rounded-full animate-pulse delay-150" />
                            </span>
                        </h4>
                        <p className="text-[10px] text-neutral-500 font-mono">Running parallel adversarial audits...</p>
                    </div>
                </div>
                {activeRole && (
                    <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-full flex items-center gap-2">
                        <Loader2 className="w-3 h-3 text-indigo-400 animate-spin" />
                        <span className="text-[10px] text-neutral-300 font-bold uppercase tracking-wider">{activeRole} Speaking...</span>
                    </div>
                )}
            </div>

            <div className="space-y-4 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                <AnimatePresence initial={false}>
                    {messages.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-12 text-neutral-600 opacity-50">
                            <Terminal className="w-8 h-8 mb-2" />
                            <p className="text-[10px] uppercase font-bold tracking-widest">Initializing Consensus Engine...</p>
                        </div>
                    )}
                    {messages.map((msg, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className={`p-4 bg-black/40 rounded-xl border ${getRoleBorder(msg.role)} space-y-2`}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    {getIcon(msg.role)}
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">
                                        {msg.agent}
                                    </span>
                                </div>
                                <span className="text-[9px] text-neutral-600 font-mono">
                                    {new Date(msg.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                </span>
                            </div>
                            <div className="flex gap-3">
                                <MessageSquareQuote className="w-4 h-4 text-neutral-700 shrink-0 mt-1" />
                                <p className="text-[11px] text-neutral-400 leading-relaxed font-medium italic">
                                    "{msg.content}"
                                </p>
                            </div>
                            {msg.role === "synthesizer" && (
                                <div className="mt-2 flex items-center gap-2 px-2 py-1 bg-emerald-500/10 rounded-md border border-emerald-500/20">
                                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                    <span className="text-[9px] text-emerald-400 font-bold uppercase">Consensus Reached: Strategy Hardened</span>
                                </div>
                            )}
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}
