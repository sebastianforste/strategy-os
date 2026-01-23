"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Upload, Plus, Trash2, Sparkles, AlertCircle, CheckCircle2 } from "lucide-react";
import {
  addTrainingPost,
  addTrainingPosts,
  getTrainingPosts,
  deleteTrainingPost,
  clearTrainingPosts,
  startFineTuning,
  checkTrainingStatus,
  getTrainingStats,
  validateTrainingPost,
  TrainingPost,
  TrainingModel,
} from "../utils/voice-training-service";

interface VoiceTrainingModalProps {
  isOpen: boolean;
  onClose: () => void;
  openaiKey: string;
  onTrainingComplete: (modelId: string) => void;
}

export default function VoiceTrainingModal({
  isOpen,
  onClose,
  openaiKey,
  onTrainingComplete,
}: VoiceTrainingModalProps) {
  const [posts, setPosts] = useState<TrainingPost[]>([]);
  const [newPost, setNewPost] = useState("");
  const [bulkPosts, setBulkPosts] = useState("");
  const [stats, setStats] = useState<any>(null);
  const [isTraining, setIsTraining] = useState(false);
  const [trainingModel, setTrainingModel] = useState<TrainingModel | null>(null);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<"upload" | "manage">("upload");

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    const [loadedPosts, loadedStats] = await Promise.all([
      getTrainingPosts(),
      getTrainingStats(),
    ]);
    setPosts(loadedPosts);
    setStats(loadedStats);
    
    if (loadedStats.activeModel) {
      setTrainingModel(loadedStats.activeModel);
    }
  };

  const handleAddSingle = async () => {
    setError("");
    const validation = validateTrainingPost(newPost);
    
    if (!validation.valid) {
      setError(validation.error || "Invalid post");
      return;
    }

    try {
      await addTrainingPost(newPost, 'manual');
      setNewPost("");
      await loadData();
    } catch (e: any) {
      setError(e.message);
    }
  };

  const handleAddBulk = async () => {
    setError("");
    const lines = bulkPosts
      .split('\n\n')
      .map(p => p.trim())
      .filter(p => p.length > 0);

    if (lines.length === 0) {
      setError("No posts found");
      return;
    }

    const valid = lines.filter(p => validateTrainingPost(p).valid);
    const invalid = lines.length - valid.length;

    if (valid.length === 0) {
      setError("No valid posts found (min 100 chars each)");
      return;
    }

    try {
      await addTrainingPosts(valid, 'manual');
      setBulkPosts("");
      await loadData();
      
      if (invalid > 0) {
        setError(`Added ${valid.length} posts. Skipped ${invalid} (too short).`);
      }
    } catch (e: any) {
      setError(e.message);
    }
  };

  const handleDelete = async (id: string) => {
    await deleteTrainingPost(id);
    await loadData();
  };

  const handleClearAll = async () => {
    if (confirm("Delete all training posts? This cannot be undone.")) {
      await clearTrainingPosts();
      await loadData();
    }
  };

  const handleStartTraining = async () => {
    if (!openaiKey || openaiKey === 'demo') {
      setError("Valid OpenAI API key required for voice training");
      return;
    }

    if (!stats?.canTrain) {
      setError("Minimum 10 posts required");
      return;
    }

    setIsTraining(true);
    setError("");

    try {
      const model = await startFineTuning(openaiKey, `voice-${Date.now()}`);
      setTrainingModel(model);
      
      // Poll for status every 30 seconds
      const pollInterval = setInterval(async () => {
        try {
          const updated = await checkTrainingStatus(model.id, openaiKey);
          setTrainingModel(updated);
          
          if (updated.status === 'completed') {
            clearInterval(pollInterval);
            setIsTraining(false);
            onTrainingComplete(updated.openaiModelId!);
            await loadData();
          } else if (updated.status === 'failed') {
            clearInterval(pollInterval);
            setIsTraining(false);
            setError(updated.error || 'Training failed');
          }
        } catch (e: any) {
          console.error('Status check failed:', e);
        }
      }, 30000);

      // Save interval ID to clear on unmount
      return () => clearInterval(pollInterval);
    } catch (e: any) {
      setError(e.message);
      setIsTraining(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-[#0A0A0A] border border-neutral-800 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-neutral-800">
            <div>
              <h2 className="text-xl font-bold text-white">Brand Voice Training</h2>
              <p className="text-sm text-neutral-500 mt-1">
                Train AI to write in your unique style
              </p>
            </div>
            <button onClick={onClose} className="text-neutral-500 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Stats Banner */}
          {stats && (
            <div className="px-6 py-4 bg-neutral-900/50 border-b border-neutral-800 grid grid-cols-3 gap-4">
              <div>
                <div className="text-2xl font-bold text-white">{stats.totalPosts}</div>
                <div className="text-xs text-neutral-500">Training Posts</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{stats.averageLength}</div>
                <div className="text-xs text-neutral-500">Avg Characters</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white">
                  {stats.activeModel ? '✓' : stats.canTrain ? '⚡' : '—'}
                </div>
                <div className="text-xs text-neutral-500">
                  {stats.activeModel ? 'Trained' : stats.canTrain ? 'Ready' : 'Not Ready'}
                </div>
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="flex border-b border-neutral-800">
            <button
              onClick={() => setTab("upload")}
              className={`flex-1 px-6 py-3 text-sm font-medium ${
                tab === "upload"
                  ? "text-white border-b-2 border-white"
                  : "text-neutral-500 hover:text-neutral-300"
              }`}
            >
              <Plus className="w-4 h-4 inline mr-2" />
              Upload Posts
            </button>
            <button
              onClick={() => setTab("manage")}
              className={`flex-1 px-6 py-3 text-sm font-medium ${
                tab === "manage"
                  ? "text-white border-b-2 border-white"
                  : "text-neutral-500 hover:text-neutral-300"
              }`}
            >
              <Upload className="w-4 h-4 inline mr-2" />
              Manage ({posts.length})
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {tab === "upload" ? (
              <div className="space-y-6">
                {/* Single Post */}
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Add Single Post
                  </label>
                  <textarea
                    value={newPost}
                    onChange={(e) => setNewPost(e.target.value)}
                    placeholder="Paste one of your best LinkedIn posts here (min 100 characters)..."
                    className="w-full h-32 bg-neutral-900 border border-neutral-800 rounded-lg p-4 text-white text-sm resize-none focus:outline-none focus:border-neutral-600"
                  />
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-neutral-500">
                      {newPost.length} characters
                    </span>
                    <button
                      onClick={handleAddSingle}
                      disabled={newPost.length < 100}
                      className="px-4 py-2 bg-white text-black text-sm font-bold rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-200"
                    >
                      Add Post
                    </button>
                  </div>
                </div>

                {/* Bulk Upload */}
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Bulk Upload (Separate posts with blank lines)
                  </label>
                  <textarea
                    value={bulkPosts}
                    onChange={(e) => setBulkPosts(e.target.value)}
                    placeholder="Post 1 content here...

Post 2 content here...

Post 3 content here..."
                    className="w-full h-48 bg-neutral-900 border border-neutral-800 rounded-lg p-4 text-white text-sm font-mono resize-none focus:outline-none focus:border-neutral-600"
                  />
                  <button
                    onClick={handleAddBulk}
                    className="mt-2 px-4 py-2 bg-white text-black text-sm font-bold rounded-full hover:bg-neutral-200"
                  >
                    Upload All
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {posts.length === 0 ? (
                  <div className="text-center py-12 text-neutral-500">
                    No training posts yet. Upload at least 10 to start training.
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-neutral-500">
                        {posts.length} post{posts.length !== 1 ? 's' : ''}
                      </div>
                      <button
                        onClick={handleClearAll}
                        className="text-xs text-red-500 hover:text-red-400"
                      >
                        <Trash2 className="w-3 h-3 inline mr-1" />
                        Clear All
                      </button>
                    </div>
                    {posts.map((post) => (
                      <div
                        key={post.id}
                        className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 relative group"
                      >
                        <button
                          onClick={() => handleDelete(post.id)}
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-neutral-500 hover:text-red-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <p className="text-sm text-neutral-300 whitespace-pre-wrap pr-8">
                          {post.content.substring(0, 200)}
                          {post.content.length > 200 ? '...' : ''}
                        </p>
                        <div className="mt-2 text-xs text-neutral-600">
                          {post.content.length} chars • {new Date(post.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-neutral-800 bg-neutral-900/30">
            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-red-400">{error}</span>
              </div>
            )}

            {trainingModel && (
              <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  {trainingModel.status === 'completed' ? (
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  ) : (
                    <Sparkles className="w-4 h-4 text-blue-500 animate-spin" />
                  )}
                 <span className="text-sm font-medium text-white">
                    {trainingModel.status === 'training' && 'Training in progress...'}
                    {trainingModel.status === 'completed' && 'Training complete!'}
                    {trainingModel.status === 'failed' && 'Training failed'}
                  </span>
                </div>
                <p className="text-xs text-neutral-400">
                  {trainingModel.status === 'training' && 'This usually takes 10-30 minutes. You can close this and check back later.'}
                  {trainingModel.status === 'completed' && `Model ID: ${trainingModel.openaiModelId}`}
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-3 bg-neutral-800 text-white rounded-lg hover:bg-neutral-700 text-sm font-medium"
              >
                Close
              </button>
              <button
                onClick={handleStartTraining}
                disabled={!stats?.canTrain || isTraining || trainingModel?.status === 'training'}
                className="flex-1 px-4 py-3 bg-white text-black rounded-lg hover:bg-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-bold flex items-center justify-center gap-2"
              >
                {isTraining || trainingModel?.status === 'training' ? (
                  <>
                    <Sparkles className="w-4 h-4 animate-spin" />
                    Training...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Start Training {!stats?.canTrain && `(${10 - (stats?.totalPosts || 0)} more posts needed)`}
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
