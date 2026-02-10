"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { MousePointer2, Type, Square, Circle, Eraser, Share2, Users, Download, Save, Layers, Settings, Maximize2 } from "lucide-react";

export default function CollaborativeWhiteboard() {
    const [activeTool, setActiveTool] = useState<'select' | 'text' | 'shape' | 'erase'>('select');
    const [users] = useState([
        { id: 1, name: 'Sebastian', color: '#10b981', x: 120, y: 340 },
        { id: 2, name: 'Ghost AI', color: '#6366f1', x: 450, y: 210 },
    ]);

    return (
        <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-8 min-h-[800px] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-brand-500/10 text-brand-400 border border-brand-500/20">
                        <Layers className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white uppercase tracking-tight">Strategy Canvas</h2>
                        <p className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-mono mt-1">Real-time Collaborative Whiteboard</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center -space-x-2">
                        {users.map(user => (
                            <div 
                                key={user.id} 
                                className="w-8 h-8 rounded-full border-2 border-[#0a0a0a] flex items-center justify-center text-[10px] font-bold text-white shadow-lg"
                                style={{ backgroundColor: user.color }}
                                title={user.name}
                            >
                                {user.name[0]}
                            </div>
                        ))}
                    </div>
                    <button className="px-4 py-2 bg-brand-500 text-white rounded-xl text-[10px] font-black tracking-widest uppercase hover:scale-105 transition-all">
                        Share Space
                    </button>
                </div>
            </div>

            {/* Canvas Area */}
            <div className="flex-1 bg-[#050505] border border-white/5 rounded-3xl relative overflow-hidden cursor-crosshair group shadow-inner">
                {/* Simulated Grid Background */}
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
                
                {/* TOOLBAR */}
                <div className="absolute top-6 left-6 p-1.5 bg-black/60 backdrop-blur-md border border-white/10 rounded-2xl flex flex-col gap-1 z-20 shadow-2xl">
                    <ToolButton active={activeTool === 'select'} onClick={() => setActiveTool('select')} icon={<MousePointer2 className="w-4 h-4" />} />
                    <ToolButton active={activeTool === 'text'} onClick={() => setActiveTool('text')} icon={<Type className="w-4 h-4" />} />
                    <ToolButton active={activeTool === 'shape'} onClick={() => setActiveTool('shape')} icon={<Square className="w-4 h-4" />} />
                    <div className="h-px bg-white/5 my-1 mx-2" />
                    <ToolButton active={activeTool === 'erase'} onClick={() => setActiveTool('erase')} icon={<Eraser className="w-4 h-4" />} />
                </div>

                {/* ZOOM & ACTIONS */}
                <div className="absolute bottom-6 right-6 flex items-center gap-3 z-20">
                    <div className="flex items-center gap-2 p-1.5 bg-black/60 backdrop-blur-md border border-white/10 rounded-xl shadow-2xl">
                        <button className="p-2 text-white/40 hover:text-white transition-colors"><Settings className="w-4 h-4" /></button>
                        <button className="p-2 text-white/40 hover:text-white transition-colors"><Download className="w-4 h-4" /></button>
                        <button className="p-2 text-white/40 hover:text-white transition-colors"><Maximize2 className="w-4 h-4" /></button>
                    </div>
                </div>

                {/* Simulated Cursors */}
                {users.map(user => (
                    <motion.div
                        key={user.id}
                        initial={{ x: user.x, y: user.y }}
                        animate={{ 
                            x: [user.x, user.x + 20, user.x - 10, user.x],
                            y: [user.y, user.y - 30, user.y + 10, user.y]
                        }}
                        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute pointer-events-none z-30 flex flex-col gap-1"
                    >
                        <MousePointer2 className="w-5 h-5 drop-shadow-lg" style={{ color: user.color, fill: user.color }} />
                        <span className="px-2 py-0.5 rounded-md text-[8px] font-bold text-white shadow-lg uppercase tracking-widest" style={{ backgroundColor: user.color }}>
                            {user.name}
                        </span>
                    </motion.div>
                ))}

                {/* Simulated Canvas Objects */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute top-1/3 left-1/4 p-8 bg-blue-500/10 border-2 border-blue-500/30 rounded-3xl backdrop-blur-sm max-w-sm"
                >
                    <h4 className="text-xs font-black text-blue-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Zap className="w-3 h-3" />
                        <span>Core Hypothesis</span>
                    </h4>
                    <p className="text-sm font-bold text-white leading-relaxed uppercase tracking-tight">
                        AGENTIC WORKFLOWS WILL REPLACE TRADITIONAL SaaS INTERFACES BY 2026.
                    </p>
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 }}
                    className="absolute top-1/2 left-2/3 p-6 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl shadow-xl"
                >
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            <span className="text-[10px] font-black text-white/60 uppercase">Viral Trigger A</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            <span className="text-[10px] font-black text-white/60 uppercase">Market Tension B</span>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

function ToolButton({ active, onClick, icon }: { active: boolean, onClick: () => void, icon: React.ReactNode }) {
    return (
        <button
            onClick={onClick}
            className={`p-3 rounded-xl transition-all ${
                active 
                    ? "bg-brand-500 text-white shadow-lg shadow-brand-500/20" 
                    : "text-white/20 hover:text-white hover:bg-white/5"
            }`}
        >
            {icon}
        </button>
    );
}
