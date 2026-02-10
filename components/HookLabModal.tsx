
"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Copy, Check, Anchor, Zap, BarChart3, TrendingUp, Plus } from "lucide-react";
import { generateHooksAction } from "../actions/generate";
import AnimatedModal from "./AnimatedModal";
import { HookVariant } from "../utils/virality-scorer";

interface HookProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
  onSelect: (hook: string) => void;
}

export default function HookLabModal({ isOpen, onClose, apiKey, onSelect }: HookProps) {
  const [topic, setTopic] = useState("");
  const [hooks, setHooks] = useState<HookVariant[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setIsLoading(true);
    setError(null);
    setHooks([]);

    try {
      const results = await generateHooksAction(topic, apiKey) as HookVariant[];
      setHooks(results);
    } catch (e) {
      setError("Hook Lab failed. Check quota or try again.");
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const selectHook = (text: string, index: number) => {
    onSelect(text);
    setCopiedIndex(index);
    setTimeout(() => {
        setCopiedIndex(null);
        onClose();
    }, 1000);
  };

  return (
    <AnimatedModal isOpen={isOpen} onClose={onClose} title="Hook Lab">
       <div className="bg-neutral-900/90 backdrop-blur-3xl border border-white/10 rounded-3xl w-full max-w-4xl h-[85vh] flex flex-col overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.8)] relative">
          
        {/* Background Glow */}
        <div className="absolute -top-32 -right-32 w-80 h-80 bg-indigo-600/10 blur-[100px] pointer-events-none" />

        {/* Header */}
        <div className="p-8 border-b border-white/5 flex items-center justify-between bg-gradient-to-b from-white/[0.03] to-transparent">
          <div className="flex items-center gap-4">
            <div className="bg-indigo-500/20 p-2.5 rounded-xl border border-indigo-500/20 shadow-lg shadow-indigo-500/10">
              <Anchor className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-tight">Viral Matrix</h2>
              <p className="text-[10px] font-mono text-indigo-400/60 uppercase tracking-widest italic">A/B Testing & Predictive Scoring Engine</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X className="w-5 h-5 text-neutral-500 hover:text-white" />
          </button>
        </div>

        {/* Body */}
        <div className="p-8 flex-1 overflow-y-auto custom-scrollbar space-y-8">
          
          {/* Input Area */}
          <div className="max-w-2xl mx-auto space-y-4">
            <div className="flex gap-3 bg-white/[0.03] p-1.5 rounded-2xl border border-white/5 shadow-inner">
                <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="Focus topic for hook optimization..."
                    className="flex-1 bg-transparent px-4 py-3 text-sm text-white placeholder-neutral-600 focus:outline-none"
                    onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
                />
                <button
                    onClick={handleGenerate}
                    disabled={isLoading || !topic.trim()}
                    className="bg-white text-black hover:scale-105 disabled:opacity-30 disabled:hover:scale-100 text-[10px] font-black uppercase tracking-tighter px-6 py-3 rounded-xl transition-all flex items-center gap-2 shadow-xl shadow-white/5"
                >
                    {isLoading ? (
                        <span className="animate-spin">⚡</span>
                    ) : (
                        <>
                            <Zap className="w-4 h-4" /> Analyze
                        </>
                    )}
                </button>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-950/30 border border-red-900/50 rounded-xl text-red-400 text-sm max-w-2xl mx-auto">
              {error}
            </div>
          )}

          {/* Comparative Matrix */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
             <AnimatePresence mode="popLayout">
               {hooks.map((hook, i) => (
                 <motion.div
                   key={i}
                   layout
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   exit={{ opacity: 0, scale: 0.9 }}
                   transition={{ delay: i * 0.1 }}
                   className="group relative bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 hover:border-indigo-500/30 p-6 rounded-2xl transition-all"
                 >
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                             <span className="px-2 py-0.5 rounded-md bg-white/5 text-[10px] font-bold text-neutral-400 uppercase tracking-widest border border-white/5">
                                {hook.style}
                             </span>
                        </div>
                        <div className="flex items-center gap-3">
                             <div className="text-right">
                                 <div className="flex items-center gap-1 text-green-400">
                                     <BarChart3 className="w-3 h-3" />
                                     <span className="text-xs font-black">{hook.ctr}%</span>
                                 </div>
                                 <span className="text-[8px] uppercase text-neutral-500 font-bold">Exp. CTR</span>
                             </div>
                             <div className="w-px h-6 bg-white/10" />
                             <div className="text-right">
                                 <div className="flex items-center gap-1 text-indigo-400">
                                     <TrendingUp className="w-3 h-3" />
                                     <span className="text-xs font-black">{hook.attention}%</span>
                                 </div>
                                 <span className="text-[8px] uppercase text-neutral-500 font-bold">Attention</span>
                             </div>
                        </div>
                    </div>

                    <p className="text-neutral-200 font-medium leading-relaxed italic mb-6">
                        "{hook.text}"
                    </p>

                    <div className="flex items-center gap-2">
                         <button 
                            onClick={() => selectHook(hook.text, i)}
                            className="flex-1 bg-indigo-500/10 hover:bg-indigo-500 text-indigo-400 hover:text-white px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-indigo-500/30 flex items-center justify-center gap-2"
                         >
                            {copiedIndex === i ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                            {copiedIndex === i ? "INJECTED" : "Inject Hook"}
                         </button>
                    </div>
                 </motion.div>
               ))}
             </AnimatePresence>
          </div>
          
          {isLoading && hooks.length === 0 && (
             <div className="text-center py-24 space-y-6">
                 <div className="w-16 h-16 border-2 border-indigo-500/10 border-t-indigo-500 rounded-full animate-spin mx-auto" />
                 <p className="text-[10px] font-mono tracking-[0.4em] text-indigo-500/60 animate-pulse">MODELING VIRAL VELOCITY...</p>
             </div>
          )}

           {!isLoading && hooks.length === 0 && !error && (
               <div className="text-center py-32 text-neutral-500">
                 <Anchor className="w-16 h-16 mx-auto mb-6 opacity-10" />
                 <p className="text-xs uppercase tracking-widest font-bold opacity-30">Matrix Standby. Enter Topic Above.</p>
               </div>
           )}
        </div>
      </div>
    </AnimatedModal>
  );
}
