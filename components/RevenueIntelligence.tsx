"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, DollarSign, Target, BarChart3, ChevronRight, Activity, PieChart, Wallet, Calendar, Filter, Search, Sparkles, RefreshCw, Layers, Database, MousePointer2 } from "lucide-react";

interface RevenueForecast {
    period: string;
    projected: string;
    probability: number;
    status: 'High' | 'Moderate' | 'Low';
}

const FORECASTS: RevenueForecast[] = [
    { period: 'Next 30 Days', projected: '$124k', probability: 84, status: 'High' },
    { period: 'Next 90 Days', projected: '$412k', probability: 62, status: 'Moderate' },
    { period: 'Next 180 Days', projected: '$1.2M', probability: 41, status: 'Low' },
];

export default function RevenueIntelligence() {
    const [forecasts] = useState<RevenueForecast[]>(FORECASTS);
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
                    <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.1)]">
                        <DollarSign className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white uppercase tracking-tight">Revenue Intel</h2>
                        <p className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-mono mt-1">Strategy-to-Revenue Attribution & Conversion Forecasting</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button 
                        onClick={handleRecalculate}
                        disabled={isCalculating}
                        className="px-6 py-2.5 bg-emerald-500 text-white rounded-xl text-[10px] font-black tracking-widest hover:shadow-[0_0_30px_rgba(16,185,129,0.3)] transition-all uppercase flex items-center gap-2"
                    >
                        {isCalculating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                        <span>{isCalculating ? "Recalculating..." : "Sync Revenue Data"}</span>
                    </button>
                    <div className="p-2.5 bg-white/5 border border-white/10 rounded-xl text-white/40">
                        <Calendar className="w-4 h-4" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* ATTRIBUTION GRID */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">High-Impact Corridors</h3>
                        <div className="flex items-center gap-2 p-1 bg-white/5 rounded-xl border border-white/10">
                            <button className="p-2 text-white/20 hover:text-white transition-colors"><Search className="w-4 h-4" /></button>
                            <button className="p-2 text-white/20 hover:text-white transition-colors"><Filter className="w-4 h-4" /></button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <AttributionCard 
                            title="Authority Posts (LinkedIn)" 
                            revenue="$42,400" 
                            conversion="4.2%" 
                            trend="+12%" 
                            status="High"
                        />
                        <AttributionCard 
                            title="Visual Thread (Twitter/X)" 
                            revenue="$12,800" 
                            conversion="1.8%" 
                            trend="+4%" 
                            status="Moderate"
                        />
                        <AttributionCard 
                            title="Bio-Link Funnel" 
                            revenue="$8,200" 
                            conversion="12.4%" 
                            trend="+24%" 
                            status="High"
                        />
                        <AttributionCard 
                            title="DM Outreach (Autonomous)" 
                            revenue="$2,400" 
                            conversion="0.8%" 
                            trend="-2%" 
                            status="Low"
                        />
                    </div>

                    <div className="p-8 bg-white/[0.01] border border-white/5 rounded-[40px] space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Strategy Drift Analysis</h3>
                            <PieChart className="w-4 h-4 text-emerald-400" />
                        </div>
                        <p className="text-xs text-white/60 leading-relaxed italic">
                            Your current focus on `Neuro-Hooks` is driving 84% of high-ticket lead inquiries. However, `Technical Deep-Dives` are converting 2.5x higher at the final sales stage. Adjusting mix...
                        </p>
                    </div>
                </div>

                {/* FORECAST VITALS */}
                <div className="space-y-6">
                    <h3 className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-4">Probability Engine</h3>
                    
                    <div className="p-8 bg-emerald-500/5 border border-emerald-500/10 rounded-3xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-700">
                            <Wallet className="w-32 h-32 text-emerald-400" />
                        </div>
                        
                        <div className="flex items-center gap-3 mb-8">
                            <BarChart3 className="w-5 h-5 text-emerald-400" />
                            <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Expected Yield</h4>
                        </div>
                        
                        <div className="text-4xl font-black text-white tracking-tighter mb-2">$542k</div>
                        <p className="text-[10px] text-white/40 uppercase font-black tracking-widest mb-8">Quarterly Revenue Baseline</p>

                        <div className="space-y-4">
                            {forecasts.map((f, i) => (
                                <div key={i} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0 hover:px-2 transition-all cursor-default">
                                    <span className="text-[10px] font-bold text-white/40 uppercase">{f.period}</span>
                                    <div className="flex items-center gap-3">
                                        <span className="text-[10px] font-mono text-emerald-400">{f.projected}</span>
                                        <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${
                                            f.status === 'High' ? 'bg-emerald-500/20 text-emerald-400' : 
                                            f.status === 'Moderate' ? 'bg-amber-500/20 text-amber-500' : 'bg-rose-500/20 text-rose-400'
                                        }`}>
                                            {f.probability}%
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl space-y-4">
                        <div className="flex items-center gap-3">
                            <Target className="w-4 h-4 text-emerald-400" />
                            <h4 className="text-[10px] font-bold text-white uppercase tracking-widest">Conversion probability HUD</h4>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                                <span className="text-[10px] font-black text-white uppercase tracking-tight">Direct Sales</span>
                                <span className="text-[10px] font-mono text-emerald-400">18.4%</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                                <span className="text-[10px] font-black text-white uppercase tracking-tight">Upsell Velocity</span>
                                <span className="text-[10px] font-mono text-indigo-400">4.2%</span>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 border border-white/5 rounded-2xl flex items-center justify-between cursor-pointer hover:bg-white/5 transition-all group">
                        <div className="flex items-center gap-3">
                            <Database className="w-4 h-4 text-white/20 group-hover:text-white" />
                            <span className="text-[10px] font-bold text-white uppercase tracking-tight">Financial Sector Insights</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-white/20" />
                    </div>
                </div>
            </div>
        </div>
    );
}

function AttributionCard({ title, revenue, conversion, trend, status }: { title: string, revenue: string, conversion: string, trend: string, status: string }) {
    return (
        <motion.div
            whileHover={{ y: -4 }}
            className={`p-8 bg-white/5 border rounded-[40px] group transition-all relative overflow-hidden ${
                status === 'High' ? 'border-emerald-500/20 shadow-[0_0_40px_rgba(16,185,129,0.05)]' : 'border-white/5'
            }`}
        >
            <div className="flex items-center justify-between mb-8">
                <div className="p-3 bg-white/5 rounded-2xl text-white/20 group-hover:text-white transition-colors">
                    <MousePointer2 className="w-5 h-5" />
                </div>
                <span className={`text-[10px] font-bold ${trend.startsWith('+') ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {trend}
                </span>
            </div>
            <h4 className="text-sm font-black text-white uppercase tracking-tight mb-2 group-hover:text-emerald-400 transition-colors">{title}</h4>
            <div className="flex items-baseline gap-2 mb-8">
                <span className="text-2xl font-black text-white tracking-tighter">{revenue}</span>
                <span className="text-[10px] font-mono text-white/20">/ {conversion} CR</span>
            </div>
            
            <div className={`w-full h-1 bg-white/5 rounded-full overflow-hidden`}>
                <motion.div initial={{ width: 0 }} animate={{ width: status === 'High' ? '85%' : status === 'Moderate' ? '45%' : '15%' }} className={`h-full ${
                    status === 'High' ? 'bg-emerald-500' : status === 'Moderate' ? 'bg-amber-500' : 'bg-rose-500'
                }`} />
            </div>
        </motion.div>
    );
}
