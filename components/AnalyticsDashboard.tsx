"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BarChart3, LineChart, PieChart, TrendingUp, TrendingDown, Users, Share2, Eye, MousePointer2, Download, Filter, Calendar, X, Rocket, Zap } from "lucide-react";
import { TeamPerformanceMetrics } from "../utils/analytics-service";

interface AnalyticsDashboardProps {
    isOpen: boolean;
    onClose: () => void;
    apiKey: string;
}

export default function AnalyticsDashboard({ isOpen, onClose, apiKey }: AnalyticsDashboardProps) {
    const [timeRange, setTimeRange] = useState('7D');
    const [loading, setLoading] = useState(true);
    const [metrics, setMetrics] = useState<TeamPerformanceMetrics | null>(null);

    useEffect(() => {
        if (isOpen) {
            setLoading(true);
            fetch("/api/analytics/team")
                .then(res => res.json())
                .then(data => {
                    setMetrics(data.metrics);
                })
                .catch(console.error)
                .finally(() => setLoading(false));
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
             <div className="absolute inset-0" onClick={onClose} />
             <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative bg-[#0a0a0a] border border-white/5 rounded-3xl p-8 min-h-[700px] w-full max-w-6xl overflow-y-auto max-h-[90vh] shadow-2xl"
            >
                <button 
                    onClick={onClose}
                    aria-label="Close Analytics"
                    className="absolute top-6 right-6 p-2 bg-white/5 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-colors z-10"
                >
                    <X className="w-5 h-5" />
                </button>
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12">
                <div className="flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        <BarChart3 className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white uppercase tracking-tight">StrategyOS Analytics</h2>
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
                    <button
                        aria-label="Download analytics report"
                        className="p-2.5 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 text-white/50 hover:text-white transition-all"
                    >
                        <Download className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* High-Level Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                <StatCard 
                    icon={<Eye className="w-4 h-4 text-sky-400" />} 
                    label="Impressions" 
                    value={loading ? "..." : (metrics?.totalImpressions || 0).toLocaleString()} 
                    change="+12.4%" 
                    positive 
                />
                <StatCard 
                    icon={<Users className="w-4 h-4 text-indigo-400" />} 
                    label="Strategies" 
                    value={loading ? "..." : (metrics?.totalPosts || 0).toString()} 
                    change="+8.1%" 
                    positive 
                />
                <StatCard 
                    icon={<MousePointer2 className="w-4 h-4 text-emerald-400" />} 
                    label="Engagement Rate" 
                    value={loading ? "..." : `${(metrics?.avgEngagement || 0).toFixed(1)}%`} 
                    change="-0.4%" 
                />
                <StatCard 
                    icon={<Share2 className="w-4 h-4 text-rose-400" />} 
                    label="Top Persona" 
                    value={loading ? "..." : (metrics?.topPersona || "N/A").toUpperCase()} 
                    change="+14%" 
                    positive 
                />
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
                    
                    {/* Live Chart Visualization */}
                    <div className="h-64 flex items-end gap-2 px-2">
                        {loading || !metrics?.timeSeriesData || metrics.timeSeriesData.length === 0 ? (
                            Array.from({ length: 12 }).map((_, i) => (
                                <div key={i} className="flex-1 bg-white/5 rounded-t-lg animate-pulse h-[20%]" />
                            ))
                        ) : (
                            metrics.timeSeriesData.map((d, i) => (
                                <motion.div
                                    key={d.date}
                                    initial={{ height: 0 }}
                                    animate={{ height: `${Math.min(100, (d.impressions / (Math.max(...metrics.timeSeriesData.map(ts => ts.impressions)) || 1)) * 100)}%` }}
                                    transition={{ duration: 1, delay: i * 0.05 }}
                                    className="flex-1 bg-gradient-to-t from-brand-600/40 to-brand-500/10 rounded-t-lg group-hover:from-brand-500/60 group-hover:to-brand-400/20 transition-all cursor-pointer relative"
                                >
                                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                        <span className="text-[8px] font-mono text-white/40">{d.impressions.toLocaleString()}</span>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>
                    <div className="flex justify-between mt-4 px-2">
                        {(metrics?.timeSeriesData || []).filter((_, i, arr) => i % Math.max(1, Math.floor(arr.length / 5)) === 0).map(d => (
                            <span key={d.date} className="text-[8px] font-black text-white/10 uppercase tracking-widest">
                                {new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: '2-digit' }).toUpperCase()}
                            </span>
                        ))}
                    </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
                    <h3 className="text-xs font-black text-white/40 uppercase tracking-[0.2em] mb-8">Persona Strategy</h3>
                    <div className="space-y-6">
                        {loading ? (
                             <div className="animate-pulse space-y-4">
                                <div className="h-8 bg-white/5 rounded-lg" />
                                <div className="h-8 bg-white/5 rounded-lg" />
                             </div>
                        ) : (
                            Object.entries(metrics?.personaBreakdown || {}).sort((a,b) => b[1] - a[1]).slice(0, 3).map(([p, count]) => (
                                <PlatformProgress key={p} label={p} value={Math.round((count / (metrics?.totalPosts || 1)) * 100)} color="bg-brand-500" />
                            ))
                        )}
                    </div>
                    
                    <div className="mt-12 p-6 bg-white/[0.02] border border-white/5 rounded-2xl">
                        <p className="text-[9px] text-white/20 uppercase tracking-[0.2em] mb-4">Coach Recommendation</p>
                        <p className="text-xs text-white/60 leading-relaxed italic">
                            {metrics?.avgEngagement && metrics.avgEngagement < 2.0 
                                ? "Engagement is below target. Focus on 'Contrarian' persona posts to spark debate and increase dwell time."
                                : "Your 'Bro-etry' syntax is hitting high marks. Double down on single-line hooks to maintain this momentum."}
                        </p>
                    </div>
                </div>
            </div>

            {/* Bottom Insights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <InsightCard title="Readability Grade" value={loading ? "..." : `Level ${metrics?.avgReadabilityScore || 0}`} icon={<TrendingUp className="w-4 h-4 text-emerald-400" />} />
                <InsightCard title="Brand Phrases" value={loading ? "..." : `${metrics?.signaturePhraseFreq || 0} per post`} icon={<Zap className="w-4 h-4 text-indigo-400" />} />
                <InsightCard title="Top Colleague" value={loading ? "..." : (metrics?.topColleague || "NONE")} icon={<Rocket className="w-4 h-4 text-rose-400" />} />
            </div>
            </motion.div>
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
