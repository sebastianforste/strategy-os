"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Video, Play, Square, Monitor, User, Layers, Radio, Send, Users, MessageSquare, Shield, Activity, RefreshCw, Zap, Settings, Globe, Database, ChevronRight, Share2, Maximize2, Camera, Mic } from "lucide-react";

interface StreamScene {
    id: string;
    label: string;
    type: 'Talking Head' | 'Strategy Canvas' | 'Network Visualization' | 'Audience HUD';
    active: boolean;
}

const SCENES: StreamScene[] = [
    { id: 's1', label: 'Main Focus', type: 'Talking Head', active: true },
    { id: 's2', label: 'Concept Map', type: 'Strategy Canvas', active: false },
    { id: 's3', label: 'World View', type: 'Network Visualization', active: false },
    { id: 's4', label: 'Engagement HUD', type: 'Audience HUD', active: false },
];

export default function StreamDirector() {
    const [scenes, setScenes] = useState<StreamScene[]>(SCENES);
    const [isLive, setIsLive] = useState(false);
    const [isBroadcasting, setIsBroadcasting] = useState(false);

    const toggleLive = () => {
        setIsLive(!isLive);
        if(!isLive) {
            setIsBroadcasting(true);
            setTimeout(() => setIsBroadcasting(false), 2000);
        }
    };

    const activateScene = (id: string) => {
        setScenes(scenes.map(s => ({ ...s, active: s.id === id })));
    };

    return (
        <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-8 min-h-[700px]">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12">
                <div className="flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20 shadow-[0_0_20px_rgba(244,63,94,0.1)]">
                        <Radio className="w-6 h-6 animate-pulse" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white uppercase tracking-tight">Stream Director</h2>
                        <p className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-mono mt-1">Multi-Modal Broadcast Management & Virtual Persona Bridging</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button 
                        onClick={toggleLive}
                        className={`px-6 py-2.5 rounded-xl text-[10px] font-black tracking-widest transition-all uppercase flex items-center gap-2 ${
                            isLive ? 'bg-rose-500 text-white shadow-[0_0_30px_rgba(244,63,94,0.3)]' : 'bg-white/5 text-white/40 border border-white/10 hover:bg-white/10'
                        }`}
                    >
                        {isBroadcasting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                        <span>{isLive ? "Go Offline" : "Initialize Stream"}</span>
                    </button>
                    <div className="p-2.5 bg-white/5 border border-white/10 rounded-xl text-white/40">
                        <Settings className="w-4 h-4" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* BROADCAST PREVIEW */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Program Output (OBS Bridge)</h3>
                        <div className="flex items-center gap-4 text-[10px] font-black text-white/40 uppercase tracking-widest">
                            <span className="flex items-center gap-1.5"><div className={`w-1.5 h-1.5 rounded-full ${isLive ? 'bg-rose-500 animate-pulse' : 'bg-white/20'}`} /> {isLive ? 'LIVE' : 'Standby'}</span>
                            <span className="flex items-center gap-1.5"><Monitor className="w-3 h-3" /> 1080p 60fps</span>
                        </div>
                    </div>

                    <div className="relative aspect-video rounded-[40px] border border-white/5 bg-black overflow-hidden group shadow-2xl">
                        {/* Mock Virtual Persona Layer */}
                        <div className="absolute inset-0 flex items-center justify-center">
                           {!isLive ? (
                               <div className="text-center space-y-4">
                                   <div className="w-24 h-24 rounded-full bg-white/5 mx-auto border border-white/10 flex items-center justify-center">
                                       <Video className="w-10 h-10 text-white/10" />
                                   </div>
                                   <p className="text-[10px] font-black uppercase text-white/20 tracking-widest italic">Awaiting Signal Ingestion</p>
                               </div>
                           ) : (
                               <div className="w-full h-full relative">
                                   <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                   <div className="absolute bottom-12 left-12 flex items-center gap-4">
                                       <div className="w-16 h-16 rounded-3xl bg-white/10 border border-white/20 backdrop-blur-xl flex items-center justify-center">
                                           <User className="w-8 h-8 text-white/40" />
                                       </div>
                                       <div>
                                           <h4 className="text-lg font-black text-white uppercase tracking-tighter">The Visionary</h4>
                                           <div className="flex items-center gap-2">
                                               <span className="text-[10px] text-rose-500 font-bold uppercase tracking-widest px-2 py-0.5 bg-rose-500/10 rounded">Persona Override</span>
                                           </div>
                                       </div>
                                   </div>
                               </div>
                           )}
                        </div>

                        {/* Overlay HUD */}
                        <div className="absolute top-8 right-8 flex flex-col gap-3">
                            <HUDButton icon={<Maximize2 className="w-4 h-4" />} />
                            <HUDButton icon={<Camera className="w-4 h-4" />} />
                            <HUDButton icon={<Mic className="w-4 h-4" />} />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {scenes.map((scene) => (
                            <button
                                key={scene.id}
                                onClick={() => activateScene(scene.id)}
                                className={`p-4 rounded-2xl border transition-all text-left relative overflow-hidden group ${
                                    scene.active ? 'bg-rose-500/5 border-rose-500/30' : 'bg-white/5 border-white/5 hover:border-white/10'
                                }`}
                            >
                                <div className="relative z-10">
                                    <h4 className={`text-[9px] font-black uppercase tracking-widest mb-1 ${scene.active ? 'text-rose-400' : 'text-white/40'}`}>{scene.label}</h4>
                                    <p className="text-[10px] font-bold text-white uppercase truncate">{scene.type}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* BROADCAST VITALS */}
                <div className="space-y-6">
                    <h3 className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-4">Stream Intelligence</h3>
                    
                    <div className="p-8 bg-rose-500/5 border border-rose-500/10 rounded-3xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-700">
                           <Users className="w-32 h-32 text-rose-400" />
                        </div>
                        <div className="flex items-center gap-3 mb-8">
                            <Activity className="w-5 h-5 text-rose-400" />
                            <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Live Resonance</h4>
                        </div>
                        <div className="text-4xl font-black text-white tracking-tighter mb-2">1.2k</div>
                        <p className="text-[10px] text-white/40 uppercase font-black tracking-widest mb-8">Current Concurrency Estimate</p>

                        <div className="space-y-4">
                            <div className="flex justify-between text-[10px] font-bold text-white/20 uppercase">
                                <span>Sentiment Vector</span>
                                <span className="text-emerald-400">+8.2%</span>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl space-y-6">
                        <div className="flex items-center gap-3">
                            <MessageSquare className="w-4 h-4 text-rose-400" />
                            <h4 className="text-[10px] font-bold text-white uppercase tracking-widest">Neural Chat Guard</h4>
                        </div>
                        <div className="space-y-4">
                            <div className="text-[10px] text-white/40 italic flex gap-3">
                                <Shield className="w-3 h-3 text-rose-500" />
                                <span>Suppressed 12 toxic entries in last 60s</span>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 border border-white/5 rounded-2xl flex items-center justify-between cursor-pointer hover:bg-white/5 transition-all group">
                        <div className="flex items-center gap-3">
                            <Database className="w-4 h-4 text-white/20 group-hover:text-white" />
                            <span className="text-[10px] font-bold text-white uppercase tracking-tight">Access Stream Logs</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-white/20" />
                    </div>
                </div>
            </div>
        </div>
    );
}

function HUDButton({ icon }: { icon: React.ReactNode }) {
    return (
        <button className="p-3 bg-black/60 backdrop-blur-3xl border border-white/10 rounded-2xl text-white/40 hover:text-white hover:bg-white/10 transition-all active:scale-95">
            {icon}
        </button>
    );
}
