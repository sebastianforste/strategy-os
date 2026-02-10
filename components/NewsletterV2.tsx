"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Send, Layers, Users, TrendingUp, Target, ChevronRight, Activity, Zap, Shield, RefreshCw, Database, MousePointer2, FileText, Globe, Star, Plus, MailOpen, BarChart3, Settings } from "lucide-react";

interface NewsletterSegment {
    id: string;
    label: string;
    count: string;
    engagement: number;
    status: 'Growth' | 'Steady' | 'Optimization';
}

const SEGMENTS: NewsletterSegment[] = [
    { id: 's1', label: 'Executive Alpha', count: '1.2k', engagement: 92, status: 'Growth' },
    { id: 's2', label: 'Tech Founders', count: '4.8k', engagement: 74, status: 'Steady' },
    { id: 's3', label: 'Sovereign Devs', count: '12.4k', engagement: 68, status: 'Optimization' },
];

export default function NewsletterV2() {
    const [segments] = useState<NewsletterSegment[]>(SEGMENTS);
    const [isSending, setIsSending] = useState(false);

    const handleSend = () => {
        setIsSending(true);
        setTimeout(() => setIsSending(false), 3000);
    };

    return (
        <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-8 min-h-[700px]">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12">
                <div className="flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20 shadow-[0_0_20px_rgba(244,63,94,0.1)]">
                        <Mail className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white uppercase tracking-tight">Newsletter OS V2</h2>
                        <p className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-mono mt-1">Multi-Segment Content Personalization & Autonomous Beehiiv Bridging</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button 
                        onClick={handleSend}
                        disabled={isSending}
                        className="px-6 py-2.5 bg-rose-500 text-white rounded-xl text-[10px] font-black tracking-widest hover:shadow-[0_0_30px_rgba(244,63,94,0.3)] transition-all uppercase flex items-center gap-2"
                    >
                        {isSending ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                        <span>{isSending ? "Dispatching..." : "Publish Issue"}</span>
                    </button>
                    <div className="p-2.5 bg-white/5 border border-white/10 rounded-xl text-white/40">
                        <Settings className="w-4 h-4" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* SEGMENTATION ENGINE */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Active Audience Segments</h3>
                        <div className="flex items-center gap-4 text-[10px] font-black text-white/40 uppercase tracking-widest">
                            <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> API: Beehiiv Connected</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {segments.map((segment) => (
                            <motion.div
                                key={segment.id}
                                whileHover={{ scale: 1.02 }}
                                className={`p-6 bg-white/[0.02] border rounded-[32px] transition-all relative overflow-hidden ${
                                    segment.status === 'Growth' ? 'border-rose-500/20 shadow-[0_0_30px_rgba(244,63,94,0.05)]' : 'border-white/5 shadow-xl'
                                }`}
                            >
                                <div className="flex items-center justify-between mb-8">
                                    <div className="p-3 bg-white/5 rounded-2xl text-white/20">
                                        <Users className="w-4 h-4" />
                                    </div>
                                    <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${
                                        segment.status === 'Growth' ? 'bg-rose-500/20 text-rose-400' : 
                                        segment.status === 'Steady' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-500'
                                    }`}>
                                        {segment.status}
                                    </span>
                                </div>
                                <h4 className="text-sm font-bold text-white uppercase tracking-tight mb-1">{segment.label}</h4>
                                <div className="text-2xl font-black text-white mb-4 tracking-tighter">{segment.count}</div>
                                
                                <div className="space-y-2">
                                    <div className="flex justify-between text-[9px] font-black text-white/20 uppercase">
                                        <span>Open Rate</span>
                                        <span className="text-rose-400">{segment.engagement}%</span>
                                    </div>
                                    <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                                        <motion.div initial={{ width: 0 }} animate={{ width: `${segment.engagement}%` }} className="h-full bg-rose-500" />
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <div className="p-8 bg-white/[0.01] border border-white/5 rounded-[40px] space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Next Issue Blueprint</h3>
                            <MailOpen className="w-4 h-4 text-rose-500" />
                        </div>
                        <div className="p-6 bg-black/40 rounded-3xl border border-white/5 font-mono text-[11px] leading-relaxed italic text-white/60">
                            "The Sovereign Strategy Era: Why 2026 is the year of the agentic exit. In this issue, we dive deep into LanceDB scaling for multi-tenant personas and why your high-status voice is your only moat."
                        </div>
                        <div className="flex flex-wrap gap-2 pt-2">
                            <Tag label="RAG Context" />
                            <Tag label="Vector Scaling" />
                            <Tag label="Agentic Ops" />
                        </div>
                    </div>
                </div>

                {/* CAMPAIGN VITALS */}
                <div className="space-y-6">
                    <h3 className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-4">Newsletter Vitals</h3>
                    
                    <div className="p-8 bg-rose-500/5 border border-rose-500/10 rounded-3xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-700">
                           <TrendingUp className="w-32 h-32 text-rose-400" />
                        </div>
                        <div className="flex items-center gap-3 mb-8">
                            <BarChart3 className="w-5 h-5 text-rose-400" />
                            <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Growth Velocity</h4>
                        </div>
                        <div className="text-4xl font-black text-white tracking-tighter mb-2">18.4k</div>
                        <p className="text-[10px] text-white/40 uppercase font-black tracking-widest mb-8">Aggregate Subscriber Count</p>

                        <div className="space-y-4">
                            <div className="flex justify-between text-[10px] font-bold text-white/20 uppercase">
                                <span>Churn Rate Vector</span>
                                <span className="text-emerald-400">-1.2% (Low)</span>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl space-y-4">
                        <div className="flex items-center gap-3">
                            <Target className="w-4 h-4 text-rose-400" />
                            <h4 className="text-[10px] font-bold text-white uppercase tracking-widest">Autonomous Segmenting</h4>
                        </div>
                        <p className="text-[10px] text-white/40 leading-relaxed uppercase font-black tracking-tighter">
                            New subscribers are automatically analyzed via semantic NLP and assigned to executive or technical cohorts.
                        </p>
                    </div>

                    <div className="p-6 border border-white/5 rounded-2xl flex items-center justify-between cursor-pointer hover:bg-white/5 transition-all group">
                        <div className="flex items-center gap-3">
                            <Database className="w-4 h-4 text-white/20 group-hover:text-white" />
                            <span className="text-[10px] font-bold text-white uppercase tracking-tight">Access Historical Campaigns</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-white/20" />
                    </div>
                </div>
            </div>
        </div>
    );
}

function Tag({ label }: { label: string }) {
    return (
        <span className="px-3 py-1 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[8px] font-black uppercase tracking-widest rounded-full">
            {label}
        </span>
    );
}
