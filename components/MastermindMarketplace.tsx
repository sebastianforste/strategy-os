
"use client";

import { motion } from "framer-motion";
import { ShoppingBag, Star, Download, Users, Globe, Flame } from "lucide-react";
import { useState } from "react";

const FEATURED_TEMPLATES = [
    { id: 1, name: "The CSO Framework", creator: "Sebastian", downloads: "1.2k", rating: 4.9, category: "Strategy", price: "Free" },
    { id: 2, name: "Viral Hook Toolkit", creator: "GhostAgent", downloads: "850", rating: 4.8, category: "Writing", price: "0.1 ETH" },
    { id: 3, name: "Technical to Story", creator: "Alex", downloads: "420", rating: 4.7, category: "Remixing", price: "Free" }
];

export default function MastermindMarketplace() {
    return (
        <div className="p-8 bg-neutral-900 border border-white/5 rounded-3xl space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-black text-white italic tracking-tighter flex items-center gap-2">
                        <ShoppingBag className="w-5 h-5 text-amber-500" />
                        MASTERMIND MARKET
                    </h2>
                    <p className="text-xs text-neutral-500">Download high-performance templates from the network.</p>
                </div>
                <div className="flex items-center gap-4 bg-black/40 px-4 py-2 rounded-full border border-white/5">
                    <div className="flex items-center gap-1">
                        <Users className="w-3 h-3 text-neutral-500" />
                        <span className="text-[10px] font-bold text-white">428 Active Nodes</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-6">
                {FEATURED_TEMPLATES.map((tpl) => (
                    <motion.div 
                        key={tpl.id}
                        whileHover={{ y: -5 }}
                        className="bg-black/40 border border-white/5 p-6 rounded-2xl hover:border-amber-500/30 transition-all group"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <span className="px-2 py-0.5 bg-amber-500/10 text-amber-500 text-[8px] font-black rounded uppercase border border-amber-500/20">{tpl.category}</span>
                            <div className="flex items-center gap-1 text-amber-400">
                                <Star className="w-3 h-3 fill-current" />
                                <span className="text-[10px] font-bold">{tpl.rating}</span>
                            </div>
                        </div>

                        <h3 className="font-bold text-white mb-1 group-hover:text-amber-400 transition-colors">{tpl.name}</h3>
                        <p className="text-[10px] text-neutral-500 mb-6">by {tpl.creator}</p>

                        <div className="flex items-center justify-between pt-4 border-t border-white/5">
                            <div className="flex items-center gap-1">
                                <Download className="w-3 h-3 text-neutral-500" />
                                <span className="text-[10px] font-bold text-neutral-400">{tpl.downloads}</span>
                            </div>
                            <button className="bg-white text-black px-4 py-1.5 rounded-lg text-[10px] font-black hover:bg-amber-400 transition-colors">
                                {tpl.price === "Free" ? "GET NOW" : `BUY ${tpl.price}`}
                            </button>
                        </div>
                    </motion.div>
                ))}

                {/* Submit Your Own */}
                <div className="bg-amber-500/5 border border-dashed border-amber-500/20 p-6 rounded-2xl flex flex-col items-center justify-center text-center group cursor-pointer hover:bg-amber-500/10 transition-all">
                    <Globe className="w-8 h-8 text-amber-500 mb-3 opacity-50 group-hover:opacity-100 transition-opacity" />
                    <p className="font-bold text-white text-sm mb-1">Submit to Network</p>
                    <p className="text-[10px] text-neutral-500">Share your best templates & earn reputation.</p>
                </div>
            </div>

            <div className="p-4 bg-indigo-600/10 border border-indigo-500/20 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-500 rounded-lg">
                        <Flame className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-white uppercase tracking-wider">Top Strategist of the Week</p>
                        <p className="text-[10px] text-indigo-400">@sebastian is leading with +24% engagement across templates.</p>
                    </div>
                </div>
                <button className="text-[10px] font-black text-indigo-400 hover:text-white transition-colors">VIEW LEADERBOARD →</button>
            </div>
        </div>
    );
}
