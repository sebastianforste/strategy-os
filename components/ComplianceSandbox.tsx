"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, AlertTriangle, CheckCircle, Search, Filter, Activity, Zap, EyeOff, Lock, Unlock, Gavel, Cpu, ChevronRight, Hash, Terminal } from "lucide-react";

interface ComplianceCheck {
    id: string;
    label: string;
    status: 'Safe' | 'Warning' | 'High Risk';
    description: string;
    details: string;
}

const CHECKS: ComplianceCheck[] = [
    { id: 'c1', label: 'Semantic Shadowban Risk', status: 'Warning', description: 'Detected highly polarized terminology in the hook section.', details: 'The word `aggressive` combined with `dominance` triggers higher scrutiny markers.' },
    { id: 'c2', label: 'External Link Sensitivity', status: 'Safe', description: 'No low-quality external links detected.', details: 'All domains are high-authority and validated.' },
    { id: 'c3', label: 'Engagement Bait Pattern', status: 'High Risk', description: 'Detected repetitive "Tag a friend" structural loops.', details: 'LinkedIn algorithms now penalize explicit manual engagement requests.' },
    { id: 'c4', label: 'Topic Toxicity Scan', status: 'Safe', description: 'Content is neutral and strategic.', details: 'Matches institutional-grade safety parameters.' },
];

export default function ComplianceSandbox() {
    const [checks] = useState<ComplianceCheck[]>(CHECKS);
    const [isScanning, setIsScanning] = useState(false);

    const handleScan = () => {
        setIsScanning(true);
        setTimeout(() => setIsScanning(false), 2500);
    };

    return (
        <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-8 min-h-[700px]">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12">
                <div className="flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
                        <Gavel className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white uppercase tracking-tight">Compliance Sandbox</h2>
                        <p className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-mono mt-1">Algorithmic Safety & Content Governance</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button 
                        onClick={handleScan}
                        disabled={isScanning}
                        className="px-6 py-2.5 bg-rose-500 text-white rounded-xl text-[10px] font-black tracking-widest hover:scale-105 transition-all shadow-lg shadow-rose-500/20 uppercase flex items-center gap-2"
                    >
                        {isScanning ? <RefreshCcw className="w-3.5 h-3.5 animate-spin" /> : <Shield className="w-3.5 h-3.5" />}
                        <span>{isScanning ? "Scanning..." : "Audit Content"}</span>
                    </button>
                    <div className="p-2.5 bg-white/5 border border-white/10 rounded-xl text-white/40 hover:text-white transition-all">
                        <Terminal className="w-4 h-4" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* COMPLIANCE LOGS */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Safety Audit Results</h3>
                        <div className="flex items-center gap-2">
                            <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest px-2 py-1 bg-white/5 rounded">Version 2.4.1</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        {checks.map((check) => (
                            <motion.div
                                key={check.id}
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="p-8 bg-white/5 border border-white/5 rounded-[32px] hover:border-white/10 transition-all group cursor-pointer"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-3 rounded-2xl ${
                                            check.status === 'Safe' ? 'bg-emerald-500/10 text-emerald-400' : 
                                            check.status === 'Warning' ? 'bg-amber-500/10 text-amber-400' : 'bg-rose-500/10 text-rose-400'
                                        }`}>
                                            {check.status === 'Safe' ? <CheckCircle className="w-5 h-5" /> : 
                                             check.status === 'Warning' ? <AlertTriangle className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-white uppercase tracking-tight mb-0.5">{check.label}</h4>
                                            <p className="text-[10px] text-white/40 uppercase font-black tracking-widest">{check.status}</p>
                                        </div>
                                    </div>
                                    <div className="text-[9px] font-mono text-white/10 uppercase group-hover:text-white/20 transition-colors tracking-tighter">ID: {check.id}</div>
                                </div>
                                <p className="text-xs text-white/60 leading-relaxed italic mb-4">"{check.description}"</p>
                                <div className="p-4 bg-black/40 border border-white/5 rounded-xl text-[10px] text-white/40 leading-relaxed font-mono">
                                    <span className="text-brand-400 mr-2">$</span> {check.details}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* ALGO VITALS */}
                <div className="space-y-6">
                    <h3 className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-4">Algorithm Intelligence</h3>
                    
                    <div className="p-8 bg-rose-500/5 border border-rose-500/10 rounded-3xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-700">
                            <Lock className="w-32 h-32 text-rose-400" />
                        </div>
                        
                        <div className="flex items-center gap-3 mb-8">
                            <Activity className="w-5 h-5 text-rose-400" />
                            <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Global Safety Score</h4>
                        </div>
                        
                        <div className="text-4xl font-black text-rose-400 tracking-tighter mb-2">74%</div>
                        <p className="text-[10px] text-white/40 uppercase font-black tracking-widest mb-8">Potential Reach Ceiling Detected</p>

                        <div className="space-y-3">
                            <button className="w-full py-3 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 rounded-xl text-[9px] font-black text-rose-400 uppercase tracking-widest transition-all">
                                Auto-Sanitize Content
                            </button>
                        </div>
                    </div>

                    <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl space-y-4">
                        <div className="flex items-center gap-3">
                            <Zap className="w-4 h-4 text-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                            <h4 className="text-[10px] font-bold text-white uppercase tracking-widest">Shadow-Prevention</h4>
                        </div>
                        <div className="space-y-4">
                            <AlgoStat label="Bot Signatures" value="0%" safe />
                            <AlgoStat label="Semantic Flags" value="12%" />
                            <AlgoStat label="Network Quality" value="98%" safe />
                        </div>
                    </div>

                    <div className="p-6 border border-white/5 rounded-2xl flex items-center justify-between cursor-pointer hover:bg-white/5 transition-all group">
                        <div className="flex items-center gap-3">
                            <Cpu className="w-4 h-4 text-white/20 group-hover:text-white" />
                            <span className="text-[10px] font-bold text-white uppercase tracking-tight">Model Update Logs</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-white/20" />
                    </div>
                </div>
            </div>
        </div>
    );
}

function AlgoStat({ label, value, safe }: { label: string, value: string, safe?: boolean }) {
    return (
        <div className="flex justify-between items-center text-[10px]">
            <span className="text-white/30 uppercase tracking-tight">{label}</span>
            <span className={`font-bold ${safe ? 'text-emerald-400' : 'text-rose-400'}`}>{value}</span>
        </div>
    );
}

function RefreshCcw(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
            <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
            <path d="M16 16h5v5" />
        </svg>
    );
}
