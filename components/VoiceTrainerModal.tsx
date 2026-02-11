"use client";

import { useState, useEffect } from "react";
import { Mic, Upload, Trash2, Plus, Sparkles, AlertCircle, FileText, CheckCircle2, X, Database } from "lucide-react";
import { addTrainingPost, getTrainingPosts, deleteTrainingPost, getTrainingStats, TrainingPost } from "../utils/voice-training-service";
import { synthesizeVoiceDNAAction } from "../actions/generate";
import { ingestStyleSamplesAction } from "../actions/style";
import { saveCustomPersona, getCustomPersonas } from "../utils/persona-store";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";

import StrategyModal from "./ui/StrategyModal";

interface VoiceTrainerModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
}

export default function VoiceTrainerModal({ isOpen, onClose, apiKey }: VoiceTrainerModalProps) {
  const [activeTab, setActiveTab] = useState<"dataset" | "dna" | "tuning">("dataset");
  const [posts, setPosts] = useState<TrainingPost[]>([]);
  const [newPost, setNewPost] = useState("");
  const [stats, setStats] = useState<{ totalPosts: number; averageLength: number; canTrain: boolean; activeModel: any } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [styleDNA, setStyleDNA] = useState<string | null>(null);
  const [showDNAPanel, setShowDNAPanel] = useState(false);
  const [selectedSubStyle, setSelectedSubStyle] = useState<"professional" | "casual" | "provocative">("professional");
  const [isSyncingRAG, setIsSyncingRAG] = useState(false);
  
  // Tuning state
  const [isTraining, setIsTraining] = useState(false);
  const [trainingModel, setTrainingModel] = useState<any>(null);
  const [tuningError, setTuningError] = useState("");

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
    if (s.activeModel) setTrainingModel(s.activeModel);
  }

  const handleAddPost = async () => {
    if (!newPost.trim()) return;
    setIsLoading(true);
    await addTrainingPost(newPost, "manual");
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
      // Automatically switch to DNA tab or show results
      setActiveTab("dna");
    } catch (e) {
      console.error("Synthesis failed", e);
    } finally {
      setIsSynthesizing(false);
    }
  };

  const handleSyncToRAG = async () => {
    if (posts.length === 0) return;
    setIsSyncingRAG(true);
    try {
      await ingestStyleSamplesAction(posts.map(p => p.content));
      alert("Style dataset synced to memory! 🧬");
    } catch (e) {
      console.error("RAG sync failed", e);
      alert("Sync failed. Check console.");
    } finally {
      setIsSyncingRAG(false);
    }
  };

  const handleApplyToPersona = async () => {
    if (!styleDNA && !trainingModel?.geminiModelId) return;
    const customs = await getCustomPersonas();
    let myPersona = customs.find(p => p.id === "custom");
    if (!myPersona) {
        myPersona = {
            id: "custom",
            name: "Your Voice",
            description: "Digital twin trained on your content.",
            styleDNA: styleDNA || undefined,
            subStyle: selectedSubStyle,
            geminiModelId: trainingModel?.geminiModelId
        };
    } else {
        if (styleDNA) myPersona.styleDNA = styleDNA;
        myPersona.subStyle = selectedSubStyle;
        if (trainingModel?.geminiModelId) myPersona.geminiModelId = trainingModel.geminiModelId;
    }
    await saveCustomPersona(myPersona);
    alert("Voice Settings applied to 'Your Voice' persona! ✨");
  };

  const handleStartTraining = async () => {
    if (!apiKey || apiKey === "demo") {
      setTuningError("Valid Gemini API key required");
      return;
    }
    if (!stats?.canTrain) {
      setTuningError("Minimum 10 posts required");
      return;
    }
    setIsTraining(true);
    setTuningError("");
    try {
      const { startFineTuning } = await import("../utils/voice-training-service");
      const model = await startFineTuning(apiKey, `voice-${Date.now()}`);
      setTrainingModel(model);
      alert("Fine-tuning started! This happens in the background.");
    } catch (e: any) {
      setTuningError(e.message || "Training failed");
      setIsTraining(false);
    }
  };

  if (!isOpen) return null;

  return (
    <StrategyModal
      isOpen={isOpen}
      onClose={onClose}
      title="Brand Voice Training"
      maxWidth="max-w-6xl"
    >
      <div className="flex flex-col h-[75vh]">
        {/* TAB NAVIGATION */}
        <div className="flex gap-4 mb-6 border-b border-white/10">
          {[
            { id: "dataset", label: "Dataset Management", icon: FileText },
            { id: "dna", label: "DNA Alchemist", icon: Sparkles },
            { id: "tuning", label: "Gemini Fine-Tuning", icon: Mic }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-3 text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-all ${
                activeTab === tab.id ? "text-amber-400 border-b-2 border-amber-400" : "text-neutral-500 hover:text-neutral-300"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            {activeTab === "dataset" && (
              <motion.div 
                key="dataset"
                initial={{ opacity: 0, x: -10 }} 
                animate={{ opacity: 1, x: 0 }} 
                exit={{ opacity: 0, x: 10 }}
                className="flex flex-col md:flex-row gap-6 h-full"
              >
                {/* LEFT: Input Area */}
                <div className="w-full md:w-1/3 flex flex-col gap-4 pr-2">
                  <div className="bg-white/[0.03] p-5 rounded-2xl border border-white/5 space-y-4">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <Upload className="w-4 h-4 text-amber-500" /> Add Performance Sample
                    </h3>
                    <textarea 
                        value={newPost}
                        onChange={(e) => setNewPost(e.target.value)}
                        placeholder="Paste a viral post here..."
                        className="w-full h-40 bg-black/50 border border-neutral-800 rounded-xl p-4 text-sm text-neutral-300 resize-none focus:outline-none focus:border-amber-500/30 transition-all"
                    />
                    <button 
                        onClick={handleAddPost}
                        disabled={isLoading || !newPost.trim()}
                        className="w-full bg-white text-black hover:bg-neutral-200 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50"
                    >
                        {isLoading ? "Analyzing..." : "ADD TO DATASET"}
                    </button>
                  </div>

                  {/* Summary Stats */}
                  <div className="grid grid-cols-1 gap-2">
                    <div className="bg-neutral-900/50 p-4 rounded-xl border border-white/5 flex justify-between items-center">
                      <span className="text-xs text-neutral-500">Sample Count</span>
                      <span className="text-sm font-mono text-amber-400">{posts.length}</span>
                    </div>
                    <div className="bg-neutral-900/50 p-4 rounded-xl border border-white/5 flex justify-between items-center">
                      <span className="text-xs text-neutral-500">Status</span>
                      <span className={`text-xs font-bold uppercase ${posts.length >= 5 ? "text-green-500" : "text-neutral-600"}`}>
                        {posts.length >= 5 ? "DNA Ready" : `Need ${5 - posts.length} more`}
                      </span>
                    </div>
                    
                    <button 
                      onClick={handleSyncToRAG}
                      disabled={isSyncingRAG || posts.length === 0}
                      className="mt-2 w-full bg-white/5 border border-white/10 hover:bg-white/10 text-neutral-300 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                    >
                      {isSyncingRAG ? (
                         <>
                           <Database className="w-3 h-3 animate-spin" /> SYNCING...
                         </>
                      ) : (
                         <>
                           <Database className="w-3 h-3 text-amber-500" /> SYNC TO STYLE RAG
                         </>
                      )}
                    </button>
                  </div>
                </div>

                {/* RIGHT: List */}
                <div className="w-full md:w-2/3 flex flex-col min-h-0 pl-6 border-l border-white/5">
                  <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                    {posts.length === 0 ? (
                      <div className="text-center py-20 text-neutral-600">
                        <FileText className="w-12 h-12 mb-4 opacity-10 mx-auto" />
                        <p className="text-sm font-bold">Your dataset is empty.</p>
                        <p className="text-xs mt-1">Add 5-10 samples to synthesize your voice.</p>
                      </div>
                    ) : (
                      posts.map((post) => (
                        <div key={post.id} className="bg-white/5 border border-white/10 rounded-2xl p-5 group hover:border-amber-500/20 transition-all">
                          <div className="flex justify-between items-start gap-4">
                            <p className="text-sm text-neutral-300 leading-relaxed line-clamp-4">{post.content}</p>
                            <button onClick={() => handleDelete(post.id)} className="text-neutral-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"><Trash2 className="w-4 h-4" /></button>
                          </div>
                          <div className="mt-3 flex items-center gap-3 text-[10px] text-neutral-500 font-mono">
                            <span className="bg-white/5 px-2 py-0.5 rounded uppercase">{post.source}</span>
                            <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                            <span>{post.content.length} chars</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "dna" && (
              <motion.div 
                key="dna"
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col gap-6 h-full max-w-4xl mx-auto"
              >
                <div className="bg-gradient-to-br from-[#7c3aed]/10 to-transparent p-8 rounded-3xl border border-white/10 text-center space-y-6">
                  <div className="w-20 h-20 bg-[#7c3aed]/20 rounded-full flex items-center justify-center mx-auto border border-[#7c3aed]/30">
                    <Sparkles className="w-10 h-10 text-[#7c3aed] animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-white">Voice DNA Alchemist</h3>
                    <p className="text-neutral-400 text-sm mt-2 max-w-lg mx-auto leading-relaxed">
                      Extract the linguistic essence of your writing style. This process decodes your syntax, rhythm, and vocabulary to create a high-fidelity stylistic anchor.
                    </p>
                  </div>

                  {!styleDNA ? (
                    <button 
                      onClick={handleSynthesize}
                      disabled={posts.length < 5 || isSynthesizing}
                      className="bg-[#7c3aed] text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-[#6d28d9] transition-all disabled:opacity-50"
                    >
                      {isSynthesizing ? "Decoding DNA..." : "START SYNTHESIS"}
                    </button>
                  ) : (
                    <div className="space-y-6 text-left">
                      <div className="bg-black/40 p-6 rounded-2xl border border-white/10 font-mono text-xs leading-relaxed text-[#7c3aed]">
                         <ReactMarkdown>{styleDNA}</ReactMarkdown>
                      </div>
                      <div className="flex gap-4">
                        <button 
                          onClick={handleApplyToPersona}
                          className="flex-1 bg-white text-black py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-neutral-200 transition-all"
                        >
                          APPLY TO "YOUR VOICE"
                        </button>
                        <button 
                          onClick={() => setStyleDNA(null)}
                          className="px-6 py-4 rounded-2xl border border-white/10 text-neutral-400 hover:text-white transition-all"
                        >
                          RETRAIN
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === "tuning" && (
              <motion.div 
                key="tuning"
                initial={{ opacity: 0, x: 10 }} 
                animate={{ opacity: 1, x: 0 }} 
                exit={{ opacity: 0, x: -10 }}
                className="flex flex-col gap-6 h-full max-w-4xl mx-auto"
              >
                <div className="bg-white/5 p-8 rounded-3xl border border-white/10 space-y-8">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-2xl font-black text-white">Gemini Fine-Tuning</h3>
                      <p className="text-neutral-400 text-sm mt-2">
                        The ultimate level of voice cloning. Trains a dedicated Gemini model instance on your entire dataset.
                      </p>
                    </div>
                    <div className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      trainingModel?.status === "completed" ? "bg-green-500/10 text-green-500 border border-green-500/20" : "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                    }`}>
                      {trainingModel?.status || "NOT TRAINED"}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-black/50 p-6 rounded-2xl border border-white/5 space-y-2">
                      <h4 className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Training Requirements</h4>
                      <ul className="text-xs text-neutral-300 space-y-2">
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className={`w-4 h-4 ${posts.length >= 10 ? "text-green-500" : "text-neutral-700"}`} />
                          10+ High-quality posts ({posts.length}/10)
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className={`w-4 h-4 ${apiKey && apiKey !== "demo" ? "text-green-500" : "text-neutral-700"}`} />
                          Verified Gemini API Key
                        </li>
                      </ul>
                    </div>
                    <div className="bg-black/50 p-6 rounded-2xl border border-white/5 space-y-2">
                      <h4 className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Estimated Time</h4>
                      <p className="text-xs text-neutral-300 leading-relaxed">
                        Fine-tuning typically takes 15-45 minutes depending on dataset size. Results are automatically saved to your "Your Voice" persona.
                      </p>
                    </div>
                  </div>

                  {tuningError && (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400 flex items-center gap-3">
                      <AlertCircle className="w-4 h-4" /> {tuningError}
                    </div>
                  )}

                  <button 
                    onClick={handleStartTraining}
                    disabled={posts.length < 10 || isTraining || trainingModel?.status === "training"}
                    className="w-full bg-amber-500 text-black py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-amber-400 transition-all disabled:opacity-50 disabled:grayscale"
                  >
                    {isTraining ? "INITIALIZING TUNING..." : "START FINE-TUNING"}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </StrategyModal>
  );
}
