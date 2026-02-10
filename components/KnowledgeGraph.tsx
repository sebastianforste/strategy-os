"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Share2, Hubot, Network, Database, Layers, Search, Minimize2, Maximize2, RefreshCw, Zap, Cpu, Brain, GitBranch, GitMerge, ChevronRight, Activity, Filter, Eye } from "lucide-react";

interface Node {
    id: string;
    label: string;
    type: 'Concept' | 'Persona' | 'Asset' | 'Channel';
    relevance: number;
}

const NODES: Node[] = [
    { id: 'n1', label: 'Agentic Ops', type: 'Concept', relevance: 98 },
    { id: 'n2', label: 'High Status', type: 'Concept', relevance: 84 },
    { id: 'n3', label: 'The Architect', type: 'Persona', relevance: 100 },
    { id: 'n4', label: 'Viral Thread', type: 'Asset', relevance: 72 },
    { id: 'n5', label: 'LinkedIn', type: 'Channel', relevance: 92 },
];

export default function KnowledgeGraph() {
    const [nodes] = useState<Node[]>(NODES);
    const [isMapping, setIsMapping] = useState(false);

    const handleRemap = () => {
        setIsMapping(true);
        setTimeout(() => setIsMapping(false), 2500);
    };

    return (
        <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-8 min-h-[700px]">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12">
                <div className="flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-[0_0_20px_rgba(99,102,241,0.1)]">
                        <Share2 className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white uppercase tracking-tight">Strategy Brain</h2>
                        <p className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-mono mt-1">Semantic Knowledge Graph & Latent Relationship Mapping</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button 
                        onClick={handleRemap}
                        disabled={isMapping}
                        className="px-6 py-2.5 bg-indigo-500 text-white rounded-xl text-[10px] font-black tracking-widest hover:shadow-[0_0_30px_rgba(99,102,241,0.3)] transition-all uppercase flex items-center gap-2"
                    >
                        {isMapping ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
                        <span>{isMapping ? "Mapping..." : "Sync LanceDB"}</span>
                    </button>
                    <div className="p-2.5 bg-white/5 border border-white/10 rounded-xl text-white/40">
                        <Maximize2 className="w-4 h-4" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* GRAPH VISUALIZATION AREA */}
                <div className="lg:col-span-2 relative min-h-[500px] border border-white/5 bg-white/[0.01] rounded-[40px] overflow-hidden group">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.05)_0%,transparent_70%)]" />
                    
                    {/* Mock Graph Elements */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="relative w-full h-full p-12">
                           <AnimatePresence>
                                {nodes.map((node, i) => (
                                    <motion.div
                                        key={node.id}
                                        initial={{ scale: 0, opacity: 0 }}
                                        animate={{ 
                                            scale: 1, 
                                            opacity: 1,
                                            x: Math.cos(i * 1.25) * 150,
                                            y: Math.sin(i * 1.25) * 100
                                        }}
                                        whileHover={{ scale: 1.1, zIndex: 10 }}
                                        className="absolute left-1/2 top-1/2 -ml-16 -mt-16 p-6 bg-[#0f0f0f] border border-white/10 rounded-full flex flex-col items-center justify-center gap-1 shadow-2xl backdrop-blur-xl cursor-move group/node"
                                    >
                                        <div className={`p-2 rounded-lg bg-white/5 mb-2 group-hover/node:text-indigo-400 transition-colors`}>
                                            {node.type === 'Concept' ? <Brain className="w-4 h-4" /> : 
                                             node.type === 'Persona' ? <GitBranch className="w-4 h-4" /> : 
                                             node.type === 'Asset' ? <Layers className="w-4 h-4" /> : <Network className="w-4 h-4" />}
                                        </div>
                                        <span className="text-[10px] font-black uppercase text-white tracking-widest leading-none text-center px-2">{node.label}</span>
                                        <span className="text-[8px] font-mono text-white/30 uppercase mt-1">{node.type}</span>
                                    </motion.div>
                                ))}
                           </AnimatePresence>

                           {/* Connector Lines (Mock) */}
                           <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-10">
                               <line x1="50%" y1="50%" x2="70%" y2="40%" stroke="white" strokeWidth="1" strokeDasharray="4 4" />
                               <line x1="50%" y1="50%" x2="30%" y2="60%" stroke="white" strokeWidth="1" strokeDasharray="4 4" />
                               <line x1="70%" y1="40%" x2="80%" y2="70%" stroke="white" strokeWidth="1" strokeDasharray="4 4" />
                           </svg>
                        </div>
                    </div>

                    {/* Overlay Controls */}
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 p-1 bg-black/80 backdrop-blur-2xl border border-white/10 rounded-2xl">
                        <button className="p-3 text-white/40 hover:text-white transition-colors"><Minimize2 className="w-4 h-4" /></button>
                        <div className="w-px h-6 bg-white/5 mx-1" />
                        <button className="p-3 text-white/40 hover:text-white transition-colors"><Layers className="w-4 h-4" /></button>
                        <button className="p-3 text-white/40 hover:text-white transition-colors"><Filter className="w-4 h-4" /></button>
                        <div className="w-px h-6 bg-white/5 mx-1" />
                        <button className="p-3 text-white/40 hover:text-white transition-colors"><RefreshCw className="w-4 h-4" /></button>
                    </div>
                </div>

                {/* GRAPH INSIGHTS */}
                <div className="space-y-6">
                    <h3 className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-4">Semantic Insights</h3>
                    
                    <div className="p-8 bg-indigo-500/5 border border-indigo-500/10 rounded-3xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-700">
                           <Network className="w-32 h-32 text-indigo-400" />
                        </div>
                        <div className="flex items-center gap-3 mb-6">
                            <Activity className="w-4 h-4 text-indigo-400" />
                            <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Latent Connectivity</h4>
                        </div>
                        <div className="text-4xl font-black text-white tracking-tighter">1,242</div>
                        <p className="text-[9px] text-white/20 uppercase font-black tracking-widest mt-2">Correlated Strategy Nodes</p>
                    </div>

                    <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl space-y-4">
                        <h4 className="text-[10px] font-bold text-white uppercase tracking-widest">Highly Correlated Pairs</h4>
                        <div className="space-y-3">
                            <CorrelationPair left="Agentic" right="Outcome" score={98} />
                            <CorrelationPair left="Viral" right="Persona" score={84} />
                            <CorrelationPair left="Enterprise" right="Compliance" score={76} />
                        </div>
                    </div>

                    <div className="p-6 border border-white/5 rounded-2xl flex items-center justify-between cursor-pointer hover:bg-white/5 transition-all group">
                        <div className="flex items-center gap-3">
                            <Eye className="w-4 h-4 text-white/20 group-hover:text-white" />
                            <span className="text-[10px] font-bold text-white uppercase tracking-tight">Focus Node Inspection</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-white/20" />
                    </div>
                </div>
            </div>
        </div>
    );
}

function CorrelationPair({ left, right, score }: { left: string, right: string, score: number }) {
    return (
        <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 group hover:border-indigo-500/20 transition-all">
            <div className="flex items-center gap-2">
                <span className="text-[9px] font-black text-white uppercase">{left}</span>
                <GitMerge className="w-3 h-3 text-white/20 group-hover:text-indigo-400 transition-colors" />
                <span className="text-[9px] font-black text-white uppercase">{right}</span>
            </div>
            <span className="text-[9px] font-mono text-indigo-400">{score}%</span>
        </div>
    );
}
