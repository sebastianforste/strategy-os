"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dna, X, ArrowRight, Zap, History, Sparkles, CheckCircle2, ShieldAlert, Loader2, TrendingUp } from "lucide-react";
import { EvolutionReport } from "../utils/evolution-service";

interface EvolutionModalProps {
    isOpen: boolean;
    onClose: () => void;
    report: EvolutionReport | null;
    onApply: (newPrompt: string) => void;
}

export default function EvolutionModal({ isOpen, onClose, report, onApply }: EvolutionModalProps) {
    if (!isOpen || !report) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-xl flex items-center justify-center p-4">
            <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="bg-neutral-900 border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col"
            >
                {/* Header */}
                <div className="p-6 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-purple-900/20 to-indigo-900/20">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-[0_0_20px_rgba(99,102,241,0.3)]">
                            <Dna className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="font-bold text-white tracking-tight">Project Darwin: Phase Completed</h3>
                            <p className="text-[10px] text-indigo-400 font-mono uppercase tracking-[0.2em]">Persona Mutated & Optimized</p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-8">
                    {/* Analysis Section */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-emerald-400" />
                            <h4 className="text-xs font-black text-neutral-400 uppercase tracking-widest">Stylistic Audit</h4>
                        </div>
                        <p className="text-sm text-neutral-300 leading-relaxed bg-white/5 p-4 rounded-xl border border-white/5 italic">
                            "{report.analysis}"
                        </p>
                    </div>

                    {/* Improvements List */}
                    <div className="grid grid-cols-2 gap-3">
                        {report.improvements.map((imp, i) => (
                            <div key={i} className="flex items-center gap-2 p-3 bg-indigo-500/5 border border-indigo-500/10 rounded-lg">
                                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                                <span className="text-[11px] text-neutral-400 font-medium truncate">{imp}</span>
                            </div>
                        ))}
                    </div>

                    {/* Diff View */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h4 className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em]">Prompt DNA Transformation</h4>
                            <span className="text-[9px] px-2 py-0.5 bg-indigo-500/10 text-indigo-400 rounded-full font-bold uppercase">v1.2 → v2.0</span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[9px] text-red-400/50 uppercase font-black tracking-widest flex items-center gap-1">
                                    <ShieldAlert className="w-3 h-3" /> Legacy DNA
                                </label>
                                <div className="p-4 bg-red-500/5 border border-red-500/10 rounded-xl h-48 overflow-y-auto custom-scrollbar text-[11px] text-neutral-500 font-mono leading-relaxed opacity-60">
                                    {report.originalPrompt}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[9px] text-emerald-400 uppercase font-black tracking-widest flex items-center gap-1">
                                    <Sparkles className="w-3 h-3" /> Mutated DNA
                                </label>
                                <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl h-48 overflow-y-auto custom-scrollbar text-[11px] text-emerald-100 font-mono leading-relaxed shadow-[inset_0_0_20px_rgba(16,185,129,0.05)]">
                                    {report.mutatedPrompt}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-white/5 bg-black/20 flex items-center justify-between gap-4">
                    <button 
                        onClick={onClose}
                        className="px-6 py-2.5 text-neutral-500 hover:text-white text-xs font-bold uppercase transition-colors"
                    >
                        Discard Mutation
                    </button>
                    <button 
                        onClick={() => onApply(report.mutatedPrompt)}
                        className="px-8 py-2.5 bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-black uppercase rounded-xl transition-all shadow-lg shadow-indigo-500/20 flex items-center gap-2 group"
                    >
                        Apply Evolution
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
