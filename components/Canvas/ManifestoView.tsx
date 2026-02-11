"use client";

import React from 'react';
import { motion } from 'framer-motion';

interface ManifestoViewProps {
  content: string;
  onClose: () => void;
}

const STIFF_SPRING = { stiffness: 400, damping: 30 };

export function ManifestoView({ content, onClose }: ManifestoViewProps) {
  // Simple paragraph splitter
  const paragraphs = content.split('\n\n').filter(p => p.trim());

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={STIFF_SPRING}
      className="fixed inset-0 z-[150] bg-white text-black overflow-y-auto"
    >
      <div className="min-h-screen py-24 px-8 md:px-24 max-w-7xl mx-auto border-x border-black/5">
        <button 
          onClick={onClose}
          className="fixed top-8 left-8 text-[10px] font-bold uppercase tracking-[0.2em] border-b-2 border-black pb-1"
        >
          Close Manifesto
        </button>

        <div className="grid grid-cols-12 gap-12">
          {/* Brutalist Intro / Header */}
          <div className="col-span-12 md:col-span-8 mb-24">
            <h1 className="text-[clamp(2.5rem,10vw,8rem)] font-black leading-[0.85] tracking-tighter uppercase break-words">
              The Thought.<br />Rendered.<br />Perfectly.
            </h1>
          </div>

          {/* Asymmetrical Content Flow */}
          {paragraphs.map((para, idx) => (
            <div 
              key={idx} 
              className={`col-span-12 ${
                idx % 3 === 0 ? 'md:col-span-10 md:col-start-2' : 
                idx % 3 === 1 ? 'md:col-span-7 md:col-start-1 h-fit' : 
                'md:col-span-6 md:col-start-6'
              } mb-12`}
            >
              <p className={`text-[clamp(1.2rem,3vw,2.5rem)] font-serif leading-tight tracking-tight ${
                idx === 0 ? 'first-letter:text-[12rem] first-letter:font-black first-letter:mr-4 first-letter:float-left first-letter:leading-[0.8]' : ''
              }`}>
                {para}
              </p>
            </div>
          ))}

          {/* Vertical Signature / Footer */}
          <div className="col-span-12 flex justify-end pt-24">
             <div className="rotate-90 origin-right whitespace-nowrap text-[10px] font-mono uppercase tracking-[0.5em] text-black">
                Sovereign Creator // Sebastian // Phase 11
             </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
