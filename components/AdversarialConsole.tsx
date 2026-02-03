"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, ShieldAlert, ShieldCheck, Zap, X, AlertTriangle, ArrowRight, Loader2, Target, Sword } from "lucide-react";
import { simulateAdversaries, auditAntiFragility, Rebuttal, AntiFragilityReport } from "../utils/adversarial-service";

interface AdversarialConsoleProps {
    isOpen: boolean;
    onClose: () => void;
    content: string;
    apiKey: string;
}

export default function AdversarialConsole({ isOpen, onClose, content, apiKey }: AdversarialConsoleProps) {
    const [isSimulating, setIsSimulating] = useState(false);
    const [report, setReport] = useState<AntiFragilityReport | null>(null);
    const [activeRebuttal, setActiveRebuttal] = useState<number | null>(null);

    const handleStressTest = async () => {
        setIsSimulating(true);
        try {
            const rebuttals = await simulateAdversaries(content, apiKey);
            const audit = await auditAntiFragility(content, rebuttals, apiKey);
            setReport(audit);
        } catch (e) {
            console.error("Stress test failed", e);
        } finally {
            setIsSimulating(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[110] bg-black/95 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="bg-[#050505] border border-red-500/20 rounded-3xl w-full max-w-5xl h-[80vh] overflow-hidden shadow-[0_0_50px_rgba(239,68,68,0.1)] flex flex-col"
            >
                {/* Tactical Header */}
                <div className="p-6 border-b border-white/5 bg-gradient-to-r from-red-950/20 to-transparent flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-red-500/10 rounded-2xl border border-red-500/30">
                            <Sword className="w-6 h-6 text-red-500" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-white tracking-tighter uppercase italic">War Room: Adversarial Simulation</h3>
                            <p className="text-[10px] text-red-500/70 font-mono tracking-widest uppercase">Predicting Competitor Rebuttals & Strategic Vulnerabilities</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 text-neutral-500 hover:text-white transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Main Battleground */}
                <div className="flex-1 overflow-hidden flex">
                    {/* Left: Content & Fixes */}
                    <div className="w-1/2 border-r border-white/5 flex flex-col">
                        <div className="p-6 flex-1 overflow-y-auto custom-scrollbar space-y-6">
                            <div>
                                <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-3 block">Deployment Content</label>
                                <div className="p-4 bg-white/5 rounded-xl border border-white/5 text-sm text-neutral-300 leading-relaxed italic">
                                    "{content.substring(0, 500)}{content.length > 500 ? '...' : ''}"
                                </div>
                            </div>

                            {!report && !isSimulating && (
                                <div className="h-64 flex flex-col items-center justify-center text-center gap-4">
                                    <Target className="w-12 h-12 text-neutral-800" />
                                    <p className="text-neutral-500 text-xs">Ready to stress-test this strategy against industry veterans?</p>
                                    <button 
                                        onClick={handleStressTest}
                                        className="px-8 py-3 bg-red-600 hover:bg-red-500 text-white font-black rounded-xl text-xs uppercase tracking-widest transition-all shadow-xl shadow-red-900/20"
                                    >
                                        Initiate Simulation
                                    </button>
                                </div>
                            )}

                            {isSimulating && (
                                <div className="h-64 flex flex-col items-center justify-center gap-4">
                                    <Loader2 className="w-10 h-10 text-red-500 animate-spin" />
                                    <p className="text-xs text-red-500 font-mono animate-pulse">DEPLOYING OPPONENT MODELERS...</p>
                                </div>
                            )}

                            {report && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="space-y-6"
                                >
                                    <div>
                                        <label className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-3 block">Anti-Fragility Refinements</label>
                                        <div className="space-y-3">
                                            {report.suggestedFixes.map((fix, i) => (
                                                <div key={i} className="flex items-start gap-3 p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-xl text-xs text-emerald-200">
                                                    <ShieldCheck className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                                                    <span>{fix}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    </div>

                    {/* Right: Opponents & Rebuttals */}
                    <div className="w-1/2 bg-black/40 flex flex-col">
                        <div className="p-6 flex-1 overflow-y-auto custom-scrollbar space-y-4">
                            <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-3 block">Simulated Opponents</label>
                            
                            {report?.rebuttals.map((rebuttal, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    onClick={() => setActiveRebuttal(i)}
                                    className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                                        activeRebuttal === i 
                                        ? 'bg-red-500/10 border-red-500/40 ring-1 ring-red-500/20' 
                                        : 'bg-white/5 border-white/5 hover:border-white/20'
                                    }`}
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-neutral-700 to-neutral-900 border border-white/10 flex items-center justify-center">
                                                <Target className="w-4 h-4 text-white" />
                                            </div>
                                            <div>
                                                <h4 className="text-white font-bold text-xs uppercase tracking-tight">{rebuttal.personaName}</h4>
                                                <p className="text-[10px] text-neutral-500">{rebuttal.description}</p>
                                            </div>
                                        </div>
                                        <div className={`text-xs font-black ${rebuttal.vulnerabilityScore > 70 ? 'text-red-500' : 'text-yellow-600'}`}>
                                            {rebuttal.vulnerabilityScore}% RISK
                                        </div>
                                    </div>
                                    
                                    <AnimatePresence>
                                        {activeRebuttal === i && (
                                            <motion.div 
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                className="pt-4 border-t border-white/5 space-y-3"
                                            >
                                                <div className="text-xs text-red-400 italic font-medium leading-relaxed">
                                                    "{rebuttal.argument}"
                                                </div>
                                                <div className="flex items-center gap-2 text-[10px] text-neutral-500 bg-black/50 p-2 rounded-lg">
                                                    <AlertTriangle className="w-3 h-3 text-red-500" />
                                                    <span className="uppercase font-bold tracking-tighter">Weakness:</span>
                                                    <span className="text-neutral-300">{rebuttal.weaknessIdentified}</span>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer Scoreboard */}
                <div className="p-6 border-t border-white/5 bg-black/60 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <div>
                            <div className="text-[10px] text-neutral-500 uppercase font-black mb-1">Resilience Score</div>
                            <div className="flex items-center gap-2">
                                <div className="w-32 h-2 bg-neutral-800 rounded-full overflow-hidden">
                                    <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${report?.resilienceScore || 0}%` }}
                                        className={`h-full ${
                                            (report?.resilienceScore || 0) > 80 ? 'bg-emerald-500' : (report?.resilienceScore || 0) > 50 ? 'bg-yellow-500' : 'bg-red-500'
                                        }`}
                                    />
                                </div>
                                <span className="text-lg font-black text-white">{report?.resilienceScore || 0}%</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={onClose}
                            className="px-6 py-2 text-xs font-bold text-neutral-500 hover:text-white transition-colors"
                        >
                            Close Chamber
                        </button>
                        {report && (
                            <button className="px-6 py-2 bg-white text-black font-black rounded-lg text-xs uppercase tracking-tighter hover:bg-neutral-200 transition-colors">
                                Apply All Refinements
                            </button>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
