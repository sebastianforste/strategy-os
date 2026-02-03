"use client";

import React from 'react';
import { CarouselSlide } from '../utils/carousel-service';
import classNames from 'classnames';

export type CarouselTheme = 'viral' | 'professional' | 'minimal';

interface CarouselPreviewProps {
  slide: CarouselSlide;
  index: number;
  total: number;
  theme: CarouselTheme;
  handle?: string;
  avatarUrl?: string; // Optional avatar
}

export default function CarouselPreview({ 
  slide, 
  index, 
  total, 
  theme, 
  handle = "@StrategyOS",
  avatarUrl 
}: CarouselPreviewProps) {
  
  // Theme Configurations
  const themes = {
    viral: {
      bg: "bg-[#FFD600]",
      text: "text-black",
      accent: "bg-black",
      font: "font-black uppercase tracking-tighter" // Impact-like
    },
    professional: {
      bg: "bg-[#0A192F]", // Navy
      text: "text-white",
      accent: "bg-[#64FFDA]", // Teal accent
      font: "font-serif tracking-wide"
    },
    minimal: {
      bg: "bg-white",
      text: "text-neutral-900",
      accent: "bg-neutral-900",
      font: "font-sans font-medium"
    }
  };

  const currentTheme = themes[theme];

  return (
    <div 
      className={classNames(
        "aspect-[4/5] w-full relative flex flex-col p-8 transition-colors duration-300 select-none overflow-hidden",
        currentTheme.bg,
        currentTheme.text
      )}
    >
      {/* --- HEADER --- */}
      <div className="flex justify-between items-center h-8 mb-4">
        {/* Progress Bar (Viral/Professional) */}
        {theme !== 'minimal' && (
          <div className="flex gap-1 h-1 flex-1 max-w-[100px]">
             {Array.from({ length: total }).map((_, i) => (
               <div 
                 key={i} 
                 className={classNames(
                   "h-full flex-1 rounded-full",
                   i <= index ? (theme === 'viral' ? 'bg-black' : 'bg-[#64FFDA]') : 'bg-black/10'
                 )} 
               />
             ))}
          </div>
        )}
        {/* Minimal Just Uses Numbers */}
        {theme === 'minimal' && (
            <span className="text-xs font-mono text-neutral-400">{index + 1}/{total}</span>
        )}
      </div>

      {/* --- CONTENT --- */}
      <div className="flex-1 flex flex-col justify-center">
        <h2 className={classNames(
          "mb-6 leading-[1.1]",
          currentTheme.font,
          theme === 'viral' ? "text-5xl" : theme === 'professional' ? "text-3xl" : "text-2xl"
        )}>
          {slide.title}
        </h2>
        
        {slide.body && (
          <p className={classNames(
            "leading-relaxed opacity-90 whitespace-pre-wrap",
            theme === 'viral' ? "text-xl font-bold" : "text-lg"
          )}>
            {slide.body}
          </p>
        )}
      </div>

      {/* --- FOOTER --- */}
      <div className="mt-8 flex items-center justify-between border-t border-black/10 pt-4">
        <div className="flex items-center gap-2">
            {avatarUrl && (
                <img src={avatarUrl} alt="Avatar" className="w-8 h-8 rounded-full object-cover border border-black/10" />
            )}
            <span className={classNames("text-sm font-bold", theme === 'viral' ? 'opacity-100' : 'opacity-70')}>
                {handle}
            </span>
        </div>
        
        {/* Swipe prompt or Arrow */}
        <div className="flex items-center gap-1 opacity-60">
            {index < total - 1 ? (
                <span className="text-xs font-mono">SWIPE ➔</span>
            ) : (
                <span className="text-xs font-mono">SAVE 💾</span>
            )}
        </div>
      </div>
      
      {/* Decorative Accents */}
      {theme === 'professional' && (
          <div className="absolute top-0 right-0 w-20 h-20 bg-[#64FFDA]/10 rounded-bl-full" />
      )}
    </div>
  );
}
