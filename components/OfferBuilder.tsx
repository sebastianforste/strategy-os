"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DollarSign, ShieldCheck, Zap, X, ChevronRight, Package, TrendingUp, Clock, AlertCircle } from "lucide-react";
import { generateGrandSlamOffer, GrandSlamOffer } from "../utils/offer-service";

export default function OfferBuilder({ 
    isOpen, 
    onClose, 
    content, 
    apiKey,
    onApply
}: { 
    isOpen: boolean, 
    onClose: () => void, 
    content: string, 
    apiKey: string,
    onApply: (offer: GrandSlamOffer) => void
}) {
    const [isGenerating, setIsGenerating] = useState(false);
    const [offer, setOffer] = useState<GrandSlamOffer | null>(null);

    const handleBuildOffer = async () => {
        setIsGenerating(true);
        try {
            const result = await generateGrandSlamOffer(content, apiKey);
            setOffer(result);
        } catch (e) {
            console.error("Offer build failed", e);
        } finally {
            setIsGenerating(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[120] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4">
            <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 50 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="bg-[#050505] border border-emerald-500/20 rounded-[2.5rem] w-full max-w-6xl h-[85vh] overflow-hidden shadow-[0_0_100px_rgba(16,185,129,0.1)] flex flex-col"
            >
                {/* Header: The Revenue Node */}
                <div className="p-8 border-b border-white/5 bg-gradient-to-r from-emerald-950/20 to-transparent flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/30">
                            <DollarSign className="w-8 h-8 text-emerald-500" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-white tracking-widest uppercase italic">The Offer Builder</h3>
                            <p className="text-[10px] text-emerald-500/70 font-mono tracking-[0.4em] uppercase mt-1">Hormozi Monetization Pipeline v3.0</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 text-neutral-500 hover:text-white transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex-1 overflow-hidden flex">
                    {/* Left: Value Equation Scorecard */}
                    <div className="w-1/3 border-r border-white/5 p-8 space-y-8 bg-black/40 overflow-y-auto custom-scrollbar">
                        <div>
                            <label className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.3em] mb-6 block">The Value Equation</label>
                            
                            {!offer && !isGenerating ? (
                                <div className="p-6 border border-dashed border-white/10 rounded-3xl text-center space-y-4">
                                    <Package className="w-12 h-12 text-neutral-800 mx-auto" />
                                    <p className="text-xs text-neutral-500 leading-relaxed">Strategy is the vehicle.<br/>The **Offer** is the engine.</p>
                                    <button 
                                        onClick={handleBuildOffer}
                                        className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl text-xs uppercase tracking-widest transition-all shadow-xl shadow-emerald-950/20"
                                    >
                                        Construct Grand Slam Offer
                                    </button>
                                </div>
                            ) : isGenerating ? (
                                <div className="space-y-6 animate-pulse">
                                    {[1, 2, 3, 4].map(i => (
                                        <div key={i} className="h-20 bg-white/5 rounded-2xl" />
                                    ))}
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <ValueMetric label="Dream Outcome" value={offer?.dreamOutcome} icon={<TrendingUp className="w-4 h-4 text-emerald-400" />} />
                                    <ValueMetric label="Likelihood of Achievement" value={offer?.perceivedLikelihood} icon={<ShieldCheck className="w-4 h-4 text-emerald-400" />} />
                                    <ValueMetric label="Time Delay Reduction" value={offer?.timeDelayReduction} icon={<Clock className="w-4 h-4 text-emerald-400" />} />
                                    <ValueMetric label="Effort & Sacrifice Removal" value={offer?.effortAndSacrificeRemoval} icon={<Zap className="w-4 h-4 text-emerald-400" />} />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right: The Final Stack */}
                    <div className="flex-1 p-8 overflow-y-auto custom-scrollbar bg-gradient-to-b from-transparent to-emerald-950/10">
                        {offer && (
                            <motion.div 
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="max-w-xl mx-auto space-y-8"
                            >
                                <div className="text-center space-y-2">
                                    <h4 className="text-4xl font-black text-white italic tracking-tighter uppercase">{offer.theOffer.name}</h4>
                                    <div className="inline-block px-4 py-1 bg-emerald-500/20 text-emerald-400 text-lg font-black rounded-full border border-emerald-500/30">
                                        {offer.theOffer.price}
                                    </div>
                                </div>

                                <div className="p-8 bg-white/5 border border-white/10 rounded-[2rem] space-y-6 shadow-2xl">
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Stacking Bonuses</label>
                                        {offer.theOffer.bonuses.map((bonus, i) => (
                                            <div key={i} className="flex items-center gap-4 text-sm text-neutral-300">
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                                                {bonus}
                                            </div>
                                        ))}
                                    </div>

                                    <div className="pt-6 border-t border-white/5 flex items-start gap-4">
                                        <div className="p-2 bg-emerald-500/10 rounded-lg">
                                            <ShieldCheck className="w-4 h-4 text-emerald-500" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-white uppercase tracking-widest">The Risk Reversal</p>
                                            <p className="text-xs text-neutral-400 mt-1">{offer.theOffer.guarantee}</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-4">
                                        <div className="flex-1 p-4 bg-orange-500/10 border border-orange-500/20 rounded-2xl">
                                            <span className="text-[9px] font-black text-orange-500 uppercase block mb-1">Scarcity</span>
                                            <span className="text-xs text-orange-200">{offer.theOffer.scarcity}</span>
                                        </div>
                                        <div className="flex-1 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl">
                                            <span className="text-[9px] font-black text-red-500 uppercase block mb-1">Urgency</span>
                                            <span className="text-xs text-red-200">{offer.theOffer.urgency}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest text-center block">The Conversion String (Appended to Post)</label>
                                    <div className="p-4 bg-black border border-white/5 rounded-xl text-xs font-mono text-emerald-400 text-center italic">
                                        "{offer.cta}"
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </div>

                {/* Footer Scoreboard */}
                <div className="p-8 border-t border-white/5 bg-black/60 flex items-center justify-between">
                    <div className="flex items-center gap-8">
                        <div className="flex items-center gap-3">
                            <AlertCircle className="w-4 h-4 text-neutral-600" />
                            <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Compliance: Verified</span>
                        </div>
                        <div className="flex items-center gap-3 text-emerald-500">
                            <TrendingUp className="w-4 h-4" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Estimated Value Gap: $12,400+</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={onClose}
                            className="px-6 py-2 text-xs font-bold text-neutral-500 hover:text-white transition-colors"
                        >
                            Discard Stack
                        </button>
                        {offer && (
                            <button 
                                onClick={() => {
                                    onApply(offer);
                                    onClose();
                                }}
                                className="px-10 py-3 bg-emerald-500 hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] text-black font-black rounded-2xl text-sm uppercase tracking-tighter transition-all"
                            >
                                Finalize & Monetize
                            </button>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

function ValueMetric({ label, value, icon }: { label: string, value?: string, icon: React.ReactNode }) {
    return (
        <div className="p-5 bg-white/[0.02] border border-white/5 rounded-3xl space-y-2">
            <div className="flex items-center gap-2">
                {icon}
                <span className="text-[9px] font-black text-neutral-500 uppercase tracking-widest">{label}</span>
            </div>
            <p className="text-xs text-white font-bold">{value || "---"}</p>
        </div>
    );
}
