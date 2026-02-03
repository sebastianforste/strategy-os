"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Search, Network, FileText, ChevronRight, Loader2, Play, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { performDeepRecursiveResearch, ResearchNode, ResearchReport } from "../utils/deep-research";

interface DeepResearchModalProps {
    isOpen: boolean;
    onClose: () => void;
    apiKey?: string;
}

export default function DeepResearchModal({ isOpen, onClose, apiKey }: DeepResearchModalProps) {
    const [topic, setTopic] = useState("");
    const [isResearching, setIsResearching] = useState(false);
    const [progressNode, setProgressNode] = useState<ResearchNode | null>(null);
    const [report, setReport] = useState<ResearchReport | null>(null);
    const [nodesVisited, setNodesVisited] = useState(0);

    const handleStartResearch = async () => {
        if (!topic.trim() || !apiKey) return;
        setIsResearching(true);
        setReport(null);
        setNodesVisited(0);
        
        try {
            const result = await performDeepRecursiveResearch(
                topic, 
                apiKey, 
                undefined, // Serper key fallback handled inside or passed if available globally
                2, // Max Depth
                3, // Breadth
                (node) => {
                    setProgressNode({ ...node }); // Force re-render shallow copy
                    setNodesVisited(prev => prev + 1);
                }
            );
            setReport(result);
        } catch (e) {
            console.error("Deep Research Failed", e);
        } finally {
            setIsResearching(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-xl">
             <div className="relative w-full max-w-5xl h-[85vh] bg-[#0c0c0c] border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
                
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/5">
                    <div className="flex items-center gap-3">
                         <div className="p-2 bg-indigo-500/10 rounded-lg">
                             <Network className="w-5 h-5 text-indigo-400" />
                         </div>
                         <div>
                             <h2 className="text-lg font-bold text-white">Deep Research Agents</h2>
                             <p className="text-xs text-neutral-500 font-mono">RECURSIVE INVESTIGATION ENGINE v1.0</p>
                         </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-neutral-500 hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-1 flex overflow-hidden">
                    
                    {/* LEFT PANEL: Setup & Visualization */}
                    <div className="w-1/3 border-r border-white/5 p-6 flex flex-col bg-[#080808]">
                        
                        <div className="space-y-4 mb-8">
                            <label className="text-xs font-bold text-neutral-500 uppercase">Research Topic</label>
                            <div className="relative group">
                                <input 
                                    type="text" 
                                    value={topic}
                                    onChange={(e) => setTopic(e.target.value)}
                                    placeholder="e.g. 'Future of Agentic AI Pricing Models'..."
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pl-10 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-all placeholder-neutral-600"
                                    onKeyDown={(e) => e.key === 'Enter' && handleStartResearch()}
                                />
                                <Search className="absolute left-3 top-3.5 w-4 h-4 text-neutral-600 group-hover:text-neutral-400 transition-colors" />
                            </div>
                            
                            <button 
                                onClick={handleStartResearch}
                                disabled={isResearching || !topic}
                                className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                                    isResearching 
                                    ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed' 
                                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 hover:scale-[1.02]'
                                }`}
                            >
                                {isResearching ? (
                                    <><Loader2 className="w-4 h-4 animate-spin" /> RESEARCHING...</>
                                ) : (
                                    <><Play className="w-4 h-4 ml-0.5" /> START DEEP DIVE</>
                                )}
                            </button>
                        </div>

                        {/* TREE VISUALIZATION */}
                        <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                             <div className="flex items-center justify-between mb-4">
                                <span className="text-xs font-bold text-neutral-500 uppercase">Thought Process</span>
                                <span className="text-xs font-mono text-indigo-400">{nodesVisited} NODES</span>
                             </div>
                             
                             {progressNode && (
                                 <motion.div 
                                    key={progressNode.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="space-y-3"
                                 >
                                    <NodeItem node={progressNode} active={isResearching} />
                                 </motion.div>
                             )}
                             
                             {!progressNode && !report && (
                                 <div className="text-center py-20 opacity-30">
                                     <Network className="w-12 h-12 mx-auto mb-4 text-neutral-600" />
                                     <p className="text-xs text-neutral-500">Visualization ready.</p>
                                 </div>
                             )}
                        </div>
                    </div>

                    {/* RIGHT PANEL: Report Output */}
                    <div className="flex-1 bg-[#0c0c0c] p-8 overflow-y-auto custom-scrollbar">
                        {report ? (
                            <motion.div 
                                initial={{ opacity: 0 }} 
                                animate={{ opacity: 1 }}
                                className="max-w-3xl mx-auto"
                            >
                                <div className="mb-8 p-6 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-white/5 rounded-2xl">
                                    <div className="flex items-center gap-3 mb-2">
                                        <Sparkles className="w-5 h-5 text-indigo-400" />
                                        <h1 className="text-xl font-bold text-white tracking-tight">{report.topic}</h1>
                                    </div>
                                    <div className="flex items-center gap-4 text-xs text-neutral-400 font-mono">
                                        <span>{report.sources.length} SOURCES</span>
                                        <span>•</span>
                                        <span>DEEP RESEARCH COMPLETE</span>
                                    </div>
                                </div>

                                <article className="prose prose-invert prose-sm md:prose-base max-w-none prose-headings:text-neutral-100 prose-p:text-neutral-300 prose-a:text-indigo-400 prose-strong:text-white">
                                    <ReactMarkdown>{report.markdown}</ReactMarkdown>
                                </article>

                                {report.sources.length > 0 && (
                                    <div className="mt-12 pt-8 border-t border-white/10">
                                        <h3 className="text-sm font-bold text-white uppercase mb-4">Sources Cited</h3>
                                        <ul className="space-y-2">
                                            {report.sources.map((s, i) => (
                                                <li key={i} className="text-xs text-neutral-500 truncate hover:text-neutral-300 transition-colors">
                                                    <a href={s} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                                                        <span className="opacity-50 text-mono">[{i+1}]</span> {s}
                                                    </a>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </motion.div>
                        ) : isResearching ? (
                            <div className="h-full flex flex-col items-center justify-center gap-6 opacity-80">
                                <ThinkingGraph />
                                <p className="text-sm text-neutral-400 font-mono animate-pulse uppercase tracking-widest">Synthesizing Intelligence...</p>
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center opacity-30">
                                <FileText className="w-16 h-16 mb-4 text-neutral-700" />
                                <p className="text-sm text-neutral-500">Report details will appear here.</p>
                            </div>
                        )}
                    </div>

                </div>
             </div>
        </div>
    );
}

function NodeItem({ node, active }: { node: ResearchNode, active: boolean }) {
    return (
        <div className="ml-2 pl-4 border-l border-white/10 relative">
            <div className={`absolute left-[-5px] top-0 w-2 h-2 rounded-full ${active && node.status === 'searching' ? 'bg-indigo-500 animate-pulse shadow-[0_0_10px_rgba(99,102,241,0.5)]' : 'bg-neutral-600'}`} />
            
            <p className="text-xs text-neutral-300 line-clamp-1">{node.query}</p>
            <p className="text-[10px] text-neutral-500 font-mono uppercase mt-0.5">{node.status}</p>

            {node.children && node.children.length > 0 && (
                <div className="mt-2 space-y-2">
                    {node.children.map(child => (
                        <NodeItem key={child.id} node={child} active={active} />
                    ))}
                </div>
            )}
        </div>
    );
}

function ThinkingGraph() {
    return (
        <div className="relative w-32 h-32">
             <div className="absolute inset-0 bg-indigo-500/20 blur-3xl rounded-full animate-pulse" />
             <div className="relative z-10 grid grid-cols-2 gap-2">
                  {[...Array(4)].map((_, i) => (
                      <motion.div 
                        key={i}
                        className="w-12 h-12 bg-white/5 border border-white/10 rounded-lg"
                        animate={{ 
                            scale: [1, 0.9, 1],
                            borderColor: ["rgba(255,255,255,0.1)", "rgba(99,102,241,0.5)", "rgba(255,255,255,0.1)"]
                        }}
                        transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
                      />
                  ))}
             </div>
        </div>
    );
}
