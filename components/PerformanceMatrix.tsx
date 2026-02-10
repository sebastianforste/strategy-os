"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BarChart, TrendingUp, Users, Target, Briefcase, ChevronRight, Activity, Zap, PieChart, Shield, RefreshCw, Layers, Database, MousePointer2, FileText, Globe, Star, StarOff } from "lucide-react";

interface ClientMatrix {
    id: string;
    name: string;
    roi: string;
    efficiency: number;
    status: 'Growth' | 'Steady' | 'Audit';
}

const CLIENTS: ClientMatrix[] = [
    { id: 'c1', name: 'Alpha Ventures', roi: '+424%', efficiency: 98, status: 'Growth' },
    { id: 'c2', name: 'Neural Flow', roi: '+112%', efficiency: 84, status: 'Steady' },
    { id: 'c3', name: 'Aether Capital', roi: '+12%', efficiency: 62, status: 'Audit' },
];

export default function PerformanceMatrix() {
    const [clients] = useState<ClientMatrix[]>(CLIENTS);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const handleRefresh = () => {
        setIsRefreshing(true);
        setTimeout(() => setIsRefreshing(false), 2000);
    };

    return (
        <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-8 min-h-[700px]">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12">
                <div className="flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-brand-400/10 text-brand-400 border border-brand-400/20 shadow-[0_0_20px_rgba(34,211,238,0.1)]">
                        <BarChart className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white uppercase tracking-tight">Agency Matrix</h2>
                        <p className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-mono mt-1">Agency-Scale ROI Tracking & Strategic Efficiency Scoring</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button 
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                        className="px-6 py-2.5 bg-brand-500 text-white rounded-xl text-[10px] font-black tracking-widest hover:shadow-[0_0_30px_rgba(34,211,238,0.3)] transition-all uppercase flex items-center gap-2"
                    >
                        {isRefreshing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Star className="w-3.5 h-3.5" />}
                        <span>{isRefreshing ? "Calculating..." : "Sync Global ROI"}</span>
                    </button>
                    <div className="p-2.5 bg-white/5 border border-white/10 rounded-xl text-white/40">
                        <FileText className="w-4 h-4" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* PERFORMANCE GRID */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Client Ecosystem</h3>
                        <div className="flex items-center gap-4 text-[10px] font-black text-white/40 uppercase tracking-widest">
                            <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-brand-400" /> Aggregated Yield: +284%</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {clients.map((client) => (
                            <motion.div
                                key={client.id}
                                whileHover={{ scale: 1.02 }}
                                className={`p-6 bg-white/[0.02] border rounded-[32px] transition-all relative overflow-hidden ${
                                    client.status === 'Growth' ? 'border-brand-500/20 shadow-[0_0_30px_rgba(34,211,238,0.05)]' : 'border-white/5 shadow-xl'
                                }`}
                            >
                                <div className="flex items-center justify-between mb-8">
                                    <div className="p-3 bg-white/5 rounded-2xl text-white/20">
                                        <Briefcase className="w-4 h-4" />
                                    </div>
                                    <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${
                                        client.status === 'Growth' ? 'bg-brand-500/20 text-brand-400' : 
                                        client.status === 'Steady' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                                    }`}>
                                        {client.status}
                                    </span>
                                </div>
                                <h4 className="text-sm font-bold text-white uppercase tracking-tight mb-1">{client.name}</h4>
                                <div className="text-2xl font-black text-white mb-4 tracking-tighter">{client.roi}</div>
                                
                                <div className="space-y-2">
                                    <div className="flex justify-between text-[9px] font-black text-white/20 uppercase">
                                        <span>Efficiency</span>
                                        <span className="text-brand-400">{client.efficiency}%</span>
                                    </div>
                                    <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                                        <motion.div initial={{ width: 0 }} animate={{ width: `${client.efficiency}%` }} className="h-full bg-brand-500" />
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <div className="p-8 bg-white/[0.01] border border-white/5 rounded-[40px] space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Strategy Portfolio Variance</h3>
                            <PieChart className="w-4 h-4 text-brand-400" />
                        </div>
                        <div className="space-y-4">
                            <VarianceItem label="Content Operations" val={64} trend="+12" />
                            <VarianceItem label="Lead Acquisition" val={28} trend="+4" />
                            <VarianceItem label="Brand Equity" val={8} trend="-2" />
                        </div>
                    </div>
                </div>

                {/* AGENCY VITALS */}
                <div className="space-y-6">
                    <h3 className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-4">Ecosystem Vitals</h3>
                    
                    <div className="p-8 bg-brand-500/5 border border-brand-500/10 rounded-3xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-700">
                           <Globe className="w-32 h-32 text-brand-400" />
                        </div>
                        <div className="flex items-center gap-3 mb-8">
                            <Activity className="w-5 h-5 text-brand-400" />
                            <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Global Efficiency</h4>
                        </div>
                        <div className="text-4xl font-black text-white tracking-tighter mb-2">91.4<span className="text-brand-500">.</span>02</div>
                        <p className="text-[10px] text-white/40 uppercase font-black tracking-widest mb-8">Aggregate Agency Health Score</p>

                        <div className="space-y-4">
                            <div className="flex justify-between text-[10px] font-bold text-white/20 uppercase">
                                <span>Autonomous Workload</span>
                                <span className="text-emerald-400">84%</span>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl space-y-4">
                        <div className="flex items-center gap-3">
                            <Shield className="w-4 h-4 text-brand-400" />
                            <h4 className="text-[10px] font-bold text-white uppercase tracking-widest">Client Auth Shield</h4>
                        </div>
                        <p className="text-[10px] text-white/40 leading-relaxed uppercase font-black tracking-tighter">
                            All 12 agency profiles synchronized with bi-rotational encryption. No strategy drift detected across silos.
                        </p>
                    </div>

                    <div className="p-6 border border-white/5 rounded-2xl flex items-center justify-between cursor-pointer hover:bg-white/5 transition-all group">
                        <div className="flex items-center gap-3">
                            <Database className="w-4 h-4 text-white/20 group-hover:text-white" />
                            <span className="text-[10px] font-bold text-white uppercase tracking-tight">Access Agency Vault</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-white/20" />
                    </div>
                </div>
            </div>
        </div>
    );
}

function VarianceItem({ label, val, trend }: { label: string, val: number, trend: string }) {
    return (
        <div className="space-y-2">
            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                <span className="text-white/40">{label}</span>
                <div className="flex items-center gap-2">
                    <span className="text-white">{val}%</span>
                    <span className={trend.startsWith('+') ? 'text-emerald-400' : 'text-rose-400'}>{trend}%</span>
                </div>
            </div>
            <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${val}%` }} className="h-full bg-brand-500" />
            </div>
        </div>
    );
}
