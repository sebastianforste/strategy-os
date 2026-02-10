"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Upload, CheckCircle, RefreshCcw, ShieldCheck, Sparkles, ChevronRight, Play, AlertCircle } from "lucide-react";

interface TrainingSet {
    id: string;
    name: string;
    status: 'Ready' | 'Training' | 'Queued';
    records: number;
    accuracy: number;
}

export default function AgentTrainer() {
    const [isUploading, setIsUploading] = useState(false);
    const [trainingStep, setTrainingStep] = useState(1);
    const [trainingSets] = useState<TrainingSet[]>([
        { id: 't1', name: 'Sebastian - LinkedIn Style', status: 'Ready', records: 124, accuracy: 98.2 },
        { id: 't2', name: 'Ghost Writer V3 - B2B', status: 'Training', records: 540, accuracy: 89.5 },
    ]);

    const handleUpload = () => {
        setIsUploading(true);
        setTimeout(() => {
            setIsUploading(false);
            setTrainingStep(2);
        }, 2000);
    };

    return (
        <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-8 min-h-[600px]">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12">
                <div className="flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-brand-600 text-white shadow-xl shadow-brand-500/20">
                        <Brain className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white uppercase tracking-tight">Agent Personalization Lab</h2>
                        <p className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-mono mt-1">Deep Learning & Fine-Tuning</p>
                    </div>
                </div>

                <div className="flex items-center gap-2 p-1 bg-white/5 rounded-xl border border-white/5">
                    <span className="text-[10px] font-bold text-white/40 px-3 uppercase">Compute Power:</span>
                    <span className="text-[10px] font-bold text-brand-400 bg-brand-500/10 px-3 py-1 rounded-lg">8x H100 Equivalent</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* TRAINING PIPELINE */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Step Indicator */}
                    <div className="flex items-center gap-4">
                        {[1, 2, 3].map(step => (
                            <div key={step} className="flex items-center gap-2">
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                                    trainingStep >= step ? 'bg-brand-500 text-white' : 'bg-white/5 text-white/20'
                                }`}>
                                    {step}
                                </div>
                                <div className={`h-0.5 w-12 rounded-full ${trainingStep > step ? 'bg-brand-500' : 'bg-white/5'}`} />
                            </div>
                        ))}
                    </div>

                    {/* Active Upload / Training Area */}
                    <AnimatePresence mode="wait">
                        {trainingStep === 1 ? (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="border-2 border-dashed border-white/10 rounded-3xl p-12 flex flex-col items-center justify-center text-center bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/20 transition-all group"
                            >
                                <div className="p-5 bg-white/5 rounded-full mb-6 group-hover:scale-110 transition-transform duration-500">
                                    <Upload className="w-8 h-8 text-white/40" />
                                </div>
                                <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-2">Ingest Training Data</h3>
                                <p className="text-xs text-white/40 max-w-xs leading-relaxed mb-8">
                                    Upload CSV, JSON, or PDF text of target brand voice. Ensure at least 50 samples for optimal cloning.
                                </p>
                                <button 
                                    onClick={handleUpload}
                                    disabled={isUploading}
                                    className="px-8 py-3 bg-white text-black rounded-xl text-[10px] font-black tracking-[0.2em] shadow-xl hover:scale-105 transition-all uppercase flex items-center gap-2"
                                >
                                    {isUploading ? <RefreshCcw className="w-3.5 h-3.5 animate-spin" /> : "Start Ingestion Sequence"}
                                </button>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="bg-white/5 border border-white/10 rounded-3xl p-8"
                            >
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
                                        <h3 className="text-sm font-bold text-white uppercase tracking-widest">Training in Progress...</h3>
                                    </div>
                                    <span className="text-[10px] font-mono text-brand-400">EPOCH 4/10</span>
                                </div>

                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-[10px] font-bold text-white/40 uppercase">
                                            <span>Loss Function Clipping</span>
                                            <span className="text-white">0.0342</span>
                                        </div>
                                        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                                            <motion.div 
                                                className="h-full bg-brand-500"
                                                initial={{ width: '0%' }}
                                                animate={{ width: '65%' }}
                                                transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse' }}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 bg-black/40 border border-white/5 rounded-2xl">
                                            <p className="text-[9px] text-white/30 uppercase tracking-widest mb-1">Tone Precision</p>
                                            <p className="text-lg font-bold text-brand-400">92.4%</p>
                                        </div>
                                        <div className="p-4 bg-black/40 border border-white/5 rounded-2xl">
                                            <p className="text-[9px] text-white/30 uppercase tracking-widest mb-1">Context Window</p>
                                            <p className="text-lg font-bold text-blue-400">128k</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8 flex justify-end">
                                    <button 
                                        onClick={() => setTrainingStep(1)}
                                        className="text-[10px] font-bold text-white/20 hover:text-white uppercase transition-all"
                                    >
                                        Cancel Training
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* SIDEBAR: ACTIVE MODELS */}
                <div className="space-y-6">
                    <h4 className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-4">Deployed Models</h4>
                    {trainingSets.map(set => (
                        <div key={set.id} className="p-5 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/[0.08] transition-all group">
                            <div className="flex items-center justify-between mb-4">
                                <span className={`text-[8px] font-black px-2 py-0.5 rounded-full border uppercase ${
                                    set.status === 'Ready' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-brand-500/10 text-brand-400 border-brand-500/20'
                                }`}>
                                    {set.status}
                                </span>
                                <div className="flex items-center gap-1">
                                    <StarRating accuracy={set.accuracy} />
                                </div>
                            </div>
                            <h5 className="text-xs font-bold text-white mb-3 uppercase tracking-tight">{set.name}</h5>
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-mono text-white/20">{set.records} Records</span>
                                <button className="p-2 bg-white/5 rounded-lg text-white/20 hover:text-white opacity-0 group-hover:opacity-100 transition-all">
                                    <Play className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>
                    ))}

                    <div className="p-6 bg-brand-500/5 border border-brand-500/20 rounded-3xl mt-8">
                        <div className="flex items-center gap-3 mb-4">
                            <ShieldCheck className="w-5 h-5 text-brand-400" />
                            <h5 className="text-[10px] font-bold text-white uppercase tracking-widest">Ethics Guardrail</h5>
                        </div>
                        <p className="text-[10px] text-white/40 leading-relaxed italic">
                            Agent personalization is subject to human-in-the-loop validation. Deepfake prevention active.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StarRating({ accuracy }: { accuracy: number }) {
    return (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className={`w-1 h-1 rounded-full ${accuracy / 20 >= i ? 'bg-amber-400' : 'bg-white/10'}`} />
            ))}
        </div>
    );
}
