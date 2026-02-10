"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Shield, Radar, Activity, Settings, Power } from "lucide-react";

interface AutonomousControlProps {
    onToggleRadar?: (enabled: boolean) => void;
    onTriggerDraft?: () => void;
}

export default function AutonomousControl({ onToggleRadar, onTriggerDraft }: AutonomousControlProps) {
    const [radarEnabled, setRadarEnabled] = useState(false);
    const [isTriggering, setIsTriggering] = useState(false);
    const [logs, setLogs] = useState<string[]>(["[GrowthAgent] System Online..."]);

    const addLog = (msg: string) => {
        setLogs(prev => [`${new Date().toLocaleTimeString()} - ${msg}`, ...prev].slice(0, 5));
    };

    const handleToggle = () => {
        const newState = !radarEnabled;
        setRadarEnabled(newState);
        onToggleRadar?.(newState);
        addLog(`Radar ${newState ? "Activated" : "Deactivated"}`);
    };

    const handleManualTrigger = async () => {
        setIsTriggering(true);
        addLog("Manual Draft Triggered...");
        try {
            await onTriggerDraft?.();
            addLog("Autonomous content ready.");
        } catch {
            addLog("Trigger failed. Check API status.");
        } finally {
            setIsTriggering(false);
        }
    };

    return (
        <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-6 overflow-hidden">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${radarEnabled ? "bg-indigo-500/20 text-indigo-400" : "bg-white/5 text-white/40"}`}>
                        <Radar className={`w-5 h-5 ${radarEnabled ? "animate-pulse" : ""}`} />
                    </div>
                    <div>
                        <h3 className="text-white font-medium">Growth Radar</h3>
                        <p className="text-xs text-white/40 uppercase tracking-widest">Autonomous Mode</p>
                    </div>
                </div>
                <button 
                    onClick={handleToggle}
                    className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${
                        radarEnabled 
                            ? "bg-indigo-500 border-indigo-400 text-white shadow-[0_0_15px_rgba(99,102,241,0.5)]" 
                            : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10"
                    }`}
                >
                    {radarEnabled ? "ACTIVE" : "STANDBY"}
                </button>
            </div>

            <div className="space-y-4">
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-white/40 font-mono">System Logs</span>
                        <div className="flex gap-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        </div>
                    </div>
                    <div className="space-y-1.5 h-24 overflow-hidden">
                        {logs.map((log, i) => (
                            <motion.p 
                                key={log + i}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="text-[10px] font-mono text-white/60 truncate"
                            >
                                {log}
                            </motion.p>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <button 
                        onClick={handleManualTrigger}
                        disabled={isTriggering}
                        className="flex flex-col items-center justify-center p-4 bg-indigo-500/5 hover:bg-indigo-500/10 border border-indigo-500/20 rounded-2xl transition-all group"
                    >
                        <Zap className={`w-5 h-5 mb-2 group-hover:scale-110 transition-transform ${isTriggering ? "text-amber-400" : "text-indigo-400"}`} />
                        <span className="text-[10px] text-white/80 font-medium">Trigger Draft</span>
                    </button>
                    <button className="flex flex-col items-center justify-center p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all group opacity-50 cursor-not-allowed">
                        <Shield className="w-5 h-5 mb-2 text-white/40" />
                        <span className="text-[10px] text-white/40 font-medium">Safety Guard</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
