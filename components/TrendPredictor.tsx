"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, TrendingDown, Clock, Zap, Target, ArrowUpRight, BarChart3, Brain } from "lucide-react";
import { TrendForecast } from "../utils/trend-surfer";

interface TrendPredictorProps {
    sector: string;
    apiKey: string;
    trends: any[]; // Existing trends to base forecast on
}

export default function TrendPredictor({ sector, apiKey, trends }: TrendPredictorProps) {
    const [forecasts, setForecasts] = useState<TrendForecast[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchForecast = async () => {
        if (!apiKey || trends.length === 0) return;
        setIsLoading(true);
        try {
            const { predictFutureTrends } = await import("../utils/trend-surfer");
            const data = await predictFutureTrends(sector, trends, apiKey);
            setForecasts(data);
        } catch (error) {
            console.error("Forecast failed:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-xl font-black text-white flex items-center gap-2 tracking-tight uppercase">
                        <Brain className="w-5 h-5 text-indigo-400" />
                        Predictive Intelligence
                    </h2>
                    <p className="text-xs text-neutral-400 font-mono mt-1 uppercase tracking-widest">Sector: {sector} • Next 14 Days</p>
                </div>
                <button 
                    onClick={fetchForecast}
                    disabled={isLoading}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-indigo-600/20 flex items-center gap-2 uppercase tracking-widest"
                >
                    {isLoading ? <Zap className="w-4 h-4 animate-spin" /> : <Target className="w-4 h-4" />}
                    {isLoading ? "Extrapolating..." : "Run Forecast"}
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AnimatePresence mode="popLayout">
                    {forecasts.map((f, i) => (
                        <motion.div
                            key={f.id || i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ delay: i * 0.1 }}
                            className="group relative bg-[#0f111a] border border-white/5 rounded-2xl p-5 hover:border-indigo-500/30 transition-all overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                                <ArrowUpRight className="w-12 h-12 text-indigo-400" />
                            </div>

                            <div className="flex items-start justify-between mb-4">
                                <div className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tighter ${
                                    f.sentiment === "bullish" ? "bg-emerald-500/10 text-emerald-400" : 
                                    f.sentiment === "bearish" ? "bg-red-500/10 text-red-400" : 
                                    "bg-blue-500/10 text-blue-400"
                                }`}>
                                    {f.sentiment} Signal
                                </div>
                                <div className="flex items-center gap-1 text-[10px] text-neutral-500 font-mono">
                                    <Clock className="w-3 h-3" />
                                    {f.timeframe || "T+7 Days"}
                                </div>
                            </div>

                            <h3 className="text-sm font-black text-white mb-2 leading-snug group-hover:text-indigo-400 transition-colors">
                                {f.headline}
                            </h3>
                            <p className="text-xs text-neutral-400 line-clamp-2 mb-4">
                                {f.context}
                            </p>

                            <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                <div className="flex gap-4">
                                    <div className="flex flex-col">
                                        <span className="text-[9px] text-neutral-500 uppercase font-mono tracking-tighter">Velocity</span>
                                        <div className="flex items-center gap-1.5">
                                            <div className="h-1 w-8 bg-neutral-800 rounded-full overflow-hidden">
                                                <div className="h-full bg-indigo-500" style={{ width: `${f.velocity}%` }} />
                                            </div>
                                            <span className="text-[10px] font-bold text-white">{f.velocity}%</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[9px] text-neutral-500 uppercase font-mono tracking-tighter">Longevity</span>
                                        <div className="flex items-center gap-1.5">
                                            <div className="h-1 w-8 bg-neutral-800 rounded-full overflow-hidden">
                                                <div className="h-full bg-purple-500" style={{ width: `${f.longevity}%` }} />
                                            </div>
                                            <span className="text-[10px] font-bold text-white">{f.longevity}%</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1.5 bg-indigo-500/10 px-2 py-1 rounded-lg border border-indigo-500/20">
                                    <BarChart3 className="w-3 h-3 text-indigo-400" />
                                    <span className="text-[10px] font-black text-indigo-400">{f.impactScore || 85}</span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {!isLoading && forecasts.length === 0 && (
                    <div className="col-span-full h-48 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-3xl">
                        <Target className="w-8 h-8 text-neutral-700 mb-2" />
                        <p className="text-xs text-neutral-500 uppercase font-mono tracking-widest">No Intelligence Generated</p>
                    </div>
                )}
            </div>
        </div>
    );
}
