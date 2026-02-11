"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface Critique {
  id: string;
  range: [number, number]; // Start and End indices
  agent: 'SKEPTIC' | 'ARCHITECT' | 'CREATIVE';
  message: string;
}

interface LensOverlayProps {
  content: string;
  critiques: Critique[];
  activeLens: 'SKEPTIC' | 'ARCHITECT' | 'NONE';
}

export function LensOverlay({ content, critiques, activeLens }: LensOverlayProps) {
  if (activeLens === 'NONE') return null;

  // Filter critiques by active lens
  const relevantCritiques = critiques.filter(c => 
    (activeLens === 'SKEPTIC' && c.agent === 'SKEPTIC') ||
    (activeLens === 'ARCHITECT' && c.agent === 'ARCHITECT')
  );

  return (
    <div className="absolute inset-0 pointer-events-none select-none overflow-hidden p-8 font-serif text-xl leading-relaxed text-transparent whitespace-pre-wrap break-words">
      {/* This invisible div mirrors the text and renders underlines */}
      {content.split('').map((char, i) => {
        const critique = relevantCritiques.find(c => i >= c.range[0] && i < c.range[1]);
        
        return (
          <span key={i} className="relative">
            {char}
            {critique && (
              <motion.span 
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                className={`absolute bottom-0 left-0 w-full h-[2px] pointer-events-auto cursor-help ${
                  critique.agent === 'SKEPTIC' ? 'bg-red-500/60' : 'bg-blue-500/60'
                }`}
                title={critique.message}
              />
            )}
          </span>
        );
      })}
    </div>
  );
}
