"use client";

import { useState, useEffect } from "react";
import { Mic, Upload, Trash2, Plus, Sparkles, AlertCircle, FileText, CheckCircle2, X } from "lucide-react";
import { addTrainingPost, getTrainingPosts, deleteTrainingPost, getTrainingStats, TrainingPost } from "../utils/voice-training-service";
import { motion, AnimatePresence } from "framer-motion";

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
           className="bg-[#0A0A0A] border border-neutral-800 rounded-xl w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl"
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
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
