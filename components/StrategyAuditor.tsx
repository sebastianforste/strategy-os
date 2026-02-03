
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, ShieldCheck, AlertCircle, Zap, Skull, TrendingDown, RefreshCw, X } from 'lucide-react';
import { AuditorService, AuditReport, AdversarialReview } from '../utils/auditor-service';

interface StrategyAuditorProps {
    isOpen: boolean;
    onClose: () => void;
    content: string;
    apiKey?: string;
}

export default function StrategyAuditor({ isOpen, onClose, content, apiKey }: StrategyAuditorProps) {
    const [report, setReport] = useState<AuditReport | null>(null);
    const [isAuditing, setIsAuditing] = useState(false);

    useEffect(() => {
        if (isOpen && content && apiKey) {
            runAudit();
        }
    }, [isOpen]);

    const runAudit = async () => {
        setIsAuditing(true);
        const service = new AuditorService(apiKey!);
        const result = await service.auditContent(content);
        setReport(result);
        setIsAuditing(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-[#0A0A0A] border border-white/10 rounded-3xl w-full max-w-4xl h-[80vh] flex flex-col overflow-hidden shadow-2xl relative"
            >
                {/* Header */}
                <div className="p-6 border-b border-white/10 flex justify-between items-center bg-neutral-900/50">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${report && report.overallRisk > 50 ? 'bg-red-500/20' : 'bg-emerald-500/20'}`}>
                            <ShieldAlert className={`w-6 h-6 ${report && report.overallRisk > 50 ? 'text-red-400' : 'text-emerald-400'}`} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Strategy Auditor</h2>
                            <p className="text-xs text-neutral-400 uppercase tracking-widest">AI Red Team Simulation</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 bg-black">
                    {isAuditing ? (
                        <div className="h-full flex flex-col items-center justify-center space-y-4">
                            <div className="relative">
                                <RefreshCw className="w-12 h-12 text-indigo-500 animate-spin" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-4 h-4 bg-indigo-500 rounded-full blur-sm animate-pulse" />
                                </div>
                            </div>
                            <p className="text-indigo-400 font-mono text-sm animate-pulse">Running Adversarial Simulations...</p>
                        </div>
                    ) : report ? (
                        <div className="space-y-8">
                            {/* Summary Card */}
                            <div className={`p-6 rounded-2xl border ${report.overallRisk > 50 ? 'bg-red-500/5 border-red-500/20' : 'bg-emerald-500/5 border-emerald-500/20'}`}>
                                <div className="flex justify-between items-end mb-4">
                                    <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-400">Strategic Vulnerability</h3>
                                    <span className={`text-4xl font-black ${report.overallRisk > 70 ? 'text-red-500' : report.overallRisk > 40 ? 'text-amber-500' : 'text-emerald-500'}`}>
                                        {report.overallRisk}%
                                    </span>
                                </div>
                                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                    <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${report.overallRisk}%` }}
                                        className={`h-full ${report.overallRisk > 70 ? 'bg-red-500' : report.overallRisk > 40 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                                    />
                                </div>
                                <p className="mt-4 text-white font-medium leading-relaxed italic border-l-2 border-indigo-500 pl-4 bg-white/5 py-3 rounded-r-lg">
                                    "{report.summary}"
                                </p>
                            </div>

                            {/* Adversarial Feed */}
                            <div className="grid grid-cols-1 gap-6">
                                {report.reviews.map((review, idx) => (
                                    <motion.div
                                        key={review.persona}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        className="bg-neutral-900/50 border border-white/10 rounded-2xl p-6 flex gap-6"
                                    >
                                        <div className="flex flex-col items-center">
                                            <div className={`p-3 rounded-full mb-2 ${
                                                review.persona === 'skeptic' ? 'bg-blue-500/20 text-blue-400' :
                                                review.persona === 'competitor' ? 'bg-red-500/20 text-red-400' :
                                                'bg-amber-500/20 text-amber-400'
                                            }`}>
                                                {review.persona === 'skeptic' && <AlertCircle className="w-6 h-6" />}
                                                {review.persona === 'competitor' && <Skull className="w-6 h-6" />}
                                                {review.persona === 'bored' && <TrendingDown className="w-6 h-6" />}
                                            </div>
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">{review.persona}</span>
                                        </div>

                                        <div className="flex-1">
                                            <div className="flex justify-between items-center mb-2">
                                                <h4 className="text-white font-bold capitalize">{review.persona} Viewpoint</h4>
                                                <div className="flex gap-1">
                                                    {[...Array(10)].map((_, i) => (
                                                        <div key={i} className={`w-2 h-2 rounded-full ${i < review.score ? (review.score > 7 ? 'bg-red-500' : 'bg-amber-500') : 'bg-white/5'}`} />
                                                    ))}
                                                </div>
                                            </div>
                                            <p className="text-sm text-neutral-300 leading-relaxed mb-4">{review.feedback}</p>
                                            
                                            <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Zap className="w-3 h-3 text-indigo-400" />
                                                    <span className="text-[10px] font-bold uppercase text-indigo-400 tracking-wider">Remediation Suggestion</span>
                                                </div>
                                                <p className="text-xs text-indigo-200 leading-relaxed italic">
                                                    {review.suggestion}
                                                </p>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex items-center justify-center text-neutral-500 italic">
                            No audit data found.
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="p-6 border-t border-white/10 bg-neutral-900/50 flex justify-between items-center">
                    <p className="text-[10px] text-neutral-500 uppercase tracking-widest">
                        Total Audit Points: {report?.reviews.length || 0}
                    </p>
                    <div className="flex gap-4">
                        <button onClick={runAudit} className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-white transition-colors border border-white/10">
                            Rerun Simulation
                        </button>
                        <button onClick={onClose} className="px-6 py-2 bg-indigo-500 hover:bg-indigo-600 rounded-lg text-sm font-bold text-white shadow-lg shadow-indigo-500/20 transition-all">
                            I'll Fix It
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
