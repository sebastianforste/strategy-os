"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Target, Flame, ThermometerSun, Snowflake, Mail, Copy, X, Loader2, RefreshCw } from "lucide-react";
import { leadExtractorService, Lead, OutreachDraft } from "../utils/lead-extractor-service";

interface LeadPipelineProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function LeadPipeline({ isOpen, onClose }: LeadPipelineProps) {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
    const [outreach, setOutreach] = useState<OutreachDraft | null>(null);

    useEffect(() => {
        if (isOpen) {
            loadLeads();
        }
    }, [isOpen]);

    const loadLeads = async () => {
        setIsLoading(true);
        try {
            const data = await leadExtractorService.getLeadsFromEngagement();
            setLeads(data);
        } catch (e) {
            console.error("Failed to load leads", e);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGenerateOutreach = (lead: Lead) => {
        setSelectedLead(lead);
        const draft = leadExtractorService.generateOutreachDraft(lead);
        setOutreach(draft);
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        alert("Copied to clipboard!");
    };

    const getTierIcon = (tier: string) => {
        switch (tier) {
            case 'hot': return <Flame className="w-4 h-4 text-orange-500" />;
            case 'warm': return <ThermometerSun className="w-4 h-4 text-amber-400" />;
            case 'cold': return <Snowflake className="w-4 h-4 text-blue-400" />;
            default: return null;
        }
    };

    const getTierColor = (tier: string) => {
        switch (tier) {
            case 'hot': return 'bg-orange-500/10 border-orange-500/30';
            case 'warm': return 'bg-amber-500/10 border-amber-500/30';
            case 'cold': return 'bg-blue-500/10 border-blue-500/30';
            default: return 'bg-white/5 border-white/10';
        }
    };

    if (!isOpen) return null;

    const hotLeads = leads.filter(l => l.tier === 'hot');
    const warmLeads = leads.filter(l => l.tier === 'warm');
    const coldLeads = leads.filter(l => l.tier === 'cold');

    return (
        <div className="fixed inset-0 z-[80] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-neutral-900 border border-white/10 rounded-2xl w-full max-w-5xl max-h-[85vh] overflow-hidden shadow-2xl flex flex-col"
            >
                {/* Header */}
                <div className="p-6 border-b border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl">
                            <Target className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="font-bold text-white">Lead Pipeline</h3>
                            <p className="text-xs text-neutral-500 font-mono">THE BOUNTY HUNTER v1.0</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={loadLeads}
                            disabled={isLoading}
                            className="p-2 text-neutral-500 hover:text-white transition-colors"
                        >
                            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                        </button>
                        <button onClick={onClose} className="text-neutral-500 hover:text-white transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center h-64 gap-4">
                            <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
                            <p className="text-sm text-neutral-500 font-mono">SCANNING NETWORK...</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Hot Leads */}
                            <div className="bg-orange-500/5 rounded-xl p-4 border border-orange-500/20">
                                <div className="flex items-center gap-2 mb-4">
                                    <Flame className="w-4 h-4 text-orange-500" />
                                    <span className="text-sm font-bold text-orange-400">HOT ({hotLeads.length})</span>
                                </div>
                                <div className="space-y-3">
                                    {hotLeads.map(lead => (
                                        <LeadCard key={lead.id} lead={lead} onOutreach={handleGenerateOutreach} tierColor={getTierColor(lead.tier)} />
                                    ))}
                                </div>
                            </div>

                            {/* Warm Leads */}
                            <div className="bg-amber-500/5 rounded-xl p-4 border border-amber-500/20">
                                <div className="flex items-center gap-2 mb-4">
                                    <ThermometerSun className="w-4 h-4 text-amber-400" />
                                    <span className="text-sm font-bold text-amber-400">WARM ({warmLeads.length})</span>
                                </div>
                                <div className="space-y-3">
                                    {warmLeads.map(lead => (
                                        <LeadCard key={lead.id} lead={lead} onOutreach={handleGenerateOutreach} tierColor={getTierColor(lead.tier)} />
                                    ))}
                                </div>
                            </div>

                            {/* Cold Leads */}
                            <div className="bg-blue-500/5 rounded-xl p-4 border border-blue-500/20">
                                <div className="flex items-center gap-2 mb-4">
                                    <Snowflake className="w-4 h-4 text-blue-400" />
                                    <span className="text-sm font-bold text-blue-400">COLD ({coldLeads.length})</span>
                                </div>
                                <div className="space-y-3">
                                    {coldLeads.map(lead => (
                                        <LeadCard key={lead.id} lead={lead} onOutreach={handleGenerateOutreach} tierColor={getTierColor(lead.tier)} />
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Outreach Panel */}
                <AnimatePresence>
                    {outreach && selectedLead && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="border-t border-white/10 bg-black/30"
                        >
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="text-sm font-bold text-white">Outreach Draft for {selectedLead.name}</h4>
                                    <button
                                        onClick={() => copyToClipboard(outreach.body)}
                                        className="px-3 py-1 bg-orange-500 text-white text-xs font-bold rounded-lg hover:bg-orange-400 transition-colors flex items-center gap-2"
                                    >
                                        <Copy className="w-3 h-3" /> Copy Draft
                                    </button>
                                </div>
                                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                                    <p className="text-xs text-neutral-500 mb-2">Subject: {outreach.subject}</p>
                                    <p className="text-sm text-neutral-300 whitespace-pre-wrap">{outreach.body}</p>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Footer */}
                <div className="p-4 border-t border-white/5 bg-black/20 flex items-center justify-between">
                    <p className="text-[10px] text-neutral-600 font-mono">TOTAL LEADS: {leads.length}</p>
                    <p className="text-[9px] text-neutral-600 font-mono uppercase tracking-widest">Powered by Bounty Hunter Engine</p>
                </div>
            </motion.div>
        </div>
    );
}

function LeadCard({ lead, onOutreach, tierColor }: { lead: Lead; onOutreach: (lead: Lead) => void; tierColor: string }) {
    return (
        <div className={`p-4 rounded-xl border ${tierColor}`}>
            <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-white">{lead.name}</span>
                <span className="text-[10px] text-neutral-400 font-mono">{lead.score}%</span>
            </div>
            <p className="text-[10px] text-neutral-400 mb-1">{lead.title} @ {lead.company}</p>
            <p className="text-[9px] text-neutral-600 italic line-clamp-2 mb-3">{lead.context}</p>
            <button
                onClick={() => onOutreach(lead)}
                className="w-full py-2 bg-white/5 border border-white/10 text-xs text-white rounded-lg hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
            >
                <Mail className="w-3 h-3" /> Draft Outreach
            </button>
        </div>
    );
}
