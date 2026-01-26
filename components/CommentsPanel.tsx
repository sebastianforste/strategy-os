"use client";

import { useState, useEffect } from "react";
import { MessageSquare, Send, X, User } from "lucide-react";
import { getComments, addComment, Comment } from "../utils/comment-service";
import { motion, AnimatePresence } from "framer-motion";

interface CommentsPanelProps {
  assetId: string; // Using a proxy ID for now (e.g. hash of content)
  isOpen: boolean;
  onClose: () => void;
}

export default function CommentsPanel({ assetId, isOpen, onClose }: CommentsPanelProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        setComments(getComments(assetId));
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [isOpen, assetId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const added = addComment(assetId, newComment);
    setComments([added, ...comments]);
    setNewComment("");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          className="fixed top-20 right-4 w-80 bg-[#0A0A0A] border border-neutral-800 rounded-lg shadow-2xl z-40 flex flex-col max-h-[80vh]"
        >
          {/* Header */}
          <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Comments
            </h3>
            <button onClick={onClose} className="text-neutral-500 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Comment List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[200px]">
            {comments.length === 0 ? (
              <div className="text-center text-neutral-600 text-xs py-8">
                No comments yet. Be the first!
              </div>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-neutral-500" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                       <span className="text-xs font-bold text-neutral-300">{comment.author}</span>
                       <span className="text-[10px] text-neutral-600">{new Date(comment.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    </div>
                    <p className="text-sm text-neutral-400 mt-1 leading-relaxed">{comment.text}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="p-4 border-t border-neutral-800">
            <div className="relative">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a note..."
                className="w-full bg-neutral-900 border border-neutral-800 rounded-md py-2 pl-3 pr-10 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-neutral-600 transition-colors"
                autoFocus
              />
              <button
                type="submit"
                disabled={!newComment.trim()}
                className="absolute right-2 top-2 text-neutral-500 hover:text-blue-400 disabled:opacity-50 transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
