/**
 * InputArea Component
 * -------------------
 * The interactive textarea with dropzone, signals, and personalized chips.
 * Extracted from StreamingConsole for maintainability.
 */

"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Zap, ImageIcon, X, Type } from "lucide-react";
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

  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className={`relative flex flex-col transition-all duration-300 ease-in-out ${isFocused || input.length > 200 ? 'min-h-[24rem]' : 'min-h-[8rem]'}`}>
      <div {...getRootProps()} className="relative flex-1 flex flex-col">
        <input {...getInputProps()} />

        {/* VIRAL SCORER */}
        <div className="absolute top-4 right-6 z-30 flex items-center gap-2">
            {viralScore && (
                <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className={`px-3 py-1 rounded-full text-xs font-bold border ${viralScore.score > 80 ? 'bg-green-500/20 border-green-500 text-green-400' : 'bg-yellow-500/20 border-yellow-500 text-yellow-400'}`}
                >
                    Viral Score: {viralScore.score}/100
                </motion.div>
            )}
            <button 
                onClick={checkViralScore}
                disabled={!input || isScoring}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
                title="Check Viral Score"
            >
                {isScoring ? <span className="animate-spin block">↻</span> : <Zap className="w-4 h-4" />}
            </button>
            
            {/* CLICHE CHECKER TRIGGER */}
             <button 
                onClick={() => onCheckCliches && onCheckCliches(input)}
                disabled={!input}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
                title="Cliche Killer"
            >
                <Type className="w-4 h-4" />
            </button>
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

        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder=" "
          className="w-full flex-1 bg-transparent text-white p-6 outline-none resize-none font-mono text-base leading-relaxed z-10 peer"
        />

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

        {/* Custom Empty State / Placeholder */}
        {!input && images.length === 0 && (
          <div className="absolute inset-0 p-6 pb-20 pointer-events-none flex flex-col gap-4 z-10">
            <p className="text-neutral-400 text-lg">What strategy are we building today?</p>
            <div className="flex flex-wrap gap-2 mt-2 pointer-events-auto">
              {starterChips.map((chip) => (
                <button
                  key={chip.label}
                  onClick={(e) => {
                    e.stopPropagation();
                    setInput(chip.prompt);
                  }}
                  className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-full text-xs text-neutral-300 hover:text-white transition-colors"
                >
                  <chip.icon className="w-3 h-3" />
                  {chip.label}
                </button>
              ))}
            </div>

            <div className="mt-auto mb-4 flex items-center gap-2 text-neutral-400 text-xs">
              <ImageIcon className="w-4 h-4" />
              <span>Drop images here to analyze</span>
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
    </div>
  );
}
