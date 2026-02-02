"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Radio, Zap, X, ArrowRight, Activity, Bell, MessageSquare } from "lucide-react";
import { scanForSignals, Signal } from "../utils/ghost-service";

interface InterceptionPanelProps {
  onIntercept: (signal: Signal) => void;
  onComment?: (signal: Signal) => void;
  apiKey?: string;
}

export default function InterceptionPanel({ onIntercept, onComment, apiKey }: InterceptionPanelProps) {
  const [isActive, setIsActive] = useState(false);
  const [activeSignal, setActiveSignal] = useState<Signal | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanCount, setScanCount] = useState(0);

  // Auto-scan effect (simulated background agent)
  useEffect(() => {
    if (!isActive || !apiKey) return;

    const interval = setInterval(async () => {
      setIsScanning(true);
      setScanCount(c => c + 1);
      
      const signal = await scanForSignals(apiKey);
      if (signal) {
        setActiveSignal(signal);
      }
      
      setTimeout(() => setIsScanning(false), 1000);
    }, 15000); // Scan every 15 seconds to prevent rate limits

    return () => clearInterval(interval);
  }, [isActive, apiKey]);

  return (
    <div className="fixed bottom-8 right-8 z-30 flex flex-col items-end gap-4 pointer-events-none">
      
      {/* Alert Card */}
      <AnimatePresence>
        {activeSignal && (
          <motion.div
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 50, scale: 0.9 }}
            className="pointer-events-auto bg-black border border-red-500/50 rounded-xl p-0 w-80 shadow-[0_0_50px_rgba(220,38,38,0.2)] overflow-hidden"
          >
             <div className="bg-red-500/10 px-4 py-2 flex items-center justify-between border-b border-red-500/20">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    <span className="text-red-400 text-xs font-bold uppercase tracking-wider">Signal Intercepted</span>
                </div>
                <button 
                    onClick={() => setActiveSignal(null)}
                    className="text-red-400/50 hover:text-red-400"
                >
                    <X className="w-4 h-4" />
                </button>
             </div>
             <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                    <span className="text-[10px] font-mono text-neutral-500 uppercase border border-neutral-800 px-1.5 py-0.5 rounded">{activeSignal.source}</span>
                    <span className="text-[10px] font-mono text-green-500">{activeSignal.velocity}</span>
                </div>
                <h4 className="text-white font-bold text-sm leading-tight mb-2">{activeSignal.topic}</h4>
                <p className="text-neutral-400 text-xs leading-relaxed mb-4">{activeSignal.summary}</p>
                
                <div className="bg-neutral-900/50 rounded p-3 border-l-2 border-indigo-500 mb-4">
                    <p className="text-[10px] text-indigo-300 font-mono leading-tight">
                        <span className="font-bold opacity-70">ANGLE:</span> {activeSignal.suggestedAngle}
                    </p>
                </div>

                <button 
                    onClick={() => {
                        onIntercept(activeSignal);
                        setActiveSignal(null);
                    }}
                    className="w-full py-2 bg-white text-black font-bold text-xs rounded hover:bg-neutral-200 transition-colors flex items-center justify-center gap-2"
                >
                    <Zap className="w-3 h-3 fill-current" /> DRAFT TAKE (2 MINS)
                </button>

                <button 
                    onClick={() => {
                        if (onComment) onComment(activeSignal);
                        setActiveSignal(null);
                    }}
                    className="w-full mt-2 py-2 bg-neutral-800 text-white border border-white/10 font-bold text-xs rounded hover:bg-neutral-700 transition-colors flex items-center justify-center gap-2"
                >
                    <MessageSquare className="w-3 h-3" /> REPLY AS STRATEGIST
                </button>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Control Pill */}
      <div className="pointer-events-auto bg-neutral-900/90 backdrop-blur-md border border-white/10 p-2 rounded-full flex items-center gap-3 shadow-2xl hover:bg-neutral-900 transition-colors group cursor-pointer"
           onClick={() => setIsActive(!isActive)}
      >
        <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${isActive ? "bg-green-500/20 text-green-500" : "bg-neutral-800 text-neutral-500"}`}>
             <Radio className={`w-4 h-4 ${isActive && isScanning ? "animate-ping absolute opacity-50" : ""}`} />
             <Radio className="w-4 h-4 relative z-10" />
        </div>
        <div className="flex flex-col pr-2">
            <span className={`text-xs font-bold transition-colors ${isActive ? "text-white" : "text-neutral-500"}`}>
                GHOST MODE
            </span>
            <span className="text-[10px] font-mono text-neutral-600">
                {isActive ? (isScanning ? "SCANNING..." : "ACTIVE") : "OFFLINE"}
            </span>
        </div>
        
        {isActive && (
            <div className="w-px h-6 bg-white/10 mx-1" />
        )}
        
        {isActive && (
             <div className="flex items-center gap-2 pr-2">
                <Activity className="w-3 h-3 text-neutral-500" />
                <span className="text-[10px] font-mono text-neutral-500">{scanCount} PINGS</span>
             </div>
        )}
      </div>
    </div>
  );
}
