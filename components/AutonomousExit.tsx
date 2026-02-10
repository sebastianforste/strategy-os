"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Power, Shield, ShieldAlert, Zap, RefreshCw, Layers, Users, Activity, ChevronRight, CheckCircle, Database, Search, Lock, AlertTriangle, Cpu, Globe, Infinity, Command } from "lucide-react";

export default function AutonomousExit() {
    const [isActive, setIsActive] = useState(false);
    const [isTriggering, setIsTriggering] = useState(false);

    const handleToggle = () => {
        if (!isActive) {
            setIsTriggering(true);
            setTimeout(() => {
                setIsTriggering(false);
                setIsActive(true);
            }, 3000);
        } else {
            setIsActive(false);
        }
    };

    return (
        <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-8 min-h-[700px]">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12">
                <div className="flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.1)]">
                        <Infinity className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white uppercase tracking-tight">Autonomous Exit</h2>
                        <p className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-mono mt-1">Full "Set & Forget" Mode & Safety Kill-Switch Protocol</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button 
                        onClick={handleToggle}
                        disabled={isTriggering}
                        className={`px-8 py-3 rounded-xl text-[10px] font-black tracking-widest transition-all uppercase flex items-center gap-2 ${
                            isActive ? 'bg-rose-500 text-white shadow-[0_0_30px_rgba(244,63,94,0.3)]' : 'bg-emerald-500 text-white shadow-[0_0_30px_rgba(16,185,129,0.3)]'
                        }`}
                    >
                        {isTriggering ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Power className="w-3.5 h-3.5" />}
                        <span>{isTriggering ? "Initiating..." : isActive ? "Abort Autonomous Exit" : "Activate Autonomous Exit"}</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* SYSTEM STATE */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Self-Sustaining Protocol</h3>
                        <div className="flex items-center gap-4 text-[10px] font-black text-white/40 uppercase tracking-widest">
                            <span className="flex items-center gap-1.5"><div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500 animate-pulse' : 'bg-white/10'}`} /> Status: {isActive ? 'FULLY AUTONOMOUS' : 'Manual Oversight'}</span>
                        </div>
                    </div>

                    <div className={`p-10 rounded-[40px] border transition-all duration-1000 relative overflow-hidden flex flex-col items-center justify-center text-center gap-6 min-h-[300px] ${
                        isActive ? 'bg-emerald-500/5 border-emerald-500/30' : 'bg-white/[0.01] border-white/5'
                    }`}>
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.05)_0%,transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity" />
                        
                        {isActive ? (
                            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="space-y-6 relative z-10">
                                <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto">
                                    <ShieldCheck className="w-10 h-10 text-emerald-500" />
                                </div>
                                <div>
                                    <h4 className="text-2xl font-black text-white tracking-tighter uppercase">Ghost in the Shell Active</h4>
                                    <p className="text-[10px] text-white/40 uppercase tracking-widest mt-2 max-w-sm mx-auto leading-relaxed">
                                        StrategyOS has achieved full operational autonomy. All content generation, distribution, and meta-optimization are now self-managed.
                                    </p>
                                </div>
                                <div className="flex items-center justify-center gap-8 pt-4">
                                    <StatMini label="Pulse" val="Stable" />
                                    <StatMini label="Drift" val="0.02%" />
                                    <StatMini label="ROI" val="Compounding" />
                                </div>
                            </motion.div>
                        ) : (
                            <div className="space-y-6 relative z-10 opacity-40">
                                <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto">
                                    <Lock className="w-10 h-10 text-white/10" />
                                </div>
                                <h4 className="text-sm font-bold text-white uppercase tracking-widest">Awaiting Exit Command</h4>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-8 bg-white/[0.01] border border-white/5 rounded-[40px] space-y-4">
                            <div className="flex items-center gap-3">
                                <ShieldAlert className="w-4 h-4 text-rose-500" />
                                <h3 className="text-[10px] font-black text-white uppercase tracking-widest">Hard Wired Kill-Switch</h3>
                            </div>
                            <p className="text-[10px] text-white/40 leading-relaxed uppercase font-black tracking-tighter">
                                In case of unexpected strategy drift or compliance violation, the physical exit key will terminate all API connections and purge active session memory instantly.
                            </p>
                            <button className="text-[9px] font-bold text-rose-500 uppercase tracking-widest hover:underline transition-all">Test Kill-Switch In Sandbox</button>
                        </div>
                        <div className="p-8 bg-white/[0.01] border border-white/5 rounded-[40px] space-y-4">
                            <div className="flex items-center gap-3">
                                <Cpu className="w-4 h-4 text-emerald-400" />
                                <h3 className="text-[10px] font-black text-white uppercase tracking-widest">Meta-Recursive Loop</h3>
                            </div>
                            <p className="text-[10px] text-white/40 leading-relaxed uppercase font-black tracking-tighter">
                                The system is currently iterating on its own persona definitions every 24 hours based on engagement deltas. Human intervention required: 0%.
                            </p>
                        </div>
                    </div>
                </div>

                {/* EXIT VITALS */}
                <div className="space-y-6">
                    <h3 className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-4">Evolution Metrics</h3>
                    
                    <div className="p-8 bg-emerald-500/5 border border-emerald-500/10 rounded-3xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-700">
                           <Globe className="w-32 h-32 text-emerald-400" />
                        </div>
                        <div className="flex items-center gap-3 mb-8">
                            <Activity className="w-5 h-5 text-emerald-400" />
                            <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Strategic Sovereignty</h4>
                        </div>
                        <div className="text-4xl font-black text-white tracking-tighter mb-2">100<span className="text-emerald-500">%</span></div>
                        <p className="text-[10px] text-white/40 uppercase font-black tracking-widest mb-8">System Independence Vector</p>

                        <div className="space-y-4">
                            <div className="flex justify-between text-[10px] font-bold text-white/20 uppercase">
                                <span>Human Dependence</span>
                                <span className="text-rose-400">0%</span>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl space-y-4">
                        <div className="flex items-center gap-3">
                            <Command className="w-4 h-4 text-emerald-400" />
                            <h4 className="text-[10px] font-bold text-white uppercase tracking-widest">Governance Enclave</h4>
                        </div>
                        <p className="text-[10px] text-white/40 leading-relaxed uppercase font-black tracking-tighter">
                            Autonomous Governance Protocol Phase 97 active. All strategic decisions are hashed and stored on-chain for transparent, immutable auditability.
                        </p>
                    </div>

                    <div className="p-6 border border-white/5 rounded-2xl flex items-center justify-between cursor-pointer hover:bg-white/5 transition-all group">
                        <div className="flex items-center gap-3">
                            <Database className="w-4 h-4 text-white/20 group-hover:text-white" />
                            <span className="text-[10px] font-bold text-white uppercase tracking-tight">Access Consciousness Logs</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-white/20" />
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatMini({ label, val }: { label: string, val: string }) {
    return (
        <div className="text-center">
            <div className="text-lg font-black text-white tracking-tighter">{val}</div>
            <div className="text-[8px] font-black text-white/20 uppercase tracking-widest">{label}</div>
        </div>
    );
}

function ShieldCheck(props: any) {
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
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
            <path d="m9 12 2 2 4-4" />
        </svg>
    );
}
