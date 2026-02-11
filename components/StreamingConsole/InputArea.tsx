/**
 * InputArea Component
 * -------------------
 * The interactive textarea with dropzone, signals, and personalized chips.
 * Extracted from StreamingConsole for maintainability.
 */

"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Zap, ImageIcon, X, Type, Target } from "lucide-react";
import { Signal } from "../../utils/signal-service";
import SwarmConsole from "../SwarmConsole";
import { SwarmMessage } from "../../utils/swarm-service";
import { ViralService, ViralScore } from "../../utils/viral-service";

export interface InputAreaProps {
  input: string;
  setInput: (val: string) => void;
  images: string[];
  removeImage: (index: number, e: React.MouseEvent) => void;
  dynamicChips: { label: string; prompt: string }[];
  signals: Signal[];
  isFetchingSignals: boolean;
  useNewsjack: boolean;
  isTeamMode: boolean;
  coworkerName: string;
  setCoworkerName: (val: string) => void;
  coworkerRole: string;
  setCoworkerRole: (val: string) => void;
  coworkerRelation: string;
  setCoworkerRelation: (val: string) => void;
  isDragActive: boolean;
  getRootProps: any;
  getInputProps: any;
  swarmMessages: SwarmMessage[];
  activeSwarmRole: string | null;
  isSwarmRunning: boolean;
  isAgenticRunning: boolean;
  starterChips: Array<{ label: string; icon: any; prompt: string }>;
  apiKey?: string;
  onCheckCliches?: (text: string) => void;
  mode: 'post' | 'reply'; // Added
  setMode: (mode: 'post' | 'reply') => void; // Added
}

