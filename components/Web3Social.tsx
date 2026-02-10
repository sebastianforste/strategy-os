"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Globe, Wallet, Share2, Shield, Zap, Layout, MessageSquare, Repeat, Heart, Link, CheckCircle, RefreshCcw, Cpu, Network } from "lucide-react";

interface DecentralizedPost {
    id: string;
    protocol: 'Lens' | 'Farcaster';
    content: string;
    profile: string;
    engagement: { mirrors: number, collects: number, reactions: number };
    timestamp: string;
}

const FEED: DecentralizedPost[] = [
    {
        id: 'p1',
        protocol: 'Lens',
        content: 'The future of decentralized strategy is here. StrategyOS now supports Lens protocol natively. 🌿',
        profile: 'sebastian.lens',
        engagement: { mirrors: 42, collects: 12, reactions: 156 },
        timestamp: '1h ago'
    },
    {
        id: 'p2',
        protocol: 'Farcaster',
        content: 'Farcaster casts are now part of our distribution engine. Strategy at the speed of light. 🚀',
        profile: 'sebastian.eth',
        engagement: { mirrors: 84, collects: 0, reactions: 312 },
        timestamp: '3h ago'
    }
];

export default function Web3Social() {
    const [posts] = useState<DecentralizedPost[]>(FEED);
    const [isConnecting, setIsConnecting] = useState(false);
    const [isConnected, setIsConnected] = useState(false);

    const handleConnect = () => {
        setIsConnecting(true);
        setTimeout(() => {
            setIsConnecting(false);
            setIsConnected(true);
        }, 2000);
    };

    return (
        <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-8 min-h-[700px]">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12">
                <div className="flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                        <Network className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white uppercase tracking-tight">Ecosystem Layer</h2>
                        <p className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-mono mt-1">Decentralized Social & Web3 Ops</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {!isConnected ? (
                        <button 
                            onClick={handleConnect}
                            disabled={isConnecting}
                            className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl text-[10px] font-black tracking-widest hover:scale-105 transition-all shadow-lg shadow-purple-500/20 uppercase flex items-center gap-2"
                        >
                            {isConnecting ? <RefreshCcw className="w-3.5 h-3.5 animate-spin" /> : <Wallet className="w-3.5 h-3.5" />}
                            <span>{isConnecting ? "Authenticating..." : "Connect Identity"}</span>
                        </button>
                    ) : (
                        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">sebastian.eth Connected</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* PROTOCOL FEED */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">DeSo Intelligence Feed</h3>
                        <div className="flex gap-2">
                            <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded text-[8px] font-black uppercase">Lens Active</span>
                            <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-400 rounded text-[8px] font-black uppercase">Farcaster Active</span>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {posts.map((post) => (
                            <motion.div
                                key={post.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-6 bg-white/5 border border-white/5 rounded-3xl hover:bg-white/[0.07] transition-all group"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-white/10 to-white/5 border border-white/10 flex items-center justify-center text-[10px] font-bold text-white">
                                            {post.profile[0].toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-white">{post.profile}</p>
                                            <p className="text-[8px] font-mono text-white/20 uppercase tracking-tighter">{post.timestamp}</p>
                                        </div>
                                    </div>
                                    <div className={`p-1.5 rounded-lg border flex items-center gap-2 ${
                                        post.protocol === 'Lens' ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-purple-500/10 border-purple-500/20 text-purple-400'
                                    }`}>
                                        <Globe className="w-3 h-3" />
                                        <span className="text-[8px] font-black uppercase">{post.protocol}</span>
                                    </div>
                                </div>
                                <p className="text-sm text-white/80 leading-relaxed mb-6 italic">"{post.content}"</p>
                                <div className="flex items-center gap-6 pt-4 border-t border-white/5">
                                    <Metric icon={<Repeat className="w-3.5 h-3.5" />} value={post.engagement.mirrors} />
                                    <Metric icon={<Heart className="w-3.5 h-3.5" />} value={post.engagement.reactions} />
                                    <Metric icon={<Zap className="w-3.5 h-3.5" />} value={post.engagement.collects} label="Collects" />
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* ON-CHAIN ACTIONS */}
                <div className="space-y-6">
                    <h3 className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-4">Strategic Proofs</h3>
                    
                    <div className="p-8 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 border border-white/10 rounded-3xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-700">
                            <Shield className="w-32 h-32 text-indigo-400" />
                        </div>
                        
                        <div className="flex items-center gap-3 mb-6">
                            <Cpu className="w-5 h-5 text-indigo-400" />
                            <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Attestation Engine</h4>
                        </div>
                        
                        <p className="text-xs text-white/60 leading-relaxed italic mb-8">
                            Register your strategies on-chain to provide immutable proof of authorship and strategic foresight.
                        </p>

                        <button className="w-full py-3 bg-white text-black rounded-xl text-[9px] font-black uppercase tracking-widest hover:scale-[1.02] transition-all">
                            Register Strategy NFT
                        </button>
                    </div>

                    <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl">
                        <h4 className="text-[10px] font-bold text-white uppercase tracking-widest mb-4">Protocol Statistics</h4>
                        <div className="space-y-4">
                            <Stat label="Global Reputation" value="842" />
                            <Stat label="Trust Score" value="9.8" />
                            <Stat label="Open Actions" value="14" />
                        </div>
                    </div>

                    <div className="p-6 border border-white/5 rounded-2xl flex items-center justify-between cursor-pointer hover:bg-white/5 transition-all">
                        <div className="flex items-center gap-3">
                            <Link className="w-4 h-4 text-white/20" />
                            <span className="text-[10px] font-bold text-white uppercase tracking-tight">Cross-Chain Sync</span>
                        </div>
                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                    </div>
                </div>
            </div>
        </div>
    );
}

function Metric({ icon, value, label }: { icon: React.ReactNode, value: number, label?: string }) {
    return (
        <div className="flex items-center gap-2">
            <div className="text-white/20">{icon}</div>
            <span className="text-[10px] font-black text-white/60">{value}</span>
            {label && <span className="text-[8px] font-bold text-white/20 uppercase">{label}</span>}
        </div>
    );
}

function Stat({ label, value }: { label: string, value: string }) {
    return (
        <div className="flex justify-between items-center text-[10px]">
            <span className="text-white/30 uppercase tracking-tight">{label}</span>
            <span className="font-bold text-white">{value}</span>
        </div>
    );
}
