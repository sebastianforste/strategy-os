"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, BarChart3, Rocket, X } from 'lucide-react';

interface DailyBriefingProps {
  onInitialize: (data: any) => void;
  onClose: () => void;
}

const SLIDES = [
  {
    id: 'pulse',
    title: 'Market Pulse',
    icon: <TrendingUp className="text-amber-500" />,
    content: '3 major trends detected in the Strategy sector. "AI fatigue" is peaking among executives. Opportunity: Counter-narrative on "Human-Agent Orchestration".',
    stats: 'Reach Potential: 120k+'
  },
  {
    id: 'performance',
    title: 'Visual Performance',
    icon: <BarChart3 className="text-emerald-500" />,
    content: 'Your "Sovereign Systems" post is trending. Engagement is up 24% compared to sector average. 12 New high-intent followers.',
    stats: 'Authority Score: 88/100'
  },
  {
    id: 'mission',
    title: 'Daily Mission',
    icon: <Rocket className="text-blue-500" />,
    content: 'Ready to execute tactical strategy? Today\'s goal: Bridge the gap between RAG-based systems and agentic autonomous execution.',
    action: 'Initialize Neural Uplink'
  }
];

const STIFF_SPRING = { stiffness: 400, damping: 30 };

export function DailyBriefing({ onInitialize, onClose }: DailyBriefingProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const next = () => {
    if (currentSlide < SLIDES.length - 1) {
      setCurrentSlide(s => s + 1);
    } else {
      onInitialize({ trends: ['AI Fatigue', 'Human-Agent Orchestration'] });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0F1115]/95 p-6">
      <div className="relative w-full max-w-lg">
        <button 
          onClick={onClose}
          className="absolute -top-16 right-0 p-2 text-[#4A4E54] hover:text-white transition-colors"
        >
          <X size={20} />
        </button>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={STIFF_SPRING}
            className="bg-[#16181D] border border-[#24282D] rounded-lg p-12 shadow-[0_0_80px_rgba(0,0,0,0.5)] relative overflow-hidden"
          >
            {/* Minimalist Mask instead of Glassmorphism */}
            <div className="absolute top-0 right-0 w-1 h-32 bg-emerald-500/50" />
            
            <div className="flex items-center gap-4 mb-10">
              <div className="w-10 h-10 bg-[#24282D] flex items-center justify-center">
                {SLIDES[currentSlide].icon}
              </div>
              <div>
                <h3 className="text-[10px] font-mono text-[#4A4E54] uppercase tracking-[0.4em]">Briefing</h3>
                <h4 className="text-lg font-serif font-bold text-white tracking-tight">{SLIDES[currentSlide].title}</h4>
              </div>
            </div>

            <p className="text-xl text-[#E1E1E1] font-serif leading-relaxed mb-12">
              {SLIDES[currentSlide].content}
            </p>

            {SLIDES[currentSlide].stats && (
              <div className="mb-12">
                <span className="text-[9px] font-mono text-emerald-500 uppercase tracking-[0.3em] font-bold">{SLIDES[currentSlide].stats}</span>
              </div>
            )}

            <button 
              onClick={next}
              className="w-full py-5 bg-white text-black text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-emerald-400 transition-colors"
            >
              {SLIDES[currentSlide].action || 'Acknowledge'}
            </button>

            {/* Pagination Links */}
            <div className="flex justify-center gap-2 mt-8">
              {SLIDES.map((_, i) => (
                <div 
                  key={i} 
                  className={`h-1 rounded-full transition-all ${i === currentSlide ? 'bg-white w-8' : 'bg-[#24282D] w-2'}`} 
                />
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
