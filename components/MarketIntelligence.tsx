"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, TrendingDown, Zap, Globe, BarChart3, Activity, PieChart, Newspaper, Rocket, AlertTriangle, ChevronRight, Search, Filter, RefreshCw } from "lucide-react";

interface TickerItem {
    id: string;
    symbol: string;
    price: string;
    change: number;
    sentiment: 'Bullish' | 'Bearish' | 'Neutral';
}

const TICKERS: TickerItem[] = [
    { id: '1', symbol: 'BTC/USD', price: '64,242.00', change: 2.4, sentiment: 'Bullish' },
    { id: '2', symbol: 'ETH/USD', price: '3,482.10', change: -1.2, sentiment: 'Neutral' },
    { id: '3', symbol: 'SOL/USD', price: '142.50', change: 8.4, sentiment: 'Bullish' },
    { id: '4', symbol: 'AI/INDEX', price: '1.42', change: 12.0, sentiment: 'Bullish' },
];

interface NewsItem {
    id: string;
    title: string;
    source: string;
    impact: 'High' | 'Medium' | 'Low';
    time: string;
}

const NEWS: NewsItem[] = [
    { id: 'n1', title: 'OpenAI announces next-gen Agentic architecture', source: 'Reuters', impact: 'High', time: '12m ago' },
    { id: 'n2', title: 'Tech indices hit all-time high amid AI boom', source: 'Bloomberg', impact: 'Medium', time: '42m ago' },
    { id: 'n3', title: 'New regulation proposed for decentralized social', source: 'CNBC', impact: 'High', time: '1h ago' },
];

export default function MarketIntelligence() {
    const [tickers, setTickers] = useState(TICKERS);
    const [news] = useState(NEWS);

    // Simulate live ticker updates
    useEffect(() => {
        const interval = setInterval(() => {
            setTickers(prev => prev.map(t => ({
                ...t,
                price: (parseFloat(t.price.replace(',', '')) + (Math.random() - 0.5) * 10).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
                change: t.change + (Math.random() - 0.5) * 0.5
            })));
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-8 min-h-[700px]">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12">
                <div className="flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-brand-400/10 text-brand-400 border border-brand-400/20">
                        <Activity className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white uppercase tracking-tight">Market Intelligence</h2>
                        <p className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-mono mt-1">Live Alpha & Sector Intelligence</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Live Streaming</span>
                    </div>
                </div>
            </div>

            {/* TICKER RIBBON */}
            <div className="flex gap-4 overflow-hidden mb-12 py-2 border-y border-white/5 bg-white/[0.01]">
                <div className="flex items-center gap-8 animate-marquee whitespace-nowrap">
                    {tickers.concat(tickers).map((t, i) => (
                        <div key={i} className="flex items-center gap-3 min-w-[180px]">
                            <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">{t.symbol}</span>
                            <span className="text-xs font-mono text-white font-bold">{t.price}</span>
                            <span className={`text-[10px] font-bold ${t.change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                {t.change >= 0 ? '+' : ''}{t.change.toFixed(2)}%
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* LIVE NEWS OPS */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">High-Impact Global Events</h3>
                        <div className="flex gap-2 p-1 bg-white/5 rounded-xl border border-white/10">
                            <button className="p-2 text-white/40 hover:text-white transition-colors"><Search className="w-4 h-4" /></button>
                            <button className="p-2 text-white/40 hover:text-white transition-colors"><Filter className="w-4 h-4" /></button>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {news.map((item) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="p-6 bg-white/5 border border-white/5 rounded-3xl hover:border-brand-500/20 transition-all flex items-start gap-5 cursor-pointer group"
                            >
                                <div className={`p-3 rounded-2xl ${
                                    item.impact === 'High' ? 'bg-rose-500/10 text-rose-400' : 'bg-blue-500/10 text-blue-400'
                                } border border-white/5`}>
                                    <Newspaper className="w-5 h-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${
                                            item.impact === 'High' ? 'bg-rose-500 text-black shadow-[0_0_10px_rgba(244,63,94,0.4)]' : 'bg-white/10 text-white/40'
                                        }`}>
                                            {item.impact} IMPACT
                                        </span>
                                        <span className="text-[9px] font-mono text-white/20 uppercase">{item.source}</span>
                                        <span className="w-1 h-1 rounded-full bg-white/10" />
                                        <span className="text-[9px] font-mono text-white/20 uppercase">{item.time}</span>
                                    </div>
                                    <h4 className="text-sm font-bold text-white uppercase tracking-tight leading-relaxed group-hover:text-brand-400 transition-colors">
                                        {item.title}
                                    </h4>
                                </div>
                                <button className="p-2 text-white/10 hover:text-white transition-colors">
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* STRATEGIC ALPHA */}
                <div className="space-y-6">
                    <h3 className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-4">Sentiment Clusters</h3>
                    
                    <div className="p-8 bg-brand-500/5 border border-brand-500/10 rounded-3xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:rotate-12 transition-transform duration-700">
                            <Zap className="w-32 h-32 text-brand-400" />
                        </div>
                        
                        <div className="flex items-center gap-3 mb-8">
                            <PieChart className="w-5 h-5 text-brand-400" />
                            <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Opportunity Score</h4>
                        </div>
                        
                        <div className="text-4xl font-black text-white tracking-tighter mb-2">84.2%</div>
                        <p className="text-[10px] text-white/40 uppercase font-black tracking-widest mb-8">Bullish Strategy Window</p>

                        <div className="space-y-4 pt-4 border-t border-white/5">
                            <div className="flex items-center justify-between text-[10px] font-bold">
                                <span className="text-white/40 uppercase">Retail Fear</span>
                                <span className="text-emerald-400">LOW</span>
                            </div>
                            <div className="flex items-center justify-between text-[10px] font-bold">
                                <span className="text-white/40 uppercase">Institutional Flow</span>
                                <span className="text-emerald-400">HIGH</span>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center justify-between group cursor-pointer hover:bg-white/5 transition-all">
                        <div className="flex items-center gap-3">
                            <Rocket className="w-4 h-4 text-brand-400" />
                            <span className="text-[10px] font-bold text-white uppercase">Sector: AI/Agents</span>
                        </div>
                        <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">+12.4%</span>
                    </div>

                    <div className="p-6 bg-rose-500/5 border border-rose-500/10 rounded-2xl">
                        <div className="flex items-start gap-4">
                            <AlertTriangle className="w-5 h-5 text-rose-400" />
                            <div>
                                <h4 className="text-[10px] font-bold text-rose-400 uppercase tracking-widest mb-1">Vol Alert</h4>
                                <p className="text-[9px] text-white/40 leading-relaxed italic">
                                    High volatility expected in `B2B SaaS` cluster. Consider defensive content narrative for the next 24H.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <style jsx>{`
                @keyframes marquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                .animate-marquee {
                    animation: marquee 30s linear infinite;
                }
            `}</style>
        </div>
    );
}
