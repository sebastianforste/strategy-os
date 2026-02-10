"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, ChevronLeft, ChevronRight, Plus, MoreHorizontal, CheckCircle2, AlertCircle, Share2, LayoutGrid, List } from "lucide-react";

interface ScheduledPost {
    id: string;
    title: string;
    platform: 'linkedin' | 'twitter';
    time: string;
    status: 'Scheduled' | 'Draft' | 'Sent';
}

const DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
const HOURS = ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'];

const INITIAL_POSTS: ScheduledPost[] = [
    { id: '1', title: 'Why AI is the New Leverage', platform: 'linkedin', time: 'TUE 10:00', status: 'Scheduled' },
    { id: '2', title: 'The Death of the Traditional CMO', platform: 'twitter', time: 'WED 14:00', status: 'Scheduled' },
    { id: '3', title: 'StrategyOS: A New Paradigm', platform: 'linkedin', time: 'FRI 09:00', status: 'Draft' },
];

export default function Scheduler() {
    const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
    const [posts] = useState<ScheduledPost[]>(INITIAL_POSTS);

    return (
        <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-8 min-h-[700px]">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12">
                <div className="flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400">
                        <Calendar className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white uppercase tracking-tight">Social Orchestrator</h2>
                        <p className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-mono mt-1">Multi-Channel Scheduling Engine</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex bg-white/5 p-1 rounded-xl border border-white/5">
                        <button 
                            onClick={() => setViewMode('calendar')}
                            className={`p-2 rounded-lg transition-all ${viewMode === 'calendar' ? 'bg-white/10 text-white shadow-lg' : 'text-white/20 hover:text-white'}`}
                        >
                            <LayoutGrid className="w-4 h-4" />
                        </button>
                        <button 
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white/10 text-white shadow-lg' : 'text-white/20 hover:text-white'}`}
                        >
                            <List className="w-4 h-4" />
                        </button>
                    </div>
                    <button className="px-6 py-2.5 bg-emerald-500 text-white rounded-xl text-[10px] font-black tracking-widest hover:scale-105 transition-all shadow-lg shadow-emerald-500/20 uppercase">
                        New Sequence
                    </button>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-px bg-white/5 border border-white/5 rounded-3xl overflow-hidden">
                {DAYS.map(day => (
                    <div key={day} className="p-4 bg-white/[0.02] text-center border-b border-white/5">
                        <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">{day}</span>
                    </div>
                ))}

                {/* Simulated Time Slots */}
                {Array.from({ length: 28 }).map((_, i) => (
                    <div key={i} className="min-h-[140px] p-2 bg-[#0a0a0a] border-white/5 hover:bg-white/[0.01] transition-colors relative group">
                        {/* Perfect Post Window Indicator */}
                        {i % 7 === 1 && (
                            <div className="absolute top-2 right-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse block" title="Optimal Engagement Window" />
                            </div>
                        )}
                        
                        {/* Mock Post in Slot */}
                        {i === 8 && (
                           <motion.div 
                             initial={{ opacity: 0, scale: 0.9 }}
                             animate={{ opacity: 1, scale: 1 }}
                             className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl cursor-pointer hover:bg-blue-500/20 transition-all border-l-4 border-l-blue-500"
                           >
                              <div className="flex items-center justify-between mb-1.5">
                                 <Share2 className="w-3 h-3 text-blue-400" />
                                 <span className="text-[7px] font-black text-white/40 uppercase">10:00</span>
                              </div>
                              <p className="text-[9px] font-bold text-white line-clamp-2 uppercase tracking-tighter leading-tight">AI Strategy Insight</p>
                           </motion.div>
                        )}

                        {i === 17 && (
                           <motion.div 
                             initial={{ opacity: 0, scale: 0.9 }}
                             animate={{ opacity: 1, scale: 1 }}
                             className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl cursor-pointer hover:bg-emerald-500/20 transition-all border-l-4 border-l-emerald-500"
                           >
                              <div className="flex items-center justify-between mb-1.5">
                                 <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                 <span className="text-[7px] font-black text-white/40 uppercase">14:30</span>
                              </div>
                              <p className="text-[9px] font-bold text-white line-clamp-2 uppercase tracking-tighter leading-tight">Ghostwriter V2 Launch</p>
                           </motion.div>
                        )}
                    </div>
                ))}
            </div>

            {/* Intelligence Bar */}
            <div className="mt-12 p-8 bg-emerald-500/5 border border-emerald-500/10 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Clock className="w-32 h-32" />
                </div>
                
                <div className="flex items-center gap-6">
                    <div className="p-4 bg-emerald-500/20 rounded-2xl border border-emerald-500/30">
                        <motion.div animate={{ rotate: 360 }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }}>
                            <RefreshCcw className="w-6 h-6 text-emerald-400" />
                        </motion.div>
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white">Continuous Sequence Auto-Pilot</h3>
                        <p className="text-[10px] text-emerald-300/40 uppercase tracking-widest font-mono mt-1">Next Recalculation in 14m 22s</p>
                    </div>
                </div>

                <div className="flex flex-col items-center md:items-end gap-2">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="text-right">
                           <p className="text-[8px] text-white/20 uppercase font-black">Success Probability</p>
                           <p className="text-xl font-black text-white">88.4%</p>
                        </div>
                        <div className="w-px h-8 bg-white/10" />
                        <div className="text-right">
                           <p className="text-[8px] text-white/20 uppercase font-black">Estimated Reach</p>
                           <p className="text-xl font-black text-white">420K+</p>
                        </div>
                    </div>
                    <button className="px-8 py-3 bg-white text-black rounded-xl text-[10px] font-black tracking-widest hover:scale-105 transition-all shadow-xl uppercase">
                        Deploy Sequence
                    </button>
                </div>
            </div>
        </div>
    );
}

function RefreshCcw(props: any) {
    return (
      <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
        <path d="M3 3v5h5" />
        <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
        <path d="M16 16h5v5" />
      </svg>
    )
}
