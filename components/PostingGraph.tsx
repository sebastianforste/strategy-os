"use client";

/**
 * POSTING GRAPH - 2028 Algorithmic Feed Prediction
 * 
 * Visualizes optimal posting windows for each platform.
 */

import React from "react";
import { motion } from "framer-motion";
import { Clock, TrendingUp } from "lucide-react";

interface PostingTime {
  platform: string;
  hour: number;
  engagement: number;
}

interface PostingGraphProps {
  times: PostingTime[];
}

export default function PostingGraph({ times }: PostingGraphProps) {
  // Group by platform
  const platforms = Array.from(new Set(times.map(t => t.platform)));

  return (
    <div className="bg-neutral-900/50 border border-white/5 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-emerald-400" />
          <h4 className="text-xs font-bold text-white uppercase tracking-widest">Post Timing Optimization</h4>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-neutral-500 font-mono">
          <TrendingUp className="w-3 h-3" />
          EST. ENGAGEMENT PEAKS
        </div>
      </div>

      <div className="space-y-6">
        {platforms.map(platform => {
          const platformTimes = times.filter(t => t.platform === platform);
          return (
            <div key={platform} className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-neutral-400 uppercase tracking-tighter">{platform}</span>
                <span className="text-[10px] text-neutral-600 font-mono">24H CYCLE</span>
              </div>
              
              <div className="relative h-12 flex items-end gap-1 px-1">
                {/* 24 hour slots */}
                {Array.from({ length: 24 }).map((_, hour) => {
                  const peak = platformTimes.find(t => t.hour === hour);
                  const height = peak ? `${peak.engagement}%` : "10%";
                  const isPeak = peak && peak.engagement > 80;
                  
                  return (
                    <div key={hour} className="flex-1 group relative flex flex-col items-center gap-1">
                      <motion.div 
                        initial={{ height: 0 }}
                        animate={{ height }}
                        className={`w-full rounded-t-sm transition-all ${isPeak ? "bg-emerald-500" : peak ? "bg-indigo-500/50" : "bg-white/5"}`}
                      />
                      {hour % 4 === 0 && (
                        <span className="text-[8px] text-neutral-700 font-mono absolute -bottom-4">{hour}h</span>
                      )}
                      
                      {peak && (
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white text-black text-[8px] font-bold px-1 rounded whitespace-nowrap z-10">
                          {peak.engagement}% @ {hour}:00
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 pt-4 border-t border-white/5 flex items-center justify-between">
        <p className="text-[10px] text-neutral-500 italic max-w-[200px]">
          Based on 2028 algorithmic feed patterns and your audience persona.
        </p>
        <div className="px-3 py-1 bg-white/5 rounded-full border border-white/10 text-[10px] font-bold text-white">
          PEAK: {Math.max(...times.map(t => t.engagement))}%
        </div>
      </div>
    </div>
  );
}
