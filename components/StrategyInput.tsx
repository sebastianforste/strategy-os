import React, { useState } from 'react';
import { Sparkles, Zap, Brain, ChevronDown } from 'lucide-react'; // Assuming you use lucide-react or similar

const StrategyInput = () => {
  const [prompt, setPrompt] = useState('');
  const [persona, setPersona] = useState('The Strategist (CDSO)');

  return (
    <div className="w-full max-w-3xl mx-auto mt-12">
      
      {/* HEADER: Persona Selector (Moved OUT of the footer to the top) */}
      <div className="flex justify-between items-end mb-3 px-1">
        <div className="flex flex-col gap-1">
           <span className="text-xs font-medium text-brand-400 tracking-wider uppercase">Active Persona</span>
           <button className="flex items-center gap-2 text-dark-text-main hover:text-white transition-colors group">
             {/* Dynamic Icon based on Persona */}
             <div className="w-5 h-5 rounded bg-brand-500/20 flex items-center justify-center text-brand-400 group-hover:bg-brand-500 group-hover:text-white transition-all">
               <Brain size={14} />
             </div>
             <span className="font-medium text-lg">{persona}</span>
             <ChevronDown size={16} className="text-dark-text-muted group-hover:text-white" />
           </button>
        </div>
      </div>

      {/* MAIN CARD: The "Glass" Input Container */}
      <div className="strategy-card p-6">
        
        {/* Input Field */}
        <div className="relative">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="What strategy are we building today?"
            className="w-full bg-transparent border-none focus:ring-0 text-lg text-white placeholder-dark-text-muted/50 resize-none h-24 py-2"
          />
        </div>

        {/* FOOTER: Controls & Action */}
        <div className="flex items-center justify-between mt-4 border-t border-white/5 pt-4">
          
          {/* Left: Quick Settings with Tooltips */}
          <div className="flex items-center gap-3">
             <TooltippedIcon icon={<Zap size={18} />} label="Speed: Turbo" />
             <TooltippedIcon icon={<Brain size={18} />} label="Reasoning: Deep" />
             <TooltippedIcon icon={<Sparkles size={18} />} label="Creativity: High" />
             
             <div className="h-4 w-[1px] bg-white/10 mx-1"></div>
             
             {/* Quick Chips */}
             <button className="text-xs bg-white/5 hover:bg-white/10 text-dark-text-muted px-3 py-1.5 rounded-full transition-colors border border-white/5">
                Analyze a Trend
             </button>
             <button className="text-xs bg-white/5 hover:bg-white/10 text-dark-text-muted px-3 py-1.5 rounded-full transition-colors border border-white/5">
                Strategic Pivot
             </button>
          </div>

          {/* Right: The Primary Action */}
          <button className="btn-primary">
            <span>GENERATE</span>
            <Sparkles size={16} className="text-white/70" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Helper Component for the Icons
const TooltippedIcon = ({ icon, label }: { icon: React.ReactNode, label: string }) => (
  <div className="group relative flex items-center justify-center w-8 h-8 rounded-full hover:bg-white/5 text-dark-text-muted hover:text-brand-400 cursor-help transition-colors">
    {icon}
    {/* Simple Tooltip Implementation */}
    <div className="absolute bottom-full mb-2 hidden group-hover:block px-2 py-1 bg-dark-surface border border-white/10 rounded text-xs text-white whitespace-nowrap shadow-xl z-10">
      {label}
    </div>
  </div>
);

export default StrategyInput;