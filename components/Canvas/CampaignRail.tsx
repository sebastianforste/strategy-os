"use client";

import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { Calendar, Repeat, Target, Share2, MessageCircle, BarChart3, Zap } from 'lucide-react';

const DAYS = [
  { id: 'day1', label: 'Day 1: Flagship', icon: Target, description: 'Long-form Insight' },
  { id: 'day2', label: 'Day 2: The Thread', icon: Repeat, description: 'Twitter Pivot' },
  { id: 'day3', label: 'Day 3: Visual', icon: Zap, description: 'Carousel Draft' },
  { id: 'day4', label: 'Day 4: Community', icon: MessageCircle, description: 'Reply Engine' },
  { id: 'day5', label: 'Day 5: Deep Dive', icon: BarChart3, description: 'Analytical Breakdown' },
  { id: 'day6', label: 'Day 6: Outreach', icon: Share2, description: 'Network Signal' },
  { id: 'day7', label: 'Day 7: Retro', icon: Calendar, description: 'Yield Analysis' },
];

export function CampaignRail() {
  return (
    <aside className="w-[300px] h-full bg-[#16181D] flex flex-col p-6 space-y-6">
      <div>
        <h2 className="text-sm font-bold text-white uppercase tracking-widest">Campaign Rail</h2>
        <p className="text-[10px] text-[#8A8D91] tracking-[0.2em] font-mono uppercase">7-Day Narrative Arc</p>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto pr-2 custom-scrollbar">
        {DAYS.map((day) => (
          <CampaignSlot key={day.id} day={day} />
        ))}
      </div>
    </aside>
  );
}

function CampaignSlot({ day }: { day: any }) {
  const { isOver, setNodeRef } = useDroppable({
    id: day.id,
  });

  const Icon = day.icon;

  return (
    <div
      ref={setNodeRef}
      className={`relative p-4 rounded-xl border transition-all duration-300 group ${
        isOver 
          ? 'bg-white/10 border-white scale-[1.02] shadow-2xl' 
          : 'bg-[#0F1115] border-[#24282D] hover:border-[#8A8D91]'
      }`}
    >
      <div className="flex items-center gap-3 mb-2">
        <div className={`p-2 rounded-lg ${isOver ? 'bg-white text-black' : 'bg-[#16181D] text-[#8A8D91] group-hover:text-white'}`}>
          <Icon size={16} />
        </div>
        <div>
          <h3 className="text-[10px] font-bold text-white uppercase tracking-widest">{day.label}</h3>
          <p className="text-[9px] text-[#8A8D91] font-mono">{day.description}</p>
        </div>
      </div>

      {/* Placeholder for dropped content */}
      <div className={`h-8 border-t border-dashed border-[#24282D] mt-2 flex items-center justify-center transition-opacity ${isOver ? 'opacity-100' : 'opacity-20'}`}>
        <span className="text-[8px] font-mono text-[#8A8D91] uppercase tracking-tighter">Drop to Orchestrate</span>
      </div>

      {isOver && (
        <div className="absolute inset-0 bg-white/5 animate-pulse rounded-xl pointer-events-none" />
      )}
    </div>
  );
}
