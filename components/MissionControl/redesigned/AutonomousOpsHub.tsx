"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { MissionActivity } from '../../../actions/mission-control';

interface AutonomousOpsHubProps {
  activities: MissionActivity[];
  onDeploy?: () => void;
  onTabChange?: (tab: string) => void;
  activeTab?: string;
}

const AutonomousOpsHub: React.FC<AutonomousOpsHubProps> = ({ 
  activities, 
  onDeploy, 
  onTabChange,
  activeTab = 'ops'
}) => {
  // Mock agents for now, could be passed as props later
  const agents = [
    { name: 'Agent Alpha', icon: 'smart_toy', color: 'emerald', status: 'ONLINE' },
    { name: 'DraftBot', icon: 'edit_note', color: 'amber', status: 'TUNING' },
    { name: 'MediaScan', icon: 'troubleshoot', color: 'rose', status: 'OFFLINE' }
  ];

  return (
    <div className="flex flex-col h-full w-full relative bg-[#06040a]/20 overflow-hidden text-white font-sans">
      {/* Nebula Background (Simulated with CSS) */}
      <div className="absolute inset-0 z-0 opacity-50" style={{
        background: `radial-gradient(circle at 50% 0%, rgba(124, 58, 237, 0.2) 0%, transparent 50%),
                    radial-gradient(circle at 100% 100%, rgba(16, 185, 129, 0.05) 0%, transparent 40%)`
      }} />

      <header className="pt-12 px-6 pb-4 flex items-center justify-between z-10">
        <div>
          <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent uppercase">
            Autonomous Ops
          </h1>
          <p className="text-[10px] text-white/40 font-mono mt-0.5 uppercase tracking-widest">
            System Control v4.0.1
          </p>
        </div>
        <div className="flex gap-2">
          <button className="w-9 h-9 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 flex items-center justify-center text-[#7c3aed] shadow-[0_0_15px_rgba(124,58,237,0.2)]">
            <span className="material-symbols-outlined text-xl">sensors</span>
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto custom-scrollbar px-6 space-y-6 pb-32 z-10">
        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[11px] font-bold text-white/40 uppercase tracking-widest">Active Agents</h3>
            <span className="text-[10px] text-[#10b981] font-mono">3 INSTANCES</span>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
            {agents.map((agent, i) => (
              <div key={i} className="bg-white/5 backdrop-blur-xl border border-white/10 min-w-[120px] p-3 rounded-2xl flex flex-col items-center gap-2">
                <div className="relative">
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-tr from-${agent.color}-500/40 to-${agent.color}-500/10 border border-white/10 flex items-center justify-center overflow-hidden`}>
                    <span className="material-symbols-outlined text-2xl text-white/80">{agent.icon}</span>
                  </div>
                  <div className="absolute bottom-0 right-0 flex h-2 w-2">
                    <span className={`absolute inline-flex h-full w-full animate-ping rounded-full bg-${agent.color}-500 opacity-75`}></span>
                    <span className={`relative inline-flex rounded-full h-2 w-2 bg-${agent.color}-500`}></span>
                  </div>
                </div>
                <span className="text-xs font-semibold">{agent.name}</span>
                <span className={`text-[8px] font-mono uppercase text-${agent.color}-500`}>{agent.status}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-[11px] font-bold text-white/40 uppercase tracking-widest">Task Queue</h3>
            <span className="material-symbols-outlined text-white/20 text-sm">drag_handle</span>
          </div>
          <div className="space-y-2">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-4 rounded-xl flex items-center justify-between group cursor-grab active:cursor-grabbing">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-white/20">reorder</span>
                <div>
                  <p className="text-xs font-medium">Generate Social Swarm</p>
                  <p className="text-[10px] text-white/40">Priority: High • Agent Alpha</p>
                </div>
              </div>
              <span className="text-[10px] bg-[#7c3aed]/20 text-[#7c3aed] px-2 py-0.5 rounded border border-[#7c3aed]/30 font-mono uppercase">Waiting</span>
            </div>
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-4 rounded-xl flex items-center justify-between cursor-grab opacity-70">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-white/20">reorder</span>
                <div>
                  <p className="text-xs font-medium">Optimize SEO Meta</p>
                  <p className="text-[10px] text-white/40">Priority: Med • DraftBot</p>
                </div>
              </div>
              <span className="text-[10px] bg-white/5 text-white/40 px-2 py-0.5 rounded border border-white/10 font-mono uppercase">Queued</span>
            </div>
          </div>
        </section>

        <section className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 overflow-hidden">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xs font-semibold">Efficiency Metrics</h3>
            <div className="flex gap-2 text-[10px] font-mono">
              <span className="text-[#7c3aed]">● FLOW</span>
              <span className="text-[#10b981]">● SYNC</span>
            </div>
          </div>
          <div className="w-full h-24 relative">
            <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 400 100">
              <path d="M0,80 Q50,70 100,40 T200,60 T300,20 T400,50" fill="none" stroke="#7c3aed" strokeWidth="2"></path>
              <path d="M0,90 Q50,85 100,70 T200,30 T300,50 T400,10" fill="none" stroke="#10b981" strokeDasharray="4" strokeWidth="2"></path>
            </svg>
          </div>
          <div className="flex justify-between mt-2 text-[8px] font-mono text-white/20 uppercase tracking-widest">
            <span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>NOW</span>
          </div>
        </section>

        <section className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 space-y-3">
          <div className="flex items-center gap-2 border-b border-white/10 pb-2">
            <span className="material-symbols-outlined text-sm text-[#7c3aed]">terminal</span>
            <h3 className="text-[11px] font-bold text-white/80 uppercase tracking-widest">Mission Control</h3>
          </div>
          <div className="h-48 overflow-y-auto custom-scrollbar font-mono text-[10px] space-y-2 leading-relaxed text-white/60">
            {activities.length > 0 ? activities.map((act) => (
              <p key={act.id}>
                <span className={act.status === 'error' ? 'text-rose-500' : 'text-[#10b981]'}>
                  [{new Date(act.timestamp).toLocaleTimeString([], { hour12: false })}]
                </span>{' '}
                {act.action}
              </p>
            )) : (
              <p className="text-white/20 uppercase italic">Awaiting telemetry...</p>
            )}
          </div>
        </section>
      </main>

      <motion.button 
        whileTap={{ scale: 0.95 }}
        onClick={onDeploy}
        className="absolute bottom-24 right-6 w-14 h-14 bg-[#7c3aed] rounded-full shadow-[0_0_30px_rgba(124,58,237,0.5)] flex items-center justify-center text-white z-50 transition-all hover:brightness-110"
      >
        <span className="material-symbols-outlined text-3xl">rocket_launch</span>
      </motion.button>

      <nav className="absolute bottom-0 w-full bg-[#06040a]/80 backdrop-blur-2xl border-t border-white/10 pt-4 pb-8 px-8 flex justify-between items-center z-40">
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
          <span className="material-icons-outlined text-2xl">settings</span>
          <span className="text-[10px] font-medium uppercase tracking-widest">Admin</span>
        </button>
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-white/10 rounded-full"></div>
      </nav>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(124, 58, 237, 0.3);
          border-radius: 10px;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default AutonomousOpsHub;
