"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, Coins, Share2, Target, Briefcase, ChevronRight, Activity, Zap, PieChart, Shield, RefreshCw, Layers, Database, MousePointer2, FileText, Globe, Star, Plus, ArrowUpRight } from "lucide-react";

interface AlphaAsset {
    id: string;
    title: string;
    value: string;
    change: string;
    holders: number;
}

const ASSETS: AlphaAsset[] = [
    { id: 'a1', title: 'Viral Hook Protocol v2', value: '4.2k $OSTR', change: '+12.4%', holders: 842 },
    { id: 'a2', title: 'Ecosystem Growth Loop', value: '1.8k $OSTR', change: '+4.2%', holders: 412 },
    { id: 'a3', title: 'High Status Persona Kit', value: '840 $OSTR', change: '-2.1%', holders: 124 },
];

export default function AlphaMarket() {
    const [assets] = useState<AlphaAsset[]>(ASSETS);
    const [isSyncing, setIsSyncing] = useState(false);

    const handleSync = () => {
        setIsSyncing(true);
        setTimeout(() => setIsSyncing(false), 2000);
    };

    return (
        <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-8 min-h-[700px]">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12">
                <div className="flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 shadow-[0_0_20px_rgba(245,158,11,0.1)]">
                        <Coins className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white uppercase tracking-tight">Alpha Market</h2>
                        <p className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-mono mt-1">Internal Strategic Trading Floor & Tokenized Strategy Ownership</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button 
                        onClick={handleSync}
                        disabled={isSyncing}
                        className="px-6 py-2.5 bg-amber-500 text-white rounded-xl text-[10px] font-black tracking-widest hover:shadow-[0_0_30px_rgba(245,158,11,0.3)] transition-all uppercase flex items-center gap-2"
                    >
                        {isSyncing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                        <span>{isSyncing ? "Syncing Floor..." : "Mint Strategy Alpha"}</span>
                    </button>
                    <div className="p-2.5 bg-white/5 border border-white/10 rounded-xl text-white/40">
                        <Share2 className="w-4 h-4" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* MARKET FLOOR */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Live Insights Exchange</h3>
                        <div className="flex items-center gap-4 text-[10px] font-black text-white/40 uppercase tracking-widest">
                            <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Chain: StrategyNet-1</span>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {assets.map((asset) => (
                            <motion.div
                                key={asset.id}
                                whileHover={{ x: 4 }}
                                className="p-6 bg-white/[0.02] border border-white/5 rounded-[32px] group hover:border-amber-500/20 transition-all cursor-pointer flex items-center justify-between"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="p-4 bg-white/5 rounded-2xl group-hover:text-amber-400 transition-colors">
                                        <TrendingUp className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-black text-white uppercase tracking-tight">{asset.title}</h4>
                                        <p className="text-[10px] text-white/20 uppercase font-black tracking-widest">{asset.holders} Holders • 24h Vol: 12.4k $OSTR</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-lg font-black text-white tracking-tighter mb-1">{asset.value}</div>
                                    <div className={`flex items-center justify-end gap-1 text-[10px] font-bold ${asset.change.startsWith('+') ? 'text-emerald-400' : 'text-rose-400'}`}>
                                        <ArrowUpRight className="w-3 h-3" />
                                        {asset.change}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <div className="p-8 bg-white/[0.01] border border-white/5 rounded-[40px] space-y-4">
                        <div className="flex items-center gap-3">
                            <Star className="w-4 h-4 text-amber-400" />
                            <h3 className="text-[10px] font-black text-white uppercase tracking-widest">Yield Distribution HUD</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <YieldMetric label="Current Balance" val="12,400 $OSTR" sub="+$424.20 Today" />
                            <YieldMetric label="Strategy Staked" val="8,200 $OSTR" sub="2 Active Pools" />
                        </div>
                    </div>
                </div>

                {/* TRADING VITALS */}
                <div className="space-y-6">
                    <h3 className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-4">Ecosystem Vitals</h3>
                    
                    <div className="p-8 bg-amber-500/5 border border-amber-500/10 rounded-3xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-700">
                           <Coins className="w-32 h-32 text-amber-400" />
                        </div>
                        <div className="flex items-center gap-3 mb-8">
                            <Activity className="w-5 h-5 text-amber-400" />
                            <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Market Fluidity</h4>
                        </div>
                        <div className="text-4xl font-black text-white tracking-tighter mb-2">102.4k</div>
                        <p className="text-[10px] text-white/40 uppercase font-black tracking-widest mb-8">Total $OSTR Market Cap</p>

                        <div className="space-y-4">
                            <div className="flex justify-between text-[10px] font-bold text-white/20 uppercase">
                                <span>Trading Velocity</span>
                                <span className="text-emerald-400">+12%</span>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl space-y-4">
                        <div className="flex items-center gap-3">
                            <Shield className="w-4 h-4 text-amber-400" />
                            <h4 className="text-[10px] font-bold text-white uppercase tracking-widest">Authenticity Staking</h4>
                        </div>
                        <p className="text-[10px] text-white/40 leading-relaxed uppercase font-black tracking-tighter">
                            All insights on floor are verified by Consensus Swarm (Phase 84). Staking requirement: 100 $OSTR for publishing alpha.
                        </p>
                    </div>

                    <div className="p-6 border border-white/5 rounded-2xl flex items-center justify-between cursor-pointer hover:bg-white/5 transition-all group">
                        <div className="flex items-center gap-3">
                            <Database className="w-4 h-4 text-white/20 group-hover:text-white" />
                            <span className="text-[10px] font-bold text-white uppercase tracking-tight">Access Ledger History</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-white/20" />
                    </div>
                </div>
            </div>
        </div>
    );
}

function YieldMetric({ label, val, sub }: { label: string, val: string, sub: string }) {
    return (
        <div className="p-6 bg-white/5 rounded-[32px] border border-white/10 group hover:border-amber-500/20 transition-all">
            <h4 className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-2">{label}</h4>
            <div className="text-xl font-black text-white tracking-tighter mb-1">{val}</div>
            <div className="text-[9px] font-bold text-emerald-400 uppercase tracking-tighter">{sub}</div>
        </div>
    );
}
