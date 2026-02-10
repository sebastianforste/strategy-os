"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Smartphone, Watch, Heart, Zap, RefreshCw, Thermometer, Sun, Wind, Shield, Activity, ChevronRight, Database, Maximize2, Cpu, Bluetooth, Layers, Search, CheckCircle, Info, Sparkles } from "lucide-react";

interface BiometricSync {
    id: string;
    metric: string;
    value: string;
    status: 'Optimal' | 'Alert' | 'Calibrating';
    icon: any;
}

const BIOMETRICS: BiometricSync[] = [
    { id: 'b1', metric: 'BPM / HRV', value: '72 / 84', status: 'Optimal', icon: Heart },
    { id: 'b2', metric: 'Body Temperature', value: '98.6°F', status: 'Optimal', icon: Thermometer },
    { id: 'b3', metric: 'Neural Focus Load', value: 'High', status: 'Alert', icon: Activity },
];

export default function HardwareSyncV2() {
    const [biometrics] = useState<BiometricSync[]>(BIOMETRICS);
    const [isSyncing, setIsSyncing] = useState(false);

    const handleSync = () => {
        setIsSyncing(true);
        setTimeout(() => setIsSyncing(false), 2500);
    };

    return (
        <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-8 min-h-[700px]">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12">
                <div className="flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-[0_0_20px_rgba(99,102,241,0.1)]">
                        <Smartphone className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white uppercase tracking-tight">Hardware Sync V2</h2>
                        <p className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-mono mt-1">Biometric-Aware Refocus & Environmental Strategy Bridging</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button 
                        onClick={handleSync}
                        disabled={isSyncing}
                        className="px-6 py-2.5 bg-indigo-500 text-white rounded-xl text-[10px] font-black tracking-widest hover:shadow-[0_0_30px_rgba(99,102,241,0.3)] transition-all uppercase flex items-center gap-2"
                    >
                        {isSyncing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Bluetooth className="w-3.5 h-3.5" />}
                        <span>{isSyncing ? "Connecting..." : "Sync Wearables"}</span>
                    </button>
                    <div className="p-2.5 bg-white/5 border border-white/10 rounded-xl text-white/40">
                        <Watch className="w-4 h-4" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* DEVICE ECOSYSTEM */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Biometric Telemetry</h3>
                        <div className="flex items-center gap-4 text-[10px] font-black text-white/40 uppercase tracking-widest">
                            <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Apple Watch Ultra: Active</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {biometrics.map((b) => (
                            <motion.div
                                key={b.id}
                                whileHover={{ y: -4 }}
                                className={`p-6 bg-white/[0.02] border rounded-[32px] transition-all relative overflow-hidden ${
                                    b.status === 'Alert' ? 'border-rose-500/20 shadow-[0_0_30px_rgba(244,63,94,0.05)]' : 'border-white/5 shadow-xl'
                                }`}
                            >
                                <div className="flex items-center justify-between mb-8">
                                    <div className={`p-3 rounded-xl bg-white/5 group-hover:text-indigo-400 transition-colors ${b.status === 'Alert' ? 'text-rose-400' : 'text-white/20'}`}>
                                        <b.icon className="w-4 h-4" />
                                    </div>
                                    <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${
                                        b.status === 'Optimal' ? 'bg-emerald-500/10 text-emerald-400' : 
                                        b.status === 'Alert' ? 'bg-rose-500 text-black animate-pulse' : 'bg-white/5 text-white/20'
                                    }`}>
                                        {b.status}
                                    </span>
                                </div>
                                <h4 className="text-[10px] font-black text-white uppercase tracking-widest mb-1">{b.metric}</h4>
                                <div className="text-2xl font-black text-white mb-4 tracking-tighter">{b.value}</div>
                                
                                <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                                    <motion.div initial={{ width: 0 }} animate={{ width: b.status === 'Optimal' ? '85%' : '45%' }} className={`h-full ${
                                        b.status === 'Optimal' ? 'bg-emerald-500' : 'bg-rose-500'
                                    }`} />
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <div className="p-8 bg-white/[0.01] border border-white/5 rounded-[40px] space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Focus Mode Strategy Shift</h3>
                            <div className="flex gap-2">
                                <Sun className="w-4 h-4 text-amber-400" />
                                <Wind className="w-4 h-4 text-brand-400" />
                            </div>
                        </div>
                        <p className="text-xs text-white/60 leading-relaxed italic">
                            High neural load detected. Automatically shifting StrategyOS into `Refocus HUD`. Suppressing Slack/Discord notifications. Optimizing desktop brightness for cognitive flow.
                        </p>
                    </div>
                </div>

                {/* HARDWARE VITALS */}
                <div className="space-y-6">
                    <h3 className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-4">Environment Node</h3>
                    
                    <div className="p-8 bg-indigo-500/5 border border-indigo-500/10 rounded-3xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-700">
                           <Cpu className="w-32 h-32 text-indigo-400" />
                        </div>
                        <div className="flex items-center gap-3 mb-8">
                            <Activity className="w-5 h-5 text-indigo-400" />
                            <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Logic Cohesion</h4>
                        </div>
                        <div className="text-4xl font-black text-white tracking-tighter mb-2">98.2%</div>
                        <p className="text-[10px] text-white/40 uppercase font-black tracking-widest mb-8">Cross-Device State Sync</p>

                        <div className="space-y-4">
                            <div className="flex justify-between text-[10px] font-bold text-white/20 uppercase">
                                <span>Signal Strength</span>
                                <span className="text-emerald-400">Stable</span>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl space-y-4">
                        <div className="flex items-center gap-3">
                            <Shield className="w-4 h-4 text-indigo-400" />
                            <h4 className="text-[10px] font-bold text-white uppercase tracking-widest">Privacy Lock</h4>
                        </div>
                        <p className="text-[10px] text-white/40 leading-relaxed uppercase font-black tracking-tighter">
                            Biometric data is processed locally on-device. No health metrics ever leave the StrategyOS hardware enclave.
                        </p>
                    </div>

                    <div className="p-6 border border-white/5 rounded-2xl flex items-center justify-between cursor-pointer hover:bg-white/5 transition-all group">
                        <div className="flex items-center gap-3">
                            <Database className="w-4 h-4 text-white/20 group-hover:text-white" />
                            <span className="text-[10px] font-bold text-white uppercase tracking-tight">Access Device Logs</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-white/20" />
                    </div>
                </div>
            </div>
        </div>
    );
}
