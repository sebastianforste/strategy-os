"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dna, Fingerprint, Sparkles, Upload } from 'lucide-react';

export function VoiceTrainer() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [dnaExtracted, setDnaExtracted] = useState(false);

  const startAnalysis = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      setDnaExtracted(true);
    }, 4000);
  };

  return (
    <div className="p-4 bg-[#24282D]/30 border border-[#24282D] rounded-2xl relative overflow-hidden group">
      <AnimatePresence mode="wait">
        {!isAnalyzing && !dnaExtracted ? (
          <motion.div 
            key="id-idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-6 flex flex-col items-center justify-center text-center space-y-4"
          >
            <div className="w-12 h-12 rounded-full bg-[#16181D] flex items-center justify-center border border-white/5 text-[#8A8D91] group-hover:text-emerald-400 transition-colors">
              <Upload size={20} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-widest">Voice Studio 2.0</h4>
              <p className="text-[9px] text-[#8A8D91] mt-1 uppercase font-mono italic">Drop posts to extract DNA</p>
            </div>
            <button 
              onClick={startAnalysis}
              className="px-4 py-1.5 bg-white/5 border border-white/10 rounded-full text-[9px] font-bold text-white uppercase hover:bg-white/10 transition-colors"
            >
              Analyze Style
            </button>
          </motion.div>
        ) : isAnalyzing ? (
          <motion.div 
            key="id-analyzing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-12 flex flex-col items-center"
          >
            <DnaAnimation />
            <h4 className="text-[10px] font-mono text-emerald-400 uppercase tracking-[0.3em] animate-pulse mt-8">Synthesizing DNA...</h4>
          </motion.div>
        ) : (
          <motion.div 
            key="id-done"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="py-6 flex flex-col items-center text-center space-y-4"
          >
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 text-emerald-500">
              <Fingerprint size={24} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-widest">Founder DNA Extracted</h4>
              <div className="mt-2 flex gap-1 justify-center">
                <span className="px-2 py-0.5 bg-emerald-500/10 text-[8px] text-emerald-500 rounded-full border border-emerald-500/20">Complex Rhythm</span>
                <span className="px-2 py-0.5 bg-emerald-500/10 text-[8px] text-emerald-500 rounded-full border border-emerald-500/20">Executive Tone</span>
              </div>
            </div>
            <button 
               onClick={() => setDnaExtracted(false)}
               className="text-[9px] text-[#8A8D91] uppercase hover:text-white underline underline-offset-4"
            >
              Update Model
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DnaAnimation() {
  return (
    <div className="relative flex gap-2">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="flex flex-col gap-4">
          <motion.div 
            animate={{ 
              y: [0, 40, 0],
              backgroundColor: ['#10B981', '#3B82F6', '#10B981']
            }}
            transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
            className="w-1.5 h-1.5 rounded-full"
          />
          <motion.div 
            animate={{ 
              y: [0, -40, 0],
              backgroundColor: ['#3B82F6', '#10B981', '#3B82F6']
            }}
            transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
            className="w-1.5 h-1.5 rounded-full"
          />
        </div>
      ))}
    </div>
  );
}
