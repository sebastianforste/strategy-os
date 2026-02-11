"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const STEPS = [
  "Scanning Source...",
  "Extracting Contrarian Angle...",
  "Applying Voice Filter...",
  "Injecting High-Status Verbs...",
  "Optimizing for LinkedIn Algorithm...",
  "Ready for Orchestration."
];

export function StatusTicker({ isActive }: { isActive: boolean }) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!isActive) {
      setStep(0);
      return;
    }

    const interval = setInterval(() => {
      setStep((s) => (s < STEPS.length - 1 ? s + 1 : s));
    }, 1200);

    return () => clearInterval(interval);
  }, [isActive]);

  return (
    <div className="h-6 flex items-center px-4 bg-[#16181D] border-t border-[#24282D]">
      <AnimatePresence mode="wait">
        {isActive && (
          <motion.div
            key={STEPS[step]}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-2"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[9px] font-mono text-[#8A8D91] uppercase tracking-widest">
              {STEPS[step]}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
