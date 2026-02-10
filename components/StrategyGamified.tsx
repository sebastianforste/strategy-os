"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Star, Target, Zap, TrendingUp, Medal, Crown, Flame, ChevronRight, Award } from "lucide-react";

interface Achievement {
    id: string;
    title: string;
    description: string;
    icon: React.ReactNode;
    progress: number;
    locked?: boolean;
}

const ACHIEVEMENTS: Achievement[] = [
    { id: 'a1', title: 'Viral Velocity', description: 'Hit 100k impressions on a single post.', icon: <TrendingUp className="w-5 h-5" />, progress: 85 },
    { id: 'a2', title: 'Ghost Elite', description: 'Train a persona to 99% accuracy.', icon: <Zap className="w-5 h-5" />, progress: 100 },
    { id: 'a3', title: 'Strategy Architect', description: 'Complete 50 complex strategy brief cycles.', icon: <Target className="w-5 h-5" />, progress: 42 },
    { id: 'a4', title: 'Network Master', description: 'Connect across 5 different social pods.', icon: <Medal className="w-5 h-5" />, progress: 20, locked: true },
];

export default function StrategyGamified() {
    const [activeTab, setActiveTab] = useState<'achievements' | 'leaderboard'>('achievements');

    return (
        <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-8 min-h-[600px]">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12">
                <div className="flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
                        <Trophy className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white uppercase tracking-tight">Strategist Arena</h2>
                        <p className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-mono mt-1">Gamified Growth & Performance</p>
                    </div>
                </div>

                <div className="flex items-center gap-2 px-4 py-2 bg-rose-500/10 rounded-xl border border-rose-500/20">
                    <Flame className="w-4 h-4 text-rose-500" />
                    <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest">12 Day Streak</span>
                </div>
            </div>

            {/* Level Progress */}
            <div className="mb-12 p-8 bg-white/5 border border-white/10 rounded-3xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Crown className="w-32 h-32 text-amber-500" />
                </div>
                
                <div className="flex flex-col md:flex-row items-center gap-12 relative z-10">
                    <div className="flex flex-col items-center">
                        <div className="w-24 h-24 rounded-full border-4 border-brand-500 flex items-center justify-center relative">
                            <span className="text-4xl font-black text-white">42</span>
                            <div className="absolute -bottom-2 bg-brand-500 px-3 py-0.5 rounded-full text-[8px] font-black text-white uppercase">Level</div>
                        </div>
                    </div>
                    
                    <div className="flex-1 space-y-4">
                        <div className="flex justify-between items-end">
                            <div>
                                <h3 className="text-lg font-bold text-white uppercase italic">Senior Strategist</h3>
                                <p className="text-[10px] text-white/40 uppercase tracking-widest">Next Rank: Strategy Architect</p>
                            </div>
                            <span className="text-[10px] font-mono text-brand-400">8,420 / 10,000 XP</span>
                        </div>
                        <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                            <motion.div 
                                className="h-full bg-brand-500 shadow-lg shadow-brand-500/50"
                                initial={{ width: '0%' }}
                                animate={{ width: '84.2%' }}
                                transition={{ duration: 1.5, ease: "easeOut" }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Tabs */}
            <div className="flex gap-8 border-b border-white/5 mb-8">
                {['achievements', 'leaderboard'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab as any)}
                        className={`pb-4 px-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative ${
                            activeTab === tab ? 'text-white' : 'text-white/20 hover:text-white/40'
                        }`}
                    >
                        {tab}
                        {activeTab === tab && (
                            <motion.div layoutId="gamifiedTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-500" />
                        )}
                    </button>
                ))}
            </div>

            <AnimatePresence mode="wait">
                {activeTab === 'achievements' ? (
                    <motion.div
                        key="achievements"
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
                    >
                        {ACHIEVEMENTS.map((ach) => (
                            <div 
                                key={ach.id}
                                className={`p-6 rounded-2xl border transition-all h-full flex flex-col ${
                                    ach.locked 
                                        ? "bg-black/40 border-white/5 grayscale opacity-40 hover:grayscale-0 hover:opacity-70" 
                                        : "bg-white/5 border-white/10 hover:border-brand-500/30 hover:bg-white/[0.08]"
                                } shadow-xl`}
                            >
                                <div className={`p-3 rounded-xl mb-4 w-fit ${ach.progress === 100 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-white/40'}`}>
                                    {ach.icon}
                                </div>
                                <h4 className="text-xs font-bold text-white uppercase tracking-tight mb-2">{ach.title}</h4>
                                <p className="text-[10px] text-white/30 leading-relaxed mb-6 flex-1 italic">
                                    {ach.description}
                                </p>
                                
                                <div className="space-y-1.5">
                                    <div className="flex justify-between text-[8px] font-black uppercase text-white/20">
                                        <span>Progress</span>
                                        <span>{ach.progress}%</span>
                                    </div>
                                    <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                                        <div className={`h-full ${ach.progress === 100 ? 'bg-emerald-500' : 'bg-brand-500'}`} style={{ width: `${ach.progress}%` }} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </motion.div>
                ) : (
                    <motion.div
                        key="leaderboard"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-4"
                    >
                        {[
                            { name: 'Sebastian (You)', xp: '8,420', rank: 1, avatar: 'S' },
                            { name: 'GrowthAgent_1', xp: '7,900', rank: 2, avatar: 'G' },
                            { name: 'Strategic_Munch', xp: '6,200', rank: 3, avatar: 'M' },
                        ].map(user => (
                            <div key={user.rank} className="p-5 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-between group hover:border-white/10 transition-all">
                                <div className="flex items-center gap-6">
                                    <span className={`text-sm font-black w-4 text-center ${user.rank === 1 ? 'text-amber-500' : 'text-white/20'}`}>
                                        {user.rank}
                                    </span>
                                    <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center text-xs font-bold text-white border border-white/5 group-hover:scale-105 transition-transform">
                                        {user.avatar}
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-white uppercase tracking-tight">{user.name}</h4>
                                        <p className="text-[9px] text-white/20 uppercase font-mono italic">Season 4 Participator</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-black text-white">{user.xp}</p>
                                    <p className="text-[8px] text-brand-400 font-bold uppercase tracking-widest">Total XP</p>
                                </div>
                            </div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Daily Challenge */}
            <div className="mt-12 p-8 bg-brand-500/5 border border-brand-500/10 rounded-3xl relative overflow-hidden group hover:border-brand-500/30 transition-all cursor-pointer">
                <div className="absolute -right-4 -bottom-4 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Zap className="w-48 h-48 text-brand-500" />
                </div>
                
                <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
                    <div className="flex items-center gap-6">
                        <div className="p-4 bg-brand-500/20 rounded-2xl border border-brand-500/30">
                            <Star className="w-6 h-6 text-brand-400 fill-brand-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white uppercase">Daily Strategy Blitz</h3>
                            <p className="text-[10px] text-brand-300/40 uppercase tracking-widest font-mono mt-1">+250 XP • 8h Remaining</p>
                        </div>
                    </div>
                    <button className="px-8 py-3 bg-brand-500 text-white rounded-xl text-[10px] font-black tracking-widest hover:scale-105 transition-all shadow-xl shadow-brand-500/20 uppercase flex items-center gap-2">
                        <span>Accept Challenge</span>
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
