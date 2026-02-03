
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Search, Scissors, TrendingUp, Lightbulb, Zap, X, ChevronRight, Copy } from 'lucide-react';
import { CompetitorService, CompetitorAnalysis } from '../utils/competitor-service';

interface CompetitorBenchProps {
    isOpen: boolean;
    onClose: () => void;
    niche: string;
    apiKey?: string;
    onStealLogic: (template: string) => void;
}

export default function CompetitorBench({ isOpen, onClose, niche, apiKey, onStealLogic }: CompetitorBenchProps) {
    const [posts, setPosts] = useState<string[]>(['', '', '']);
    const [analysis, setAnalysis] = useState<CompetitorAnalysis | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const handlePostChange = (index: number, val: string) => {
        const newPosts = [...posts];
        newPosts[index] = val;
        setPosts(newPosts);
    };

    const addPostEntry = () => setPosts([...posts, '']);

    const runAnalysis = async () => {
        if (!apiKey) return;
        setIsAnalyzing(true);
        const service = new CompetitorService(apiKey);
        const filteredPosts = posts.filter(p => p.trim().length > 0);
        const result = await service.analyzeBrutally(filteredPosts, niche);
        setAnalysis(result);
        setIsAnalyzing(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-[#0A0A0A] border border-white/10 rounded-3xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden shadow-2xl"
            >
                {/* Header */}
                <div className="p-6 border-b border-white/10 flex justify-between items-center bg-neutral-900/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-orange-500/20">
                            <Target className="w-6 h-6 text-orange-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Competitor Benchbreaker</h2>
                            <p className="text-[10px] text-neutral-400 uppercase tracking-widest font-mono">Reverse-Engineering Success in {niche}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-hidden flex">
                    {/* Input Side (Left) */}
                    <div className="w-1/3 border-r border-white/10 p-6 overflow-y-auto bg-neutral-900/10">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-bold text-white">Competitor Posts</h3>
                            <button onClick={addPostEntry} className="text-[10px] text-indigo-400 hover:text-indigo-300 font-bold uppercase transition-colors">
                                + Add URL/Post
                            </button>
                        </div>
                        <div className="space-y-4">
                            {posts.map((post, idx) => (
                                <div key={idx} className="relative group">
                                    <textarea
                                        value={post}
                                        onChange={(e) => handlePostChange(idx, e.target.value)}
                                        placeholder={`Paste Post #${idx + 1} content...`}
                                        className="w-full h-32 bg-black/40 border border-white/5 rounded-xl p-3 text-xs text-neutral-300 focus:outline-none focus:border-indigo-500/50 transition-all resize-none group-hover:border-white/10"
                                    />
                                    {posts.length > 3 && (
                                        <button 
                                            onClick={() => setPosts(posts.filter((_, i) => i !== idx))}
                                            className="absolute -top-2 -right-2 p-1 bg-red-500/10 border border-red-500/20 rounded-full text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                        <button 
                            onClick={runAnalysis}
                            disabled={isAnalyzing || posts.every(p => !p.trim())}
                            className="w-full mt-6 py-3 bg-white text-black font-black text-xs rounded-xl hover:scale-[1.02] transition-all disabled:opacity-50 disabled:scale-100 shadow-xl shadow-white/5 uppercase tracking-tighter"
                        >
                            {isAnalyzing ? 'Extracting Intelligence...' : 'Break the Patterns'}
                        </button>
                    </div>

                    {/* Results Side (Right) */}
                    <div className="flex-1 bg-black overflow-y-auto p-8 custom-scrollbar">
                        <AnimatePresence mode="wait">
                            {isAnalyzing ? (
                                <motion.div 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="h-full flex flex-col items-center justify-center space-y-6"
                                >
                                    <div className="relative">
                                        <div className="w-16 h-16 rounded-full border-2 border-indigo-500/20 border-t-indigo-500 animate-spin" />
                                        <Search className="absolute inset-0 m-auto w-6 h-6 text-indigo-400 animate-pulse" />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-white font-bold">Scanning Rival DNA</p>
                                        <p className="text-[10px] text-neutral-500 uppercase tracking-widest mt-2 animate-pulse">Framework Analysis in Progress</p>
                                    </div>
                                </motion.div>
                            ) : analysis ? (
                                <motion.div 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="space-y-8 pb-12"
                                >
                                    {/* Anatomy Section */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-neutral-900/50 border border-white/5 rounded-2xl p-5">
                                            <div className="flex items-center gap-2 mb-4">
                                                <Scissors className="w-4 h-4 text-emerald-400" />
                                                <h4 className="text-xs font-black uppercase text-neutral-400 tracking-widest">Hook Frameworks</h4>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {analysis.hookFrameworks.map((hook, i) => (
                                                    <span key={i} className="px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-md text-[10px] text-emerald-300 font-bold">
                                                        {hook}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="bg-neutral-900/50 border border-white/5 rounded-2xl p-5">
                                            <div className="flex items-center gap-2 mb-4">
                                                <TrendingUp className="w-4 h-4 text-purple-400" />
                                                <h4 className="text-xs font-black uppercase text-neutral-400 tracking-widest">Dominant Tone</h4>
                                            </div>
                                            <p className="text-lg font-bold text-white capitalize">{analysis.dominantTone}</p>
                                        </div>
                                    </div>

                                    {/* Content Gaps Section */}
                                    <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-2xl p-6">
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="p-2 bg-indigo-500/20 rounded-lg">
                                                <Lightbulb className="w-5 h-5 text-indigo-400" />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-bold text-white">The "Blue Ocean" Opportunities</h4>
                                                <p className="text-[10px] text-neutral-500 uppercase">High-demand areas your rivals are ignoring</p>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 gap-3">
                                            {analysis.contentGaps.map((gap, i) => (
                                                <div key={i} className="flex items-center gap-4 bg-black/40 p-4 rounded-xl border border-white/5 group hover:border-indigo-500/30 transition-all">
                                                    <div className="w-6 h-6 rounded-full bg-indigo-500/10 flex items-center justify-center text-[10px] font-black text-indigo-400">
                                                        {i + 1}
                                                    </div>
                                                    <p className="text-sm text-neutral-200 font-medium flex-1">{gap}</p>
                                                    <ChevronRight className="w-4 h-4 text-neutral-700 group-hover:text-indigo-400" />
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Structural Logic Section */}
                                    <div>
                                        <div className="flex items-center gap-2 mb-6">
                                            <Zap className="w-4 h-4 text-yellow-400" />
                                            <h4 className="text-xs font-black uppercase text-neutral-400 tracking-widest">Reverse-Engineered Structures</h4>
                                        </div>
                                        <div className="space-y-4">
                                            {analysis.structuralTemplates.map((template, i) => (
                                                <div key={i} className="bg-neutral-900/30 border border-white/5 rounded-xl p-5 group flex items-start gap-4">
                                                    <div className="flex-1">
                                                        <pre className="text-xs text-neutral-400 font-mono whitespace-pre-wrap leading-relaxed">
                                                            {template}
                                                        </pre>
                                                    </div>
                                                    <button 
                                                        onClick={() => onStealLogic(template)}
                                                        className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-[10px] font-bold text-white flex items-center gap-2 transition-all opacity-0 group-hover:opacity-100 uppercase"
                                                    >
                                                        <Copy className="w-3 h-3" /> Steal Logic
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center opacity-30">
                                    <Scissors className="w-16 h-16 text-neutral-600 mb-4" />
                                    <p className="text-neutral-500 max-w-xs text-center text-sm font-medium">
                                        Paste some competitor posts on the left to begin reverse-engineering their content matrix.
                                    </p>
                                </div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
