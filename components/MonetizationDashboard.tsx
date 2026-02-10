"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CreditCard, Zap, Check, ArrowRight, Shield, Globe, Cpu, Users, BarChart3, Wallet } from "lucide-react";

interface Tier {
    name: string;
    price: string;
    description: string;
    features: string[];
    highlight?: boolean;
    cta: string;
}

const TIERS: Tier[] = [
    {
        name: "Individual",
        price: "$49",
        description: "For solo strategists building their personal brand.",
        features: ["1 Active Persona", "50 Generations / mo", "Basic Analytics", "Community Support"],
        cta: "Stay Current"
    },
    {
        name: "Ghost Agency",
        price: "$199",
        description: "Scale your agency with high-status AI ghostwriting.",
        features: ["5 Active Personas", "Unlimited Generations", "Advanced RAG / Memory", "Priority Support", "White-label Reports"],
        highlight: true,
        cta: "Upgrade to Agency"
    },
    {
        name: "Enterprise",
        price: "Custom",
        description: "World-class strategy engine for global teams.",
        features: ["Unlimited Personas", "SSO & Security Governance", "Dedicated Account Manager", "Custom Fine-tuning Lab"],
        cta: "Contact Sales"
    }
];

export default function MonetizationDashboard() {
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

    return (
        <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-8 min-h-[600px]">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12">
                <div className="flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        <Wallet className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white uppercase tracking-tight">Enterprise Monetization</h2>
                        <p className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-mono mt-1">Tiered Access & Usage Control</p>
                    </div>
                </div>

                {/* Billing Toggle */}
                <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
                    <button 
                        onClick={() => setBillingCycle('monthly')}
                        className={`px-4 py-1.5 rounded-lg text-[10px] font-bold transition-all uppercase tracking-widest ${billingCycle === 'monthly' ? 'bg-white/10 text-white' : 'text-white/30 hover:text-white'}`}
                    >
                        Monthly
                    </button>
                    <button 
                        onClick={() => setBillingCycle('yearly')}
                        className={`px-4 py-1.5 rounded-lg text-[10px] font-bold transition-all uppercase tracking-widest ${billingCycle === 'yearly' ? 'bg-white/10 text-white' : 'text-white/30 hover:text-white'}`}
                    >
                        Yearly (-20%)
                    </button>
                </div>
            </div>

            {/* Pricing Tiers */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                {TIERS.map((tier, idx) => (
                    <motion.div
                        key={idx}
                        whileHover={{ y: -5 }}
                        className={`p-8 rounded-3xl border transition-all flex flex-col h-full relative overflow-hidden ${
                            tier.highlight 
                                ? "bg-indigo-600/10 border-indigo-500 shadow-2xl shadow-indigo-500/10" 
                                : "bg-white/5 border-white/5 hover:border-white/10"
                        }`}
                    >
                        {tier.highlight && (
                            <div className="absolute top-0 right-0 p-4">
                                <span className="bg-indigo-500 text-white text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-full">Popular</span>
                            </div>
                        )}
                        
                        <div className="mb-8">
                            <h3 className="text-xs font-black text-white/40 uppercase tracking-[0.2em] mb-4">{tier.name}</h3>
                            <div className="flex items-baseline gap-2">
                                <span className="text-4xl font-black text-white">{tier.price}</span>
                                {tier.price !== 'Custom' && (
                                    <span className="text-[10px] font-mono text-white/20 uppercase">/ {billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
                                )}
                            </div>
                        </div>

                        <p className="text-xs text-white/60 mb-8 leading-relaxed italic h-12 overflow-hidden line-clamp-2">
                            "{tier.description}"
                        </p>

                        <div className="space-y-4 mb-10 flex-1">
                            {tier.features.map((feature, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <div className="p-1 bg-emerald-500/10 rounded-full">
                                        <Check className="w-3 h-3 text-emerald-400" />
                                    </div>
                                    <span className="text-[10px] font-medium text-white/70 uppercase tracking-tight">{feature}</span>
                                </div>
                            ))}
                        </div>

                        <button className={`w-full py-4 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all flex items-center justify-center gap-2 ${
                            tier.highlight 
                                ? "bg-indigo-500 hover:bg-indigo-400 text-white shadow-xl shadow-indigo-500/20" 
                                : "bg-white text-black hover:bg-neutral-200"
                        }`}>
                            <span>{tier.cta}</span>
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </motion.div>
                ))}
            </div>

            {/* Usage Stats (Simulated) */}
            <div className="p-8 bg-white/5 border border-white/10 rounded-3xl grid grid-cols-1 md:grid-cols-4 gap-8">
                <div className="col-span-1 md:col-span-2">
                    <div className="flex items-center gap-3 mb-4">
                        <BarChart3 className="w-5 h-5 text-emerald-400" />
                        <h4 className="text-[10px] font-bold text-white uppercase tracking-widest">Workspace Usage</h4>
                    </div>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <div className="flex justify-between text-[8px] font-black text-white/20 uppercase">
                                <span>AI Generations Used</span>
                                <span>142 / 500</span>
                            </div>
                            <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500" style={{ width: '28.4%' }} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-[8px] font-black text-white/20 uppercase">
                                <span>Storage Capacity</span>
                                <span>1.2 GB / 50 GB</span>
                            </div>
                            <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full bg-indigo-500" style={{ width: '2.4%' }} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col items-center justify-center text-center p-6 bg-indigo-500/5 rounded-2xl border border-indigo-500/10">
                    <p className="text-[8px] font-black text-indigo-400 uppercase tracking-widest mb-1">Current Tier</p>
                    <p className="text-xl font-black text-white uppercase">Ghost Agency</p>
                </div>

                <div className="flex flex-col items-center justify-center text-center p-6 bg-white/5 rounded-2xl border border-white/5">
                    <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-1">Next Bill</p>
                    <p className="text-xl font-black text-white">Mar 10, 26</p>
                </div>
            </div>
        </div>
    );
}
