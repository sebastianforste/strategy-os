"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileBarChart, Download, Mail, Share2, Printer, ChevronRight, FileText, CheckCircle, Clock, Filter, Search, MoreHorizontal, Layout, PieChart, TrendingUp } from "lucide-react";

interface Report {
    id: string;
    title: string;
    date: string;
    type: 'Weekly' | 'Monthly' | 'Custom';
    status: 'Generated' | 'Queued' | 'Scheduled';
    downloadUrl?: string;
}

const RECENT_REPORTS: Report[] = [
    { id: 'r1', title: 'Executive Strategy Audit - Q1', date: 'Mar 10, 2026', type: 'Monthly', status: 'Generated' },
    { id: 'r2', title: 'Viral Velocity Analysis - Week 10', date: 'Mar 08, 2026', type: 'Weekly', status: 'Generated' },
    { id: 'r3', title: 'Lead Gen Attribution Report', date: 'Mar 12, 2026', type: 'Custom', status: 'Queued' },
];

export default function ExecutiveReporter() {
    const [reports] = useState<Report[]>(RECENT_REPORTS);
    const [isGenerating, setIsGenerating] = useState(false);

    const handleGenerate = () => {
        setIsGenerating(true);
        setTimeout(() => setIsGenerating(false), 2500);
    };

    return (
        <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-8 min-h-[700px]">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12">
                <div className="flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-brand-500/10 text-brand-400 border border-brand-500/20">
                        <FileBarChart className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white uppercase tracking-tight">Executive Studio</h2>
                        <p className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-mono mt-1">Automated Strategic Reporting & Exports</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button 
                        onClick={handleGenerate}
                        disabled={isGenerating}
                        className="px-6 py-2.5 bg-brand-500 text-white rounded-xl text-[10px] font-black tracking-widest hover:scale-105 transition-all shadow-lg shadow-brand-500/20 uppercase flex items-center gap-2"
                    >
                        {isGenerating ? <RefreshCcw className="w-3.5 h-3.5 animate-spin" /> : <Layout className="w-3.5 h-3.5" />}
                        <span>Compile Report</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* RECENT REPORTS TABLE */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Generated Assets</h3>
                        <div className="flex items-center gap-2">
                            <button className="p-2 text-white/20 hover:text-white transition-colors"><Search className="w-4 h-4" /></button>
                            <button className="p-2 text-white/20 hover:text-white transition-colors"><Filter className="w-4 h-4" /></button>
                        </div>
                    </div>

                    <div className="overflow-hidden border border-white/5 rounded-2xl bg-white/[0.02]">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/5 bg-white/[0.02]">
                                    <th className="px-6 py-4 text-[9px] font-black text-white/40 uppercase tracking-widest">Report Name</th>
                                    <th className="px-6 py-4 text-[9px] font-black text-white/40 uppercase tracking-widest">Type</th>
                                    <th className="px-6 py-4 text-[9px] font-black text-white/40 uppercase tracking-widest text-right">Date</th>
                                    <th className="px-6 py-4 text-[9px] font-black text-white/40 uppercase tracking-widest text-right">Status</th>
                                    <th className="px-6 py-4 text-[9px] font-black text-white/40 uppercase tracking-widest"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {reports.map((report) => (
                                    <tr key={report.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.03] transition-colors group">
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <FileText className="w-4 h-4 text-brand-400/60" />
                                                <span className="text-xs font-bold text-white uppercase tracking-tight truncate max-w-[200px]">{report.title}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">{report.type}</span>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <span className="text-[10px] font-mono text-white/40">{report.date}</span>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <div className="flex items-center gap-1.5 justify-end">
                                                {report.status === 'Generated' ? (
                                                    <CheckCircle className="w-3 h-3 text-emerald-500" />
                                                ) : (
                                                    <Clock className="w-3 h-3 text-amber-500" />
                                                )}
                                                <span className={`text-[9px] font-bold uppercase tracking-widest ${
                                                    report.status === 'Generated' ? 'text-emerald-500' : 'text-amber-500'
                                                }`}>
                                                    {report.status}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <div className="flex items-center gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button className="p-2 bg-white/5 rounded-lg text-white/40 hover:text-white transition-colors" title="Download PDF"><Download className="w-3.5 h-3.5" /></button>
                                                <button className="p-2 bg-white/5 rounded-lg text-white/40 hover:text-white transition-colors" title="Send Email"><Mail className="w-3.5 h-3.5" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* SIDEBAR OPS */}
                <div className="space-y-6">
                    <h3 className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-4">Distribution Portal</h3>
                    
                    <div className="p-8 bg-brand-500/5 border border-brand-500/10 rounded-3xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-5">
                            <PieChart className="w-32 h-32" />
                        </div>
                        
                        <div className="flex items-center gap-3 mb-8">
                            <TrendingUp className="w-5 h-5 text-brand-400" />
                            <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Automated Insights</h4>
                        </div>
                        
                        <p className="text-xs text-white/60 leading-relaxed italic mb-8">
                            "Last month, 84% of your strategy milestones were achieved 12 days ahead of schedule. Efficiency is up 22%."
                        </p>

                        <div className="space-y-3">
                            <button className="w-full py-2.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-[9px] font-black text-white uppercase tracking-widest transition-all text-center">
                                View Full Metrics
                            </button>
                        </div>
                    </div>

                    <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl space-y-4">
                        <div className="flex items-center gap-3">
                            <Mail className="w-4 h-4 text-emerald-400" />
                            <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Recursive Delivery</h4>
                        </div>
                        <p className="text-[9px] text-white/40 leading-relaxed italic">
                            Your weekly audit is set to deliver to `sebastian@strategy-os.ai` every Monday at 9:00 AM EST.
                        </p>
                        <button className="w-full py-2.5 bg-brand-500/10 hover:bg-brand-500/20 border border-brand-500/20 rounded-xl text-[9px] font-black text-brand-400 uppercase tracking-widest transition-all">
                            Manage Schedules
                        </button>
                    </div>

                    <div className="p-6 border border-white/5 rounded-2xl flex items-center justify-between cursor-pointer hover:bg-white/5 transition-all">
                        <div className="flex items-center gap-3">
                            <Printer className="w-4 h-4 text-white/20" />
                            <span className="text-[10px] font-bold text-white uppercase tracking-tight">Print Layout Mode</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-white/20" />
                    </div>
                </div>
            </div>
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
