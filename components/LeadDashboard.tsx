"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Target, TrendingUp, ArrowUpRight, Mail, MessageSquare, Zap, ShieldCheck, Search, Filter, MoreHorizontal } from "lucide-react";
import { Lead, fetchCRMPipeline } from "../utils/crm-service";

export default function LeadDashboard() {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

    useEffect(() => {
        const load = async () => {
            const data = await fetchCRMPipeline();
            setLeads(data);
            setIsLoading(false);
        };
        load();
    }, []);

    const getIntentColor = (intent: string) => {
        switch(intent) {
            case 'buyer': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
            case 'skeptic': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
            case 'fan': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
            default: return 'text-white/40 bg-white/5 border-white/10';
        }
    };

    return (
        <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-6 min-h-[600px]">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
                        <Target className="w-5 h-5 transition-transform hover:scale-110" />
                    </div>
                    <div>
                        <h3 className="text-white font-medium">Lead Generation CRM</h3>
                        <p className="text-xs text-white/40 uppercase tracking-widest">High-Value Pipeline</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
                        <input 
                            type="text" 
                            placeholder="SEARCH PIPELINE..." 
                            className="bg-white/5 border border-white/10 rounded-xl py-2 pl-9 pr-4 text-[10px] text-white focus:outline-none focus:border-blue-500/50 w-48 transition-all"
                        />
                    </div>
                    <button className="p-2 bg-white/5 border border-white/10 rounded-xl text-white/40 hover:text-white transition-all">
                        <Filter className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* LEAD LIST */}
                <div className="space-y-4">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20 opacity-20">
                            <TrendingUp className="w-8 h-8 animate-pulse mb-4 text-blue-400" />
                            <span className="text-[10px] font-mono tracking-widest uppercase">Syncing Intelligence...</span>
                        </div>
                    ) : (
                        leads.map((lead) => (
                            <motion.button
                                key={lead.id}
                                layoutId={lead.id}
                                onClick={() => setSelectedLead(lead)}
                                className={`w-full text-left p-4 rounded-2xl border transition-all relative overflow-hidden group ${
                                    selectedLead?.id === lead.id 
                                        ? "bg-white/10 border-white/20" 
                                        : "bg-white/5 border-white/5 hover:border-white/10"
                                }`}
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center text-xs font-bold text-white/60">
                                            {lead.author[0]}
                                        </div>
                                        <div>
                                            <h4 className="text-xs font-bold text-white">{lead.author}</h4>
                                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-tighter ${getIntentColor(lead.intent)}`}>
                                                {lead.intent}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-[10px] font-black text-blue-400">{lead.score}%</div>
                                        <div className="text-[8px] text-white/20 uppercase font-mono">LTV Prob.</div>
                                    </div>
                                </div>
                                <p className="text-[11px] text-white/60 line-clamp-2 italic mb-2">
                                    "{lead.description}"
                                </p>
                            </motion.button>
                        ))
                    )}
                </div>

                {/* LEAD DETAILS & ACTION */}
                <AnimatePresence mode="wait">
                    {selectedLead ? (
                        <motion.div
                            key={selectedLead.id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col justify-between"
                        >
                            <div>
                                <div className="flex items-center justify-between mb-6">
                                    <h4 className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Lead Intelligence Profile</h4>
                                    <button className="text-white/20 hover:text-white">
                                        <MoreHorizontal className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/30 to-purple-500/30 border border-white/10 flex items-center justify-center text-xl font-bold text-white">
                                        {selectedLead.author[0]}
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-white leading-tight">{selectedLead.author}</h2>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-[10px] text-white/40 uppercase">Intensity Score:</span>
                                            <div className="w-20 h-1 bg-white/10 rounded-full overflow-hidden">
                                                <div className="h-full bg-blue-500" style={{ width: `${selectedLead.score}%` }} />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div>
                                        <label className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-2 block">Strategic Assessment</label>
                                        <p className="text-xs text-white/80 leading-relaxed bg-black/40 p-4 rounded-2xl border border-white/5">
                                            {selectedLead.description}
                                        </p>
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-2 block">AI Next Action</label>
                                        <div className="flex items-start gap-3 bg-blue-500/10 border border-blue-500/20 p-4 rounded-2xl">
                                            <Zap className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                                            <p className="text-[11px] text-blue-400 font-bold leading-relaxed">
                                                {selectedLead.suggestedNextAction}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 space-y-3">
                                <button className="w-full py-4 bg-white text-black rounded-2xl text-[10px] font-black tracking-[0.2em] flex items-center justify-center gap-2 hover:scale-[1.02] transition-all shadow-xl shadow-white/5 uppercase">
                                    <span>Initiate High-Status Outbound</span>
                                    <ArrowUpRight className="w-4 h-4" />
                                </button>
                                <div className="grid grid-cols-2 gap-3">
                                    <button className="py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-bold text-white/60 hover:text-white hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                                        <Mail className="w-3.5 h-3.5" />
                                        SEND ASSET
                                    </button>
                                    <button className="py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-bold text-white/60 hover:text-white hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                                        <ShieldCheck className="w-3.5 h-3.5" />
                                        ADD TO VETTING
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <div className="bg-white/5 border border-white/5 border-dashed rounded-3xl flex flex-col items-center justify-center py-20 opacity-30 text-center px-12">
                            <Users className="w-12 h-12 mb-4" />
                            <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-2">Lead Intelligence Selection</h4>
                            <p className="text-[10px] text-white/60">Select a lead from the pipeline to view strategic assessments and initiate outbound sequences.</p>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
