"use client";

import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { TrendingUp, Globe, Hash, Zap } from 'lucide-react';

const TRENDS = [
  { id: 'trend1', topic: 'AI Accountability', volume: '128K', category: 'Tech' },
  { id: 'trend2', topic: 'The Death of Consulting', volume: '84K', category: 'Strategy' },
  { id: 'trend3', topic: 'Second-Order Thinking', volume: '56K', category: 'Business' },
  { id: 'trend4', topic: 'Algorithmic Status', volume: '42K', category: 'Culture' },
];

export function TrendStream() {
  return (
    <aside className="w-[300px] h-full bg-[#16181D] flex flex-col p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-white uppercase tracking-widest">Trend Stream</h2>
          <p className="text-[10px] text-[#8A8D91] tracking-[0.2em] font-mono uppercase">Newsjacking Intel</p>
        </div>
        <TrendingUp size={16} className="text-emerald-500 animate-pulse" />
      </div>

      <div className="space-y-4">
        {TRENDS.map((trend) => (
          <TrendCard key={trend.id} trend={trend} />
        ))}
      </div>
    </aside>
  );
}

function TrendCard({ trend }: { trend: any }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: trend.id,
    data: {
      type: 'TREND',
      trend
    }
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 100 : 0,
  } : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`p-4 bg-[#0F1115] border border-[#24282D] rounded-xl hover:border-emerald-500/50 transition-all cursor-grab active:cursor-grabbing group ${
        isDragging ? 'shadow-2xl' : ''
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-[9px] font-mono text-[#8A8D91] uppercase tracking-widest">{trend.category}</span>
        <Zap size={10} className="text-emerald-500" />
      </div>
      <h3 className="text-sm font-bold text-white mb-1 group-hover:text-emerald-400 transition-colors">{trend.topic}</h3>
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 text-[9px] font-mono text-[#8A8D91]">
          <Globe size={10} />
          <span>{trend.volume} engagements</span>
        </div>
      </div>
    </div>
  );
}
