"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, X, Activity, Zap, Lightbulb } from "lucide-react";
import { applyTheme, AppTheme } from "../utils/theme-engine";

interface BoardroomModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BoardroomModal({ isOpen, onClose }: BoardroomModalProps) {
  const [voiceState, setVoiceState] = useState<'listening' | 'processing' | 'speaking'>('listening');
  const [theme, setTheme] = useState<AppTheme>('default');
  const [transcript, setTranscript] = useState("I'm listening. Define the strategic objective.");

  // Apply theme when it changes
  useEffect(() => {
    applyTheme(theme);
    // Reset to default on unmount
    return () => applyTheme('default');
  }, [theme]);

  // Simulate voice interaction loop
  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      // Random state switching for demo
      const states: ('listening' | 'processing' | 'speaking')[] = ['listening', 'processing', 'speaking'];
      const nextState = states[Math.floor(Math.random() * states.length)];
      setVoiceState(nextState);
      
      if (nextState === 'listening') setTranscript("...");
      if (nextState === 'processing') setTranscript("Analyzing market signals...");
      if (nextState === 'speaking') setTranscript("The data suggests a pivot to aggressive acquisition.");
      
    }, 4000);

    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl transition-colors duration-1000">
      <div className="absolute top-8 right-8 z-[70]">
        <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-all">
          <X className="w-8 h-8" />
        </button>
      </div>

      <div className="relative w-full max-w-4xl h-[80vh] flex flex-col items-center justify-center">
        
        {/* Generative UI Controls */}
        <div className="absolute top-0 flex gap-4 p-4 bg-white/5 rounded-full border border-white/10 backdrop-blur-md">
            <button 
                onClick={() => setTheme('default')}
                className={`p-2 rounded-full transition-all ${theme === 'default' ? 'bg-white text-black' : 'text-neutral-500 hover:text-white'}`}
            >
                <Activity className="w-4 h-4" />
            </button>
            <button 
                onClick={() => setTheme('crisis')}
                className={`p-2 rounded-full transition-all ${theme === 'crisis' ? 'bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.5)]' : 'text-neutral-500 hover:text-red-400'}`}
                title="Crisis Mode"
            >
                <Zap className="w-4 h-4" />
            </button>
            <button 
                onClick={() => setTheme('creative')}
                className={`p-2 rounded-full transition-all ${theme === 'creative' ? 'bg-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.5)]' : 'text-neutral-500 hover:text-indigo-400'}`}
                title="Creative Mode"
            >
                <Lightbulb className="w-4 h-4" />
            </button>
        </div>

        {/* The Liquid Orb */}
        <div className="relative w-64 h-64 mb-12 flex items-center justify-center">
            {/* Core Blob */}
            <div className={`absolute inset-0 rounded-full animate-liquid-blob transition-all duration-1000 blur-xl opacity-60
                ${theme === 'crisis' ? 'bg-red-600' : theme === 'creative' ? 'bg-indigo-400' : 'bg-white'}
            `} />
            
            {/* Inner Core */}
            <div className={`relative w-32 h-32 rounded-full animate-pulse blur-md transition-all duration-500
                ${voiceState === 'speaking' ? 'scale-125' : 'scale-100'}
                ${theme === 'crisis' ? 'bg-red-500' : theme === 'creative' ? 'bg-indigo-300' : 'bg-white'}
            `} />
        </div>

        {/* Transcript */}
        <motion.div 
            key={transcript}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-2xl px-4"
        >
            <h2 className={`text-4xl md:text-5xl font-bold tracking-tight mb-4 transition-colors duration-500
                ${theme === 'crisis' ? 'text-red-500 font-mono' : 'text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60'}
            `}>
                {transcript}
            </h2>
            <p className="text-sm font-mono text-white/40 uppercase tracking-[0.2em]">{voiceState}</p>
        </motion.div>

        {/* Mic Indicator */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2">
            <div className={`p-6 rounded-full border transition-all duration-500
                 ${voiceState === 'listening' ? 'border-white/50 bg-white/10 scale-110' : 'border-white/10 bg-transparent scale-100'}
            `}>
                <Mic className="w-6 h-6 text-white" />
            </div>
        </div>

      </div>
    </div>
  );
}
