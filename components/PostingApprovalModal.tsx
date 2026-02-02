"use client";

/**
 * POSTING APPROVAL MODAL - 2027 Computer Use
 * 
 * Provides a "human-in-the-loop" approval step before autonomous posting.
 * Displays preview, platform, and scheduled time.
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Clock, ShieldCheck, Loader2, Globe, AlertCircle } from "lucide-react";
import { PostingJob, executePostingJob, PostingProgress } from "../utils/posting-agent";

interface PostingApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: PostingJob | null;
  onSuccess: (url: string) => void;
}

export default function PostingApprovalModal({ isOpen, onClose, job, onSuccess }: PostingApprovalModalProps) {
  const [isPosting, setIsPosting] = useState(false);
  const [progress, setProgress] = useState<PostingProgress | null>(null);

  if (!job) return null;

  const handleApprove = async () => {
    setIsPosting(true);
    
    try {
      // Step 1: Execute posting
      const result = await executePostingJob(job.id, (p) => {
        setProgress(p);
      });
      
      if (result.status === "posted" && result.postedUrl) {
        onSuccess(result.postedUrl);
        onClose();
      }
    } catch (e) {
      console.error("Posting failed:", e);
    } finally {
      setIsPosting(false);
      setProgress(null);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-md z-[60] flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="w-full max-w-lg bg-neutral-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 border-b border-white/5 bg-white/2 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 rounded-xl">
                  <ShieldCheck className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Review & Publish</h2>
                  <p className="text-xs text-neutral-500">Autonomous post requiring human approval</p>
                </div>
              </div>
              <button 
                onClick={onClose} 
                disabled={isPosting}
                className="text-neutral-500 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Preview */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-neutral-500 uppercase tracking-widest">Platform</label>
                <div className="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-xl border border-white/5 w-fit">
                  <Globe className="w-4 h-4 text-neutral-400" />
                  <span className="text-sm text-white capitalize font-medium">{job.platform}</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-neutral-500 uppercase tracking-widest">Content Preview</label>
                <div className="p-4 bg-white/5 border border-white/10 rounded-2xl text-neutral-200 text-sm leading-relaxed whitespace-pre-wrap font-mono">
                  {job.content}
                </div>
              </div>

              {job.imageUrl && (
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-neutral-500 uppercase tracking-widest">Attached Asset</label>
                  <img src={job.imageUrl} alt="AI Generated" className="w-full aspect-video object-cover rounded-xl border border-white/10" />
                </div>
              )}

              <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-200/70 leading-relaxed">
                  By clicking "Publish Now", you authorize StrategyOS to post this content to your {job.platform} account. 
                  Ensure compliance with your corporate social media guidelines.
                </p>
              </div>
            </div>

            {/* Progress / Footer */}
            <div className="p-6 border-t border-white/5 bg-white/2">
              {isPosting ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-neutral-400 font-medium">Posting Status:</span>
                    <span className="text-blue-400 font-bold animate-pulse">{progress?.message || "Processing..."}</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-blue-500"
                      initial={{ width: "0%" }}
                      animate={{ 
                        width: progress?.phase === "preparing" ? "20%" : 
                               progress?.phase === "authenticating" ? "40%" :
                               progress?.phase === "composing" ? "70%" :
                               progress?.phase === "posting" ? "90%" : "100%"
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-center gap-2 py-3 text-neutral-500 italic text-xs">
                    <Loader2 className="w-3 h-3 animate-spin" /> Do not close this window
                  </div>
                </div>
              ) : (
                <div className="flex gap-4">
                  <button
                    onClick={onClose}
                    className="flex-1 py-3 px-4 border border-white/10 rounded-2xl text-white font-semibold hover:bg-white/5 transition-colors"
                  >
                    Keep as Draft
                  </button>
                  <button
                    onClick={handleApprove}
                    className="flex-2 py-3 px-8 bg-blue-550 hover:bg-blue-600 text-white font-bold rounded-2xl flex items-center justify-center gap-2 transition-all hover:scale-[1.02] shadow-lg shadow-blue-500/20"
                  >
                    <Send className="w-4 h-4" />
                    Publish Now
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
