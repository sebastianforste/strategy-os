"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCcw, Sparkles, AlertCircle, TrendingUp, History, CheckCircle, ArrowRight, Zap, Target, Gauge, ChevronRight, CheckCircle2 } from "lucide-react";

interface StaleContent {
    id: string;
    title: string;
    lastPosted: string;
    performance: number;
    platform: 'linkedin' | 'twitter';
}

const STALE_ASSETS: StaleContent[] = [
    { id: 's1', title: 'The Future of Agentic Workflows', lastPosted: '92 days ago', performance: 88, platform: 'linkedin' },
    { id: 's2', title: 'Why SMBs Need AI Strategists', lastPosted: '45 days ago', performance: 72, platform: 'twitter' },
    { id: 's3', title: 'Mastering the Ghostwriter V1', lastPosted: '120 days ago', performance: 94, platform: 'linkedin' },
];

export default function ContentRefresher() {
    const [selectedAsset, setSelectedAsset] = useState<StaleContent | null>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [refreshSuccess, setRefreshSuccess] = useState(false);

    const handleRefresh = () => {
        setIsRefreshing(true);
        setTimeout(() => {
            setIsRefreshing(false);
            setRefreshSuccess(true);
        }, 2500);
    };

    return (
        <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-8 min-h-[600px]">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12">
                <div className="flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        <RefreshCcw className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white uppercase tracking-tight">Content Alchemy</h2>
                        <p className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-mono mt-1">AI-Powered Asset Refresh</p>
                    </div>
                </div>

                <div className="flex items-center gap-2 px-4 py-2 bg-amber-500/5 rounded-xl border border-amber-500/10">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">3 Stale Assets Identified</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* STALE ASSET LIST */}
                <div className="space-y-4">
                    <h3 className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-4">Legacy Asset Audit</h3>
                    {STALE_ASSETS.map((asset) => (
                        <button
                            key={asset.id}
                            onClick={() => setSelectedAsset(asset)}
                            className={`w-full p-6 rounded-2xl border transition-all text-left flex items-center justify-between group ${
                                selectedAsset?.id === asset.id 
                                    ? "bg-amber-500/10 border-amber-500/20 shadow-xl" 
                                    : "bg-white/5 border-white/5 hover:border-white/10 hover:bg-white/[0.08]"
                            }`}
                        >
                            <div className="flex items-start gap-4">
                                <div className="p-2.5 rounded-xl bg-black/40 border border-white/5">
                                    <History className="w-4 h-4 text-white/40" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-white uppercase tracking-tight">{asset.title}</h4>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-[9px] font-mono text-white/30 uppercase">Last: {asset.lastPosted}</span>
                                        <span className="w-1 h-1 rounded-full bg-white/10" />
                                        <span className="text-[9px] font-bold text-emerald-400 uppercase">{asset.performance}% Viral Score</span>
                                    </div>
                                </div>
                            </div>
                            <ChevronRight className={`w-4 h-4 transition-transform ${selectedAsset?.id === asset.id ? 'translate-x-1 text-amber-400' : 'text-white/10 group-hover:text-white/40'}`} />
                        </button>
                    ))}
                </div>

                {/* REFRESH CONSOLE */}
                <div className="relative">
                    <AnimatePresence mode="wait">
                        {selectedAsset ? (
                            <motion.div
                                key={selectedAsset.id}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="bg-white/5 border border-white/10 rounded-3xl p-8 relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 p-8 opacity-5">
                                    <Sparkles className="w-32 h-32" />
                                </div>

                                <div className="flex items-center gap-3 mb-8">
                                    <Zap className="w-4 h-4 text-amber-400" />
                                    <h3 className="text-xs font-black text-white uppercase tracking-widest">Synthesis Engine</h3>
                                </div>

                                <div className="space-y-6 mb-10">
                                    <p className="text-[11px] text-white/60 leading-relaxed italic">
                                        "{selectedAsset.title}" reached 42k impressions. Refreshing with updated data from Sector Research & Current Trends.
                                    </p>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 bg-black/40 border border-white/5 rounded-2xl">
                                            <div className="flex items-center gap-2 mb-2 text-white/30">
                                                <Target className="w-3 h-3" />
                                                <span className="text-[8px] font-bold uppercase tracking-widest">New Target</span>
                                            </div>
                                            <p className="text-xs font-bold text-white uppercase">Growth VCs</p>
                                        </div>
                                        <div className="p-4 bg-black/40 border border-white/5 rounded-2xl">
                                            <div className="flex items-center gap-2 mb-2 text-white/30">
                                                <Gauge className="w-3 h-3" />
                                                <span className="text-[8px] font-bold uppercase tracking-widest">Viral Pot.</span>
                                            </div>
                                            <p className="text-xs font-bold text-emerald-400">94.2%</p>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={handleRefresh}
                                    disabled={isRefreshing}
                                    className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-white rounded-xl text-[10px] font-black tracking-widest transition-all shadow-xl shadow-amber-500/20 uppercase flex items-center justify-center gap-2"
                                >
                                    {isRefreshing ? (
                                        <RefreshCcw className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <>
                                            <Sparkles className="w-4 h-4" />
                                            <span>GENERATE REFRESHED CONTENT</span>
                                        </>
                                    )}
                                </button>

                                {refreshSuccess && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="mt-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-3"
                                    >
                                        <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                                        <p className="text-[10px] text-emerald-300 leading-tight">
                                            Strategic refresh complete. Asset updated with Level 4 Intelligence.
                                        </p>
                                    </motion.div>
                                )}
                            </motion.div>
                        ) : (
                            <div className="h-full border-2 border-dashed border-white/5 rounded-3xl flex flex-col items-center justify-center p-12 text-center text-white/20">
                                <History className="w-12 h-12 mb-6 opacity-20" />
                                <p className="text-[10px] font-bold uppercase tracking-widest max-w-[200px] leading-relaxed">
                                    Select a legacy asset to initiate the content refresh sequence.
                                </p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
