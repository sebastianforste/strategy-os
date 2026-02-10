"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutGrid, Download, Star, ExternalLink, ChevronRight, Search, Filter, Rocket, Zap, Clock, CheckCircle, Shield, Globe, Cpu, ShoppingBag, Plus, MoreHorizontal } from "lucide-react";

interface Extension {
    id: string;
    name: string;
    version: string;
    author: string;
    description: string;
    rating: number;
    installs: string;
    category: 'Agent' | 'Module' | 'Visual';
    price: string;
}

const EXTENSIONS: Extension[] = [
    { id: 'ex1', name: 'Neuro-Hook Pro', version: '2.1.0', author: 'LogicLabs', description: 'Advanced psychological hook generator for technical threads.', rating: 4.9, installs: '12k', category: 'Agent', price: 'Free' },
    { id: 'ex2', name: 'CinemaStory 4D', version: '1.4.2', author: 'VisualCortex', description: 'Real-time storyboard generation with cinematic depth.', rating: 4.8, installs: '8.4k', category: 'Visual', price: '$12/mo' },
    { id: 'ex3', name: 'RAG-Force DB', version: '0.9.4', author: 'VectorFlow', description: 'High-speed semantic search bridge for proprietary data.', rating: 4.7, installs: '4.2k', category: 'Module', price: 'Free' },
];

export default function ExtensionMarketplace() {
    const [extensions] = useState<Extension[]>(EXTENSIONS);
    const [searchQuery, setSearchQuery] = useState("");

    return (
        <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-8 min-h-[700px]">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12">
                <div className="flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-brand-400/10 text-brand-400 border border-brand-400/20">
                        <ShoppingBag className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white uppercase tracking-tight">App Marketplace</h2>
                        <p className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-mono mt-1">Community AI Agents & Strategy Modules</p>
                    </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                        <input 
                            type="text" 
                            placeholder="SEARCH EXTENSIONS..." 
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-10 py-2.5 text-[10px] font-black uppercase tracking-widest text-white placeholder:text-white/20 focus:border-brand-500/50 transition-all outline-none"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <button className="px-6 py-2.5 bg-brand-500 text-white rounded-xl text-[10px] font-black tracking-widest hover:scale-105 transition-all shadow-lg shadow-brand-500/20 uppercase">
                        Publish App
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* MARKET GRID */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Top Rated Labs</h3>
                        <div className="flex items-center gap-2">
                            <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest px-2 py-1 bg-white/5 rounded">Featured</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {extensions.map((ext) => (
                            <motion.div
                                key={ext.id}
                                whileHover={{ y: -4 }}
                                className="p-8 bg-white/5 border border-white/5 rounded-[40px] group hover:border-brand-500/20 transition-all cursor-pointer flex flex-col justify-between"
                            >
                                <div>
                                    <div className="flex items-start justify-between mb-6">
                                        <div className={`p-4 rounded-3xl bg-white/5 border border-white/10 ${
                                            ext.category === 'Agent' ? 'text-brand-400' : 'text-indigo-400'
                                        }`}>
                                            {ext.category === 'Agent' ? <Cpu className="w-6 h-6" /> : <LayoutGrid className="w-6 h-6" />}
                                        </div>
                                        <div className="flex items-center gap-1 px-2 py-1 bg-white/5 rounded-lg border border-white/10">
                                            <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                                            <span className="text-[10px] font-black text-white/60">{ext.rating}</span>
                                        </div>
                                    </div>
                                    <h4 className="text-lg font-black text-white uppercase tracking-tight mb-2 group-hover:text-brand-400 transition-colors">{ext.name}</h4>
                                    <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em] mb-4">by {ext.author}</p>
                                    <p className="text-xs text-white/40 leading-relaxed italic mb-8">"{ext.description}"</p>
                                </div>
                                <div className="flex items-center justify-between pt-6 border-t border-white/5">
                                    <span className="text-[10px] font-black text-white uppercase tracking-widest">{ext.price}</span>
                                    <button className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-[9px] font-black text-white uppercase tracking-widest transition-all">
                                        <Download className="w-3.5 h-3.5" /> Install
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                        
                        <div className="p-8 border-2 border-dashed border-white/5 rounded-[40px] flex flex-col items-center justify-center gap-4 group cursor-pointer hover:bg-white/[0.02] transition-all">
                            <div className="p-4 rounded-full bg-white/5 text-white/20 group-hover:text-white transition-colors">
                                <Plus className="w-6 h-6" />
                            </div>
                            <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Build Custom Extension</p>
                        </div>
                    </div>
                </div>

                {/* TRENDING / STATS */}
                <div className="space-y-6">
                    <h3 className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-4">Ecosystem Vitals</h3>
                    
                    <div className="p-8 bg-brand-500/5 border border-brand-500/10 rounded-3xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-700">
                            <Rocket className="w-32 h-32 text-brand-400" />
                        </div>
                        
                        <div className="flex items-center gap-3 mb-8">
                            <Zap className="w-5 h-5 text-brand-400" />
                            <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Global Deployments</h4>
                        </div>
                        
                        <div className="text-4xl font-black text-white tracking-tighter mb-2">1,424</div>
                        <p className="text-[10px] text-white/40 uppercase font-black tracking-widest">Active modules in the wild</p>
                    </div>

                    <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl space-y-4">
                        <h4 className="text-[10px] font-bold text-white uppercase tracking-widest">Categories</h4>
                        <div className="space-y-2">
                            <MarketCategory label="Persona Agents" count={42} active />
                            <MarketCategory label="Visual Alchemists" count={12} />
                            <MarketCategory label="Data Silos" count={8} />
                            <MarketCategory label="Compliance Bots" count={4} />
                        </div>
                    </div>

                    <div className="p-6 border border-white/5 rounded-2xl flex items-center justify-between cursor-pointer hover:bg-white/5 transition-all group">
                        <div className="flex items-center gap-3">
                            <Shield className="w-4 h-4 text-white/20 group-hover:text-white" />
                            <span className="text-[10px] font-bold text-white uppercase tracking-tight">Manage Installed Apps</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-white/20" />
                    </div>
                </div>
            </div>
        </div>
    );
}

function MarketCategory({ label, count, active }: { label: string, count: number, active?: boolean }) {
    return (
        <div className={`flex justify-between items-center p-3 rounded-xl border transition-all cursor-pointer ${
            active ? "bg-brand-500/10 border-brand-500/20 text-brand-400" : "bg-white/5 border-white/5 text-white/40 hover:text-white"
        }`}>
            <span className="text-[10px] font-bold uppercase tracking-tight">{label}</span>
            <span className="text-[9px] font-mono opacity-60">{count}</span>
        </div>
    );
}
