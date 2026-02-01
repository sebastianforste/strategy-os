"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { X, Users, Crosshair, Search, Zap, MessageSquare, Handshake, Target, Copy, ChevronRight, BrainCircuit } from "lucide-react";
import { analyzeCorpus, generateCommentStrategy, ContentDNA, CommentStrategy } from "../utils/dna-service";

interface NetworkHubProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
}

interface NetworkTarget {
  id: string;
  name: string;
  role: string;
  dna: ContentDNA | null;
  status: "prospect" | "engaged" | "ally";
}

export default function NetworkHub({ isOpen, onClose, apiKey }: NetworkHubProps) {
  const [step, setStep] = useState<"list" | "intel" | "war-room">("list");
  const [targets, setTargets] = useState<NetworkTarget[]>([
    { id: "1", name: "Elon Musk", role: "Technoking", dna: null, status: "prospect" },
    { id: "2", name: "Paul Graham", role: "YCombinator", dna: null, status: "engaged" }
  ]);
  const [selectedTarget, setSelectedTarget] = useState<NetworkTarget | null>(null);
  const [intelText, setIntelText] = useState("");
  const [postInput, setPostInput] = useState("");
  const [strategies, setStrategies] = useState<CommentStrategy[]>([]);
  const [analyzing, setAnalyzing] = useState(false);

  const handleAnalyzeTarget = async () => {
    if (!intelText || !apiKey || !selectedTarget) return;
    setAnalyzing(true);
    const result = await analyzeCorpus([intelText], apiKey);
    if (result) {
        setTargets(prev => prev.map(t => t.id === selectedTarget.id ? { ...t, dna: result } : t));
        setSelectedTarget(prev => prev ? { ...prev, dna: result } : null);
        setStep("war-room");
    }
    setAnalyzing(false);
  };

  const handleGenerateStrategy = async () => {
      if (!selectedTarget?.dna || !postInput || !apiKey) return;
      setAnalyzing(true);
      const results = await generateCommentStrategy(selectedTarget.dna, postInput, apiKey);
      setStrategies(results);
      setAnalyzing(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={onClose} />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-full max-w-4xl bg-[#0A0A0A] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[600px]"
      >
        {/* Header */}
        <div className="h-16 border-b border-white/10 flex items-center justify-between px-6 bg-white/5">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-500/10 rounded-lg border border-indigo-500/30">
                    <Crosshair className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                    <h3 className="text-white font-bold text-lg">Network Intelligence</h3>
                    <p className="text-[10px] text-neutral-400 uppercase tracking-widest">Strategic Relationship Management</p>
                </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <X className="w-5 h-5 text-neutral-400" />
            </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
            {/* Sidebar */}
            <div className="w-64 border-r border-white/10 bg-black/20 p-4 overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h4 className="text-xs font-bold text-neutral-500 uppercase tracking-widest">High Value Targets</h4>
                    <button className="p-1 hover:bg-white/10 rounded"><Users className="w-3 h-3 text-neutral-400" /></button>
                </div>
                <div className="space-y-2">
                    {targets.map(target => (
                        <button
                            key={target.id}
                            onClick={() => { setSelectedTarget(target); setStep(target.dna ? "war-room" : "intel"); }}
                            className={`w-full text-left p-3 rounded-xl border transition-all ${selectedTarget?.id === target.id ? "bg-white/10 border-white/20" : "bg-transparent border-transparent hover:bg-white/5"}`}
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-xs font-bold text-indigo-300">
                                    {target.name.charAt(0)}
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-white leading-none">{target.name}</p>
                                    <p className="text-[10px] text-neutral-500 mt-1">{target.role}</p>
                                </div>
                                {target.dna && <BrainCircuit className="w-3 h-3 text-green-400 ml-auto" />}
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
                {!selectedTarget ? (
                    <div className="h-full flex flex-col items-center justify-center text-neutral-500 gap-4">
                        <Crosshair className="w-12 h-12 opacity-20" />
                        <p>Select a target to initialize intelligence protocols.</p>
                    </div>
                ) : step === "intel" ? (
                    <div className="space-y-6">
                        <div className="bg-indigo-900/10 border border-indigo-500/20 p-4 rounded-xl">
                            <h4 className="text-indigo-300 font-bold mb-1 flex items-center gap-2">
                                <Search className="w-4 h-4" /> Intel Collection Required
                            </h4>
                            <p className="text-xs text-indigo-200/70">
                                To analyze {selectedTarget.name}'s psych profile, paste their recent content below (About section, last 3 tweets, or detailed bio).
                            </p>
                        </div>

                        <textarea
                            value={intelText}
                            onChange={(e) => setIntelText(e.target.value)}
                            className="w-full h-64 bg-black/40 border border-white/10 rounded-xl p-4 text-sm text-white focus:border-indigo-500/50 outline-none resize-none font-mono"
                            placeholder={`Paste ${selectedTarget.name}'s content dossier here...`}
                        />

                        <button
                            onClick={handleAnalyzeTarget}
                            disabled={!intelText || analyzing}
                            className="w-full py-3 bg-white text-black font-bold rounded-lg hover:scale-[1.02] transition-transform disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {analyzing ? (
                                <>Analyzing Psych Profile...</>
                            ) : (
                                <><BrainCircuit className="w-4 h-4" /> GENERATE PSYCH DOSSIER</>
                            )}
                        </button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Dossier Card */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                                <h5 className="text-[10px] text-neutral-500 uppercase tracking-widest mb-2">Tone Vector</h5>
                                <p className="text-sm font-serif italic text-white">"{selectedTarget.dna?.tone}"</p>
                            </div>
                            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                                <h5 className="text-[10px] text-neutral-500 uppercase tracking-widest mb-2">Core Syntax</h5>
                                <p className="text-xs text-neutral-300">{selectedTarget.dna?.syntax}</p>
                            </div>
                        </div>

                        {/* War Room Input */}
                        <div className="border-t border-white/10 pt-6">
                            <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                                <Target className="w-4 h-4 text-red-400" /> War Room: Comment Strategy
                            </h4>
                            
                            <textarea
                                value={postInput}
                                onChange={(e) => setPostInput(e.target.value)}
                                className="w-full h-24 bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-red-500/50 outline-none resize-none mb-3"
                                placeholder={`Paste the post you want to reply to...`}
                            />
                            
                            <button
                                onClick={handleGenerateStrategy}
                                disabled={!postInput || analyzing}
                                className="w-full py-2 bg-red-900/20 border border-red-500/30 text-red-400 font-bold rounded-lg hover:bg-red-900/30 transition-colors disabled:opacity-50 text-xs"
                            >
                                {analyzing ? "Simulating Impact..." : "GENERATE STRATEGIC REPLIES"}
                            </button>
                        </div>

                        {/* Strategy Results */}
                        <div className="space-y-4">
                            {strategies.map((strat, i) => (
                                <div key={i} className="bg-black/40 border border-white/10 rounded-xl p-4 hover:border-white/20 transition-colors">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className={`px-2 py-1 rounded text-[10px] uppercase font-bold border ${
                                            strat.type === 'mirror' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                            strat.type === 'debate' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                            'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                                        }`}>
                                            {strat.type === 'mirror' ? 'The Mirror (Rapport)' : 
                                             strat.type === 'debate' ? 'The Debate (Status)' : 
                                             'The Question (Curiosity)'}
                                        </span>
                                        <button 
                                            onClick={() => navigator.clipboard.writeText(strat.content)}
                                            className="text-neutral-500 hover:text-white"
                                        >
                                            <Copy className="w-3 h-3" />
                                        </button>
                                    </div>
                                    <p className="text-sm text-white font-medium mb-2 leading-relaxed">{strat.content}</p>
                                    <p className="text-[10px] text-neutral-500 italic border-t border-white/5 pt-2">
                                        Strategy: {strat.reasoning}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
      </motion.div>
    </div>
  );
}
