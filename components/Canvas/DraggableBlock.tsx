"use client";

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { ContentBlock } from './TactileNewsroom';
import { mapToUnicode, checkUnicodeDensity } from '@/utils/UnicodeMapper';

export function DraggableBlock({ block }: { block: ContentBlock }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 0,
    opacity: isDragging ? 0.3 : 1,
  };

  const { density, isHigh, plainText } = checkUnicodeDensity(block.content);

  return (
    <div 
      ref={setNodeRef} 
      style={style}
      aria-label={plainText}
      className={`group relative p-4 bg-transparent rounded-lg border border-transparent hover:border-[#24282D] transition-colors ${isDragging ? 'cursor-grabbing backdrop-blur-md' : 'cursor-default'}`}
    >
      {/* Grip Handle */}
      <div 
        {...attributes} 
        {...listeners}
        className="absolute left-[-24px] top-1/2 -translate-y-1/2 p-2 opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing text-[#8A8D91] hover:text-white transition-opacity"
      >
        <GripVertical size={16} />
      </div>

      {/* Content */}
      <div className="relative font-serif text-xl leading-relaxed text-[#E1E1E1]">
        {/* Render formatted content with potential Unicode styling test */}
        {block.content}
        
        {/* Accessibility Warning (Yellow Badge) */}
        {isHigh && (
          <div className="mt-2 inline-flex items-center gap-2 px-2 py-0.5 bg-yellow-500/10 border border-yellow-500/20 rounded text-[9px] font-mono text-yellow-500 uppercase tracking-widest animate-pulse">
            ⚠️ Low Accessibility Density: {(density * 100).toFixed(0)}%
          </div>
        )}
      </div>
    </div>
  );
}
