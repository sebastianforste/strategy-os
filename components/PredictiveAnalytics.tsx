"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, BarChart, Zap, Activity, Filter, RefreshCw, BarChart3, PieChart, Info, ChevronRight, Layout, CheckCircle, Flame, Target, MessageSquare, Share2 } from "lucide-react";

interface ForecastData {
    period: string;
    probability: number;
    reach: string;
    intensity: 'High' | 'Medium' | 'Low';
}

const FORECAST_DATA: ForecastData[] = [
    { period: '09:00 - 11:00', probability: 84, reach: '12k - 18k', intensity: 'High' },
    { period: '11:00 - 13:00', probability: 62, reach: '8k - 12k', intensity: 'Medium' },
    { period: '13:00 - 15:00', probability: 45, reach: '5k - 8k', intensity: 'Medium' },
    { period: '15:00 - 17:00', probability: 78, reach: '10k - 15k', intensity: 'High' },
];

export default function PredictiveAnalytics() {
    const [data] = useState<ForecastData[]>(FORECAST_DATA);
    const [isCalculating, setIsCalculating] = useState(false);

    const handleRecalculate = () => {
        setIsCalculating(true);
        setTimeout(() => setIsCalculating(false), 2000);
    };

    return (
        <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-8 min-h-[700px]">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12">
                <div className="flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        <Target className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white uppercase tracking-tight">Predictive Studio</h2>
                        <p className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-mono mt-1">Viral Forecasting & Engagement Simulation</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button 
                        onClick={handleRecalculate}
                        disabled={isCalculating}
                        className="px-6 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl text-[10px] font-black tracking-widest transition-all uppercase flex items-center gap-2"
                    >
                        {isCalculating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Activity className="w-3.5 h-3.5" />}
                        <span>{isCalculating ? "Simulating..." : "Sync Forecast"}</span>
                    </button>
                    <button className="p-2 bg-indigo-500 text-white rounded-xl shadow-lg shadow-indigo-500/20 hover:scale-105 transition-all">
                        <Share2 className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* FORECAST TABLE */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Predicted Engagement Windows</h3>
                        <div className="flex items-center gap-2 text-[10px] uppercase font-black text-white/40">
                            <span className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]" />
                            Global Optimal
                        </div>
                    </div>

                    <div className="overflow-hidden border border-white/5 rounded-3xl bg-white/[0.01]">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-white/5 bg-white/[0.02]">
                                    <th className="px-8 py-5 text-[9px] font-black text-white/40 uppercase tracking-widest">Time Slot (EST)</th>
                                    <th className="px-8 py-5 text-[9px] font-black text-white/40 uppercase tracking-widest">Viral Prob.</th>
                                    <th className="px-8 py-5 text-[9px] font-black text-white/40 uppercase tracking-widest">Ext. Impression Reach</th>
                                    <th className="px-8 py-5 text-[9px] font-black text-white/40 uppercase tracking-widest text-right">Intensity</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.map((row, i) => (
                                    <tr key={i} className="border-b border-white/5 last:border-0 hover:bg-white/[0.03] transition-all group cursor-pointer">
                                        <td className="px-8 py-6 font-mono text-[11px] text-white/80">{row.period}</td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-6">
                                                <div className="w-24 h-1.5 bg-white/5 rounded-full overflow-hidden">
                                                    <motion.div 
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${row.probability}%` }}
                                                        className={`h-full ${row.probability > 75 ? 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]' : 'bg-white/20'}`}
                                                    />
                                                </div>
                                                <span className="text-[11px] font-bold text-white">{row.probability}%</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-[11px] font-black text-white/40 uppercase tracking-tight">{row.reach}</td>
                                        <td className="px-8 py-6 text-right">
                                            <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${
                                                row.intensity === 'High' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-white/5 text-white/20'
                                            }`}>
                                                {row.intensity}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="p-8 bg-white/[0.02] border border-white/5 rounded-3xl space-y-4">
                        <div className="flex items-center gap-3">
                            <Info className="w-4 h-4 text-indigo-400" />
                            <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Algorithmic Insight</h4>
                        </div>
                        <p className="text-xs text-white/60 leading-relaxed italic">
                            The current trend sentiment in `Artificial Intelligence` and `B2B Strategy` clusters indicates a high probability of virality for technical long-form content. Suggest posting the "Agentic Future" storyboard during the 09:00 - 11:00 EST window.
                        </p>
                    </div>
                </div>

                {/* VISUAL METRICS */}
                <div className="space-y-6">
                    <h3 className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-4">Sentiment Entropy</h3>
                    
                    <div className="p-8 bg-gradient-to-br from-indigo-500/10 to-transparent border border-indigo-500/20 rounded-3xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-700">
                            <Flame className="w-32 h-32 text-indigo-400" />
                        </div>
                        
                        <div className="flex items-center gap-3 mb-6">
                            <Activity className="w-5 h-5 text-indigo-400" />
                            <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Velocity Multiplier</h4>
                        </div>
                        
                        <div className="text-4xl font-black text-white tracking-tighter mb-2">2.4x</div>
                        <p className="text-[10px] text-white/40 uppercase font-black tracking-widest mb-8">Above Global Average</p>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                                <div className="text-[9px] font-black text-white/20 uppercase mb-2">Confidence</div>
                                <div className="text-lg font-black text-indigo-400">92%</div>
                            </div>
                            <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                                <div className="text-[9px] font-black text-white/20 uppercase mb-2">Safety</div>
                                <div className="text-lg font-black text-emerald-400">98%</div>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl space-y-4">
                        <h4 className="text-[10px] font-bold text-white uppercase tracking-widest">Top Predictors</h4>
                        <div className="space-y-3">
                            <PredictorItem label="Hook Resilience" value={88} color="indigo" />
                            <PredictorItem label="Topic Relevance" value={94} color="emerald" />
                            <PredictorItem label="Structural Quality" value={76} color="amber" />
                        </div>
                    </div>

                    <div className="p-6 border border-white/5 rounded-2xl flex items-center justify-between cursor-pointer hover:bg-white/5 transition-all group">
                        <div className="flex items-center gap-3">
                            <Layout className="w-4 h-4 text-white/20 group-hover:text-white" />
                            <span className="text-[10px] font-bold text-white uppercase tracking-tight">View Heatmap Projection</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-white/20" />
                    </div>
                </div>
            </div>
        </div>
    );
}

function PredictorItem({ label, value, color }: { label: string, value: number, color: string }) {
    const colorClass = color === 'indigo' ? 'bg-indigo-500' : color === 'emerald' ? 'bg-emerald-500' : 'bg-amber-500';
    return (
        <div className="space-y-1.5">
            <div className="flex justify-between text-[9px] font-black uppercase">
                <span className="text-white/40">{label}</span>
                <span className="text-white">{value}%</span>
            </div>
            <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${value}%` }}
                    className={`h-full ${colorClass}`}
                />
            </div>
        </div>
    );
}
