"use client";

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Zap } from 'lucide-react';

interface TestCertificateProps {
  isOpen: boolean;
  onClose: () => void;
  hashId: string;
  timestamp: number;
}

const STIFF_SPRING = { stiffness: 400, damping: 30 };

export function TestCertificate({ isOpen, onClose, hashId, timestamp }: TestCertificateProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const dateStr = new Date(timestamp).toLocaleString('en-GB', { hour12: false });

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
            onClick={onClose}
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={STIFF_SPRING}
            className="relative w-full max-w-md bg-[#16181D]/80 border border-white/10 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-xl"
          >
            {/* Header / Seal */}
            <div className="p-8 pb-4 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-[#C53030]/10 border border-[#C53030]/20 rounded-full flex items-center justify-center mb-6">
                <ShieldCheck size={32} className="text-[#C53030]" />
              </div>
              <h2 className="text-xl font-serif font-bold text-white mb-2 uppercase tracking-tight">Actuation Certificate</h2>
              <p className="text-[10px] text-[#8A8D91] font-mono uppercase tracking-[0.2em]">Sovereign Output Protocol // Phase 13</p>
            </div>

            {/* Data Block */}
            <div className="px-8 py-6 bg-black/40 border-y border-white/5 space-y-4">
              <div className="flex justify-between items-center group">
                <span className="text-[9px] font-bold text-[#4A4E54] uppercase tracking-widest">Protocol Hash</span>
                <span className="text-[10px] font-mono text-[#C53030] tracking-wider select-all">{hashId}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[9px] font-bold text-[#4A4E54] uppercase tracking-widest">Timestamp</span>
                <span className="text-[10px] font-mono text-white tracking-wider">{dateStr}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[9px] font-bold text-[#4A4E54] uppercase tracking-widest">Signatory</span>
                <span className="text-[10px] font-mono text-white tracking-wider italic">Sebastian // StrategyOS</span>
              </div>
            </div>

            {/* Signature Area */}
            <div className="p-8 space-y-6">
              <div className="border-b border-white/20 text-center pb-2">
                 <span className="text-[10px] font-serif text-white/40 italic">digital signature recorded</span>
              </div>
              <button
                onClick={onClose}
                className="w-full py-3 bg-white text-black text-[10px] font-bold uppercase tracking-widest hover:bg-[#C53030] hover:text-white transition-all rounded-lg"
              >
                Archive to Ledger
              </button>
            </div>

            {/* Background Texture */}
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
               <Zap size={160} className="text-white" />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.getElementById('canvas-overlay-portal') || document.body
  );
}
