
"use client";

import { motion } from "framer-motion";
import { Search, TrendingUp, AlertCircle, Target, Zap, ChevronRight } from "lucide-react";
import { useState } from "react";

export default function CompetitorMonitor() {
    const [competitorUrl, setCompetitorUrl] = useState("");
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [report, setReport] = useState<any | null>(null);

    const handleAnalyze = async () => {
        setIsAnalyzing(true);
        // Simulate Deep Gap Analysis
        await new Promise(r => setTimeout(r, 2000));
        setReport({
            name: "Elite Strategist",
            score: 88,
            gaps: [
                { topic: "AI Governance", opportunity: "High", detail: "Competitor focuses on tech; no one is talking about the legal/ethical layer." },
                { topic: "Solopreneur Burnout", opportunity: "Medium", detail: "They are too 'hustle' oriented; there's a gap for wellness-driven strategy." }
            ],
            recentViralHooks: [
                "The $0 to $1M blueprint is broken. Here's why...",
                "I analyzed 1,000 SaaS landing pages. 99% fail at this..."
            ]
        });
        setIsAnalyzing(false);
    };

    return (
        <div className="p-8 bg-[#050505] rounded-3xl border border-white/5 space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-black text-white italic tracking-tighter flex items-center gap-2">
                        <Target className="w-5 h-5 text-red-500" />
                        COMPETITIVE RECON
                    </h2>
                    <p className="text-xs text-neutral-500">Find the holes in their strategy. Then fill them.</p>
                </div>
                <div className="flex gap-2">
                    <span className="px-2 py-1 bg-red-500/10 text-red-500 text-[10px] font-bold rounded border border-red-500/20 animate-pulse">LIVE MONITORING</span>
                </div>
            </div>

            <div className="flex gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600" />
                    <input 
                        type="text" 
                        value={competitorUrl}
                        onChange={(e) => setCompetitorUrl(e.target.value)}
                        placeholder="Paste Competitor Profile URL (LinkedIn/X)..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm text-white focus:border-red-500 outline-none transition-all"
                    />
                </div>
                <button 
                    onClick={handleAnalyze}
                    disabled={isAnalyzing || !competitorUrl}
                    className="px-6 py-3 bg-red-600 text-white font-bold rounded-xl text-xs hover:bg-red-500 transition-all disabled:opacity-50"
                >
                    {isAnalyzing ? "RECON IN PROGRESS..." : "ANALYZE GAPS"}
                </button>
            </div>

            {report && (
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-2 gap-6"
                >
                    <div className="space-y-4">
                        <h3 className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em]">Strategic Gaps Identified</h3>
                        <div className="space-y-3">
                            {report.gaps.map((gap: any, i: number) => (
                                <div key={i} className="p-4 bg-white/5 border border-white/10 rounded-2xl group hover:border-red-500/50 transition-all cursor-pointer">
                                    <div className="flex justify-between items-start mb-2">
                                        <p className="font-bold text-white text-sm">{gap.topic}</p>
                                        <span className="text-[10px] font-bold text-red-400 bg-red-400/10 px-2 py-0.5 rounded uppercase">Opportunity: {gap.opportunity}</span>
                                    </div>
                                    <p className="text-[10px] text-neutral-400 leading-relaxed">{gap.detail}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-4">
                         <h3 className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em]">Viral Pattern Recognition</h3>
                         <div className="p-6 bg-red-600/5 border border-red-500/20 rounded-2xl relative overflow-hidden">
                            <Zap className="absolute -right-4 -top-4 w-24 h-24 text-red-500/10 rotate-12" />
                            <div className="space-y-4 relative">
                                {report.recentViralHooks.map((hook: string, i: number) => (
                                    <div key={i} className="flex gap-3">
                                        <ChevronRight className="w-4 h-4 text-red-500 shrink-0" />
                                        <p className="text-xs text-neutral-300 italic">"{hook}"</p>
                                    </div>
                                ))}
                                <button className="w-full py-2 bg-red-600 text-white text-[10px] font-black rounded-lg hover:bg-red-500 transition-all">
                                    REMIX TOP PERFORMERS
                                </button>
                            </div>
                         </div>
                    </div>
                </motion.div>
            )}
        </div>
    );
}
