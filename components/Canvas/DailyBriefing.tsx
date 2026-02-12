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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[rgba(8,10,15,0.94)] p-6 backdrop-blur-sm">
      <div className="relative w-full max-w-lg">
        <button 
          onClick={onClose}
          aria-label="Close daily briefing"
          className="absolute -top-16 right-0 rounded-lg border border-white/10 bg-[rgba(16,20,28,0.9)] p-2 text-[var(--stitch-text-secondary,#8A8D91)] transition-colors hover:border-white/20 hover:text-white"
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
            className="relative overflow-hidden rounded-[var(--stitch-radius-panel,1.25rem)] border border-[var(--stitch-border,#24282D)] bg-[rgba(16,20,28,0.95)] p-8 shadow-[var(--stitch-elevation-high,0_24px_80px_rgba(0,0,0,0.58))] md:p-12"
          >
            {/* Minimalist Mask instead of Glassmorphism */}
            <div className="absolute right-0 top-0 h-32 w-1 bg-[var(--stitch-accent,#7c3bed)]/70" />
            
            <div className="flex items-center gap-4 mb-10">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[var(--stitch-border,#24282D)]/70">
                {SLIDES[currentSlide].icon}
              </div>
              <div>
                <h3 className="text-[10px] font-mono uppercase tracking-[0.4em] text-[var(--stitch-text-secondary,#8A8D91)]">Briefing</h3>
                <h4 className="text-lg font-serif font-bold text-white tracking-tight">{SLIDES[currentSlide].title}</h4>
              </div>
            </div>

            <p className="mb-12 text-xl font-serif leading-relaxed text-[var(--stitch-text-primary,#E1E1E1)]">
              {SLIDES[currentSlide].content}
            </p>

            {SLIDES[currentSlide].stats && (
              <div className="mb-12">
                <span className="text-[9px] font-mono font-bold uppercase tracking-[0.3em] text-[var(--stitch-accent,#7c3bed)]">{SLIDES[currentSlide].stats}</span>
              </div>
            )}

            <button 
              onClick={next}
              className="w-full rounded-xl bg-white py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-black transition-colors hover:bg-[var(--stitch-accent,#7c3bed)] hover:text-white"
            >
              {SLIDES[currentSlide].action || 'Acknowledge'}
            </button>

            {/* Pagination Links */}
            <div className="flex justify-center gap-2 mt-8">
              {SLIDES.map((_, i) => (
                <div 
                  key={i} 
                  className={`h-1 rounded-full transition-all ${i === currentSlide ? 'w-8 bg-white' : 'w-2 bg-[var(--stitch-border,#24282D)]'}`} 
                />
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
