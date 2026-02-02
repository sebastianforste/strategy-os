/**
 * InputArea Component
 * -------------------
 * The interactive textarea with dropzone, signals, and personalized chips.
 * Extracted from StreamingConsole for maintainability.
 */

"use client";

import React from "react";
import { motion } from "framer-motion";
import { Sparkles, Zap, ImageIcon, X } from "lucide-react";
import { Signal } from "../../utils/signal-service";
import SwarmConsole from "../SwarmConsole";
import { SwarmMessage } from "../../utils/swarm-service";

export interface InputAreaProps {
  input: string;
  setInput: (val: string) => void;
  images: string[];
  removeImage: (index: number, e: React.MouseEvent) => void;
  dynamicChips: { label: string; prompt: string }[];
  signals: Signal[];
  isFetchingSignals: boolean;
  useNewsjack: boolean;
  isDragActive: boolean;
  getRootProps: any;
  getInputProps: any;
  swarmMessages: SwarmMessage[];
  activeSwarmRole: string | null;
  isSwarmRunning: boolean;
  isAgenticRunning: boolean;
  starterChips: Array<{ label: string; icon: any; prompt: string }>;
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
  isDragActive,
  getRootProps,
  getInputProps,
  swarmMessages,
  activeSwarmRole,
  isSwarmRunning,
  isAgenticRunning,
  starterChips,
}: InputAreaProps) {
  return (
    <div className="relative flex flex-col min-h-[16rem]">
      <div {...getRootProps()} className="relative flex-1 flex flex-col">
        <input {...getInputProps()} />

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
