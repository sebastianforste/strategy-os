"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic2, Play, Pause, SkipForward, Volume2, Save, Download, RefreshCw, Zap, Stars, Brain, Speaker, Gauge, Layers, MoreHorizontal, CheckCircle, Sliders, Music } from "lucide-react";

interface AudioAsset {
    id: string;
    title: string;
    duration: string;
    persona: string;
    status: 'Ready' | 'Processing' | 'Archived';
}

const ASSETS: AudioAsset[] = [
    { id: 'a1', title: 'The Agentic Manifesto v1', duration: '2:42', persona: 'The Architect', status: 'Ready' },
    { id: 'a2', title: 'B2B Growth Loop Narration', duration: '1:15', persona: 'The Visionary', status: 'Processing' },
    { id: 'a3', title: 'Viral Thread Audiobook', duration: '5:10', persona: 'The Renegade', status: 'Archived' },
];

export default function VoiceV2Studio() {
    const [assets] = useState<AudioAsset[]>(ASSETS);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isSynthesizing, setIsSynthesizing] = useState(false);

    const handleSynthesize = () => {
        setIsSynthesizing(true);
        setTimeout(() => setIsSynthesizing(false), 3000);
    };

    return (
        <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-8 min-h-[700px]">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12">
                <div className="flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20 shadow-[0_0_20px_rgba(244,63,94,0.1)]">
                        <Mic2 className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white uppercase tracking-tight">Voice Studio V2</h2>
                        <p className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-mono mt-1">High-Fidelity Neural Cloning & Emotion-Aware Synthesis</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button 
                        onClick={handleSynthesize}
                        disabled={isSynthesizing}
                        className="px-6 py-2.5 bg-rose-500 text-white rounded-xl text-[10px] font-black tracking-widest hover:shadow-[0_0_30px_rgba(244,63,94,0.3)] transition-all uppercase flex items-center gap-2"
                    >
                        {isSynthesizing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
                        <span>{isSynthesizing ? "Synthesizing..." : "Generate Audio"}</span>
                    </button>
                    <div className="p-2.5 bg-white/5 border border-white/10 rounded-xl text-white/40">
                        <Save className="w-4 h-4" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* STUDIO CONTROLS */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Narration Engine</h3>
                        <div className="flex items-center gap-4 text-[10px] font-black text-white/40 uppercase tracking-widest">
                            <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Neural Pipeline: Active</span>
                        </div>
                    </div>

                    <div className="p-8 bg-white/[0.02] border border-white/5 rounded-[40px] space-y-8">
                        <div className="flex items-center justify-between bg-black/40 p-6 rounded-3xl border border-white/5 relative overflow-hidden group">
                           <div className="absolute inset-0 bg-gradient-to-r from-rose-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                           <div className="flex items-center gap-6 relative z-10">
                               <button 
                                    onClick={() => setIsPlaying(!isPlaying)}
                                    className="w-14 h-14 bg-white text-black rounded-full flex items-center justify-center hover:scale-105 transition-all shadow-xl shadow-white/10"
                                >
                                   {isPlaying ? <Pause className="fill-black w-6 h-6" /> : <Play className="fill-black w-6 h-6 ml-1" />}
                               </button>
                               <div>
                                   <h4 className="text-sm font-bold text-white uppercase tracking-tight mb-1">Live Preview: The Architect</h4>
                                   <p className="text-[10px] text-white/40 uppercase font-mono tracking-tighter">01:42 / 02:42 | Sample Rate: 48kHz</p>
                               </div>
                           </div>
                           <Music className="w-8 h-8 text-white/5 group-hover:text-rose-500/20 transition-all duration-700" />
                        </div>

                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <StudioSlider label="Emotional Depth" val={84} />
                                <StudioSlider label="Neural Fluency" val={92} />
                                <StudioSlider label="Vocal Clarity" val={76} />
                                <StudioSlider label="Cadence Variance" val={42} />
                            </div>
                        </div>

                        <div className="pt-6 border-t border-white/5 flex flex-wrap gap-3">
                            <StudioAction icon={<Speaker className="w-3.5 h-3.5" />} label="Clone External Voice" />
                            <StudioAction icon={<Music className="w-3.5 h-3.5" />} label="Add Atmospheric Bed" />
                            <StudioAction icon={<Sliders className="w-3.5 h-3.5" />} label="Frequency Sculpt" />
                        </div>
                    </div>
                </div>

                {/* ASSET ARCHIVE */}
                <div className="space-y-6">
                    <h3 className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-4">Production Archive</h3>
                    
                    <div className="space-y-4">
                        {assets.map((asset) => (
                            <motion.div
                                key={asset.id}
                                whileHover={{ x: 4 }}
                                className="p-6 bg-white/5 border border-white/5 rounded-3xl group hover:border-rose-500/20 transition-all cursor-pointer flex items-center justify-between"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-xl ${asset.status === 'Processing' ? 'bg-amber-500/10 text-amber-500 animate-pulse' : 'bg-white/5 text-white/20 group-hover:text-rose-400'}`}>
                                        <Volume2 className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h4 className="text-[11px] font-bold text-white uppercase tracking-tight">{asset.title}</h4>
                                        <p className="text-[9px] text-white/20 uppercase font-black tracking-widest">{asset.persona} • {asset.duration}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {asset.status === 'Ready' && <Download className="w-3.5 h-3.5 text-white/20 hover:text-white transition-colors" />}
                                    <MoreHorizontal className="w-3.5 h-3.5 text-white/10" />
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <div className="p-8 bg-rose-500/5 border border-rose-500/10 rounded-[32px] relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:rotate-12 transition-transform duration-700">
                           <Brain className="w-32 h-32 text-rose-400" />
                        </div>
                        <div className="flex items-center gap-3 mb-6">
                            <Gauge className="w-4 h-4 text-rose-400" />
                            <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Model Fidelity</h4>
                        </div>
                        <div className="text-4xl font-black text-white tracking-tighter">98.4%</div>
                        <p className="text-[9px] text-white/20 uppercase font-black tracking-widest mt-2">Zero-Shot Consistency Match</p>
                    </div>

                    <div className="p-6 border border-white/5 rounded-2xl flex items-center justify-between cursor-pointer hover:bg-white/5 transition-all group">
                        <div className="flex items-center gap-3">
                            <Layers className="w-4 h-4 text-white/20 group-hover:text-white" />
                            <span className="text-[10px] font-bold text-white uppercase tracking-tight">Access Stems Library</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-white/20" />
                    </div>
                </div>
            </div>
        </div>
    );
}

function StudioSlider({ label, val }: { label: string, val: number }) {
    return (
        <div className="space-y-3">
            <div className="flex justify-between text-[9px] font-black uppercase text-white/40 tracking-widest">
                <span>{label}</span>
                <span className="text-white/60">{val}%</span>
            </div>
            <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${val}%` }} className="h-full bg-rose-500" />
            </div>
        </div>
    );
}

function StudioAction({ icon, label }: { icon: React.ReactNode, label: string }) {
    return (
        <button className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 hover:border-white/10 transition-all text-white/60 hover:text-white group">
            {icon}
            <span className="text-[9px] font-black uppercase tracking-widest">{label}</span>
        </button>
    );
}
