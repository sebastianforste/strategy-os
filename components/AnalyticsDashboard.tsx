"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { BarChart3, LineChart, PieChart, TrendingUp, TrendingDown, Users, Share2, Eye, MousePointer2, Download, Filter, Calendar } from "lucide-react";

export default function AnalyticsDashboard() {
    const [timeRange, setTimeRange] = useState('7D');

    return (
        <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-8 min-h-[700px]">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12">
                <div className="flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        <BarChart3 className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white uppercase tracking-tight">Intelligence Analytics</h2>
                        <p className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-mono mt-1">Deep Performance Attribution</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
                        {['24H', '7D', '30D', '90D'].map(range => (
                            <button
                                key={range}
                                onClick={() => setTimeRange(range)}
                                className={`px-4 py-1.5 rounded-lg text-[10px] font-bold transition-all uppercase tracking-widest ${
                                    timeRange === range ? "bg-white/10 text-white shadow-lg" : "text-white/30 hover:text-white"
                                }`}
                            >
                                {range}
                            </button>
                        ))}
                    </div>
                    <button className="p-2.5 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 text-white/50 hover:text-white transition-all">
                        <Download className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* High-Level Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                <StatCard icon={<Eye className="w-4 h-4 text-sky-400" />} label="Impressions" value="1.2M" change="+12.4%" positive />
                <StatCard icon={<Users className="w-4 h-4 text-indigo-400" />} label="Network Growth" value="14.2K" change="+8.1%" positive />
                <StatCard icon={<MousePointer2 className="w-4 h-4 text-emerald-400" />} label="Engagement" value="5.8%" change="-0.4%" />
                <StatCard icon={<Share2 className="w-4 h-4 text-rose-400" />} label="Viral Coeff." value="1.42" change="+14%" positive />
            </div>

            {/* Main Charts Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-3xl p-8 relative overflow-hidden group">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-xs font-black text-white/40 uppercase tracking-[0.2em]">Viral Growth Curve</h3>
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                            <TrendingUp className="w-3 h-3 text-emerald-400" />
                            <span className="text-[9px] font-bold text-emerald-400 uppercase">Live</span>
                        </div>
                    </div>
                    
                    {/* Simulated Chart Visualization */}
                    <div className="h-64 flex items-end gap-2 px-2">
                        {Array.from({ length: 12 }).map((_, i) => (
                            <motion.div
                                key={i}
                                initial={{ height: 0 }}
                                animate={{ height: `${20 + Math.random() * 80}%` }}
                                transition={{ duration: 1, delay: i * 0.05 }}
                                className="flex-1 bg-gradient-to-t from-brand-600/40 to-brand-500/10 rounded-t-lg group-hover:from-brand-500/60 group-hover:to-brand-400/20 transition-all cursor-pointer relative"
                            >
                                <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                    <span className="text-[8px] font-mono text-white/40">{(Math.random() * 10).toFixed(1)}k</span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                    <div className="flex justify-between mt-4 px-2">
                        {['MAR 01', 'MAR 02', 'MAR 03', 'MAR 04', 'MAR 05', 'MAR 06'].map(d => (
                            <span key={d} className="text-[8px] font-black text-white/10 uppercase tracking-widest">{d}</span>
                        ))}
                    </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
                    <h3 className="text-xs font-black text-white/40 uppercase tracking-[0.2em] mb-8">Platform Split</h3>
                    <div className="space-y-8">
                        <PlatformProgress label="LinkedIn" value={74} color="bg-blue-500" />
                        <PlatformProgress label="Twitter / X" value={22} color="bg-sky-400" />
                        <PlatformProgress label="Farcaster" value={4} color="bg-purple-500" />
                    </div>
                    
                    <div className="mt-12 p-6 bg-white/[0.02] border border-white/5 rounded-2xl">
                        <p className="text-[9px] text-white/20 uppercase tracking-[0.2em] mb-4">AI Prediction</p>
                        <p className="text-xs text-white/60 leading-relaxed italic">
                            "Engagement is peaking between 10 AM - 12 PM EST. Consider shifting the Friday sequence 2 hours earlier."
                        </p>
                    </div>
                </div>
            </div>

            {/* Bottom Insights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <InsightCard title="Top Sector" value="Venture Capital" icon={<TrendingUp className="w-4 h-4 text-emerald-400" />} />
                <InsightCard title="Best Persona" value="The Ghost Agent" icon={<Users className="w-4 h-4 text-indigo-400" />} />
                <InsightCard title="Conversion" value="3.4%" icon={<MousePointer2 className="w-4 h-4 text-rose-400" />} />
            </div>
        </div>
    );
}

function StatCard({ icon, label, value, change, positive }: { icon: React.ReactNode, label: string, value: string, change: string, positive?: boolean }) {
    return (
        <div className="p-6 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/[0.08] transition-all">
            <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-black/40 border border-white/5 rounded-xl">{icon}</div>
                <span className={`text-[10px] font-bold ${positive ? 'text-emerald-400' : 'text-rose-400'}`}>{change}</span>
            </div>
            <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-1">{label}</p>
            <p className="text-2xl font-black text-white tracking-tighter">{value}</p>
        </div>
    );
}

function PlatformProgress({ label, value, color }: { label: string, value: number, color: string }) {
    return (
        <div className="space-y-2">
            <div className="flex justify-between text-[10px] font-bold uppercase tracking-tight">
                <span className="text-white">{label}</span>
                <span className="text-white/40">{value}%</span>
            </div>
            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${value}%` }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    className={`h-full ${color}`} 
                />
            </div>
        </div>
    );
}

function InsightCard({ title, value, icon }: { title: string, value: string, icon: React.ReactNode }) {
    return (
        <div className="p-6 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between group cursor-pointer hover:bg-white/[0.08] transition-all">
            <div>
                <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-1">{title}</p>
                <p className="text-sm font-bold text-white uppercase">{value}</p>
            </div>
            <div className="p-2.5 bg-black/20 rounded-xl group-hover:scale-110 transition-transform">
                {icon}
            </div>
        </div>
    );
}
