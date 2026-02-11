"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Command, Ghost } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface HUDAction {
    id: string;
    title: string;
    description: string;
    icon: LucideIcon;
    shortcut: string;
    handler: () => void;
}

export default function GlobalHUD({ 
    isOpen, 
    onClose,
    actions = [] 
}: { 
    isOpen: boolean; 
    onClose: () => void;
    actions?: HUDAction[];
}) {
    const [search, setSearch] = useState("");
    const [selectedIndex, setSelectedIndex] = useState(0);

    const filteredActions = actions.filter(a => 
        a.title.toLowerCase().includes(search.toLowerCase()) || 
        a.description.toLowerCase().includes(search.toLowerCase())
    );

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (!isOpen) return;
        if (filteredActions.length === 0 && e.key !== "Escape") return;

        if (e.key === "Escape") onClose();
        if (e.key === "ArrowDown") setSelectedIndex(prev => (prev + 1) % filteredActions.length);
        if (e.key === "ArrowUp") setSelectedIndex(prev => (prev - 1 + filteredActions.length) % filteredActions.length);
        if (e.key === "Enter") {
            filteredActions[selectedIndex]?.handler();
            onClose();
        }
    }, [isOpen, filteredActions, selectedIndex, onClose]);

    useEffect(() => {
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [handleKeyDown]);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4">
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        onClick={onClose}
                    />
                    
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -20 }}
                        className="relative w-full max-w-2xl bg-[#0f111a] border border-white/10 rounded-3xl shadow-3xl overflow-hidden"
                    >
                        <div className="flex items-center px-6 py-4 border-b border-white/5 bg-black/20">
                            <Command className="w-5 h-5 text-neutral-500 mr-4" />
                            <input 
                                autoFocus
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Command StrategyOS..."
                                className="flex-1 bg-transparent text-lg text-white placeholder:text-neutral-700 outline-none"
                            />
                            <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 bg-white/5 border border-white/10 rounded text-[10px] text-neutral-500 font-mono">ESC to Close</span>
                            </div>
                        </div>

                        <div className="max-h-[400px] overflow-y-auto p-3 space-y-1 custom-scrollbar">
                            {filteredActions.length === 0 ? (
                                <div className="py-20 text-center">
                                    <Ghost className="w-12 h-12 text-neutral-800 mx-auto mb-4" />
                                    <p className="text-sm text-neutral-600 font-mono uppercase tracking-widest">No Actions Available</p>
                                </div>
                            ) : (
                                filteredActions.map((action, i) => (
                                    <button
                                        key={action.id}
                                        onClick={() => { action.handler(); onClose(); }}
                                        onMouseEnter={() => setSelectedIndex(i)}
                                        className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${
                                            i === selectedIndex ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-neutral-400 hover:bg-white/5'
                                        }`}
                                    >
                                        <div className="flex items-center gap-4 text-left">
                                            <div className={`p-2 rounded-xl ${i === selectedIndex ? 'bg-white/20' : 'bg-white/5'}`}>
                                                <action.icon className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <div className={`text-sm font-black uppercase tracking-tight ${i === selectedIndex ? 'text-white' : 'text-neutral-200'}`}>{action.title}</div>
                                                <div className={`text-[10px] ${i === selectedIndex ? 'text-indigo-200' : 'text-neutral-500'}`}>{action.description}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1 opacity-50">
                                            <span className="text-[10px] font-mono">CMD +</span>
                                            <span className="px-1.5 py-0.5 bg-black/40 border border-white/10 rounded text-[10px] font-mono">{action.shortcut}</span>
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>

                        <div className="p-3 bg-black/40 border-t border-white/5 flex items-center justify-between px-6">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-1">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                    <span className="text-[9px] text-neutral-500 uppercase font-mono tracking-tighter">System Ready</span>
                                </div>
                            </div>
                            <p className="text-[9px] text-neutral-700 font-mono uppercase tracking-widest">Powered by Gemini 1.5 Flash</p>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
