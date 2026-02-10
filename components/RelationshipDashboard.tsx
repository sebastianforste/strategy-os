"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Users, Send, CheckCircle, Clock, Filter, Search, MoreHorizontal, UserPlus, Zap, Star, Shield, Mail, ChevronRight, Activity, Smartphone } from "lucide-react";

interface Relationship {
    id: string;
    name: string;
    role: string;
    status: 'High Value' | 'Nurturing' | 'Connected';
    lastInteraction: string;
    suggestedAction: string;
}

const RELATIONSHIPS: Relationship[] = [
    { id: 'u1', name: 'Alex Rivera', role: 'VP Engineering @ Vercel', status: 'High Value', lastInteraction: '2d ago', suggestedAction: 'Congratulate on the new release' },
    { id: 'u2', name: 'Sarah Chen', role: 'Partner @ Sequoia', status: 'Nurturing', lastInteraction: '1w ago', suggestedAction: 'Share the Agentic Strategy doc' },
    { id: 'u3', name: 'James Wilson', role: 'Chief Strategist @ NVIDIA', status: 'Connected', lastInteraction: '3h ago', suggestedAction: 'Schedule 15 min catch-up' },
];

export default function RelationshipDashboard() {
    const [relationships] = useState<Relationship[]>(RELATIONSHIPS);
    const [isDrafting, setIsDrafting] = useState(false);

    const handleDraft = () => {
        setIsDrafting(true);
        setTimeout(() => setIsDrafting(false), 2000);
    };

    return (
        <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-8 min-h-[700px]">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12">
                <div className="flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        <Users className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white uppercase tracking-tight">Relationship OS</h2>
                        <p className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-mono mt-1">Autonomous DM & Strategic Networking</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
                        <button className="p-2 text-white/40 hover:text-white transition-colors"><Search className="w-4 h-4" /></button>
                        <button className="p-2 text-white/40 hover:text-white transition-colors"><Filter className="w-4 h-4" /></button>
                    </div>
                    <button 
                        onClick={handleDraft}
                        disabled={isDrafting}
                        className="px-6 py-2.5 bg-indigo-500 text-white rounded-xl text-[10px] font-black tracking-widest hover:scale-105 transition-all shadow-lg shadow-indigo-500/20 uppercase flex items-center gap-2"
                    >
                        {isDrafting ? <Clock className="w-3.5 h-3.5 animate-spin" /> : <MessageSquare className="w-3.5 h-3.5" />}
                        <span>{isDrafting ? "Drafting..." : "Sync Messages"}</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* RELATIONSHIPS TABLE */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Priority Contacts</h3>
                        <div className="flex items-center gap-2 px-2 py-1 bg-white/5 rounded-lg border border-white/10">
                            <Star className="w-3 h-3 text-amber-500" />
                            <span className="text-[9px] font-bold text-white/40 uppercase">A-List Only</span>
                        </div>
                    </div>

                    <div className="overflow-hidden border border-white/5 rounded-3xl bg-white/[0.01]">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-white/5 bg-white/[0.02]">
                                    <th className="px-8 py-5 text-[9px] font-black text-white/40 uppercase tracking-widest">Contact</th>
                                    <th className="px-8 py-5 text-[9px] font-black text-white/40 uppercase tracking-widest text-right">Last Interaction</th>
                                    <th className="px-8 py-5 text-[9px] font-black text-white/40 uppercase tracking-widest text-right">Status</th>
                                    <th className="px-8 py-5 text-[9px] font-black text-white/40 uppercase tracking-widest text-right">AI Suggested Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {relationships.map((rel) => (
                                    <tr key={rel.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.03] transition-all group cursor-pointer">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-white/10 to-transparent border border-white/10 flex items-center justify-center text-xs font-bold text-white">
                                                    {rel.name.split(' ').map(n => n[0]).join('')}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-white tracking-tight">{rel.name}</p>
                                                    <p className="text-[9px] font-mono text-white/20 uppercase tracking-tighter">{rel.role}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <span className="text-[10px] font-mono text-white/40">{rel.lastInteraction}</span>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${
                                                rel.status === 'High Value' ? 'bg-amber-500/10 text-amber-400' : 
                                                rel.status === 'Nurturing' ? 'bg-blue-500/10 text-blue-400' : 'bg-white/5 text-white/40'
                                            }`}>
                                                {rel.status}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <p className="text-[10px] font-bold text-white/60 italic group-hover:text-indigo-400 transition-colors uppercase tracking-tight underline decoration-white/10 underline-offset-4">
                                                {rel.suggestedAction}
                                            </p>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* NETWORKING OPS */}
                <div className="space-y-6">
                    <h3 className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-4">Draft Warehouse</h3>
                    
                    <div className="p-8 bg-indigo-500/5 border border-indigo-500/10 rounded-3xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:rotate-12 transition-transform duration-700">
                            <Mail className="w-32 h-32 text-indigo-400" />
                        </div>
                        
                        <div className="flex items-center gap-3 mb-8">
                            <Activity className="w-5 h-5 text-indigo-400" />
                            <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Action Velocity</h4>
                        </div>
                        
                        <div className="text-4xl font-black text-white tracking-tighter mb-2">12 drafts</div>
                        <p className="text-[10px] text-white/40 uppercase font-black tracking-widest mb-8">Ready for one-click send</p>

                        <button className="w-full py-3 bg-white text-black rounded-xl text-[9px] font-black uppercase tracking-widest hover:scale-[1.02] transition-all">
                            Approve All Drafts
                        </button>
                    </div>

                    <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl space-y-4">
                        <div className="flex items-center gap-3">
                            <Zap className="w-4 h-4 text-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]" />
                            <h4 className="text-[10px] font-bold text-white uppercase tracking-widest">Nurture Strategy</h4>
                        </div>
                        <p className="text-[9px] text-white/40 leading-relaxed italic">
                            Agent `Marcus` is currently drafting personalized value-adds for 8 top-tier contacts.
                        </p>
                        <div className="flex items-center gap-2 text-[10px] font-black text-white uppercase tracking-widest">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Active Monitoring
                        </div>
                    </div>

                    <div className="p-6 border border-white/5 rounded-2xl flex items-center justify-between cursor-pointer hover:bg-white/5 transition-all group">
                        <div className="flex items-center gap-3">
                            <UserPlus className="w-4 h-4 text-white/20 group-hover:text-white" />
                            <span className="text-[10px] font-bold text-white uppercase tracking-tight">Expand Sphere of Influence</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-white/20" />
                    </div>
                </div>
            </div>
        </div>
    );
}
