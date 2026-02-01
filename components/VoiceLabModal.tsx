"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, Dna, ArrowRight, Wand2, Check, RefreshCw } from "lucide-react";
import { analyzeCorpus, saveDNA, getDNA, ContentDNA } from "../utils/dna-service";

interface VoiceLabModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
}

export default function VoiceLabModal({ isOpen, onClose, apiKey }: VoiceLabModalProps) {
  const [step, setStep] = useState<"input" | "analyzing" | "result">("input");
  const [corpusText, setCorpusText] = useState("");
  const [dna, setDNA] = useState<ContentDNA | null>(null);

  // Load existing DNA on mount
  useEffect(() => {
      if (isOpen) {
          const existing = getDNA();
          if (existing) {
              setDNA(existing);
              // If we already have DNA, show result view first? Or maybe a split view?
              // For now, let's just let them see it if they want, but default to input if they want to retrain.
              if (!corpusText) setStep("result");
          } else {
              setStep("input");
          }
      }
  }, [isOpen]);

  const handleAnalyze = async () => {
      if (!corpusText.trim() || !apiKey) return;
      
      const posts = corpusText.split("\n\n").filter(p => p.trim().length > 20);
      if (posts.length < 3) {
          alert("Please provide at least 3 distinct posts separated by double line breaks.");
          return;
      }

      setStep("analyzing");
      const result = await analyzeCorpus(posts, apiKey);
      if (result) {
          setDNA(result);
          saveDNA(result);
          setStep("result");
      } else {
          setStep("input");
          alert("Analysis failed. Please check your API key and try again.");
      }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={onClose} />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-full max-w-2xl bg-[#0A0A0A] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="h-16 border-b border-white/10 flex items-center justify-between px-6 bg-white/5">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-pink-500/10 rounded-lg border border-pink-500/30">
                    <Dna className="w-5 h-5 text-pink-400" />
                </div>
                <div>
                    <h3 className="text-white font-bold text-lg">Voice Lab</h3>
                    <p className="text-[10px] text-neutral-400 uppercase tracking-widest">Content DNA Extraction</p>
                </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <X className="w-5 h-5 text-neutral-400" />
            </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar">
            
            {step === "input" && (
                <div className="space-y-4">
                     <div className="p-4 bg-blue-900/20 border border-blue-500/20 rounded-xl">
                         <h4 className="text-blue-200 font-bold text-sm mb-1">🧬 How to cloning your voice</h4>
                         <p className="text-xs text-blue-200/70">
                             Paste 5-10 of your <b>best performing posts</b> below. 
                             The AI will analyze your syntax, tone, and vocabulary to create a replica of your writing style.
                         </p>
                     </div>

                     <textarea 
                        value={corpusText}
                        onChange={(e) => setCorpusText(e.target.value)}
                        placeholder="Paste your content archive here..."
                        className="w-full h-64 bg-black/40 border border-white/10 rounded-xl p-4 text-sm text-white focus:border-pink-500/50 outline-none transition-colors resize-none font-mono"
                     />
                     
                     <div className="flex justify-end">
                         <button 
                            onClick={handleAnalyze}
                            disabled={!corpusText.trim()}
                            className="bg-white text-black px-6 py-2 rounded-lg font-bold text-sm hover:scale-105 transition-transform flex items-center gap-2 disabled:opacity-50"
                         >
                             <Wand2 className="w-4 h-4" />
                             EXTRACT DNA
                         </button>
                     </div>
                </div>
            )}

            {step === "analyzing" && (
                <div className="h-64 flex flex-col items-center justify-center text-center space-y-4">
                    <div className="relative">
                        <div className="w-16 h-16 rounded-full border-4 border-white/10 border-t-pink-500 animate-spin" />
                        <Dna className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-white animate-pulse" />
                    </div>
                    <div>
                        <h3 className="text-white font-bold">Sequencing Content DNA...</h3>
                        <p className="text-xs text-neutral-500 mt-1">Analyzing syntax, tone vectors, and vocabulary patterns.</p>
                    </div>
                </div>
            )}

            {step === "result" && dna && (
                <div className="space-y-6">
                    <div className="text-center">
                        <div className="inline-block p-3 rounded-full bg-green-500/10 mb-2">
                             <Check className="w-8 h-8 text-green-400" />
                        </div>
                        <h3 className="text-2xl font-bold text-white">Voice Clone Complete</h3>
                        <p className="text-neutral-400 text-sm">Your unique signature has been saved to the "Custom" persona.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                            <h4 className="text-xs text-neutral-500 uppercase tracking-widest mb-2">Tone Signature</h4>
                            <p className="text-lg font-serif text-white italic">"{dna.tone}"</p>
                        </div>
                        <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                            <h4 className="text-xs text-neutral-500 uppercase tracking-widest mb-2">Syntax Rules</h4>
                            <p className="text-sm text-neutral-300">{dna.syntax}</p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h4 className="text-xs text-neutral-500 uppercase tracking-widest">Core Vocabulary</h4>
                        <div className="flex flex-wrap gap-2">
                            {dna.keywords.map((k, i) => (
                                <span key={i} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-neutral-300">{k}</span>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h4 className="text-xs text-neutral-500 uppercase tracking-widest text-red-400/80">Anti-Vocabulary (Banned)</h4>
                        <div className="flex flex-wrap gap-2">
                            {dna.antiKeywords.map((k, i) => (
                                <span key={i} className="px-3 py-1 bg-red-900/20 border border-red-500/20 rounded-full text-xs text-red-300 line-through opacity-70">{k}</span>
                            ))}
                        </div>
                    </div>
                    
                    <div className="pt-6 border-t border-white/10 flex justify-between">
                         <button 
                            onClick={() => { setStep("input"); setCorpusText(""); }}
                            className="text-neutral-500 hover:text-white text-xs flex items-center gap-1"
                         >
                             <RefreshCw className="w-3 h-3" /> Retrain
                         </button>
                         <button 
                            onClick={onClose}
                            className="bg-white text-black px-6 py-2 rounded-lg font-bold text-sm hover:scale-105 transition-transform"
                         >
                             DONE
                         </button>
                    </div>
                </div>
            )}

        </div>
      </motion.div>
    </div>
  );
}
