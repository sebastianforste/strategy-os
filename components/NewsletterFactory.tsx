"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Send, Layout, Newspaper, Sparkles, ChevronRight, CheckCircle, Clock, Filter, Search, MoreHorizontal, FileText, Share2, Rocket, Zap, BookOpen } from "lucide-react";

interface NewsletterEdition {
    id: string;
    title: string;
    date: string;
    status: 'Draft' | 'Sent' | 'Scheduled';
    subscribers: number;
    openRate: string;
}

const EDITIONS: NewsletterEdition[] = [
    { id: 'e1', title: 'The Agentic Alpha - Weekly #42', date: 'Mar 10, 2026', status: 'Sent', subscribers: 12400, openRate: '54%' },
    { id: 'e2', title: 'World-Class Persona Design', date: 'Mar 08, 2026', status: 'Sent', subscribers: 11900, openRate: '48%' },
    { id: 'e3', title: 'B2B SaaS Growth Loops', date: 'Mar 15, 2026', status: 'Scheduled', subscribers: 12500, openRate: '--' },
];

export default function NewsletterFactory() {
    const [editions] = useState<NewsletterEdition[]>(EDITIONS);
    const [isTransposing, setIsTransposing] = useState(false);

    const handleTranspose = () => {
        setIsTransposing(true);
        setTimeout(() => setIsTransposing(false), 2500);
    };

    return (
        <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-8 min-h-[700px]">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12">
                <div className="flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-brand-500/10 text-brand-400 border border-brand-500/20">
                        <Newspaper className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white uppercase tracking-tight">Newsletter Factory</h2>
                        <p className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-mono mt-1">LinkedIn-to-Newsletter Content Transposition</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button 
                        onClick={handleTranspose}
                        disabled={isTransposing}
                        className="px-6 py-2.5 bg-brand-500 text-white rounded-xl text-[10px] font-black tracking-widest hover:scale-105 transition-all shadow-lg shadow-brand-500/20 uppercase flex items-center gap-2"
                    >
                        {isTransposing ? <RefreshCcw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                        <span>{isTransposing ? "Transposing..." : "Transpose Post"}</span>
                    </button>
                    <button className="p-2.5 bg-white/5 border border-white/10 rounded-xl text-white/40 hover:text-white transition-all">
                        <Share2 className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* ARCHIVE TABLE */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Edition Archive</h3>
                        <div className="flex items-center gap-2">
                            <button className="p-2 text-white/20 hover:text-white transition-colors"><Search className="w-4 h-4" /></button>
                            <button className="p-2 text-white/20 hover:text-white transition-colors"><Filter className="w-4 h-4" /></button>
                        </div>
                    </div>

                    <div className="overflow-hidden border border-white/5 rounded-3xl bg-white/[0.01]">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-white/5 bg-white/[0.02]">
                                    <th className="px-8 py-5 text-[9px] font-black text-white/40 uppercase tracking-widest">Edition Title</th>
                                    <th className="px-8 py-5 text-[9px] font-black text-white/40 uppercase tracking-widest">Growth</th>
                                    <th className="px-8 py-5 text-[9px] font-black text-white/40 uppercase tracking-widest text-right">Open Rate</th>
                                    <th className="px-8 py-5 text-[9px] font-black text-white/40 uppercase tracking-widest text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {editions.map((edition) => (
                                    <tr key={edition.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.03] transition-all group cursor-pointer">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-white/10 to-transparent border border-white/10 flex items-center justify-center">
                                                    <BookOpen className="w-4 h-4 text-white/40" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-white tracking-tight uppercase group-hover:text-brand-400 transition-colors">{edition.title}</p>
                                                    <p className="text-[9px] font-mono text-white/20 uppercase tracking-tighter">{edition.date}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="text-[10px] font-mono text-white/60 tracking-tighter">{edition.subscribers.toLocaleString()} SUBS</span>
                                        </td>
                                        <td className="px-8 py-6 text-right font-mono text-[11px] text-white/60">{edition.openRate}</td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex items-center gap-1.5 justify-end">
                                                {edition.status === 'Sent' ? <CheckCircle className="w-3 h-3 text-emerald-500" /> : <Clock className="w-3 h-3 text-amber-500" />}
                                                <span className={`text-[8px] font-black uppercase tracking-widest ${
                                                    edition.status === 'Sent' ? 'text-emerald-500' : 'text-amber-500'
                                                }`}>
                                                    {edition.status}
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* DISTRIBUTION OPS */}
                <div className="space-y-6">
                    <h3 className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-4">Transmission Hub</h3>
                    
                    <div className="p-8 bg-brand-500/5 border border-brand-500/10 rounded-3xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:rotate-6 transition-transform duration-700">
                            <Mail className="w-32 h-32 text-brand-400" />
                        </div>
                        
                        <div className="flex items-center gap-3 mb-8">
                            <Rocket className="w-5 h-5 text-brand-400" />
                            <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Growth Engine</h4>
                        </div>
                        
                        <p className="text-xs text-white/60 leading-relaxed italic mb-8">
                            Convert your top-performing LinkedIn series into a long-form newsletter edition. Automated formatting for Substack & Ghost.
                        </p>

                        <button className="w-full py-3 bg-white text-black rounded-xl text-[9px] font-black uppercase tracking-widest hover:scale-[1.02] transition-all">
                            Blast Latest Edition
                        </button>
                    </div>

                    <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl space-y-4">
                        <div className="flex items-center justify-between">
                            <h4 className="text-[10px] font-bold text-white uppercase tracking-widest">Subscriber Flow</h4>
                            <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded text-[8px] font-black uppercase">+12% WoW</span>
                        </div>
                        <div className="space-y-3">
                            <MetricBox label="Unique Opens" value="6.4k" />
                            <MetricBox label="Link Clicks" value="1.2k" />
                        </div>
                    </div>

                    <div className="p-6 border border-white/5 rounded-2xl flex items-center justify-between cursor-pointer hover:bg-white/5 transition-all group">
                        <div className="flex items-center gap-3">
                            <Layout className="w-4 h-4 text-white/20 group-hover:text-white" />
                            <span className="text-[10px] font-bold text-white uppercase tracking-tight">Template Designer</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-white/20" />
                    </div>
                </div>
            </div>
        </div>
    );
}

function MetricBox({ label, value }: { label: string, value: string }) {
    return (
        <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5">
            <span className="text-[10px] uppercase font-black text-white/20">{label}</span>
            <span className="text-[10px] font-bold text-white tracking-widest">{value}</span>
        </div>
    );
}

function RefreshCcw(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
            <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
            <path d="M16 16h5v5" />
        </svg>
    );
}
