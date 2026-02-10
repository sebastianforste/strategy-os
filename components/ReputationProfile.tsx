"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Award, Shield, Star, Trophy, Target, Zap, Activity, CheckCircle, ChevronRight, Globe, BarChart3, Users, Crown, Sparkles, Map, Hash } from "lucide-react";

interface Badge {
    id: string;
    label: string;
    icon: React.ReactNode;
    color: string;
    attained: boolean;
    rarity: string;
}

const BADGES: Badge[] = [
    { id: 'b1', label: 'Viral Architect', icon: <Flame className="w-4 h-4" />, color: 'orange', attained: true, rarity: 'Legendary' },
    { id: 'b2', label: 'Council ELite', icon: <Crown className="w-4 h-4" />, color: 'purple', attained: true, rarity: 'Epic' },
    { id: 'b3', label: 'Data Titan', icon: <BarChart3 className="w-4 h-4" />, color: 'blue', attained: false, rarity: 'Rare' },
    { id: 'b4', label: 'Global Strategist', icon: <Globe className="w-4 h-4" />, color: 'emerald', attained: true, rarity: 'Uncommon' },
];

export default function ReputationProfile() {
    const [badges] = useState<Badge[]>(BADGES);
    const attainedCount = badges.filter(b => b.attained).length;

    return (
        <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-8 min-h-[700px]">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12">
                <div className="flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        <Trophy className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white uppercase tracking-tight">Authority Ledger</h2>
                        <p className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-mono mt-1">Strategic Reputation & Proof of Work</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl flex items-center gap-3">
                        <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Global Rank</span>
                        <span className="text-lg font-black text-white tracking-tighter">#424</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* REPUTATION STATS */}
                <div className="lg:col-span-2 space-y-12">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <AuthorityMetric label="Trust Score" value="9.4" sub="Excellent" color="emerald" />
                        <AuthorityMetric label="Aura Level" value="82" sub="Dominant" color="amber" />
                        <AuthorityMetric label="Strategy Reach" value="1.2M" sub="Market Leader" color="indigo" />
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Provenance Badges</h3>
                            <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest">{attainedCount} / {badges.length} UNLOCKED</span>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {badges.map((badge) => (
                                <motion.div
                                    key={badge.id}
                                    whileHover={{ scale: 1.05 }}
                                    className={`p-6 rounded-3xl border flex flex-col items-center gap-4 transition-all relative overflow-hidden ${
                                        badge.attained ? "bg-white/5 border-white/10 opacity-100" : "bg-black/40 border-white/5 opacity-40 grayscale"
                                    }`}
                                >
                                    <div className={`p-4 rounded-2xl bg-${badge.color}-500/10 text-${badge.color}-400 border border-${badge.color}-500/20`}>
                                        {badge.icon}
                                    </div>
                                    <div className="text-center">
                                        <p className="text-[10px] font-black text-white uppercase tracking-tight mb-1">{badge.label}</p>
                                        <p className={`text-[8px] font-black uppercase tracking-widest text-${badge.color}-500/60`}>{badge.rarity}</p>
                                    </div>
                                    {!badge.attained && <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center"><Zap className="w-4 h-4 text-white/20" /></div>}
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    <div className="p-10 bg-gradient-to-br from-indigo-500/5 to-transparent border border-white/5 rounded-[40px] relative overflow-hidden group">
                        <div className="flex items-center gap-4 mb-8">
                            <Activity className="w-6 h-6 text-indigo-400" />
                            <h4 className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Strategy Velocity</h4>
                        </div>
                        
                        <div className="h-24 flex items-end gap-2 px-4">
                            {[40, 70, 45, 90, 65, 80, 55, 100, 75, 85].map((h, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ height: 0 }}
                                    animate={{ height: `${h}%` }}
                                    transition={{ delay: i * 0.1 }}
                                    className="flex-1 bg-gradient-to-t from-indigo-500/20 to-indigo-500 rounded-t-sm"
                                />
                            ))}
                        </div>
                        <div className="flex justify-between mt-4 text-[8px] font-black text-white/20 uppercase tracking-[0.2em] px-4">
                            <span>MAR 01</span>
                            <span>MAR 10</span>
                        </div>
                    </div>
                </div>

                {/* SIDEBAR RANKINGS */}
                <div className="space-y-6">
                    <h3 className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-4">Community Ranking</h3>
                    
                    <div className="space-y-3">
                        <LeaderboardItem rank={1} name="Marcus.eth" score="9,842" avatar="M" active />
                        <LeaderboardItem rank={2} name="Elena Growth" score="9,210" avatar="E" />
                        <LeaderboardItem rank={3} name="Vector Master" score="8,940" avatar="V" />
                    </div>

                    <div className="p-8 bg-amber-500/5 border border-amber-500/10 rounded-3xl relative overflow-hidden group mt-12">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:rotate-12 transition-transform duration-700">
                            <Target className="w-32 h-32 text-amber-400" />
                        </div>
                        
                        <div className="flex items-center gap-3 mb-6">
                            <Shield className="w-5 h-5 text-amber-400" />
                            <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Next Milestone</h4>
                        </div>
                        
                        <p className="text-xs text-white/60 leading-relaxed italic mb-8">
                            Post 5 consecutive high-status strategies with an aura score above 90% to unlock the `Strategy Oracle` title.
                        </p>

                        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden mb-8">
                            <motion.div initial={{ width: 0 }} animate={{ width: '60%' }} className="h-full bg-amber-500" />
                        </div>

                        <button className="w-full py-3 bg-white text-black rounded-xl text-[9px] font-black uppercase tracking-widest hover:scale-[1.02] transition-all">
                            View Roadmap
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function AuthorityMetric({ label, value, sub, color }: { label: string, value: string, sub: string, color: string }) {
    const colorMap: any = {
        emerald: 'text-emerald-400 bg-emerald-500/10',
        amber: 'text-amber-400 bg-amber-500/10',
        indigo: 'text-indigo-400 bg-indigo-500/10'
    };
    return (
        <div className={`p-8 rounded-[32px] border border-white/5 ${colorMap[color]} group hover:border-white/10 transition-all`}>
            <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-2">{label}</p>
            <div className="text-4xl font-black text-white tracking-tighter mb-1">{value}</div>
            <p className="text-[9px] font-black uppercase tracking-widest opacity-60">{sub}</p>
        </div>
    );
}

function LeaderboardItem({ rank, name, score, avatar, active }: { rank: number, name: string, score: string, avatar: string, active?: boolean }) {
    return (
        <div className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${
            active ? "bg-white/10 border-white/20" : "bg-white/[0.02] border-white/5 hover:bg-white/5"
        }`}>
            <span className="text-[10px] font-black text-white/40 w-4">{rank}</span>
            <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-bold text-white/60">{avatar}</div>
            <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white truncate">{name}</p>
                <p className="text-[9px] font-mono text-white/20 uppercase tracking-tighter">{score} AP</p>
            </div>
            {rank === 1 && <Crown className="w-3 h-3 text-amber-500" />}
        </div>
    );
}

function Flame(props: any) {
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
            <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.298 1.1-3.1" />
        </svg>
    );
}
