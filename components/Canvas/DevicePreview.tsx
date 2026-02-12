"use client";

import React from 'react';
import { motion } from 'framer-motion';

interface DevicePreviewProps {
  content: string;
  platform: 'LINKEDIN' | 'TWITTER';
}

export function DevicePreview({ content, platform }: DevicePreviewProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-[rgba(12,16,22,0.9)] px-4 py-8 md:p-12">
      {/* iPhone 15 Pro Frame (CSS-Only) */}
      <div className="relative h-[min(650px,76vh)] w-[min(320px,90vw)] overflow-hidden rounded-[55px] border-[8px] border-[var(--stitch-border,#24282D)] bg-black shadow-2xl ring-4 ring-[var(--stitch-surface,#16181D)]">
        {/* Dynamic Island */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-7 bg-black rounded-full z-20" />
        
        {/* Screen Content */}
        <div className="absolute inset-0 bg-white overflow-y-auto px-4 pt-12">
          {platform === 'LINKEDIN' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-gray-200" />
                <div className="space-y-1">
                  <div className="h-3 w-24 bg-gray-200 rounded" />
                  <div className="h-2 w-16 bg-gray-100 rounded" />
                </div>
              </div>
              
              {/* LinkedIn Font Simulation */}
              <div className="text-[14px] leading-[1.42] text-[#000000e6] font-sans whitespace-pre-wrap">
                {content.split('\n').map((line, i) => {
                  const isTruncated = i > 3; // Fold simulation
                  if (isTruncated) return null;
                  return <p key={i} className="mb-4">{line}</p>;
                })}
                {content.split('\n').length > 4 && (
                    <span className="text-[#00000099] font-bold cursor-pointer">...see more</span>
                )}
              </div>

              {/* Engagement Controls */}
              <div className="border-t border-gray-100 pt-3 flex justify-between text-[#00000099] text-xs">
                <span>Like</span>
                <span>Comment</span>
                <span>Repost</span>
                <span>Send</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 text-center">
        <h4 className="text-[10px] font-mono text-[var(--stitch-accent,#7c3bed)] uppercase tracking-widest">High-Fidelity Preview: iPhone 15 Pro</h4>
        <p className="text-[9px] text-[var(--stitch-text-secondary,#8A8D91)] mt-1 italic">Pixel-accurate font rendering for {platform}</p>
      </div>
    </div>
  );
}
