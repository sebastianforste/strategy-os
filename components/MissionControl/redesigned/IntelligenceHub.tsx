"use client";

import React from 'react';
import { motion } from 'framer-motion';

interface IntelligenceHubProps {
  metrics: {
    totalImpressions: number;
    avgEngagement: number;
    viralHits: number;
  };
  topPersona?: string;
  onTabChange?: (tab: string) => void;
  activeTab?: string;
}

const IntelligenceHub: React.FC<IntelligenceHubProps> = ({ 
  metrics, 
  topPersona = "TechGuru", 
  onTabChange,
  activeTab = 'intelligence' 
}) => {
  return (
    <div className="flex flex-col h-full w-full relative bg-[#06040a]/20 overflow-hidden text-white font-sans">
      {/* Nebula Background */}
      <div className="absolute inset-0 z-0 opacity-50" style={{
        background: `radial-gradient(circle at 10% 10%, rgba(124, 58, 237, 0.15) 0%, transparent 40%),
                    radial-gradient(circle at 90% 90%, rgba(16, 185, 129, 0.1) 0%, transparent 40%)`
      }} />

      <header className="pt-12 px-6 pb-6 flex items-center justify-between z-10">
        <div>
          <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent uppercase">
            Intelligence Hub
          </h1>
          <p className="text-xs text-white/40 font-mono mt-0.5 uppercase tracking-widest">
            Global Analytics v2.4
          </p>
        </div>
        <button className="w-10 h-10 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 flex items-center justify-center text-[#7c3aed] shadow-[0_0_15px_rgba(124,58,237,0.3)]">
          <span className="material-symbols-outlined">hub</span>
        </button>
      </header>

      <main className="flex-1 overflow-y-auto custom-scrollbar px-6 space-y-6 pb-24 z-10">
        <section className="grid grid-cols-2 gap-3">
          {[
            { label: 'Total Reach', value: metrics.totalImpressions.toLocaleString(), change: '+12%', positive: true },
            { label: 'Engagement', value: `${metrics.avgEngagement.toFixed(1)}%`, change: '+2.1%', positive: true },
            { label: 'Viral Hits', value: metrics.viralHits.toString(), change: 'UP', positive: true },
            { label: 'Top Agent', value: topPersona, change: '', positive: true }
          ].map((metric, i) => (
            <div key={i} className="bg-white/5 backdrop-blur-xl border border-white/10 p-4 rounded-2xl">
              <span className="text-[10px] text-white/40 uppercase font-bold tracking-wider">{metric.label}</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-xl font-bold">{metric.value}</span>
                {metric.change && (
                  <span className={`text-[10px] ${metric.positive ? 'text-[#10b981]' : 'text-white/40'}`}>
                    {metric.change}
                  </span>
                )}
              </div>
            </div>
          ))}
        </section>

        <section className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 relative overflow-hidden">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white/80">Engagement Trends</h3>
            <div className="flex gap-2">
              <span className="text-[10px] bg-[#7c3aed]/20 text-[#7c3aed] px-2 py-0.5 rounded-full border border-[#7c3aed]/30 font-bold uppercase">7D</span>
              <span className="text-[10px] text-white/30 px-2 py-0.5 uppercase">30D</span>
            </div>
          </div>
          <div className="w-full h-40 relative">
            <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 400 160">
              <defs>
                <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.5"></stop>
                  <stop offset="100%" stopColor="#7c3aed" stopOpacity="0"></stop>
                </linearGradient>
              </defs>
              <path d="M0,140 Q50,130 80,100 T160,80 T240,40 T320,60 T400,20 L400,160 L0,160 Z" fill="url(#chartGradient)"></path>
              <path d="M0,140 Q50,130 80,100 T160,80 T240,40 T320,60 T400,20" fill="none" stroke="#7c3aed" strokeLinecap="round" strokeWidth="3"></path>
              <motion.circle 
                cx="400" cy="20" fill="#7c3aed" r="4"
                animate={{ r: [4, 6, 4] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </svg>
          </div>
          <div className="flex justify-between mt-4 text-[10px] font-mono text-white/30 uppercase tracking-widest">
            <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5">
            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2 uppercase tracking-wider text-white/80">
              <span className="material-symbols-outlined text-[#7c3aed] text-lg">trending_up</span>
              Top Performers
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-[10px] font-bold">AI</div>
                  <div>
                    <p className="text-xs font-medium">Quantum Computing ELI5</p>
                    <p className="text-[10px] text-white/40 font-mono">2.4k Likes • 482 Shares</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-[#10b981] bg-[#10b981]/10 px-2 py-0.5 rounded border border-[#10b981]/20 font-mono tracking-tighter">VIRAL</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-[10px] font-bold">BC</div>
                  <div>
                    <p className="text-xs font-medium">Blockchain Future Wrap</p>
                    <p className="text-[10px] text-white/40 font-mono">1.8k Likes • 122 Shares</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-white/40 bg-white/5 px-2 py-0.5 rounded border border-white/10 font-mono tracking-tighter">GOOD</span>
              </div>
            </div>
          </div>

          <div className="bg-[#7c3aed]/20 border border-[#7c3aed]/30 rounded-2xl p-5 relative overflow-hidden group">
            <div className="absolute top-[-20px] right-[-20px] w-24 h-24 bg-[#7c3aed]/20 blur-[40px] rounded-full"></div>
            <div className="flex gap-4 items-start relative z-10">
              <div className="w-12 h-12 rounded-xl bg-[#7c3aed]/40 flex items-center justify-center shadow-[0_0_20px_rgba(124,58,237,0.4)]">
                <span className="material-symbols-outlined text-white">psychology</span>
              </div>
              <div className="flex-1">
                <h4 className="text-xs font-bold text-[#7c3aed] uppercase tracking-widest mb-1">AI Strategic Insight</h4>
                <p className="text-sm text-white/90 leading-relaxed font-medium">
                  Strategy: Post more <span className="text-[#7c3aed] font-bold">Swarm-mode</span> content on Tuesdays between <span className="text-[#7c3aed] font-bold">14:00 - 16:00 UTC</span> to maximize reach.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <nav className="absolute bottom-0 w-full bg-[#06040a]/80 backdrop-blur-2xl border-t border-white/10 pt-4 pb-8 px-8 flex justify-between items-center z-50">
        <button 
          onClick={() => onTabChange?.('ops')}
          className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'ops' ? 'text-[#7c3aed]' : 'text-white/40 hover:text-white/60'}`}
        >
          <span className="material-symbols-outlined text-2xl">memory</span>
          <span className="text-[10px] font-medium uppercase tracking-widest">Ops</span>
        </button>
        <button 
          onClick={() => onTabChange?.('intelligence')}
          className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'intelligence' ? 'text-[#7c3aed]' : 'text-white/40 hover:text-white/60'}`}
        >
          <span className="material-symbols-outlined text-2xl">insights</span>
          <span className="text-[10px] font-medium uppercase tracking-widest">Data</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-white/40 hover:text-[#7c3aed] transition-colors">
          <span className="material-symbols-outlined text-2xl">auto_awesome</span>
          <span className="text-[10px] font-medium uppercase tracking-widest">Build</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-white/40 hover:text-[#7c3aed] transition-colors">
          <span className="material-symbols-outlined text-2xl">settings</span>
          <span className="text-[10px] font-medium uppercase tracking-widest">Admin</span>
        </button>
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-white/10 rounded-full"></div>
      </nav>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(124, 58, 237, 0.3);
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
};

export default IntelligenceHub;
