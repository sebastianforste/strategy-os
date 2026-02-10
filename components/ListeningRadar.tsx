"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Radio, MessageSquare, Twitter, Linkedin, Zap, CheckCircle, AlertTriangle, ArrowRight } from "lucide-react";
import { SocialMention, fetchRecentMentions } from "../utils/engagement-service";

export default function ListeningRadar() {
    const [mentions, setMentions] = useState<SocialMention[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedMention, setSelectedMention] = useState<SocialMention | null>(null);

    useEffect(() => {
        const load = async () => {
            const data = await fetchRecentMentions();
            setMentions(data);
            setIsLoading(false);
        };
        load();
    }, []);

    const getSentimentColor = (sentiment: string) => {
        if (sentiment === 'positive') return 'text-emerald-400';
        if (sentiment === 'negative') return 'text-rose-400';
        return 'text-white/40';
    };

    return (
        <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-6 overflow-hidden">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400">
                        <Radio className="w-5 h-5 animate-pulse" />
                    </div>
                    <div>
                        <h3 className="text-white font-medium">Social Listening Radar</h3>
                        <p className="text-xs text-white/40 uppercase tracking-widest">Active Monitoring</p>
                    </div>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-tighter">Live Signals</span>
                </div>
            </div>

            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-12 opacity-20">
                        <Radio className="w-8 h-8 animate-ping mb-4" />
                        <span className="text-xs font-mono">Scanning Social Grids...</span>
                    </div>
                ) : (
                    mentions.map((mention) => (
                        <motion.button
                            key={mention.id}
                            layoutId={mention.id}
                            onClick={() => setSelectedMention(mention)}
                            className={`w-full text-left p-4 rounded-2xl border transition-all ${
                                selectedMention?.id === mention.id 
                                    ? "bg-white/10 border-white/20 shadow-xl" 
                                    : "bg-white/5 border-white/5 hover:border-white/10"
                            }`}
                        >
                            <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    {mention.platform === 'twitter' ? (
                                        <Twitter className="w-3.5 h-3.5 text-sky-400" />
                                    ) : (
                                        <Linkedin className="w-3.5 h-3.5 text-blue-500" />
                                    )}
                                    <span className="text-xs font-bold text-white/80">{mention.author}</span>
                                </div>
                                <span className={`text-[10px] font-mono ${getSentimentColor(mention.sentiment)}`}>
                                    {mention.sentiment.toUpperCase()}
                                </span>
                            </div>
                            <p className="text-[11px] text-white/60 leading-relaxed line-clamp-2 italic">
                                "{mention.text}"
                            </p>
                        </motion.button>
                    ))
                )}
            </div>

            <AnimatePresence>
                {selectedMention && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="mt-6 p-5 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-3">
                            <Zap className="w-4 h-4 text-indigo-400 opacity-50" />
                        </div>
                        
                        <h4 className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                            AI Objection Handler
                        </h4>
                        
                        <p className="text-[11px] text-white/80 leading-relaxed mb-4">
                            Deploy high-status reframing to address {selectedMention.author}'s skepticism.
                        </p>

                        <button className="w-full py-3 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-500/20">
                            <span>ARCHITECT RESPONSE</span>
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
