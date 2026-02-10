"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Code2, Key, Globe, Shield, Terminal, BookOpen, Copy, Check, RefreshCw, Zap, Server, Activity } from "lucide-react";

export default function APIDashboard() {
    const [apiKey, setApiKey] = useState("sk_live_51MhStrategyOS_v2_9a72...");
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(apiKey);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-8 min-h-[700px]">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12">
                <div className="flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-brand-500/10 text-brand-400 border border-brand-500/20">
                        <Terminal className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white uppercase tracking-tight">Enterprise Gateway</h2>
                        <p className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-mono mt-1">Developer Portal & SDK access</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Gateway Active</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                {/* SDK & ACCESS */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="p-8 bg-white/5 border border-white/10 rounded-3xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-5">
                            <Key className="w-32 h-32" />
                        </div>
                        
                        <h3 className="text-xs font-black text-white/40 uppercase tracking-[0.2em] mb-6">Production API Keys</h3>
                        
                        <div className="space-y-4">
                            <div className="flex items-center gap-4 p-4 bg-black/40 border border-white/5 rounded-2xl group-hover:border-white/10 transition-all">
                                <div className="p-2 bg-brand-500/10 rounded-lg text-brand-400">
                                    <Shield className="w-4 h-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[10px] text-white/20 uppercase font-black mb-1">Live Secret Key</p>
                                    <code className="text-[11px] font-mono text-white/60 truncate block">{apiKey}</code>
                                </div>
                                <button 
                                    onClick={handleCopy}
                                    className="p-2 text-white/20 hover:text-white transition-colors"
                                >
                                    {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                                </button>
                            </div>
                            
                            <div className="flex justify-between items-center px-2">
                                <p className="text-[9px] text-white/30 uppercase font-bold italic">Never share your secret key in client-side code.</p>
                                <button className="text-[9px] font-black text-brand-400 uppercase tracking-widest hover:text-brand-300 transition-colors flex items-center gap-1.5">
                                    <RefreshCw className="w-3 h-3" />
                                    <span>Rotate Keys</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 bg-white/5 border border-white/10 rounded-3xl">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-xs font-black text-white/40 uppercase tracking-[0.2em]">Quickstart SDK</h3>
                            <button className="text-[10px] font-black text-white/40 uppercase tracking-widest flex items-center gap-2 hover:text-white transition-colors">
                                <BookOpen className="w-4 h-4" />
                                <span>Full Docs</span>
                            </button>
                        </div>
                        
                        <div className="bg-black/60 rounded-2xl p-6 font-mono border border-white/5">
                            <div className="flex gap-2 mb-4">
                                <span className="w-2.5 h-2.5 rounded-full bg-rose-500/40" />
                                <span className="w-2.5 h-2.5 rounded-full bg-amber-500/40" />
                                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/40" />
                            </div>
                            <pre className="text-[11px] leading-relaxed">
                                <span className="text-zinc-500">// npm install @strategy-os/sdk</span><br/>
                                <span className="text-brand-400">import</span> {"{ StrategyEngine }"} <span className="text-brand-400">from</span> <span className="text-emerald-400">'@strategy-os/sdk'</span>;<br/><br/>
                                <span className="text-brand-400">const</span> engine = <span className="text-brand-400">new</span> StrategyEngine({"{"}<br/>
                                &nbsp;&nbsp;apiKey: <span className="text-emerald-400">'YOUR_API_KEY'</span>,<br/>
                                &nbsp;&nbsp;persona: <span className="text-emerald-400">'ghost_v2'</span><br/>
                                {"}"});<br/><br/>
                                <span className="text-zinc-500">// Generate high-status content</span><br/>
                                <span className="text-brand-400">const</span> content = <span className="text-brand-400">await</span> engine.generate(<span className="text-emerald-400">'The Future of AI'</span>);
                            </pre>
                        </div>
                    </div>
                </div>

                {/* SIDEBAR OPS */}
                <div className="space-y-6">
                    <h3 className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-4">Real-time Telemetry</h3>
                    
                    <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-2">
                                <Activity className="w-4 h-4 text-emerald-400" />
                                <span className="text-[10px] font-bold text-white uppercase">API Health</span>
                            </div>
                            <span className="text-[10px] font-mono text-white/30">99.98%</span>
                        </div>
                        <div className="flex gap-1 h-8 items-end">
                            {Array.from({ length: 30 }).map((_, i) => (
                                <div key={i} className="flex-1 bg-emerald-500/40 rounded-sm hover:bg-emerald-400 transition-colors h-full" title="Normal" />
                            ))}
                        </div>
                    </div>

                    <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <Zap className="w-4 h-4 text-amber-500" />
                                <span className="text-[10px] font-bold text-white uppercase">Request Volume</span>
                            </div>
                        </div>
                        <div className="text-2xl font-black text-white">42,842</div>
                        <p className="text-[9px] text-white/20 uppercase font-black">Past 24 Hours</p>
                    </div>

                    <div className="p-6 bg-white/5 border border-white/5 rounded-2xl space-y-4">
                        <div className="flex items-start gap-4">
                            <Server className="w-5 h-5 text-brand-400" />
                            <div>
                                <h4 className="text-[10px] font-black text-white uppercase tracking-widest mb-1">Webhooks</h4>
                                <p className="text-[9px] text-white/40 leading-relaxed italic">
                                    Configure endpoints to receive real-time notifications for content completion and viral alerts.
                                </p>
                            </div>
                        </div>
                        <button className="w-full py-2.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-[10px] font-black text-white uppercase tracking-widest transition-all">
                            Add Endpoint
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
