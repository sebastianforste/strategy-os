"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Shield, Zap, Activity, MessageSquare, ChevronRight, CheckCircle, Cpu, Database, Command, AlertCircle, Sparkles, Filter, Terminal, Brain, MessageCircle, RotateCcw, Play } from "lucide-react";

interface SwarmAgent {
    id: string;
    name: string;
    role: 'Strategist' | 'Researcher' | 'Synthesizer' | 'Architect';
    status: 'Idle' | 'Thinking' | 'Debating' | 'Verified';
    message: string;
}

const AGENTS: SwarmAgent[] = [
    { id: 'a1', name: 'Nexus-7', role: 'Strategist', status: 'Thinking', message: 'Analyzing market sentiment for viral hooks...' },
    { id: 'a2', name: 'Cortex-S', role: 'Researcher', status: 'Debating', message: 'Evaluating competitor backlink patterns.' },
    { id: 'a3', name: 'Prism-A', role: 'Synthesizer', status: 'Idle', message: 'Awaiting data packets for consolidation.' },
];

export default function AgentSwarm() {
    const [agents] = useState<SwarmAgent[]>(AGENTS);
    const [isSwarming, setIsSwarming] = useState(false);

    const handleSwarmStart = () => {
        setIsSwarming(true);
        setTimeout(() => setIsSwarming(false), 3500);
    };

    return (
        <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-8 min-h-[700px]">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12">
                <div className="flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-brand-400/10 text-brand-400 border border-brand-400/20 shadow-[0_0_20px_rgba(34,211,238,0.1)]">
                        <Users className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white uppercase tracking-tight">Intelligence Swarm</h2>
                        <p className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-mono mt-1">Autonomous Multi-Agent Collaborative Execution</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button 
                        onClick={handleSwarmStart}
                        disabled={isSwarming}
                        className="px-6 py-2.5 bg-brand-500 text-white rounded-xl text-[10px] font-black tracking-widest hover:shadow-[0_0_30px_rgba(34,211,238,0.3)] transition-all uppercase flex items-center gap-2"
                    >
                        {isSwarming ? <RotateCcw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                        <span>{isSwarming ? "Swarming..." : "Initiate Swarm"}</span>
                    </button>
                    <div className="p-2.5 bg-white/5 border border-white/10 rounded-xl text-white/40">
                        <Terminal className="w-4 h-4" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* SWARM GRID */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Active Council</h3>
                        <div className="flex items-center gap-2">
                            <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest px-2 py-1 bg-white/5 rounded">Live Telemetry</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {agents.map((agent) => (
                            <motion.div
                                key={agent.id}
                                whileHover={{ scale: 1.02 }}
                                className={`p-6 bg-white/[0.02] border rounded-[32px] transition-all relative overflow-hidden ${
                                    agent.status === 'Debating' ? 'border-brand-500/20 shadow-[0_0_30px_rgba(34,211,238,0.05)]' : 'border-white/5'
                                }`}
                            >
                                <div className="flex items-center justify-between mb-6">
                                    <div className="p-3 bg-white/5 rounded-2xl">
                                        {agent.role === 'Strategist' ? <Brain className="w-4 h-4 text-brand-400" /> : 
                                         agent.role === 'Researcher' ? <SearchCode className="w-4 h-4 text-emerald-400" /> : <Cpu className="w-4 h-4 text-indigo-400" />}
                                    </div>
                                    <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${
                                        agent.status === 'Thinking' ? 'bg-amber-500/20 text-amber-500' : 
                                        agent.status === 'Debating' ? 'bg-brand-500 text-black animate-pulse' : 'text-white/20 bg-white/5'
                                    }`}>
                                        {agent.status}
                                    </span>
                                </div>
                                <h4 className="text-sm font-bold text-white uppercase tracking-tight mb-1">{agent.name}</h4>
                                <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em] mb-6">{agent.role}</p>
                                <p className="text-[10px] text-white/40 leading-relaxed italic line-clamp-2">"{agent.message}"</p>
                            </motion.div>
                        ))}
                    </div>

                    <div className="p-8 bg-white/[0.01] border border-white/5 rounded-[40px] space-y-4">
                        <div className="flex items-center gap-3">
                            <MessageCircle className="w-4 h-4 text-brand-400" />
                            <h3 className="text-[10px] font-black text-white uppercase tracking-widest">Debate Transcript Buffer</h3>
                        </div>
                        <div className="space-y-4 font-mono text-[10px]">
                            <div className="flex gap-4">
                                <span className="text-brand-400 font-bold uppercase">[Nexus-7]:</span>
                                <span className="text-white/60 text-xs">Recommended shift: Emphasis on 'Agentic Ops' vs 'Automation'.</span>
                            </div>
                            <div className="flex gap-4">
                                <span className="text-emerald-400 font-bold uppercase">[Cortex-S]:</span>
                                <span className="text-white/60 text-xs">Agreement. Search volume for 'Agentic' up 412% this quarter.</span>
                            </div>
                            <div className="flex gap-4">
                                <span className="text-indigo-400 font-bold uppercase">[System]:</span>
                                <span className="text-white/40 text-xs italic">Syncing refined strategy to all operational nodes...</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* COUNCIL STATS */}
                <div className="space-y-6">
                    <h3 className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-4">Consensus Vitals</h3>
                    
                    <div className="p-8 bg-brand-500/5 border border-brand-500/10 rounded-3xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-700">
                            <Command className="w-32 h-32 text-brand-400" />
                        </div>
                        
                        <div className="flex items-center gap-3 mb-8">
                            <Activity className="w-5 h-5 text-brand-400" />
                            <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Sync Cohesion</h4>
                        </div>
                        
                        <div className="text-4xl font-black text-white tracking-tighter mb-2">94.2%</div>
                        <p className="text-[10px] text-white/40 uppercase font-black tracking-widest mb-8">Multi-Agent Strategy Alignment</p>

                        <div className="space-y-4">
                            <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                                <motion.div initial={{ width: 0 }} animate={{ width: '94%' }} className="h-full bg-brand-500 shadow-[0_0_10px_rgba(34,211,238,0.5)]" />
                            </div>
                        </div>
                    </div>

                    <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl space-y-4">
                        <div className="flex items-center justify-between">
                            <h4 className="text-[10px] font-bold text-white uppercase tracking-widest">Resource Allocation</h4>
                            <Shield className="w-4 h-4 text-brand-400" />
                        </div>
                        <div className="space-y-3">
                            <ResourceBar label="Compute Load" val={24} color="emerald" />
                            <ResourceBar label="Memory Depth" val={68} color="indigo" />
                            <ResourceBar label="Strategy Latency" val={12} color="brand" />
                        </div>
                    </div>

                    <div className="p-6 border border-white/5 rounded-2xl flex items-center justify-between cursor-pointer hover:bg-white/5 transition-all group">
                        <div className="flex items-center gap-3">
                            <Database className="w-4 h-4 text-white/20 group-hover:text-white" />
                            <span className="text-[10px] font-bold text-white uppercase tracking-tight">Access Swarm History</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-white/20" />
                    </div>
                </div>
            </div>
        </div>
    );
}

function ResourceBar({ label, val, color }: { label: string, val: number, color: string }) {
    return (
        <div className="space-y-2">
            <div className="flex justify-between text-[9px] font-black uppercase text-white/40 tracking-widest">
                <span>{label}</span>
                <span>{val}%</span>
            </div>
            <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${val}%` }} className={`h-full ${
                    color === 'brand' ? 'bg-brand-500' : color === 'emerald' ? 'bg-emerald-500' : 'bg-indigo-500'
                }`} />
            </div>
        </div>
    );
}

function SearchCode(props: any) {
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
            <path d="m13 13.5 2-2.5-2-2.5" />
            <path d="m21 21-4.35-4.35" />
            <path d="M9 8.5 7 11l2 2.5" />
            <circle cx="11" cy="11" r="8" />
        </svg>
    );
}
