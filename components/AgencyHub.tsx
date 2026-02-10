"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Layout, Building2, ChevronRight, Plus, ShieldCheck, CheckCircle, Clock, MoreHorizontal, Search, Filter, Briefcase, Globe, BarChart3, Settings2, UserPlus, Trash2 } from "lucide-react";

interface BrandAccount {
    id: string;
    name: string;
    industry: string;
    users: number;
    status: 'Active' | 'Pending Approval' | 'Inactive';
}

const ACCOUNTS: BrandAccount[] = [
    { id: 'b1', name: 'Synthetix AI', industry: 'SaaS / AI', users: 12, status: 'Active' },
    { id: 'b2', name: 'Lumina Growth', industry: 'Marketing Agency', users: 4, status: 'Active' },
    { id: 'b3', name: 'Arcane Capital', industry: 'Venture Capital', users: 8, status: 'Pending Approval' },
];

export default function AgencyHub() {
    const [accounts] = useState<BrandAccount[]>(ACCOUNTS);
    const [isAdding, setIsAdding] = useState(false);

    return (
        <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-8 min-h-[700px]">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12">
                <div className="flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-brand-400/10 text-brand-400 border border-brand-400/20">
                        <Building2 className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white uppercase tracking-tight">Agency Command</h2>
                        <p className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-mono mt-1">Multi-Account & Client Portfolio Management</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => setIsAdding(true)}
                        className="px-6 py-2.5 bg-brand-500 text-white rounded-xl text-[10px] font-black tracking-widest hover:scale-105 transition-all shadow-lg shadow-brand-500/20 uppercase flex items-center gap-2"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Onboard Brand</span>
                    </button>
                    <div className="p-2.5 bg-white/5 border border-white/10 rounded-xl text-white/40 hover:text-white transition-all">
                        <UserPlus className="w-4 h-4" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* ACCOUNTS TABLE */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Portfolio Overview</h3>
                        <div className="flex items-center gap-2">
                            <button className="p-2 text-white/20 hover:text-white transition-colors"><Search className="w-4 h-4" /></button>
                            <button className="p-2 text-white/20 hover:text-white transition-colors"><Filter className="w-4 h-4" /></button>
                        </div>
                    </div>

                    <div className="overflow-hidden border border-white/5 rounded-3xl bg-white/[0.01]">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-white/5 bg-white/[0.02]">
                                    <th className="px-8 py-5 text-[9px] font-black text-white/40 uppercase tracking-widest">Brand Alias</th>
                                    <th className="px-8 py-5 text-[9px] font-black text-white/40 uppercase tracking-widest">Vertical</th>
                                    <th className="px-8 py-5 text-[9px] font-black text-white/40 uppercase tracking-widest text-right">Team</th>
                                    <th className="px-8 py-5 text-[9px] font-black text-white/40 uppercase tracking-widest text-right">Status</th>
                                    <th className="px-8 py-5 text-[9px] font-black text-white/40 uppercase tracking-widest"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {accounts.map((account) => (
                                    <tr key={account.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.03] transition-all group cursor-pointer">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-white/10 to-transparent border border-white/10 flex items-center justify-center">
                                                    <Briefcase className="w-4 h-4 text-white/40" />
                                                </div>
                                                <span className="text-sm font-bold text-white tracking-tight uppercase group-hover:text-brand-400 transition-colors">{account.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="text-[10px] font-mono text-white/40 uppercase tracking-tighter">{account.industry}</span>
                                        </td>
                                        <td className="px-8 py-6 text-right font-mono text-[11px] text-white/60">{account.users} Seats</td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex items-center gap-1.5 justify-end">
                                                {account.status === 'Active' ? <CheckCircle className="w-3 h-3 text-emerald-500" /> : <Clock className="w-3 h-3 text-amber-500" />}
                                                <span className={`text-[8px] font-black uppercase tracking-widest ${
                                                    account.status === 'Active' ? 'text-emerald-500' : 'text-amber-500'
                                                }`}>
                                                    {account.status}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <button className="p-2 text-white/10 hover:text-white transition-colors"><MoreHorizontal className="w-4 h-4" /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* AGENCY OPS */}
                <div className="space-y-6">
                    <h3 className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-4">Strategic Control</h3>
                    
                    <div className="p-8 bg-brand-500/5 border border-brand-500/10 rounded-3xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:rotate-6 transition-transform duration-700">
                            <ShieldCheck className="w-32 h-32 text-brand-400" />
                        </div>
                        
                        <div className="flex items-center gap-3 mb-8">
                            <Globe className="w-5 h-5 text-brand-400" />
                            <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Global Synchro</h4>
                        </div>
                        
                        <p className="text-xs text-white/60 leading-relaxed italic mb-8">
                            Push updates, personas, and strategic guidelines across all client accounts in one click.
                        </p>

                        <button className="w-full py-3 bg-white text-black rounded-xl text-[9px] font-black uppercase tracking-widest hover:scale-[1.02] transition-all">
                            Broadcast Strategy Update
                        </button>
                    </div>

                    <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl space-y-4">
                        <div className="flex items-center justify-between">
                            <h4 className="text-[10px] font-bold text-white uppercase tracking-widest">Client Requests</h4>
                            <span className="px-2 py-0.5 bg-rose-500/20 text-rose-400 rounded text-[8px] font-black uppercase">3 Urgent</span>
                        </div>
                        <div className="space-y-3">
                            <RequestItem label="Asset Review: Arcane" time="12m ago" />
                            <RequestItem label="Access Request: Synthetix" time="4h ago" />
                        </div>
                    </div>

                    <div className="p-6 border border-white/5 rounded-2xl flex items-center justify-between cursor-pointer hover:bg-white/5 transition-all group">
                        <div className="flex items-center gap-3">
                            <Settings2 className="w-4 h-4 text-white/20 group-hover:text-white" />
                            <span className="text-[10px] font-bold text-white uppercase tracking-tight">Portal Configuration</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-white/20" />
                    </div>
                </div>
            </div>
        </div>
    );
}

function RequestItem({ label, time }: { label: string, time: string }) {
    return (
        <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 hover:border-white/10 transition-colors cursor-pointer">
            <span className="text-[10px] font-bold text-white uppercase tracking-tight truncate">{label}</span>
            <span className="text-[8px] font-mono text-white/20 uppercase">{time}</span>
        </div>
    );
}
