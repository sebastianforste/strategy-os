"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Video, Layers, Hash, ArrowRight, Loader2, Maximize2, X, Download } from "lucide-react";
import { synthesizerService, TransmutationResult } from "../utils/synthesizer-service";

interface RepurposingStudioProps {
    isOpen: boolean;
    onClose: () => void;
    initialContent?: string;
    apiKey?: string;
}

export default function RepurposingStudio({ isOpen, onClose, initialContent = "", apiKey = "" }: RepurposingStudioProps) {
    const [input, setInput] = useState(initialContent);
    const [result, setResult] = useState<TransmutationResult | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [activeTab, setActiveTab] = useState<'video' | 'carousel' | 'thread'>('video');

    const handleSynthesize = async () => {
        if (!input || isGenerating) return;
        setIsGenerating(true);
        try {
            const data = await synthesizerService.generateVariants(input, apiKey);
            setResult(data);
        } catch (e) {
            console.error("Synthesis failed", e);
        } finally {
            setIsGenerating(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[90] bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-[#0a0a0a] border border-white/10 rounded-2xl w-full max-w-6xl h-[85vh] flex flex-col shadow-2xl overflow-hidden"
            >
                {/* Header */}
                <div className="p-4 border-b border-white/10 flex items-center justify-between text-white">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-r from-pink-500 to-rose-500 rounded-lg">
                            <Layers className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="font-bold">Repurposing Studio</h3>
                            <p className="text-[10px] text-neutral-400 font-mono">TEXT → MULTI-FORMAT ENGINE</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <X className="w-5 h-5 text-neutral-500" />
                    </button>
                </div>

                <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                    {/* Input Panel */}
                    <div className="w-full md:w-1/3 border-r border-white/10 p-6 flex flex-col bg-black/20">
                        <h4 className="text-xs font-bold text-neutral-400 mb-4 uppercase tracking-wider">Source Material</h4>
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Paste your high-performing post here..."
                            className="flex-1 bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-neutral-300 resize-none focus:outline-none focus:border-pink-500/50 transition-colors mb-4"
                        />
                        <button
                            onClick={handleSynthesize}
                            disabled={!input || isGenerating}
                            className="w-full py-4 bg-pink-600 hover:bg-pink-500 text-white font-bold rounded-xl transition-all hover:scale-[1.02] flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:scale-100"
                        >
                            {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <ZapIcon />}
                            SYNTHESIZE ASSETS
                        </button>
                    </div>

                    {/* Output Panel */}
                    <div className="flex-1 flex flex-col bg-[#111]">
                        {!result ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-neutral-600">
                                <Layers className="w-16 h-16 opacity-20 mb-4" />
                                <p className="text-sm font-mono opacity-50">. . . AWAITING INPUT . . .</p>
                            </div>
                        ) : (
                            <>
                                {/* Tabs */}
                                <div className="flex items-center border-b border-white/10 px-6 pt-6 gap-6">
                                    <TabButton 
                                        active={activeTab === 'video'} 
                                        onClick={() => setActiveTab('video')} 
                                        icon={<Video className="w-4 h-4" />} 
                                        label="Video Script" 
                                    />
                                    <TabButton 
                                        active={activeTab === 'carousel'} 
                                        onClick={() => setActiveTab('carousel')} 
                                        icon={<Layers className="w-4 h-4" />} 
                                        label="Carousel" 
                                    />
                                    <TabButton 
                                        active={activeTab === 'thread'} 
                                        onClick={() => setActiveTab('thread')} 
                                        icon={<Hash className="w-4 h-4" />} 
                                        label="Thread" 
                                    />
                                </div>

                                {/* Content Display */}
                                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                                    <AnimatePresence mode="wait">
                                        {activeTab === 'video' && (
                                            <motion.div 
                                                key="video" 
                                                initial={{ opacity: 0, y: 10 }} 
                                                animate={{ opacity: 1, y: 0 }} 
                                                exit={{ opacity: 0, y: -10 }}
                                                className="max-w-2xl mx-auto space-y-6"
                                            >
                                                <div className="bg-white/5 rounded-xl border border-white/10 p-6">
                                                    <div className="flex justify-between items-start mb-4">
                                                        <h4 className="text-pink-400 font-bold text-sm uppercase">Vertical Script (60s)</h4>
                                                        <span className="text-xs font-mono text-neutral-500">{result.videoScript.durationSec}s est.</span>
                                                    </div>
                                                    
                                                    <div className="space-y-4">
                                                        <ScriptSection title="HOOK" content={result.videoScript.hook} visual={result.videoScript.visualCues[0]} />
                                                        
                                                        <div className="pl-4 border-l-2 border-neutral-700 space-y-2">
                                                            <p className="text-xs font-bold text-neutral-500 uppercase">Body</p>
                                                            {result.videoScript.body.map((line, i) => (
                                                                <p key={i} className="text-neutral-300 text-sm">{line}</p>
                                                            ))}
                                                        </div>

                                                        <ScriptSection title="CTA" content={result.videoScript.cta} visual={result.videoScript.visualCues[2]} />
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}

                                        {activeTab === 'carousel' && (
                                            <motion.div 
                                                key="carousel"
                                                initial={{ opacity: 0, y: 10 }} 
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }} 
                                                className="grid grid-cols-2 lg:grid-cols-3 gap-4"
                                            >
                                                {result.carousel.map((slide, i) => (
                                                    <div key={i} className="aspect-[4/5] bg-white text-black p-6 flex flex-col justify-between rounded-lg shadow-xl relative overflow-hidden group">
                                                        <div className="absolute top-2 right-2 text-[10px] font-bold opacity-30">#{slide.slideNumber}</div>
                                                        <div className="flex-1 flex flex-col justify-center">
                                                            <h5 className="font-black text-lg leading-tight mb-2">{slide.title}</h5>
                                                            <p className="text-xs font-medium opacity-80">{slide.content}</p>
                                                        </div>
                                                        <div className="h-1 bg-black w-full mt-4" />
                                                    </div>
                                                ))}
                                            </motion.div>
                                        )}

                                        {activeTab === 'thread' && (
                                            <motion.div 
                                                key="thread"
                                                initial={{ opacity: 0, y: 10 }} 
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }} 
                                                className="max-w-xl mx-auto space-y-4"
                                            >
                                                {result.thread.map((tweet, i) => (
                                                    <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4 hover:border-white/20 transition-colors">
                                                        <div className="flex gap-3">
                                                            <div className="w-10 h-10 rounded-full bg-neutral-700 flex-shrink-0" />
                                                            <div className="space-y-1">
                                                                <div className="flex items-center gap-2">
                                                                    <div className="h-4 w-24 bg-neutral-800 rounded animate-pulse" />
                                                                    <span className="text-xs text-neutral-500">@{i === 0 ? 'root' : 'reply'}</span>
                                                                </div>
                                                                <p className="text-sm text-neutral-200 leading-relaxed whitespace-pre-wrap">{tweet}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

function TabButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: any; label: string }) {
    return (
        <button
            onClick={onClick}
            className={`pb-4 px-2 flex items-center gap-2 text-sm font-medium transition-colors relative ${
                active ? 'text-white' : 'text-neutral-500 hover:text-white'
            }`}
        >
            {icon}
            {label}
            {active && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-pink-500" />}
        </button>
    );
}

function ScriptSection({ title, content, visual }: { title: string; content: string; visual?: string }) {
    return (
        <div className="bg-black/30 p-4 rounded-lg font-mono">
            <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] text-pink-500 font-bold bg-pink-500/10 px-2 py-1 rounded">{title}</span>
                {visual && <span className="text-[10px] text-neutral-500 border border-neutral-700 px-2 py-1 rounded">Visual: {visual}</span>}
            </div>
            <p className="text-sm text-white">{content}</p>
        </div>
    );
}

function ZapIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
        </svg>
    )
}
