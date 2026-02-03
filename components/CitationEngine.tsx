"use client";

import { motion } from "framer-motion";
import { ShieldCheck, ExternalLink, Database, Search, Award, Info } from "lucide-react";
import { ProprietarySpark } from "../utils/insight-extractor";

export default function CitationEngine({ sparks, isLoading }: { sparks: ProprietarySpark[], isLoading?: boolean }) {
    if (!isLoading && sparks.length === 0) return null;

    return (
        <div className="mt-8 border-t border-white/5 pt-8">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
                        <ShieldCheck className="w-4 h-4 text-indigo-400" />
                    </div>
                    <div>
                        <h4 className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Verified Data Proofs</h4>
                        <p className="text-[9px] text-neutral-500 font-mono uppercase mt-0.5 tracking-widest">Authorized Proprietary Signal Intelligence</p>
                    </div>
                </div>
                {isLoading && (
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                        <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest">Searching Deep Web...</span>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {isLoading ? (
                    [1, 2, 3].map(i => (
                        <div key={i} className="h-32 bg-white/[0.02] border border-white/5 rounded-2xl animate-pulse" />
                    ))
                ) : (
                    sparks.map((spark, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="p-5 bg-white/[0.02] border border-white/5 rounded-2xl hover:border-indigo-500/30 transition-all group"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <Database className="w-3 h-3 text-indigo-500" />
                                    <span className="text-[9px] font-black text-neutral-400 uppercase tracking-tighter">Proprietary Spark #{i+1}</span>
                                </div>
                                <div className="flex items-center gap-1.5 px-1.5 py-0.5 bg-indigo-500/10 border border-indigo-500/20 rounded text-[8px] font-bold text-indigo-300">
                                    <Award className="w-2 h-2" />
                                    ORIGINALITY: {spark.originalityScore}/10
                                </div>
                            </div>
                            
                            <p className="text-xs text-white font-bold leading-relaxed line-clamp-2 italic mb-3">
                                "{spark.insight}"
                            </p>

                            <div className="p-2.5 bg-black/40 rounded-xl border border-white/5 mb-4">
                                <div className="flex items-center gap-2 mb-1">
                                    <Info className="w-2.5 h-2.5 text-neutral-600" />
                                    <span className="text-[8px] font-black text-neutral-600 uppercase">Hard Evidence</span>
                                </div>
                                <p className="text-[10px] text-neutral-400 font-mono leading-tight">
                                    {spark.dataPoint}
                                </p>
                            </div>

                            <a 
                                href={spark.citationUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-[9px] font-black text-neutral-500 hover:text-indigo-400 transition-colors uppercase tracking-widest"
                            >
                                <ExternalLink className="w-3 h-3" />
                                View Source Document
                            </a>
                        </motion.div>
                    ))
                )}
            </div>
            
            <div className="mt-6 flex items-center justify-center gap-6 py-4 border-y border-white/5 bg-white/[0.01]">
                 <div className="flex items-center gap-2 text-[9px] font-bold text-neutral-500 uppercase tracking-widest">
                    <Search className="w-3 h-3" />
                    Indexed: 14,000+ Obscure Nodes
                 </div>
                 <div className="w-px h-4 bg-white/5" />
                 <div className="flex items-center gap-2 text-[9px] font-bold text-neutral-500 uppercase tracking-widest">
                    <ShieldCheck className="w-3 h-3" />
                    Validation: Multi-Agent Consensus
                 </div>
            </div>
        </div>
    );
}
