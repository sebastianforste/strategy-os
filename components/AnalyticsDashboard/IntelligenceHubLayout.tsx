"use client";

import React from "react";
import { 
  Activity, 
  TrendingUp, 
  Brain, 
  LayoutGrid, 
  LineChart, 
  Sparkles, 
  Settings,
  Share2,
  MoreHorizontal
} from "lucide-react";

interface IntelligenceHubLayoutProps {
  metrics: {
    totalPosts: number;
    avgEngagement: string;
    viralRate: string;
    topPersona: string;
  };
  topPost: {
    title: string;
    stats: string;
    type: "VIRAL" | "GOOD";
  };
  insight: string;
}

export default function IntelligenceHubLayout({ 
  metrics = {
    totalPosts: 1284,
    avgEngagement: "8.4%",
    viralRate: "14.2%",
    topPersona: "TechGuru"
  },
  topPost = {
    title: "Quantum Computing ELI5",
    stats: "2.4k Likes • 482 Shares",
    type: "VIRAL"
  },
  insight = "Post more Swarm-mode content on Tuesdays between 14:00 - 16:00 UTC to maximize reach."
}: Partial<IntelligenceHubLayoutProps>) {
  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#06040a] text-white relative font-sans">
      {/* Nebula Background */}
      <div 
        className="absolute inset-0 pointer-events-none" 
        style={{
          background: `
            radial-gradient(circle at 10% 10%, rgba(124, 58, 237, 0.15) 0%, transparent 40%),
            radial-gradient(circle at 90% 90%, rgba(16, 185, 129, 0.1) 0%, transparent 40%)
          `
        }} 
      />

      <header className="pt-8 px-6 pb-6 flex items-center justify-between relative z-10">
        <div>
          <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
            Intelligence Hub
          </h1>
          <p className="text-xs text-white/40 font-mono mt-0.5 uppercase tracking-widest">
            Global Analytics v2.4
          </p>
        </div>
        <button className="w-10 h-10 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 flex items-center justify-center text-[#7c3aed] shadow-[0_0_15px_rgba(124,58,237,0.3)] hover:bg-white/10 transition-colors">
          <Activity className="w-5 h-5" />
        </button>
      </header>

      <main className="flex-1 overflow-y-auto custom-scrollbar px-6 space-y-6 pb-24 relative z-10">
        
        {/* Metric Cards */}
        <section className="grid grid-cols-2 gap-3">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-4 rounded-2xl">
            <span className="text-[10px] text-white/40 uppercase font-bold tracking-wider">Total Posts</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl font-bold">{metrics.totalPosts.toLocaleString()}</span>
              <span className="text-[10px] text-[#10b981]">+12%</span>
            </div>
          </div>
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-4 rounded-2xl">
            <span className="text-[10px] text-white/40 uppercase font-bold tracking-wider">Avg Engagement</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl font-bold">{metrics.avgEngagement}</span>
              <span className="text-[10px] text-[#10b981]">+2.1%</span>
            </div>
          </div>
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-4 rounded-2xl">
            <span className="text-[10px] text-white/40 uppercase font-bold tracking-wider">Viral Rate</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl font-bold">{metrics.viralRate}</span>
              <span className="text-[10px] text-white/40">~0%</span>
            </div>
          </div>
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-4 rounded-2xl">
            <span className="text-[10px] text-white/40 uppercase font-bold tracking-wider">Top Persona</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-lg font-bold truncate">{metrics.topPersona}</span>
            </div>
          </div>
        </section>

        {/* Engagement Trends Chart */}
        <section className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 relative overflow-hidden">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-semibold">Engagement Trends</h3>
            <div className="flex gap-2">
              <span className="text-[10px] bg-[#7c3aed]/20 text-[#7c3aed] px-2 py-0.5 rounded-full border border-[#7c3aed]/30">7D</span>
              <span className="text-[10px] text-white/30 px-2 py-0.5">30D</span>
            </div>
          </div>
          <div className="w-full h-40 relative">
            {/* SVG Chart */}
            <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 400 160">
              <defs>
                <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.5"></stop>
                  <stop offset="100%" stopColor="#7c3aed" stopOpacity="0"></stop>
                </linearGradient>
              </defs>
              <path d="M0,140 Q50,130 80,100 T160,80 T240,40 T320,60 T400,20 L400,160 L0,160 Z" fill="url(#chartGradient)"></path>
              <path d="M0,140 Q50,130 80,100 T160,80 T240,40 T320,60 T400,20" fill="none" stroke="#7c3aed" strokeLinecap="round" strokeWidth="3"></path>
              <circle cx="400" cy="20" fill="#7c3aed" r="4">
                <animate attributeName="r" dur="2s" repeatCount="indefinite" values="4;6;4"></animate>
              </circle>
            </svg>
          </div>
          <div className="flex justify-between mt-4 text-[10px] font-mono text-white/30 uppercase tracking-tighter">
            <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
          </div>
        </section>

        {/* Leaderboard & Insights */}
        <section className="grid grid-cols-1 gap-4">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5">
            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="text-[#7c3aed] w-5 h-5" />
              Performance Leaderboard
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-[10px] font-bold">AI</div>
                  <div>
                    <p className="text-xs font-medium">{topPost.title}</p>
                    <p className="text-[10px] text-white/40">{topPost.stats}</p>
                  </div>
                </div>
                {topPost.type === "VIRAL" && (
                  <span className="text-[10px] font-bold text-[#10b981] bg-[#10b981]/10 px-2 py-0.5 rounded border border-[#10b981]/20">VIRAL</span>
                )}
              </div>
              
               <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-[10px] font-bold">BC</div>
                  <div>
                    <p className="text-xs font-medium">Blockchain Future Wrap</p>
                    <p className="text-[10px] text-white/40">1.8k Likes • 122 Shares</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-white/40 bg-white/5 px-2 py-0.5 rounded border border-white/10">GOOD</span>
              </div>
            </div>
          </div>

          <div className="bg-[#7c3aed]/20 border border-[#7c3aed]/30 rounded-2xl p-5 relative overflow-hidden group">
            <div className="absolute top-[-20px] right-[-20px] w-24 h-24 bg-[#7c3aed]/20 blur-[40px] rounded-full"></div>
            <div className="flex gap-4 items-start relative z-10">
              <div className="w-12 h-12 rounded-xl bg-[#7c3aed]/40 flex items-center justify-center shadow-[0_0_20px_rgba(124,58,237,0.4)]">
                <Brain className="text-white w-6 h-6" />
              </div>
              <div className="flex-1">
                <h4 className="text-xs font-bold text-[#7c3aed] uppercase tracking-widest mb-1">AI Strategic Insight</h4>
                <p className="text-sm text-white/90 leading-relaxed">
                   Strategy: <span dangerouslySetInnerHTML={{ __html: insight.replace("Swarm-mode", "<span class='text-[#7c3aed] font-semibold'>Swarm-mode</span>").replace(/(\d{2}:\d{2} - \d{2}:\d{2} UTC)/, "<span class='text-[#7c3aed] font-semibold'>$1</span>") }} />
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>


    </div>
  );
}
