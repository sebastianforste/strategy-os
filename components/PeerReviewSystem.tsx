"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, CheckCircle, MessageSquare, Shield, Clock, Stars, Sparkles, Filter, Search, ChevronRight, Activity, MessageCircle, UserX, UserCheck, AlertCircle, Quote } from "lucide-react";

interface ReviewRequest {
    id: string;
    target: string;
    reviewer: string;
    status: 'Pending' | 'Approved' | 'Requires Edit';
    priority: 'Critical' | 'Standard';
    timestamp: string;
}

const REQUESTS: ReviewRequest[] = [
    { id: 'r1', target: 'The Agentic Era Manifesto', reviewer: 'Alex Rivera (VP Eng)', status: 'Requires Edit', priority: 'Critical', timestamp: '12m ago' },
    { id: 'r2', target: 'B2B Growth Loops V4', reviewer: 'Sarah Chen (Partner)', status: 'Approved', priority: 'Standard', timestamp: '2h ago' },
    { id: 'r3', target: 'Draft: SEO Authority', reviewer: 'James Wilson (Chief)', status: 'Pending', priority: 'Standard', timestamp: '4h ago' },
];

export default function PeerReviewSystem() {
    const [requests] = useState<ReviewRequest[]>(REQUESTS);
    const [activeComment, setActiveComment] = useState<string | null>(null);

    return (
        <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-8 min-h-[700px]">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12">
                <div className="flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        <Users className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white uppercase tracking-tight">Strategy Audit</h2>
                        <p className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-mono mt-1">Peer Review & Internal Collaborative Quality Gates</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
                        <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                        <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Active Session</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* AUDIT LOGS */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Queue Audit</h3>
                        <div className="flex items-center gap-2">
                            <button className="p-2 text-white/20 hover:text-white transition-colors"><Search className="w-4 h-4" /></button>
                            <button className="p-2 text-white/20 hover:text-white transition-colors"><Filter className="w-4 h-4" /></button>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {requests.map((req) => (
                            <motion.div
                                key={req.id}
                                whileHover={{ x: 4 }}
                                className="p-6 bg-white/5 border border-white/5 rounded-3xl hover:border-indigo-500/20 transition-all cursor-pointer group"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${
                                            req.priority === 'Critical' ? 'bg-rose-500 text-black' : 'bg-white/10 text-white/40'
                                        }`}>
                                            {req.priority}
                                        </span>
                                        <span className="text-[9px] font-mono text-white/20 uppercase tracking-tighter">{req.timestamp}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        {req.status === 'Approved' ? <UserCheck className="w-3 h-3 text-emerald-500" /> : 
                                         req.status === 'Pending' ? <Clock className="w-3 h-3 text-amber-500" /> : <UserX className="w-3 h-3 text-rose-500" />}
                                        <span className={`text-[8px] font-black uppercase tracking-widest ${
                                            req.status === 'Approved' ? 'text-emerald-500' : 
                                            req.status === 'Pending' ? 'text-amber-500' : 'text-rose-500'
                                        }`}>
                                            {req.status}
                                        </span>
                                    </div>
                                </div>
                                <h4 className="text-sm font-bold text-white uppercase tracking-tight mb-2 group-hover:text-indigo-400 transition-colors">{req.target}</h4>
                                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-6 h-6 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-[8px] font-bold text-white/40">{req.reviewer[0]}</div>
                                        <span className="text-[10px] font-bold text-white/60 lowercase tracking-tight">{req.reviewer}</span>
                                    </div>
                                    <button className="flex items-center gap-2 text-[10px] font-black text-white/20 hover:text-white uppercase tracking-widest transition-colors">
                                        Audit Breakdown <ChevronRight className="w-3 h-3" />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* COLLAB OPS */}
                <div className="space-y-6">
                    <h3 className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-4">Live Critique</h3>
                    
                    <div className="p-8 bg-indigo-500/5 border border-indigo-500/10 rounded-[32px] relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:rotate-6 transition-transform duration-700">
                            <Quote className="w-32 h-32 text-indigo-400" />
                        </div>
                        
                        <div className="flex items-center gap-3 mb-6">
                            <MessageCircle className="w-5 h-5 text-indigo-400" />
                            <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Active Highlight</h4>
                        </div>
                        
                        <p className="text-xs text-white/60 leading-relaxed italic mb-8">
                            "The transition between the B-roll and the talking head in scene 3 feels slightly disjointed. Suggest a 0.2s longer cross-dissolve."
                        </p>

                        <div className="flex gap-2">
                            <button className="flex-1 py-3 bg-white text-black rounded-xl text-[9px] font-black uppercase tracking-widest hover:scale-[1.02] transition-all">
                                Implement Fix
                            </button>
                            <button className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white/40 hover:text-white">
                                <MessageSquare className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl space-y-4 text-center">
                        <div className="flex justify-center mb-2">
                            <Stars className="w-6 h-6 text-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.4)]" />
                        </div>
                        <h4 className="text-[10px] font-bold text-white uppercase tracking-widest">Consensus Score</h4>
                        <div className="text-4xl font-black text-white tracking-tighter">8.2<span className="text-base text-white/20">/10</span></div>
                        <p className="text-[9px] text-white/20 uppercase font-black tracking-widest">Market Ready Threshold Reached</p>
                    </div>

                    <div className="p-6 border border-white/5 rounded-2xl flex items-center justify-between cursor-pointer hover:bg-white/5 transition-all group">
                        <div className="flex items-center gap-3">
                            <Shield className="w-4 h-4 text-white/20 group-hover:text-white" />
                            <span className="text-[10px] font-bold text-white uppercase tracking-tight">Audit Permissions</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-white/20" />
                    </div>
                </div>
            </div>
        </div>
    );
}

