"use client";

import { useState, useEffect } from "react";
import { Mic, Mail, Send, CheckCircle, RefreshCw, X, Edit3 } from "lucide-react";
import { findPodcastOpportunities, MediaOpportunity, analyzeHostStyle } from "../utils/media-scanner";
import { draftColdPitch, PitchDraft } from "../utils/pitch-drafter";
import { motion, AnimatePresence } from "framer-motion";

interface MediaKitProps {
  initialNiche?: string;
  apiKey?: string;
}

export default function MediaKit({ initialNiche = "Tech", apiKey }: MediaKitProps) {
  const [pipeline, setPipeline] = useState<{
    identified: MediaOpportunity[];
    drafted: { opp: MediaOpportunity; draft: PitchDraft }[];
    sent: MediaOpportunity[];
  }>({ identified: [], drafted: [], sent: [] });

  const [isLoading, setIsLoading] = useState(false);
  const [selectedDraft, setSelectedDraft] = useState<{ opp: MediaOpportunity; draft: PitchDraft } | null>(null);

  useEffect(() => {
    if (apiKey) scanMedia(initialNiche);
  }, [initialNiche, apiKey]);

  const scanMedia = async (niche: string) => {
    setIsLoading(true);
    const opps = await findPodcastOpportunities(niche, apiKey);
    setPipeline(prev => ({ ...prev, identified: opps }));
    setIsLoading(false);
  };

  const handleDraftPitch = async (opp: MediaOpportunity) => {
    setIsLoading(true);
    // Remove from identified
    setPipeline(prev => ({
        ...prev,
        identified: prev.identified.filter(o => o.id !== opp.id)
    }));

    // Generate Draft
    const draft = await draftColdPitch(opp, "The Strategist");
    
    // Add to Drafted
    setPipeline(prev => ({
        ...prev,
        drafted: [...prev.drafted, { opp, draft }]
    }));
    setIsLoading(false);
  };

  const handleSendPitch = (item: { opp: MediaOpportunity; draft: PitchDraft }) => {
    // Determine style for visual feedback
    const style = analyzeHostStyle(item.opp.id);
    console.log(`[PR Agent] Pitch sent to ${item.opp.name} (${style} style). Subject: ${item.draft.subject}`);

    setPipeline(prev => ({
        ...prev,
        drafted: prev.drafted.filter(i => i.opp.id !== item.opp.id),
        sent: [...prev.sent, item.opp]
    }));
    setSelectedDraft(null);
  };

  return (
    <div className="w-full h-full p-6 bg-[#0a0a0a] text-white">
      <div className="flex items-center justify-between mb-8">
        <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
                <Mic className="text-indigo-500" />
                Media Agent
            </h2>
            <p className="text-neutral-500 text-sm">Automated Outreach Pipeline</p>
        </div>
        <button onClick={() => scanMedia("GenAI")} className="p-2 bg-neutral-800 rounded-full hover:bg-neutral-700 transition">
            <RefreshCw className={`w-4 h-4 text-neutral-400 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-6 h-[500px]">
        {/* COL 1: IDENTIFIED */}
        <div className="bg-neutral-900/50 rounded-xl p-4 border border-white/5 flex flex-col">
            <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                Identified ({pipeline.identified.length})
            </h3>
            <div className="space-y-3 overflow-y-auto flex-1">
                <AnimatePresence>
                    {pipeline.identified.map(opp => (
                        <motion.div 
                            key={opp.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="p-4 bg-neutral-800 rounded-lg border border-white/5 group hover:border-indigo-500/50 transition-colors"
                        >
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-[10px] bg-neutral-900 text-neutral-400 px-2 py-0.5 rounded flex items-center gap-1">
                                    <Mic className="w-3 h-3" /> {opp.type}
                                </span>
                                <span className="text-[10px] text-indigo-400 font-mono">{opp.relevanceScore}% MATCH</span>
                            </div>
                            <h4 className="font-bold text-sm mb-1">{opp.name}</h4>
                            <p className="text-xs text-neutral-500 mb-3">Host: {opp.host}</p>
                            
                            <button 
                                onClick={() => handleDraftPitch(opp)}
                                className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-xs font-bold rounded flex items-center justify-center gap-2 transition-colors"
                            >
                                <Edit3 className="w-3 h-3" /> Draft Pitch
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>
                {pipeline.identified.length === 0 && !isLoading && (
                    <div className="text-center py-8 text-neutral-600 text-xs">No opportunities found.</div>
                )}
            </div>
        </div>

        {/* COL 2: DRAFTED */}
        <div className="bg-neutral-900/50 rounded-xl p-4 border border-white/5 flex flex-col">
            <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-yellow-500" />
                Drafted ({pipeline.drafted.length})
            </h3>
            <div className="space-y-3 overflow-y-auto flex-1">
                {pipeline.drafted.map(item => (
                    <div 
                        key={item.opp.id}
                        onClick={() => setSelectedDraft(item)}
                        className="p-4 bg-neutral-800 rounded-lg border border-white/5 hover:bg-neutral-750 cursor-pointer transition-colors"
                    >
                        <h4 className="font-bold text-sm mb-1">{item.opp.name}</h4>
                        <p className="text-xs text-neutral-500 line-clamp-2">"{item.draft.subject}"</p>
                        <div className="mt-2 flex justify-end">
                            <span className="text-[10px] text-yellow-500 flex items-center gap-1">
                                Review Required <ArrowUpRight className="w-3 h-3" />
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* COL 3: SENT */}
        <div className="bg-neutral-900/50 rounded-xl p-4 border border-white/5 flex flex-col">
            <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                Sent ({pipeline.sent.length})
            </h3>
            <div className="space-y-3 overflow-y-auto flex-1">
                 {pipeline.sent.map(opp => (
                    <div key={opp.id} className="p-4 bg-green-900/10 rounded-lg border border-green-500/20 opacity-70">
                        <div className="flex justify-between items-center mb-1">
                             <h4 className="font-bold text-sm text-green-100">{opp.name}</h4>
                             <CheckCircle className="w-4 h-4 text-green-500" />
                        </div>
                        <p className="text-[10px] text-green-400">Pitch Sent</p>
                    </div>
                 ))}
            </div>
        </div>
      </div>

      {/* Pitch Review Modal */}
      <AnimatePresence>
        {selectedDraft && (
            <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            >
                <div className="w-full max-w-2xl bg-[#111] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
                    <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
                        <h3 className="font-bold">Review Pitch: {selectedDraft.opp.name}</h3>
                        <button onClick={() => setSelectedDraft(null)}><X className="w-5 h-5 text-neutral-400" /></button>
                    </div>
                    <div className="p-6 space-y-4">
                        <div>
                            <label className="text-xs text-neutral-500 uppercase font-bold">Subject</label>
                            <input 
                                className="w-full bg-black border border-white/10 p-2 rounded text-sm text-white mt-1"
                                defaultValue={selectedDraft.draft.subject}
                            />
                        </div>
                        <div>
                            <label className="text-xs text-neutral-500 uppercase font-bold">Body</label>
                            <textarea 
                                className="w-full h-64 bg-black border border-white/10 p-4 rounded text-sm text-neutral-300 mt-1 font-mono leading-relaxed resize-none"
                                defaultValue={selectedDraft.draft.body}
                            />
                        </div>
                    </div>
                    <div className="p-4 border-t border-white/10 flex justify-end gap-3 bg-white/5">
                        <button onClick={() => setSelectedDraft(null)} className="px-4 py-2 text-sm text-neutral-400 hover:text-white">Cancel</button>
                        <button 
                            onClick={() => handleSendPitch(selectedDraft)}
                            className="px-6 py-2 bg-green-600 hover:bg-green-500 text-white text-sm font-bold rounded flex items-center gap-2"
                        >
                            <Send className="w-4 h-4" /> Approve & Send
                        </button>
                    </div>
                </div>
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ArrowUpRight({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M7 7h10v10"/><path d="M7 17 17 7"/></svg>
    )
}
