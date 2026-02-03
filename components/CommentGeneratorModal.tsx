"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X, Clipboard, Sparkles, Copy, RefreshCw, Zap, Search, Globe } from "lucide-react";
import { generateCommentAction, findTrendsAction } from "../actions/generate";
import Toast, { ToastType } from "./Toast";
import { TrendResult } from "../utils/search-service";

interface CommentGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
  personaId: string;
  initialSignals?: TrendResult[];
}

const TONES_V1 = [
  "Insightful",
  "Questioning",
  "Contrarian",
  "Supportive",
  "Funny",
  "Brief"
];

const TONES_V2 = [
  "Insightful",
  "Supportive",
  "Questioning",
  "Contrarian",
  "Witty",
  "Data-driven"
];

export default function CommentGeneratorModal({ isOpen, onClose, apiKey, personaId, initialSignals }: CommentGeneratorModalProps) {
  const [postContent, setPostContent] = useState("");
  const [generatedComment, setGeneratedComment] = useState("");
  const [selectedTone, setSelectedTone] = useState("Insightful");
  const [isGenerating, setIsGenerating] = useState(false);
  const [useV2, setUseV2] = useState(true); // Default to V2
  const [industryContext, setIndustryContext] = useState("");
  const [toast, setToast] = useState<{ message: string; type: ToastType; isVisible: boolean }>({
    message: "",
    type: "success",
    isVisible: false,
  });
  
  // New State for Signal Integration
  const [foundSignals, setFoundSignals] = useState<TrendResult[]>([]);
  const [isSearchingSignals, setIsSearchingSignals] = useState(false);

  // Sync initial signals
  useEffect(() => {
    if (isOpen && initialSignals && initialSignals.length > 0) {
      setFoundSignals(initialSignals);
    }
  }, [initialSignals, isOpen]);
  
  const TONES = useV2 ? TONES_V2 : TONES_V1;

  const showToast = (message: string, type: ToastType) => {
    setToast({ message, type, isVisible: true });
  };

  const handlePasteClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setPostContent(text);
        showToast("Content pasted from clipboard", "success");
      } else {
        showToast("Clipboard is empty", "error");
      }
    } catch (err) {
      console.error("Failed to read clipboard:", err);
      showToast("Could not access clipboard. Please paste manually.", "error");
    }
  };

  const handleDeepSearch = async () => {
    if (!postContent.trim()) {
        showToast("Enter post content first to search for context.", "error");
        return;
    }
    setIsSearchingSignals(true);
    try {
        // Use the first 120 chars as query
        const query = postContent.substring(0, 120);
        showToast(`Searching for signals about: "${query}..."`, "success");
        const trends = await findTrendsAction(query, apiKey);
        setFoundSignals(trends);
        showToast(`Found ${trends.length} relevant signals.`, "success");
    } catch (e) {
        console.error("Signal search failed:", e);
        showToast("Signal search failed.", "error");
    } finally {
        setIsSearchingSignals(false);
    }
  };

  const handleGenerate = async () => {
    if (!postContent.trim()) {
      showToast("Please enter or paste post content first.", "error");
      return;
    }
    if (!apiKey) {
      showToast("API Key missing. Please check settings.", "error");
      return;
    }

    setIsGenerating(true);
    try {
        const comment = await generateCommentAction(postContent, selectedTone, apiKey, personaId as any, {
            useV2,
            industryContext: industryContext || undefined,
            relatedSignals: foundSignals.length > 0 ? foundSignals : undefined,
        });
        setGeneratedComment(comment);
    } catch (e) {
        showToast("Generation failed.", "error");
    } finally {
        setIsGenerating(false);
    }
  };

  const handleCopyComment = () => {
    if (!generatedComment) return;
    navigator.clipboard.writeText(generatedComment);
    showToast("Comment copied to clipboard!", "success");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
        onClick={onClose}
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-2xl bg-[#0A0A0A] border border-white/10 rounded-2xl shadow-2xl overflow-hidden glass-panel"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-white/5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-blue-500/20">
                <MessageSquare className="w-5 h-5 text-blue-400" />
            </div>
            <div>
                <h2 className="text-xl font-bold text-white">Comment Generator</h2>
                <p className="text-xs text-neutral-400 font-mono">
                    REPLY GUY MODE: ACTIVE
                </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X className="w-5 h-5 text-neutral-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
            
            {/* Input Section */}
            <div className="space-y-3">
                <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-neutral-300">Target Post</label>
                    <button 
                        onClick={handlePasteClipboard}
                        className="flex items-center gap-1.5 text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors uppercase tracking-wider"
                    >
                        <Clipboard className="w-3 h-3" />
                        Paste from Clipboard
                    </button>
                </div>
                <textarea
                    value={postContent}
                    onChange={(e) => setPostContent(e.target.value)}
                    placeholder="Paste the LinkedIn/Twitter post here..."
                    className="w-full h-32 bg-black/40 border border-white/10 rounded-xl p-4 text-sm text-neutral-200 focus:outline-none focus:border-blue-500/50 resize-none font-mono"
                />

                {/* Deep Signal Hunt Integration */}
                <div className="pt-2">
                    {!foundSignals.length ? (
                        <button 
                            onClick={handleDeepSearch}
                            disabled={isSearchingSignals}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/30 rounded-lg text-xs font-bold text-blue-400 hover:bg-blue-500/20 transition-all disabled:opacity-50"
                        >
                            {isSearchingSignals ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
                            DEEP SIGNAL HUNT (ADD REAL-TIME CONTEXT)
                        </button>
                    ) : (
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest flex items-center gap-1">
                                    <Globe className="w-3 h-3" /> Real-Time Context Loaded
                                </span>
                                <button 
                                    onClick={() => setFoundSignals([])}
                                    className="text-[10px] text-neutral-500 hover:text-white uppercase"
                                >
                                    Clear
                                </button>
                            </div>
                            <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                                {foundSignals.map((s, idx) => {
                                    const sentimentColor = 
                                        s.sentiment === "Bullish" ? "text-green-400 bg-green-400/10 border-green-400/20" :
                                        s.sentiment === "Bearish" ? "text-red-400 bg-red-400/10 border-red-400/20" :
                                        s.sentiment === "Controversial" ? "text-purple-400 bg-purple-400/10 border-purple-400/20" :
                                        "text-neutral-400 bg-white/5 border-white/10";

                                    return (
                                        <div key={idx} className="flex-shrink-0 w-56 p-3 bg-white/5 border border-white/10 rounded-xl space-y-2">
                                            <div className="flex justify-between items-start">
                                                <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter border ${sentimentColor}`}>
                                                    {s.sentiment}
                                                </span>
                                                <div className="flex items-center gap-1">
                                                    <Zap className="w-2.5 h-2.5 text-amber-400 fill-current" />
                                                    <span className="text-[9px] font-bold text-neutral-500">{s.momentum}%</span>
                                                </div>
                                            </div>
                                            <span className="text-white block font-bold text-[11px] leading-tight line-clamp-2">{s.title}</span>
                                            <div className="flex justify-between items-center text-[9px] text-neutral-500">
                                                <span className="truncate">{s.source}</span>
                                                <div className="w-12 h-1 bg-white/5 rounded-full overflow-hidden">
                                                    <div 
                                                        className="h-full bg-blue-500 rounded-full" 
                                                        style={{ width: `${s.momentum}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Tone Selection */}
            <div className="space-y-3">
                <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-neutral-300">Comment Tone</label>
                    <button
                        onClick={() => setUseV2(!useV2)}
                        className={`text-[10px] font-mono px-2 py-1 rounded transition-all ${
                            useV2 
                            ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                            : 'bg-white/5 text-neutral-500 border border-white/10'
                        }`}
                    >
                        {useV2 ? 'V2 ENHANCED' : 'V1 CLASSIC'}
                    </button>
                </div>
                <div className="flex flex-wrap gap-2">
                    {TONES.map(tone => (
                        <button
                            key={tone}
                            onClick={() => setSelectedTone(tone)}
                            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all border ${
                                selectedTone === tone 
                                ? 'bg-blue-500 text-white border-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.5)]' 
                                : 'bg-white/5 text-neutral-400 border-white/5 hover:border-white/20 hover:text-white'
                            }`}
                        >
                            {tone}
                        </button>
                    ))}
                </div>
            </div>

            {/* V2: Industry Context (Optional) */}
            {useV2 && (
                <div className="space-y-2">
                    <label className="text-xs font-medium text-neutral-400">
                        Industry Context <span className="text-neutral-600">(optional)</span>
                    </label>
                    <input
                        type="text"
                        value={industryContext}
                        onChange={(e) => setIndustryContext(e.target.value)}
                        placeholder="e.g., SaaS, Healthcare, FinTech..."
                        className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-neutral-200 focus:outline-none focus:border-purple-500/50"
                    />
                </div>
            )}

            {/* Generate Action */}
            <button
                onClick={handleGenerate}
                disabled={isGenerating || !postContent}
                className={`w-full py-4 rounded-xl flex items-center justify-center gap-2 font-bold text-lg transition-all ${
                    isGenerating || !postContent
                    ? 'bg-white/5 text-neutral-600 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg hover:shadow-blue-500/25 active:scale-[0.99]'
                }`}
            >
                {isGenerating ? (
                    <>
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        Generating Response...
                    </>
                ) : (
                    <>
                        <Sparkles className="w-5 h-5 fill-current" />
                        Generate Comment
                    </>
                )}
            </button>

            {/* Output Section */}
            <AnimatePresence>
                {generatedComment && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="relative mt-6"
                    >
                        <div className="absolute -inset-[1px] bg-gradient-to-r from-blue-500/50 to-purple-500/50 rounded-xl z-0 blur-sm opacity-50" />
                        <div className="relative z-10 bg-[#0F0F0F] border border-white/10 rounded-xl p-6">
                            <div className="flex justify-between items-start mb-4">
                                <span className="text-xs font-mono text-blue-400 uppercase tracking-widest">
                                    Generated Response
                                </span>
                                <button
                                    onClick={handleCopyComment}
                                    className="p-2 hover:bg-white/10 rounded-lg transition-colors group"
                                    title="Copy to clipboard"
                                >
                                    <Copy className="w-4 h-4 text-neutral-400 group-hover:text-white" />
                                </button>
                            </div>
                            <p className="text-neutral-200 text-base leading-relaxed whitespace-pre-wrap">
                                {generatedComment}
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
      </motion.div>

      <Toast 
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={() => setToast(prev => ({ ...prev, isVisible: false }))}
      />
    </div>
  );
}
