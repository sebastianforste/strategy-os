"use client";

import { useState, useEffect } from "react";
import { Mic, Upload, Trash2, Plus, Sparkles, AlertCircle, FileText, CheckCircle2, X } from "lucide-react";
import { addTrainingPost, getTrainingPosts, deleteTrainingPost, getTrainingStats, TrainingPost } from "../utils/voice-training-service";
import { synthesizeVoiceDNAAction } from "../actions/generate";
import { saveCustomPersona, getCustomPersonas } from "../utils/persona-store";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";

interface VoiceTrainerModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
}

export default function VoiceTrainerModal({ isOpen, onClose, apiKey }: VoiceTrainerModalProps) {
  const [posts, setPosts] = useState<TrainingPost[]>([]);
  const [newPost, setNewPost] = useState("");
  const [stats, setStats] = useState<{ totalPosts: number; averageLength: number; canTrain: boolean } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [styleDNA, setStyleDNA] = useState<string | null>(null);
  const [showDNAPanel, setShowDNAPanel] = useState(false);
  const [selectedSubStyle, setSelectedSubStyle] = useState<"professional" | "casual" | "provocative">("professional");

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  async function loadData() {
    const p = await getTrainingPosts();
    const s = await getTrainingStats();
    setPosts(p.reverse()); // Newest first
    setStats(s);
  }

  const handleAddPost = async () => {
    if (!newPost.trim()) return;
    setIsLoading(true);
    await addTrainingPost(newPost, 'manual');
    setNewPost("");
    await loadData();
    setIsLoading(false);
  };

  const handleDelete = async (id: string) => {
    await deleteTrainingPost(id);
    await loadData();
  };

  const handleSynthesize = async () => {
    if (posts.length < 5) return;
    setIsSynthesizing(true);
    try {
      const dna = await synthesizeVoiceDNAAction(posts.map(p => p.content), apiKey);
      setStyleDNA(dna);
      setShowDNAPanel(true);
    } catch (e) {
      console.error("Synthesis failed", e);
    } finally {
      setIsSynthesizing(false);
    }
  };

  const handleApplyToPersona = async () => {
    if (!styleDNA) return;
    
    // Get existing custom persona or create new one
    const customs = await getCustomPersonas();
    let myPersona = customs.find(p => p.id === "custom");
    
    if (!myPersona) {
        myPersona = {
            id: "custom",
            name: "Your Voice",
            description: "Digital twin trained on your content.",
            styleDNA: styleDNA,
            subStyle: selectedSubStyle
        };
    } else {
        myPersona.styleDNA = styleDNA;
        myPersona.subStyle = selectedSubStyle;
    }
    
    await saveCustomPersona(myPersona);
    alert("Style DNA applied to 'Your Voice' persona! ✨");
    setShowDNAPanel(false);
  };

  // Calculate generic "Voice DNA" (Simple metrics for display)
  const voiceDNA = stats ? [
    { label: "Avg Length", value: `${stats.averageLength} chars` },
    { label: "Dataset", value: `${stats.totalPosts}/10 posts` },
    { label: "Status", value: stats.canTrain ? "Ready" : "Need more data" }
  ] : [];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={onClose}>
        <motion.div
           initial={{ opacity: 0, scale: 0.95 }}
           animate={{ opacity: 1, scale: 1 }}
           exit={{ opacity: 0, scale: 0.95 }}
           onClick={(e) => e.stopPropagation()}
           className="bg-[#0A0A0A] border border-neutral-800 rounded-xl w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl relative"
        >
            {/* Header */}
            <div className="p-6 border-b border-neutral-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                     <div className="p-2 bg-amber-500/10 rounded-lg border border-amber-500/20">
                         <Mic className="w-5 h-5 text-amber-400" />
                     </div>
                     <div>
                        <h2 className="text-xl font-bold text-white">Voice Cloning Studio</h2>
                        <p className="text-xs text-neutral-400">Upload your best content to teach the AI your unique rhythm and style.</p>
                     </div>
                </div>
                <button 
                  onClick={onClose}
                  className="p-2 text-neutral-500 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-3">
                
                {/* LEFT: Input Area */}
                <div className="md:col-span-1 border-r border-neutral-800 p-6 flex flex-col gap-4 bg-neutral-900/30 overflow-y-auto">
                    <div className="bg-neutral-900/50 p-4 rounded-xl border border-neutral-800 space-y-3">
                        <h3 className="text-sm font-bold text-white flex items-center gap-2">
                            <Upload className="w-4 h-4" /> Add Sample
                        </h3>
                        <textarea 
                            value={newPost}
                            onChange={(e) => setNewPost(e.target.value)}
                            placeholder="Paste a high-performing post here..."
                            className="w-full h-32 bg-black/50 border border-neutral-700 rounded-lg p-3 text-xs text-neutral-300 resize-none focus:outline-none focus:border-amber-500/50"
                        />
                        <button 
                            onClick={handleAddPost}
                            disabled={isLoading || !newPost.trim()}
                            className="w-full bg-white text-black hover:bg-neutral-200 py-2 rounded-lg text-xs font-bold transition-colors disabled:opacity-50"
                        >
                            {isLoading ? "Analyzing..." : "ADD TO DATASET"}
                        </button>
                    </div>

                    {/* Stats */}
                    <div className="space-y-2">
                        {voiceDNA.map((dna, i) => (
                            <div key={i} className="bg-neutral-900 p-3 rounded-lg border border-neutral-800 flex justify-between items-center">
                                <span className="text-xs text-neutral-500">{dna.label}</span>
                                <span className="text-xs font-mono text-amber-400">{dna.value}</span>
                            </div>
                        ))}
                    </div>

                    {/* Synthesis Button */}
                    <button 
                        onClick={handleSynthesize}
                        disabled={posts.length < 5 || isSynthesizing}
                        className="w-full mt-2 group relative overflow-hidden bg-gradient-to-br from-amber-500 to-orange-600 p-3 rounded-xl border border-amber-400/20 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:grayscale"
                    >
                        <div className="relative z-10 flex items-center justify-center gap-2">
                            <Sparkles className={`w-4 h-4 text-white ${isSynthesizing ? 'animate-spin' : 'animate-pulse'}`} />
                            <span className="text-xs font-black text-white uppercase tracking-wider">
                                {isSynthesizing ? "Extracting DNA..." : "SYNTHESIZE VOICE DNA"}
                            </span>
                        </div>
                        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                    {posts.length < 5 && (
                        <p className="text-[10px] text-center text-neutral-500 italic mt-1">Need 5+ samples to decode your DNA.</p>
                    )}
                </div>

                {/* RIGHT: List */}
                <div className="md:col-span-2 p-6 flex flex-col min-h-0 bg-[#0A0A0A]">
                    <h3 className="text-sm font-bold text-white mb-4 flex items-center justify-between">
                        <span>Training Data ({posts.length})</span>
                        <span className="text-xs text-neutral-500 font-normal">Newest First</span>
                    </h3>
                    
                    <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                         {posts.length === 0 ? (
                            <div className="text-center py-20 text-neutral-600 flex flex-col items-center">
                                <FileText className="w-12 h-12 mb-4 opacity-20" />
                                <p className="text-sm">No training samples yet.</p>
                                <p className="text-xs mt-1">Add 5-10 posts to create a robust voice profile.</p>
                            </div>
                        ) : (
                            posts.map((post) => (
                                <div 
                                    key={post.id}
                                    className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-4 group hover:border-neutral-700 transition-colors"
                                >
                                    <div className="flex justify-between items-start gap-4">
                                        <p className="text-sm text-neutral-300 line-clamp-3 leading-relaxed font-mono">
                                            {post.content}
                                        </p>
                                        <button 
                                            onClick={() => handleDelete(post.id)}
                                            className="text-neutral-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 p-1"
                                            title="Delete Sample"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <div className="mt-2 flex items-center gap-2 text-[10px] text-neutral-600 font-mono">
                                        <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                                        <span className="text-neutral-700">•</span>
                                        <span>{post.content.length} chars</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* DNA REVIEW OVERLAY */}
            <AnimatePresence>
                {showDNAPanel && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="absolute inset-x-6 bottom-6 top-24 bg-neutral-900 border border-amber-500/30 rounded-2xl shadow-[0_0_100px_rgba(245,158,11,0.15)] z-30 flex flex-col overflow-hidden"
                    >
                        <div className="p-6 border-b border-neutral-800 flex items-center justify-between bg-black/40">
                            <div className="flex items-center gap-3">
                                <Sparkles className="w-5 h-5 text-amber-400" />
                                <h3 className="text-lg font-bold text-white tracking-tight">Your Style DNA Decoded</h3>
                            </div>
                            <button onClick={() => setShowDNAPanel(false)} className="text-neutral-500 hover:text-white">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-8 prose prose-invert prose-xs max-w-none custom-scrollbar text-neutral-300">
                            {/* SUB-STYLE SELECTOR */}
                            <div className="mb-8 p-4 bg-black/40 border border-neutral-800 rounded-xl">
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-neutral-500 mb-3 text-center">Select Delivery Mode (Sub-Style)</h4>
                                <div className="grid grid-cols-3 gap-2">
                                    {(["professional", "casual", "provocative"] as const).map((mode) => (
                                        <button
                                            key={mode}
                                            onClick={() => setSelectedSubStyle(mode)}
                                            className={`py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border ${
                                                selectedSubStyle === mode 
                                                ? 'bg-amber-500/20 border-amber-500 text-amber-400' 
                                                : 'bg-neutral-900 border-neutral-800 text-neutral-500 hover:border-neutral-700'
                                            }`}
                                        >
                                            {mode}
                                        </button>
                                    ))}
                                </div>
                                <p className="mt-3 text-[10px] text-neutral-600 italic text-center leading-tight px-4 pb-1">
                                    {selectedSubStyle === "professional" && "Polished, authoritative, and corporate-ready."}
                                    {selectedSubStyle === "casual" && "Accessible, conversational, and analogy-driven."}
                                    {selectedSubStyle === "provocative" && "Punchy, contrarian, and debate-sparking."}
                                </p>
                            </div>

                            <ReactMarkdown>{styleDNA || ""}</ReactMarkdown>
                        </div>

                        <div className="p-6 bg-black/40 border-t border-neutral-800 flex justify-end gap-3">
                            <button 
                                onClick={() => setShowDNAPanel(false)}
                                className="px-6 py-2 text-xs font-bold text-neutral-400 hover:text-white transition-colors"
                            >
                                DISCARD
                            </button>
                            <button 
                                onClick={handleApplyToPersona}
                                className="px-8 py-2 bg-white text-black text-xs font-black uppercase tracking-widest rounded-lg hover:bg-amber-400 transition-all shadow-[0_4px_20px_rgba(255,255,255,0.1)]"
                            >
                                APPLY TO DIGITAL TWIN
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
