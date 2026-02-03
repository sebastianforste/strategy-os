
"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Flame, AlertTriangle, CheckCircle, X, ThumbsDown, ThumbsUp } from "lucide-react";
import { simulateAudience, RoastResult } from "../utils/audience-simulator";
import AnimatedModal from "./AnimatedModal";

interface RoastModalProps {
  isOpen: boolean;
  onClose: () => void;
  postContent: string;
  apiKey: string;
}

export default function RoastModal({ isOpen, onClose, postContent, apiKey }: RoastModalProps) {
  const [result, setResult] = useState<RoastResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (isOpen && postContent) {
      handleRoast();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleRoast = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await simulateAudience(postContent, apiKey);
      if (res.score === 0 && res.critique[0]?.includes("Failed")) {
         throw new Error("API Failed");
      }
      setResult(res);
    } catch (e) {
      console.error(e);
      setError("Roast failed (API Quote or Network). Try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatedModal isOpen={isOpen} onClose={onClose} title="Audience Simulator">
      <div className="bg-neutral-900/80 backdrop-blur-2xl border border-white/10 rounded-3xl w-full max-w-lg overflow-hidden relative shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)]">
        
        {/* Glow Effect */}
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-red-600/10 blur-[100px] pointer-events-none" />

        {/* Header */}
        <div className="p-6 bg-gradient-to-b from-red-500/10 to-transparent border-b border-white/5 flex items-center justify-between">
           <div className="flex items-center gap-3">
             <div className="bg-red-500/20 p-2.5 rounded-xl border border-red-500/20 shadow-lg shadow-red-500/10">
                <Flame className="w-5 h-5 text-red-500" />
             </div>
             <div>
               <h3 className="text-lg font-black text-white tracking-tight">Roast My Post</h3>
               <p className="text-[10px] font-mono text-red-400/60 uppercase tracking-widest">Simulating Skeptical CTO...</p>
             </div>
           </div>
           <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
              <X className="w-5 h-5 text-neutral-500 hover:text-white" />
           </button>
        </div>

        {/* Content */}
        <div className="p-8 min-h-[340px] flex flex-col justify-center">
            {isLoading && (
               <div className="text-center space-y-4">
                  <div className="relative w-16 h-16 mx-auto">
                    <div className="absolute inset-0 border-4 border-red-500/10 rounded-full" />
                    <div className="absolute inset-0 border-4 border-t-red-600 rounded-full animate-spin" />
                  </div>
                  <p className="text-[10px] font-mono tracking-[0.3em] text-red-500/80 animate-pulse">ANALYZING CRINGE...</p>
               </div>
            )}

            {error && (
                <div className="text-center p-6 border border-red-500/20 rounded-2xl bg-red-500/5 backdrop-blur-sm">
                    <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-3" />
                    <p className="text-sm text-red-200 font-medium">{error}</p>
                    <button onClick={handleRoast} className="mt-4 text-xs font-bold text-red-400 hover:text-red-300 underline underline-offset-4">Retry Simulation</button>
                </div>
            )}

            {!isLoading && result && (
                <div className="space-y-8">
                    {/* Score Ring */}
                    <div className="relative py-4 flex flex-col items-center">
                        <div className={`text-7xl font-black italic tracking-tighter mb-1 ${result.score > 7 ? "text-white" : result.score < 4 ? "text-red-500" : "text-yellow-500"}`}>
                            {result.score}<span className="text-2xl opacity-30 not-italic">/10</span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10">
                             {result.verdict === "Publish" ? <ThumbsUp className="w-3.5 h-3.5 text-green-400" /> : <ThumbsDown className="w-3.5 h-3.5 text-red-400" />}
                             <span className="text-[10px] font-black uppercase tracking-tighter text-white">{result.verdict}</span>
                        </div>
                    </div>

                    {/* Critique Cards */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 mb-1">
                           <div className="h-px flex-1 bg-white/5" />
                           <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest whitespace-nowrap">Fatal Flaws & Feedback</span>
                           <div className="h-px flex-1 bg-white/5" />
                        </div>
                        <div className="grid gap-2">
                           {result.critique.map((point, i) => (
                               <motion.div 
                                 key={i} 
                                 initial={{ opacity: 0, x: -10 }}
                                 animate={{ opacity: 1, x: 0 }}
                                 transition={{ delay: i * 0.1 }}
                                 className="flex items-start gap-3 p-3 bg-white/[0.03] border border-white/5 rounded-xl hover:bg-white/[0.05] transition-colors group"
                               >
                                   <div className="w-1 h-1 rounded-full bg-red-500 mt-2 shrink-0 group-hover:scale-150 transition-transform" />
                                   <p className="text-sm text-neutral-300 leading-relaxed font-medium">
                                       {point}
                                   </p>
                               </motion.div>
                           ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
      </div>
    </AnimatedModal>
  );
}
