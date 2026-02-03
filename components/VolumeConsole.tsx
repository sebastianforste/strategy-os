"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Layers, Grid, List, Zap, Send, Edit3, Trash2, Shield, Calendar, Filter, BarChart3, ChevronRight } from "lucide-react";

interface VolumeVariant {
    id: string;
    topic: string;
    angle: string;
    platform: string;
    scheduledFor: string;
    status: 'queued' | 'draft' | 'posted';
}

export default function VolumeConsole({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
    const [view, setView] = useState<'matrix' | 'list'>('matrix');
    const [variants, setVariants] = useState<VolumeVariant[]>([
        { id: "1", topic: "AI Strategy", angle: "Contrarian", platform: "linkedin", scheduledFor: "2026-02-05 09:00", status: "queued" },
        { id: "2", topic: "AI Strategy", angle: "Educational", platform: "linkedin", scheduledFor: "2026-02-05 14:00", status: "queued" },
        { id: "3", topic: "Fintech Risk", angle: "Aggressive", platform: "twitter", scheduledFor: "2026-02-06 10:00", status: "queued" },
        { id: "4", topic: "Fintech Risk", angle: "Checklist", platform: "twitter", scheduledFor: "2026-02-06 18:00", status: "queued" },
        { id: "5", topic: "Growth Hacks", angle: "Story", platform: "substack", scheduledFor: "2026-02-07 08:00", status: "queued" },
    ]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[110] bg-black/98 backdrop-blur-2xl flex items-center justify-center p-4">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-[#050505] border border-white/5 rounded-[2rem] w-full max-w-7xl h-[90vh] overflow-hidden shadow-2xl flex flex-col"
            >
                {/* Tactical Top Bar */}
                <div className="p-8 border-b border-white/5 bg-gradient-to-r from-indigo-950/10 to-transparent flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <div className="p-4 bg-indigo-500/10 rounded-2xl border border-indigo-500/20">
                            <Layers className="w-8 h-8 text-indigo-400" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-white tracking-widest uppercase italic">Volume Multiplier</h3>
                            <p className="text-[10px] text-indigo-400 font-mono tracking-[0.4em] uppercase mt-1">Hormozi Scale Machine v2.0 // Active Matrix</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
                            <button 
                                onClick={() => setView('matrix')}
                                className={`p-2 px-4 rounded-lg flex items-center gap-2 transition-all ${view === 'matrix' ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'text-neutral-500 hover:text-white'}`}
                            >
                                <Grid className="w-4 h-4" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Matrix View</span>
                            </button>
                            <button 
                                onClick={() => setView('list')}
                                className={`p-2 px-4 rounded-lg flex items-center gap-2 transition-all ${view === 'list' ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'text-neutral-500 hover:text-white'}`}
                            >
                                <List className="w-4 h-4" />
                                <span className="text-[10px] font-black uppercase tracking-widest">List View</span>
                            </button>
                        </div>
                        <button onClick={onClose} className="p-4 bg-white/5 border border-white/10 rounded-2xl text-neutral-500 hover:text-white transition-all">
                           <Zap className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-hidden flex">
                    {/* Status Sidebar */}
                    <div className="w-72 border-r border-white/5 p-8 space-y-10 bg-black/40">
                        <div>
                            <label className="text-[9px] font-black text-neutral-600 uppercase tracking-widest block mb-4">Volume Statistics</label>
                            <div className="space-y-4">
                                <StatItem label="Active Variants" value={variants.length.toString()} color="text-indigo-400" />
                                <StatItem label="Total Impressions (Est)" value="1.2M" color="text-emerald-400" />
                                <StatItem label="Market Saturation" value="64%" color="text-yellow-500" />
                            </div>
                        </div>

                        <div>
                            <label className="text-[9px] font-black text-neutral-600 uppercase tracking-widest block mb-4">Platform Coverage</label>
                            <div className="space-y-4">
                                <PlatformMetric label="LinkedIn" progress={80} />
                                <PlatformMetric label="X / Twitter" progress={45} />
                                <PlatformMetric label="Substack" progress={20} />
                            </div>
                        </div>

                        <div className="pt-6 border-t border-white/5">
                            <button className="w-full py-4 bg-indigo-500 hover:bg-indigo-400 text-white font-black rounded-2xl text-xs uppercase tracking-[0.2em] transition-all shadow-lg shadow-indigo-950/20 flex items-center justify-center gap-3">
                                <Send className="w-4 h-4" />
                                Force Triple-Dispatch
                            </button>
                        </div>
                    </div>

                    {/* Main Matrix Area */}
                    <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {variants.map((v) => (
                                <motion.div
                                    key={v.id}
                                    layout
                                    className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl hover:border-indigo-500/30 transition-all group"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-indigo-500/10 rounded-xl">
                                                <Zap className="w-4 h-4 text-indigo-400" />
                                            </div>
                                            <div>
                                                <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{v.angle}</span>
                                                <p className="text-xs text-white font-bold truncate max-w-[150px]">{v.topic}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="px-2 py-1 bg-white/5 border border-white/5 rounded text-[8px] font-black text-neutral-500 uppercase">
                                                {v.platform}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-3 mb-6">
                                        <div className="flex items-center justify-between text-[10px] font-mono">
                                            <span className="text-neutral-600">SCHEDULE:</span>
                                            <span className="text-emerald-500">{v.scheduledFor}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-[10px] font-mono">
                                            <span className="text-neutral-600">STATUS:</span>
                                            <span className="text-indigo-400 uppercase tracking-widest font-black">{v.status}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 pt-6 border-t border-white/5 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button className="flex-1 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-[9px] font-black text-neutral-400 hover:text-white uppercase tracking-widest transition-all">
                                            Edit Reveal
                                        </button>
                                        <button className="p-2 text-neutral-600 hover:text-red-500 transition-colors">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </motion.div>
                            ))}

                            {/* Add Variant Placeholder */}
                            <button className="p-6 border-2 border-dashed border-white/5 rounded-3xl flex flex-col items-center justify-center gap-4 text-neutral-600 hover:text-indigo-500 hover:border-indigo-500/20 transition-all bg-black/20">
                                <Layers className="w-8 h-8" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Add Custom Angle variant</span>
                            </button>
                         </div>
                    </div>
                </div>

                {/* Status Bar */}
                <div className="p-6 border-t border-white/5 bg-black/60 flex items-center justify-between">
                    <div className="flex items-center gap-8">
                        <div className="flex items-center gap-2">
                             <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                             <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Multi-Agent Dispatcher Operational</span>
                        </div>
                        <div className="flex items-center gap-2">
                             <Shield className="w-3 h-3 text-neutral-600" />
                             <span className="text-[10px] font-bold text-neutral-600 uppercase tracking-widest">Rate Limits: 42% Remaining</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="text-[10px] font-mono text-neutral-600">
                            COORD: 34.0522° N, 118.2437° W
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

function StatItem({ label, value, color }: { label: string, value: string, color: string }) {
    return (
        <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
            <span className="text-[9px] font-black text-neutral-600 uppercase block mb-1">{label}</span>
            <span className={`text-2xl font-black ${color}`}>{value}</span>
        </div>
    );
}

function PlatformMetric({ label, progress }: { label: string, progress: number }) {
    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between text-[9px] font-black uppercase">
                <span className="text-neutral-400">{label}</span>
                <span className="text-white">{progress}%</span>
            </div>
            <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    className="h-full bg-indigo-500" 
                />
            </div>
        </div>
    );
}
