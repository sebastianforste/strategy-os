"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Layers, ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';
import rawTheme from '../../theme.json';
import type { StrategyTheme } from '@/types/theme';

const theme = rawTheme as StrategyTheme;

export interface CarouselSlide {
  id: string;
  title: string;
  body: string;
  visualCue?: string;
}

export interface CarouselAsset {
  topic: string;
  slides: CarouselSlide[];
  totalSlides: number;
  style: 'STRATEGIST' | 'PROVOCATEUR' | 'FOUNDER';
}

interface VisualAlchemistProps {
  content: string;
}

export function VisualAlchemist({ content }: VisualAlchemistProps) {
  const [asset, setAsset] = useState<CarouselAsset | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-trigger detection logic (3+ bullets)
  useEffect(() => {
    const bulletCount = (content.match(/\n- /g) || []).length;
    const numberedCount = (content.match(/\n\d\. /g) || []).length;

    if ((bulletCount >= 3 || numberedCount >= 3) && !asset && !isGenerating) {
      triggerGeneration();
    }
  }, [content]);

  const triggerGeneration = async () => {
    setIsGenerating(true);
    // Simulate AI Generation delay
    setTimeout(() => {
      const mockAsset: CarouselAsset = {
        topic: "Carousel Generation",
        totalSlides: 5,
        style: 'STRATEGIST',
        slides: [
          { id: '1', title: 'The Death of Context', body: 'Why high-status writing is moving to atomic visuals.' },
          { id: '2', title: '01. Attention Scarcity', body: 'The average reader spends 1.2 seconds on a text block.' },
          { id: '3', title: '02. Visual Anchoring', body: 'Images are processed 60,000x faster than text.' },
          { id: '4', title: '03. The StrategyOS Edge', body: 'Automating high-status carousels from raw notes.' },
          { id: '5', title: 'Final Thought', body: 'Don’t write more. Visualize better.' }
        ]
      };
      setAsset(mockAsset);
      setIsGenerating(false);
    }, 2000);
  };

  if (isGenerating) {
    return (
      <div className="p-6 bg-[#16181D] border border-[#24282D] rounded-xl flex flex-col items-center gap-4">
        <Loader2 className="animate-spin text-white w-6 h-6" />
        <span className="text-[10px] font-mono text-[#8A8D91] uppercase tracking-[0.2em] animate-pulse">
          Synthesizing Carousel...
        </span>
      </div>
    );
  }

  if (!asset) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <Layers size={14} className="text-[#8A8D91]" />
          <span className="text-[10px] font-mono text-[#8A8D91] uppercase tracking-widest">
            Visual Alchemist
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Sparkles size={10} className="text-amber-500" />
          <span className="text-[9px] text-amber-500 font-bold uppercase tracking-tighter">Draft Ready</span>
        </div>
      </div>

      <div className="relative aspect-[4/5] w-full group">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, scale: 0.9, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 1.1, x: -20 }}
            className="absolute inset-0 rounded-xl p-8 flex flex-col shadow-2xl border border-white/5 overflow-hidden"
            style={{ 
              background: asset.style === 'STRATEGIST' 
                ? `linear-gradient(to bottom right, ${theme.theme.colors.surface}, ${theme.theme.colors.background})` 
                : theme.theme.colors.accent 
            }}
          >
            {/* Slide Content */}
            <div className="flex-1 flex flex-col justify-center gap-6">
              <h3 
                className={`text-2xl font-serif leading-tight ${asset.style === 'STRATEGIST' ? 'text-white' : 'text-black font-black uppercase'}`}
                style={asset.style !== 'STRATEGIST' ? { color: theme.theme.colors.text.contrast } : {}}
              >
                {asset.slides[currentIndex].title}
              </h3>
              <p 
                className={`text-sm leading-relaxed opacity-70 ${asset.style === 'STRATEGIST' ? 'text-[#E1E1E1]' : 'text-black font-bold'}`}
              >
                {asset.slides[currentIndex].body}
              </p>
            </div>

            {/* Pagination/Controls */}
            <div className="flex items-center justify-between mt-auto pt-6 border-t border-white/10">
              <span className="text-[10px] font-mono text-[#8A8D91]">
                {currentIndex + 1} / {asset.totalSlides}
              </span>
              <div className="flex gap-2">
                <button 
                  disabled={currentIndex === 0}
                  onClick={() => setCurrentIndex(prev => prev - 1)}
                  className="p-1.5 hover:bg-white/5 rounded-full transition-colors disabled:opacity-20"
                >
                  <ChevronLeft size={16} />
                </button>
                <button 
                  disabled={currentIndex === asset.totalSlides - 1}
                  onClick={() => setCurrentIndex(prev => prev + 1)}
                  className="p-1.5 hover:bg-white/5 rounded-full transition-colors disabled:opacity-20"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            {/* Backdrop Accents */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-full pointer-events-none" />
          </motion.div>
        </AnimatePresence>
      </div>

      <button className="w-full py-2.5 bg-white text-black rounded font-bold text-[10px] uppercase tracking-widest hover:bg-gray-200 transition-colors">
        Export to LinkedIn Carousel
      </button>
    </div>
  );
}
