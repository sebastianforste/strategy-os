"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Database, Brain, Search, Trash2, Shield, Zap, Filter, ArrowUpRight, Clock, Box } from "lucide-react";

interface MemoryItem {
    id: string;
    content: string;
    topic?: string;
    timestamp: string;
    retrievalCount: number;
}

export default function MemoryDashboard({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
    const [searchQuery, setSearchQuery] = useState("");
    const [memories, setMemories] = useState<MemoryItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Mock initial load - will connect to memory-service via server action later
    useEffect(() => {
        if (isOpen) {
            setMemories([
                { id: "1", content: "Successful fintech post about risk mitigation.", topic: "Fintech", timestamp: "2026-02-01", retrievalCount: 5 },
                { id: "2", content: "Growth hack sequence for B2B SaaS LinkedIn presence.", topic: "B2B SaaS", timestamp: "2026-01-28", retrievalCount: 3 },
                { id: "3", content: "Zero-marginal cost strategy for content distribution.", topic: "Economics", timestamp: "2026-01-25", retrievalCount: 8 }
            ]);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[110] bg-black/95 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="bg-[#080808] border border-indigo-500/20 rounded-3xl w-full max-w-6xl h-[85vh] overflow-hidden shadow-[0_0_100px_rgba(79,70,229,0.1)] flex flex-col"
            >
                {/* Tactical Header */}
                <div className="p-8 border-b border-white/5 bg-gradient-to-r from-indigo-950/20 to-transparent flex items-center justify-between">
                    <div className="flex items-center gap-5">
                        <div className="p-4 bg-indigo-500/10 rounded-2xl border border-indigo-500/30 shadow-[0_0_20px_rgba(79,70,229,0.2)]">
                            <Brain className="w-8 h-8 text-indigo-400" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-white tracking-widest uppercase italic">Memory Cortex</h3>
                            <p className="text-[10px] text-indigo-400 font-mono tracking-[0.3em] uppercase mt-1">Long-term Cognitive Retrieval Node v1.0</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                            <input 
                                type="text"
                                placeholder="QUERY STRATEGEMS..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="bg-white/5 border border-white/10 rounded-xl pl-12 pr-6 py-3 text-xs text-white placeholder:text-neutral-600 focus:outline-none focus:border-indigo-500/50 w-64 uppercase tracking-widest transition-all"
                            />
                        </div>
                        <button onClick={onClose} className="p-2 text-neutral-500 hover:text-white transition-colors">
                            <ArrowUpRight className="w-6 h-6 rotate-45" />
                        </button>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 overflow-hidden flex">
                    {/* Knowledge Stats Sidebar */}
                    <div className="w-64 border-r border-white/5 p-6 space-y-8 bg-black/20">
                        <div>
                            <label className="text-[9px] font-black text-neutral-600 uppercase tracking-widest block mb-4">Cortex Statistics</label>
                            <div className="space-y-4">
                                <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                                    <div className="text-[10px] text-neutral-500 uppercase font-bold mb-1">Total Strategems</div>
                                    <div className="text-2xl font-black text-white">{memories.length}</div>
                                </div>
                                <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                                    <div className="text-[10px] text-neutral-500 uppercase font-bold mb-1">Retrieval Latency</div>
                                    <div className="text-2xl font-black text-indigo-400">12ms</div>
                                </div>
                                <div className="p-4 bg-indigo-500/5 rounded-2xl border border-indigo-500/10">
                                    <div className="text-[10px] text-indigo-400 uppercase font-bold mb-1">Pattern Matches</div>
                                    <div className="text-2xl font-black text-indigo-300">84%</div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="text-[9px] font-black text-neutral-600 uppercase tracking-widest block mb-4">Storage Priority</label>
                            <div className="flex flex-wrap gap-2">
                                {['FINTECH', 'STRATEGY', 'B2B', 'CRYPTO', 'AI'].map(tag => (
                                    <span key={tag} className="px-2 py-1 bg-white/5 border border-white/10 rounded text-[9px] text-neutral-400 font-bold tracking-tight">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Strategem Grid */}
                    <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
                        <div className="grid grid-cols-2 gap-6">
                            {memories.map((memory) => (
                                <motion.div
                                    key={memory.id}
                                    layout
                                    className="group relative p-6 bg-white/[0.02] border border-white/5 rounded-3xl hover:border-indigo-500/30 transition-all hover:bg-white/[0.04]"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-indigo-500/10 rounded-xl">
                                                <Box className="w-4 h-4 text-indigo-400" />
                                            </div>
                                            <div>
                                                <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{memory.topic}</span>
                                                <p className="text-[9px] text-neutral-600 font-mono mt-0.5 uppercase">{memory.timestamp}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1.5 px-2 py-1 bg-white/5 rounded-lg border border-white/5">
                                            <Zap className="w-3 h-3 text-yellow-500" />
                                            <span className="text-[10px] font-black text-white">{memory.retrievalCount}x</span>
                                        </div>
                                    </div>
                                    
                                    <p className="text-sm text-neutral-300 leading-relaxed line-clamp-4 italic">
                                        "{memory.content}"
                                    </p>

                                    <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button className="text-[9px] font-black text-neutral-500 hover:text-white uppercase tracking-widest flex items-center gap-2">
                                            Recalibrate Patterns
                                        </button>
                                        <button className="p-2 text-neutral-600 hover:text-red-500 transition-colors">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer Status */}
                <div className="p-6 border-t border-white/5 bg-black/40 flex items-center justify-between">
                    <div className="flex items-center gap-8">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                            <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">LanceDB Vector Mesh Active</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Shield className="w-3 h-3 text-emerald-500" />
                            <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Data Encryption: High</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                         <button className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-xl text-xs uppercase tracking-widest transition-all shadow-lg shadow-indigo-950/20">
                            Force Sync Archive
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
