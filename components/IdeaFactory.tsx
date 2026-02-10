"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Link, Layers, ArrowRight, CheckCircle, Zap, RefreshCw } from "lucide-react";

interface IdeaFactoryProps {
    onBatchGenerate?: (ideas: string[], formats: string[]) => void;
}

const FORMATS = [
    { id: 'linkedin', label: 'LinkedIn Post', icon: FileText },
    { id: 'twitter', label: 'X Thread', icon: Layers },
    { id: 'substack', label: 'Substack Mini', icon: FileText },
    { id: 'carousel', label: 'Visual Carousel', icon: Layers }
];

export default function IdeaFactory({ onBatchGenerate }: IdeaFactoryProps) {
    const [rawIdeas, setRawIdeas] = useState("");
    const [selectedFormats, setSelectedFormats] = useState<string[]>(['linkedin']);
    const [isTransmuting, setIsTransmuting] = useState(false);

    const handleToggleFormat = (id: string) => {
        setSelectedFormats(prev => 
            prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
        );
    };

    const handleTransmute = async () => {
        const ideas = rawIdeas.split("\n").filter(line => line.trim().length > 10);
        if (ideas.length === 0) return;

        setIsTransmuting(true);
        try {
            await onBatchGenerate?.(ideas, selectedFormats);
        } finally {
            setIsTransmuting(false);
        }
    };

    return (
        <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-8 overflow-hidden">
            <div className="flex items-center gap-4 mb-8">
                <div className="p-3 rounded-2xl bg-brand-500/10 text-brand-400">
                    <Layers className="w-6 h-6" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-white">Idea Factory</h2>
                    <p className="text-white/40 text-sm">Batch Ingestion & Multi-Format Repurposing</p>
                </div>
            </div>

            <div className="space-y-6">
                <div>
                    <label className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-3 block">
                        Raw Input (One Idea per Line)
                    </label>
                    <textarea 
                        value={rawIdeas}
                        onChange={(e) => setRawIdeas(e.target.value)}
                        placeholder="Paste your Notion notes, raw thoughts, or article bullets here..."
                        className="w-full h-48 bg-white/5 border border-white/10 rounded-2xl p-5 text-white/80 focus:ring-1 focus:ring-brand-500/50 outline-none resize-none font-light leading-relaxed transition-all"
                    />
                </div>

                <div>
                    <label className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-3 block">
                        Target Formats
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {FORMATS.map(f => (
                            <button
                                key={f.id}
                                onClick={() => handleToggleFormat(f.id)}
                                className={`flex items-center gap-2 p-3 rounded-xl border transition-all ${
                                    selectedFormats.includes(f.id) 
                                        ? "bg-brand-500/10 border-brand-500/40 text-brand-300 shadow-[0_0_10px_rgba(124,58,237,0.1)]" 
                                        : "bg-white/5 border-white/10 text-white/40 hover:bg-white/10"
                                }`}
                            >
                                <f.icon className="w-4 h-4" />
                                <span className="text-xs font-medium">{f.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="pt-4">
                    <button 
                        onClick={handleTransmute}
                        disabled={isTransmuting || !rawIdeas.trim()}
                        className="w-full py-4 bg-brand-600 hover:bg-brand-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-2xl font-bold flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-lg shadow-brand-500/20"
                    >
                        {isTransmuting ? (
                            <>
                                <RefreshCw className="w-5 h-5 animate-spin" />
                                <span>TRANSMUTING BATCH...</span>
                            </>
                        ) : (
                            <>
                                <span>TRANSMUTE ALL</span>
                                <ArrowRight className="w-5 h-5" />
                            </>
                        )}
                    </button>
                </div>
                
                <div className="flex items-center gap-2 justify-center opacity-40">
                    <Zap className="w-3 h-3 text-amber-500" />
                    <span className="text-[10px] uppercase tracking-widest text-white/60">Powered by Gemini 1.5 Pro</span>
                </div>
            </div>
        </div>
    );
}
