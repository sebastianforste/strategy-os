"use client";

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Share2, Award, Zap, Heart, TrendingUp } from 'lucide-react';
import { useSoundEngine } from '@/hooks/useSoundEngine';

interface SovereignModalProps {
  isOpen: boolean;
  onClose: () => void;
  steppsData?: {
    socialCurrency: number;
    triggers: number;
    emotion: number;
    public: number;
    practicalValue: number;
    stories: number;
  };
}

const STIFF_SPRING = { stiffness: 400, damping: 30 };

const RadarChart = ({ data }: { data: number[] }) => {
  const size = 160;
  const center = size / 2;
  const radius = center * 0.8;
  const angleStep = (Math.PI * 2) / data.length;

  const points = data.map((val, i) => {
    const r = (val / 100) * radius;
    const x = center + r * Math.cos(i * angleStep - Math.PI / 2);
    const y = center + r * Math.sin(i * angleStep - Math.PI / 2);
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width={size} height={size} className="overflow-visible">
      {/* Background Rings */}
      {[0.5, 1].map((scale) => (
        <circle 
          key={scale}
          cx={center} 
          cy={center} 
          r={radius * scale} 
          fill="none" 
          stroke="#24282D" 
          strokeWidth="1" 
        />
      ))}
      {/* Spider Lines */}
      {data.map((_, i) => {
        const x = center + radius * Math.cos(i * angleStep - Math.PI / 2);
        const y = center + radius * Math.sin(i * angleStep - Math.PI / 2);
        return (
          <line 
            key={i}
            x1={center} y1={center} x2={x} y2={y} 
            stroke="#24282D" 
            strokeWidth="1" 
          />
        );
      })}
      {/* Data Polygon */}
      <motion.polygon
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={STIFF_SPRING}
        points={points}
        fill="rgba(197, 48, 48, 0.2)"
        stroke="#C53030"
        strokeWidth="2"
      />
    </svg>
  );
};

export function SovereignModal({ isOpen, onClose, steppsData }: SovereignModalProps) {
  const { play } = useSoundEngine();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (isOpen) {
      play('HARMONIC_MAJOR_CHORD');
    }
  }, [isOpen]);

  const defaultData = [85, 72, 94, 68, 90, 88]; // Mock STEPPS scores
  const scoreData = steppsData ? Object.values(steppsData) : defaultData;

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-[#000000]/80 backdrop-blur-[24px]"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={STIFF_SPRING}
            className="w-full max-w-2xl bg-[#0F1115] border border-[#24282D] p-16 relative overflow-hidden"
          >
            {/* Massive Kinetic Background Text */}
            <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center pointer-events-none opacity-[0.03]">
              <motion.h1 
                initial={{ scale: 1.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-white text-[240px] font-black tracking-tighter"
              >
                PUBLISHED
              </motion.h1>
            </div>

            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-[#C53030] flex items-center justify-center mb-8">
                <Check size={32} className="text-white" />
              </div>

              <div className="flex flex-col items-center mb-4">
                <span className="text-[10px] font-bold text-[#C53030] uppercase tracking-[0.5em] mb-2">Sovereign Creator</span>
                <span className="text-2xl font-sans font-black text-white uppercase tracking-tighter">Sebastian</span>
              </div>

              <h2 className="text-4xl font-sans font-black text-white mb-2 tracking-tighter uppercase">Authority Established.</h2>
              <p className="text-[#8A8D91] mb-12 uppercase tracking-[0.4em] text-[10px] font-mono">Thought leadership index: 96th Percentile</p>

              <div className="grid grid-cols-2 gap-12 text-left w-full mb-12">
                <div className="flex flex-col items-center justify-center border-r border-[#24282D]">
                  <RadarChart data={scoreData} />
                  <span className="mt-4 text-[9px] font-mono text-[#C53030] uppercase tracking-widest">STEPPS Intelligence</span>
                </div>
                
                <div className="flex flex-col justify-center space-y-6">
                  <div className="flex items-center gap-3">
                      <Zap size={16} className="text-amber-500" />
                      <div>
                        <p className="text-xs text-white font-bold">High Triggers</p>
                        <p className="text-[10px] text-[#4A4E54]">Contextually aligned with morning peak traffic.</p>
                      </div>
                  </div>
                  <div className="flex items-center gap-3">
                      <Heart size={16} className="text-rose-500" />
                      <div>
                        <p className="text-xs text-white font-bold">Emotional Resonance</p>
                        <p className="text-[10px] text-[#4A4E54]">Hook triggers "Awe" and "Anxiety" response.</p>
                      </div>
                  </div>
                  <div className="flex items-center gap-3">
                      <TrendingUp size={16} className="text-blue-500" />
                      <div>
                        <p className="text-xs text-white font-bold">Viral Propagation</p>
                        <p className="text-[10px] text-[#4A4E54]">Optimized for LinkedIn's 2nd-degree distribution.</p>
                      </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 w-full">
                <button 
                  onClick={onClose}
                  className="flex-1 py-4 bg-white text-black font-bold text-[10px] uppercase tracking-[0.2em] transition-colors"
                >
                  Return to Studio
                </button>
                <button className="p-4 bg-[#16181D] border border-[#24282D] text-white hover:text-[#C53030] transition-colors">
                  <Share2 size={20} />
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.getElementById('canvas-overlay-portal') || document.body
  );
}
