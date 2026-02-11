"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Clock, Trash2, TrendingUp, ThumbsUp, Meh, ThumbsDown } from "lucide-react";
import { HistoryItem, PerformanceRating, updateHistoryPerformance } from "../utils/history-service";

interface HistorySidebarProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
  onClear: () => void;
  onRatingChange?: () => void;
}

export default function HistorySidebar({
  isOpen,
  onClose,
  history,
  onSelect,
  onClear,
  onRatingChange,
}: HistorySidebarProps) {

  const handleRate = (itemId: string, rating: Exclude<PerformanceRating, null>, e: React.MouseEvent) => {
    e.stopPropagation();
    updateHistoryPerformance(itemId, {
      rating,
      markedAt: Date.now(),
    });
    onRatingChange?.();
  };

  const getRatingIcon = (rating: PerformanceRating) => {
    switch (rating) {
      case "viral":
        return <TrendingUp className="w-3 h-3 text-green-500" />;
      case "good":
        return <ThumbsUp className="w-3 h-3 text-blue-500" />;
      case "meh":
        return <Meh className="w-3 h-3 text-yellow-500" />;
      case "flopped":
        return <ThumbsDown className="w-3 h-3 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[120]"
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: 0 }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-[#0A0A0A] border-l border-neutral-800 p-6 z-[121] shadow-2xl overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-neutral-400" />
                History
              </h2>
              <button
                onClick={onClose}
                className="text-neutral-500 hover:text-white transition-colors"
                aria-label="Close History"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {history.length === 0 ? (
              <div className="text-center mt-20 text-neutral-600">
                <p>No history yet.</p>
                <p className="text-xs mt-2">Generate content to see history.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {history.map((item) => (
                  <div
                    key={item.id}
                    className="bg-neutral-900/50 border border-neutral-800 rounded-lg overflow-hidden hover:border-neutral-600 transition-all"
                  >
                    <button
                      onClick={() => {
                        onSelect(item);
                        onClose();
                      }}
                      className="w-full text-left p-4 hover:bg-neutral-900 transition-all"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-mono text-neutral-500">
                          {new Date(item.createdAt).toLocaleDateString()} • {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {item.performance?.rating && (
                          <div className="flex items-center gap-1">
                            {getRatingIcon(item.performance.rating)}
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-white font-medium line-clamp-2">
                        {item.input}
                      </p>
                    </button>

                    {/* Rating Buttons */}
                    <div className="px-4 pb-3 pt-0 border-t border-neutral-800/50">
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-neutral-600 mr-2">Rate:</span>
                        <button
                          onClick={(e) => handleRate(item.id, "viral", e)}
                          className={`flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded text-xs font-medium transition-colors ${
                            item.performance?.rating === "viral"
                              ? "bg-green-500/20 text-green-400 border border-green-500/30"
                              : "bg-neutral-900 text-neutral-500 hover:text-green-400 hover:bg-green-500/10"
                          }`}
                          title="Viral"
                        >
                          <TrendingUp className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => handleRate(item.id, "good", e)}
                          className={`flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded text-xs font-medium transition-colors ${
                            item.performance?.rating === "good"
                              ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                              : "bg-neutral-900 text-neutral-500 hover:text-blue-400 hover:bg-blue-500/10"
                          }`}
                          title="Good"
                        >
                          <ThumbsUp className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => handleRate(item.id, "meh", e)}
                          className={`flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded text-xs font-medium transition-colors ${
                            item.performance?.rating === "meh"
                              ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                              : "bg-neutral-900 text-neutral-500 hover:text-yellow-400 hover:bg-yellow-500/10"
                          }`}
                          title="Meh"
                        >
                          <Meh className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => handleRate(item.id, "flopped", e)}
                          className={`flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded text-xs font-medium transition-colors ${
                            item.performance?.rating === "flopped"
                              ? "bg-red-500/20 text-red-400 border border-red-500/30"
                              : "bg-neutral-900 text-neutral-500 hover:text-red-400 hover:bg-red-500/10"
                          }`}
                          title="Flopped"
                        >
                          <ThumbsDown className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  onClick={onClear}
                  className="w-full mt-8 flex items-center justify-center gap-2 text-xs text-red-500 hover:text-red-400 py-4 border-t border-neutral-900"
                >
                  <Trash2 className="w-3 h-3" />
                  Clear History
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
