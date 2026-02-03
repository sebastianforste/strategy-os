"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, AlertCircle, ArrowUpRight, RefreshCw, Radio } from "lucide-react";
import { TrendOpportunity, scanForTrends } from "../utils/trend-surfer";

interface TrendMonitorProps {
    apiKey?: string;
    onSelectTrend: (trend: TrendOpportunity) => void;
    onTrendsFetched?: (trends: TrendOpportunity[]) => void;
}

export default function TrendMonitor({ apiKey, onSelectTrend, onTrendsFetched }: TrendMonitorProps) {
    const [trends, setTrends] = useState<TrendOpportunity[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

    const handleScan = async () => {
        if (!apiKey || isLoading) return;
        setIsLoading(true);
        // Default to "Tech & AI" sector for now
        // In real app, this could be user-configurable
        try {
            const results = await scanForTrends("Artificial Intelligence Business", apiKey, process.env.NEXT_PUBLIC_SERPER_API_KEY || "");
            setTrends(results);
            if (onTrendsFetched) onTrendsFetched(results);
            setLastUpdated(new Date());
        } catch (e) {
            console.error("Trend scan failed", e);
        } finally {
            setIsLoading(false);
        }
    };

    // Auto-scan on mount if empty
    useEffect(() => {
        if (apiKey && trends.length === 0) {
           // handleScan(); // Optional: Auto-scan on load
        }
    }, [apiKey]);

    return (
        <div className="bg-black/40 border border-white/5 rounded-2xl overflow-hidden flex flex-col h-full max-h-[600px]">
            {/* Header */}
            <div className="p-4 border-b border-white/5 bg-neutral-900/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Radio className={`w-4 h-4 ${isLoading ? 'text-amber-500 animate-pulse' : 'text-emerald-500'}`} />
                        {isLoading && <div className="absolute inset-0 bg-amber-500 rounded-full blur-md opacity-20 animate-ping" />}
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">TrendSurfer v1.0</span>
                </div>
                <button 
                    onClick={handleScan}
                    disabled={isLoading}
                    className="p-1.5 hover:bg-white/5 rounded-lg text-neutral-500 hover:text-white transition-colors"
                >
                    <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                {isLoading ? (
                    <div className="space-y-4">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="relative p-4 bg-white/[0.02] border border-white/5 rounded-xl overflow-hidden">
                                <motion.div 
                                    className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-500/5 to-transparent -translate-x-full"
                                    animate={{ translateX: ['100%', '-100%'] }}
                                    transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                                />
                                <div className="h-2 w-16 bg-white/5 rounded mb-3" />
                                <div className="h-3 w-full bg-white/5 rounded mb-2" />
                                <div className="h-2 w-3/4 bg-white/5 rounded" />
                            </div>
                        ))}
                    </div>
                ) : trends.length === 0 ? (
                     <div className="h-60 flex flex-col items-center justify-center text-neutral-600 gap-4">
                        <div className="relative">
                            <TrendingUp className="w-12 h-12 opacity-10" />
                            <motion.div 
                                className="absolute inset-0 border border-indigo-500/20 rounded-full"
                                animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                                transition={{ repeat: Infinity, duration: 2 }}
                            />
                        </div>
                        <div className="text-center">
                            <p className="text-[10px] font-black tracking-[0.3em] mb-1">NO ACTIVE SIGNALS</p>
                            <p className="text-[9px] text-neutral-500 mb-4 opacity-50 uppercase tracking-widest">Ghost Agent is standing by</p>
                            <button 
                                onClick={handleScan} 
                                className="px-6 py-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[9px] font-black rounded-full hover:bg-indigo-500/20 transition-all uppercase tracking-widest"
                            >
                                Initialize Deep Scan
                            </button>
                        </div>
                     </div>
                ) : (
                    <AnimatePresence>
                        {trends.map((trend, i) => (
                            <motion.div
                                key={trend.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="group relative p-4 bg-white/[0.02] border border-white/5 rounded-xl hover:border-indigo-500/30 transition-all cursor-pointer"
                                onClick={() => onSelectTrend(trend)}
                            >
                                <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <ArrowUpRight className="w-3 h-3 text-indigo-400" />
                                </div>

                                <div className="flex items-start justify-between mb-2">
                                    <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded border ${
                                        trend.suggestedAngle === 'contrarian' ? 'border-red-500/30 text-red-400' :
                                        trend.suggestedAngle === 'prediction' ? 'border-purple-500/30 text-purple-400' :
                                        'border-blue-500/30 text-blue-400'
                                    }`}>
                                        {trend.suggestedAngle}
                                    </span>
                                    <span className="text-[8px] font-mono text-neutral-600">{trend.viralityScore}% VIRALITY</span>
                                </div>

                                <h4 className="text-xs font-bold text-white mb-1 line-clamp-2 leading-relaxed group-hover:text-indigo-200 transition-colors">
                                    {trend.headline}
                                </h4>
                                <p className="text-[10px] text-neutral-500 line-clamp-2">
                                    {trend.context}
                                </p>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                )}
            </div>

            {/* Footer Status */}
            <div className="p-2 border-t border-white/5 bg-black/60 flex items-center justify-between text-[8px] font-mono text-neutral-600 px-4">
                <span>SECTOR: AI & TECH</span>
                <span>{lastUpdated ? `UPDATED: ${lastUpdated.toLocaleTimeString()}` : 'IDLE'}</span>
            </div>
        </div>
    );
}