export default function InputArea({
  input,
  setInput,
  images,
  removeImage,
  dynamicChips,
  signals,
  isFetchingSignals,
  useNewsjack,
  isTeamMode,
  coworkerName,
  setCoworkerName,
  coworkerRole,
  setCoworkerRole,
  coworkerRelation,
  setCoworkerRelation,
  isDragActive,
  getRootProps,
  getInputProps,
  swarmMessages,
  activeSwarmRole,
  isSwarmRunning,
  isAgenticRunning,
  starterChips,
  apiKey,
  onCheckCliches,
  mode,
  setMode,
}: InputAreaProps) {
  const [viralScore, setViralScore] = useState<ViralScore | null>(null);
  const [isScoring, setIsScoring] = useState(false);

  const checkViralScore = async () => {
    if (!input || !apiKey) return;
    setIsScoring(true);
    const service = new ViralService(apiKey);
    const score = await service.calculateViralScore(input);
    setViralScore(score);
    setIsScoring(false);
  };

  // local mode state removed (lifted)
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className={`relative flex flex-col transition-all duration-500 ease-in-out bg-white/[0.02] border border-white/[0.05] rounded-t-2xl ${isFocused || input.length > 200 ? 'min-h-[28rem]' : 'min-h-[12rem]'}`}>
      
      {/* MODE TOGGLE: Google Stitch Precision */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.03]">
        <div className="flex bg-white/[0.05] p-1 rounded-lg border border-white/[0.03]">
          <button 
            onClick={() => setMode('post')}
            className={`px-4 py-1.5 rounded-md text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-2 ${mode === 'post' ? 'bg-white text-black shadow-xl scale-[1.02]' : 'text-neutral-500 hover:text-neutral-300'}`}
          >
            <Sparkles className="w-3 h-3" />
            New Post
          </button>
          <button 
            onClick={() => setMode('reply')}
            className={`px-4 py-1.5 rounded-md text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-2 ${mode === 'reply' ? 'bg-white text-black shadow-xl scale-[1.02]' : 'text-neutral-500 hover:text-neutral-300'}`}
          >
            <Zap className="w-3 h-3" />
            High-Status Reply
          </button>
        </div>

        <div className="flex items-center gap-3">
            {viralScore && (
                <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className={`px-3 py-1 rounded-full text-[9px] font-black tracking-widest border ${viralScore.score > 80 ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'}`}
                >
                    SCORE: {viralScore.score}
                </motion.div>
            )}
            <div className="flex gap-1">
                <button 
                    onClick={checkViralScore}
                    disabled={!input || isScoring}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-500 hover:text-white transition-colors"
                >
                    {isScoring ? <span className="animate-spin block">↻</span> : <Target className="w-4 h-4" />}
                </button>
                <button 
                    onClick={() => onCheckCliches && onCheckCliches(input)}
                    disabled={!input}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-500 hover:text-white transition-colors"
                >
                    <Type className="w-4 h-4" />
                </button>
            </div>
        </div>
      </div>

        {/* TEAM MODE INPUTS */}
        {isTeamMode && (
           <div className="px-6 pt-4 pb-0 flex gap-3 animate-in fade-in slide-in-from-top-2">
              <div className="flex-1">
                 <label className="text-[10px] uppercase tracking-widest text-emerald-400 font-bold mb-1 block">Ghostwriting For</label>
                 <input 
                   type="text"
                   value={coworkerName}
                   onChange={(e) => setCoworkerName(e.target.value)}
                   placeholder="e.g. Sarah Chen"
                   className="w-full bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2 text-sm text-white placeholder-emerald-500/30 focus:border-emerald-500/50 outline-none"
                 />
              </div>
              <div className="flex-1">
                 <label className="text-[10px] uppercase tracking-widest text-emerald-400 font-bold mb-1 block">Their Role</label>
                 <input 
                   type="text"
                   value={coworkerRole}
                   onChange={(e) => setCoworkerRole(e.target.value)}
                   placeholder="e.g. VP Engineering"
                   className="w-full bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2 text-sm text-white placeholder-emerald-500/30 focus:border-emerald-500/50 outline-none"
                 />
              </div>
              <div className="flex-1">
                 <label className="text-[10px] uppercase tracking-widest text-emerald-400 font-bold mb-1 block">Context</label>
                 <input 
                   type="text"
                   value={coworkerRelation}
                   onChange={(e) => setCoworkerRelation(e.target.value)}
                   placeholder="e.g. I am her manager"
                   className="w-full bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2 text-sm text-white placeholder-emerald-500/30 focus:border-emerald-500/50 outline-none"
                 />
              </div>
           </div>
        )}

        {/* Dynamic Chips (Personalized) */}
        {dynamicChips.length > 0 && !input && (
          <div className="flex flex-wrap gap-2 mb-2 px-6 pt-4 z-20">
            {dynamicChips.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => setInput(chip.prompt)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-xs text-neutral-400 hover:text-white hover:border-white/20 transition-all"
              >
                <Sparkles className="w-3 h-3 text-amber-400" />
                {chip.label}
              </button>
            ))}
          </div>
        )}

        <div {...getRootProps()} className="relative flex-1 flex flex-col">
            <input {...getInputProps()} />
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={mode === 'post' ? "What's the strategic insight today?" : "Paste the thread or post you want to dismantle..."}
              className="w-full flex-1 bg-transparent text-white p-6 outline-none resize-none font-inter text-lg leading-relaxed z-10 peer placeholder:text-neutral-700"
            />
        </div>

        {/* Signals Area */}
        {useNewsjack && (signals.length > 0 || isFetchingSignals) && (
          <div className="px-6 pb-4 z-20">
            <div className="flex flex-wrap gap-2">
              {isFetchingSignals && (
                <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-white/5 border border-white/5 rounded text-[10px] text-neutral-400 animate-pulse">
                  <Zap className="w-3 h-3" /> Scanning...
                </span>
              )}
              {signals.map((s, i) => (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  key={i}
                  className="group/signal relative inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 hover:border-red-500/40 rounded-full cursor-help transition-colors"
                >
                  <Zap className="w-3 h-3 text-red-400" />
                  <span className="text-xs font-medium text-red-200">{s.value}</span>

                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-neutral-900 border border-white/10 rounded-lg shadow-xl opacity-0 group-hover/signal:opacity-100 pointer-events-none transition-opacity z-50">
                    <p className="text-[10px] text-neutral-500 uppercase tracking-widest">
                      {s.source}
                    </p>
                    <p className="text-xs text-white leading-tight mt-1 truncate">{s.url}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* SWARM COUNCIL DEBATE */}
        <SwarmConsole
          messages={swarmMessages}
          activeRole={activeSwarmRole}
          isVisible={isSwarmRunning || (isAgenticRunning && swarmMessages.length > 0)}
        />

        {/* Zen Start Experience (Empty State) */}
        {!input && images.length === 0 && (
          <div className="absolute inset-0 p-8 pb-20 pointer-events-none flex flex-col items-center justify-center text-center z-10 transition-all duration-700">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-8"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-white/10 to-transparent border border-white/10 rounded-2xl flex items-center justify-center shadow-2xl backdrop-blur-3xl overflow-hidden relative">
                 <div className="absolute inset-0 bg-white/5 animate-pulse" />
                 <Sparkles className="w-8 h-8 text-neutral-400" />
              </div>
            </motion.div>

            <h3 className="text-2xl font-bold text-white tracking-tight mb-2 selection:bg-white/30">
              The Command is Yours.
            </h3>
            <p className="text-neutral-500 text-sm max-w-sm leading-relaxed mb-12">
              Select a strategic objective or type a high-level command to begin the synthesis.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 max-w-2xl pointer-events-auto">
              {starterChips.map((chip, idx) => (
                <motion.button
                  key={chip.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setInput(chip.prompt);
                  }}
                  className="group relative flex items-center gap-3 px-6 py-3 bg-[#0A0A0A] border border-white/5 hover:border-white/20 rounded-xl text-[11px] font-black uppercase tracking-[0.15em] text-neutral-400 hover:text-white transition-all shadow-xl active:scale-95"
                >
                  <chip.icon className="w-4 h-4 text-neutral-500 group-hover:text-white transition-colors" />
                  {chip.label}
                  <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />
                </motion.button>
              ))}
            </div>

            <div className="mt-16 flex items-center gap-3 text-neutral-600 text-[10px] uppercase font-bold tracking-[0.2em] opacity-40 hover:opacity-100 transition-opacity cursor-pointer">
              <ImageIcon className="w-5 h-5" />
              <span>Drop vision assets to analysis layer</span>
            </div>
          </div>
        )}

        {/* Drag Overlay */}
        {isDragActive && (
          <div className="absolute inset-0 bg-indigo-500/10 backdrop-blur-sm flex items-center justify-center border-2 border-indigo-500 border-dashed rounded-xl z-20">
            <div className="text-center text-indigo-400 font-bold">
              <ImageIcon className="w-8 h-8 mx-auto mb-2" />
              <p>Drop to Analyze</p>
            </div>
          </div>
        )}

        {/* Image Previews */}
        {images.length > 0 && (
          <div className="px-6 pb-2 flex gap-2 z-20">
            {images.map((img, i) => (
              <div key={i} className="relative group/img">
                <img
                  src={img}
                  alt="Upload"
                  className="w-12 h-12 object-cover rounded-lg border border-white/20"
                />
                <button
                  onClick={(e) => removeImage(i, e)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover/img:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
    </div>
  );
}
