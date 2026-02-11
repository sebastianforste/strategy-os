"use client";

import React from 'react';
import { motion } from 'framer-motion';

export function SkeletonDraft() {
  return (
    <div className="w-full max-w-2xl space-y-8 animate-pulse">
      {/* Hook Shimmer */}
      <div className="space-y-3">
        <div className="h-4 bg-[#24282D] rounded-full w-3/4" />
        <div className="h-4 bg-[#24282D] rounded-full w-1/2" />
      </div>

      {/* Body Shimmer */}
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-2">
            <div className="h-3 bg-[#16181D] rounded-full w-full" />
            <div className="h-3 bg-[#16181D] rounded-full w-5/6" />
          </div>
        ))}
      </div>

      {/* CTA Shimmer */}
      <div className="h-8 bg-[#24282D]/50 border border-dashed border-[#24282D] rounded-lg w-full flex items-center justify-center">
        <span className="text-[10px] font-mono text-[#8A8D91] uppercase tracking-widest">Synthesizing Strategy...</span>
      </div>
    </div>
  );
}
