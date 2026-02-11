"use client";

import React from 'react';
import { motion } from 'framer-motion';

interface DevicePreviewProps {
  content: string;
  platform: 'LINKEDIN' | 'TWITTER';
}

export function DevicePreview({ content, platform }: DevicePreviewProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-[#0F1115] p-12">
      {/* iPhone 15 Pro Frame (CSS-Only) */}
      <div className="relative w-[320px] h-[650px] bg-black rounded-[55px] border-[8px] border-[#24282D] shadow-2xl overflow-hidden ring-4 ring-[#16181D]">
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
        <h4 className="text-[10px] font-mono text-emerald-500 uppercase tracking-widest">High-Fidelity Preview: iPhone 15 Pro</h4>
        <p className="text-[9px] text-[#8A8D91] mt-1 italic">Pixel-accurate font rendering for {platform}</p>
      </div>
    </div>
  );
}
