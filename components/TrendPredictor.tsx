"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, Clock, Zap, Target, ArrowUpRight, BarChart3, Brain, Activity } from "lucide-react";
import { TrendForecast } from "../utils/trend-surfer";
import { predictTrendsAction } from "../actions/analytics";

interface TrendPredictorProps {
    sector: string;
    apiKey: string;
    trends: any[];
}

export default function TrendPredictor({ sector, apiKey, trends }: TrendPredictorProps) {
    const [forecasts, setForecasts] = useState<TrendForecast[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchForecast = async () => {
        if (!apiKey || trends.length === 0) return;
        setIsLoading(true);
        try {
            const data = await predictTrendsAction(sector, trends, apiKey);
            if (data) setForecasts(data);
        } catch (error) {
            console.error("Forecast failed:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full bg-[#080a0f]/60 backdrop-blur-3xl border border-white/10 rounded-[2rem] overflow-hidden shadow-[0_32px_120px_rgba(0,0,0,0.5)] group/container">
            <div className="p-10 border-b border-white/5 bg-gradient-to-br from-indigo-500/5 via-transparent to-black flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                    <div className="relative">
                        <div className="absolute inset-0 bg-indigo-500/20 blur-2xl rounded-full" />
                        <div className="relative p-5 bg-indigo-500/10 rounded-[1.5rem] border border-indigo-500/20 backdrop-blur-xl">
                            <Activity className="w-7 h-7 text-indigo-400" />
                        </div>
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-white flex items-center gap-3 tracking-tighter uppercase italic">
                            Predictive Horizon
                        </h2>
                        <div className="flex items-center gap-3 mt-1 text-[9px] text-neutral-500 font-mono tracking-[0.3em] uppercase">
                            <span className="text-indigo-400 font-bold">Sector:</span> {sector}
                            <span className="w-1 h-3 border-r border-white/10" />
                            <Clock className="w-3 h-3 text-neutral-600" />
                            Next 14 Days
                        </div>
                    </div>
                </div>

                <button 
                    onClick={fetchForecast}
                    disabled={isLoading || trends.length === 0}
                    className="relative group/btn overflow-hidden px-8 py-3.5 bg-indigo-600 text-white rounded-2xl text-[11px] font-black tracking-[0.2em] uppercase transition-all shadow-2xl shadow-indigo-600/20 active:scale-95 disabled:opacity-30"
                >
                    <div className="absolute inset-0 bg-white/10 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-500" />
                    <span className="relative flex items-center gap-3">
                        {isLoading ? <Zap className="w-4 h-4 animate-spin" /> : <Target className="w-4 h-4" />}
                        {isLoading ? "Extrapolating..." : "Run Forecast"}
                    </span>
                </button>
            </div>

            <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-8 min-h-[400px]">
                <AnimatePresence mode="popLayout">
                    {forecasts.map((f, i) => (
                        <motion.div
                            key={f.id || i}
                            initial={{ opacity: 0, x: -30, scale: 0.98 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.5, delay: i * 0.1, ease: [0.23, 1, 0.32, 1] }}
                            className="group relative bg-white/[0.02] border border-white/5 rounded-[2rem] p-8 hover:bg-white/[0.04] hover:border-indigo-500/30 transition-all duration-500 overflow-hidden"
                        >
                            <div className="absolute -top-4 -right-4 p-8 opacity-[0.03] group-hover:opacity-10 transition-opacity">
                                <ArrowUpRight className="w-24 h-24 text-indigo-400" />
                            </div>

                            <div className="flex items-center justify-between mb-6">
                                <div className={`px-4 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                                    f.sentiment === "bullish" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : 
                                    f.sentiment === "bearish" ? "bg-red-500/10 text-red-400 border border-red-500/20" : 
                                    "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                                }`}>
                                    {f.sentiment} Signal
                                </div>
                                <div className="text-[9px] text-neutral-600 font-mono font-black uppercase tracking-tighter">
                                    Expected: {f.timeframe || "T+7-14"}
                                </div>
                            </div>

                            <h3 className="text-lg font-black text-white mb-3 leading-tight group-hover:text-indigo-400 transition-colors">
                                {f.headline}
                            </h3>
                            <p className="text-[13px] text-neutral-400 leading-relaxed font-medium line-clamp-3 mb-8">
                                {f.context}
                            </p>

                            <div className="flex items-center justify-between pt-6 border-t border-white/5">
                                <div className="flex gap-8 w-2/3">
                                    <div className="flex flex-col gap-1.5 w-full">
                                        <span className="text-[9px] text-neutral-600 uppercase font-black tracking-widest">Velocity</span>
                                        <div className="flex items-center gap-3">
                                            <div className="h-1 flex-1 bg-white/5 rounded-full overflow-hidden">
                                                <motion.div 
                                                    className="h-full bg-indigo-500" 
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${f.velocity}%` }}
                                                    transition={{ duration: 1.5, delay: i * 0.2 }}
                                                />
                                            </div>
                                            <span className="text-[10px] font-black text-white tabular-nums">{f.velocity}%</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-1.5 w-full">
                                        <span className="text-[9px] text-neutral-600 uppercase font-black tracking-widest">Longevity</span>
                                        <div className="flex items-center gap-3">
                                            <div className="h-1 flex-1 bg-white/5 rounded-full overflow-hidden">
                                                <motion.div 
                                                    className="h-full bg-purple-500" 
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${f.longevity}%` }}
                                                    transition={{ duration: 1.5, delay: i * 0.3 }}
                                                />
                                            </div>
                                            <span className="text-[10px] font-black text-white tabular-nums">{f.longevity}%</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-4 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 group-hover:bg-indigo-500/20 transition-all">
                                    <span className="text-xl font-black text-white tracking-widest leading-none tabular-nums">{f.impactScore || 85}</span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {!isLoading && forecasts.length === 0 && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        className="col-span-full h-64 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-[2.5rem] bg-black/20"
                    >
                        <div className="p-6 rounded-full bg-white/[0.02] border border-white/[0.05] mb-4">
                            <Target className="w-10 h-10 text-neutral-700 opacity-20" />
                        </div>
                        <p className="text-[10px] text-neutral-600 font-mono uppercase tracking-[0.4em] opacity-30">Awaiting Signal Acquisition</p>
                    </motion.div>
                )}
            </div>
            
            <div className="p-6 bg-black/40 border-t border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Brain className="w-4 h-4 text-neutral-700" />
                    <span className="text-[9px] text-neutral-600 font-mono uppercase tracking-widest">Statistical Extrapolation via Gemini Long-Context</span>
                </div>
                <div className="w-48 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />
            </div>
        </div>
    );
}
