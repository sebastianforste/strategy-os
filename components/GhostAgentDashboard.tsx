"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Ghost, Zap, Calendar, Trash2, Copy, RefreshCw, TrendingUp } from "lucide-react";
import { runGhostAgentAction } from "../actions/generate";
import { GhostDraft } from "../utils/ghost-agent";
import Toast, { ToastType } from "./Toast";

interface GhostAgentDashboardProps {
  apiKey: string;
  isOpen: boolean;
  onClose: () => void;
  onLoadDraft?: (draft: GhostDraft) => void;
}

export default function GhostAgentDashboard({ apiKey, isOpen, onClose, onLoadDraft }: GhostAgentDashboardProps) {
  const [drafts, setDrafts] = useState<GhostDraft[]>([]);
  const [isHunting, setIsHunting] = useState(false);
  const [selectedDraft, setSelectedDraft] = useState<GhostDraft | null>(null);
  
  // V2 Settings
  const [draftCount, setDraftCount] = useState(3);
  const [autoSchedule, setAutoSchedule] = useState(false);
  const [huntLog, setHuntLog] = useState("");

  const [toast, setToast] = useState<{ message: string; type: ToastType; isVisible: boolean }>({
    message: "",
    type: "success",
    isVisible: false,
  });

  const showToast = (message: string, type: ToastType) => {
    setToast({ message, type, isVisible: true });
  };

  const handleHunt = async () => {
    if (!apiKey) {
      showToast("API Key required for Ghost Agent", "error");
      return;
    }
    setIsHunting(true);
    setHuntLog("Initializing V2 Protocols...");

    try {
      // Simulated Log Steps
      setTimeout(() => setHuntLog("Scanning Sector Signals..."), 800);
      setTimeout(() => setHuntLog("Detecting Conflicts..."), 1600);
      setTimeout(() => setHuntLog(`Drafting ${draftCount} Variants...`), 2400);

      const result = await runGhostAgentAction(apiKey, { draftCount, autoSchedule });
      
      const newDrafts = Array.isArray(result) ? result : [result];
      setDrafts(prev => [...newDrafts, ...prev]);
      showToast(`Ghost found ${newDrafts.length} opportunities`, "success");
      
      if (newDrafts.length > 0) {
        setSelectedDraft(newDrafts[0]);
      }
    } catch (e) {
      console.error("Ghost hunt failed:", e);
      showToast("Hunt failed. Check API keys.", "error");
    } finally {
      setIsHunting(false);
      setHuntLog("");
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast("Copied to clipboard", "success");
  };

  const handleDiscard = (id: string) => {
    setDrafts(prev => prev.map(d => d.id === id ? { ...d, status: 'discarded' as const } : d));
    if (selectedDraft?.id === id) setSelectedDraft(null);
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return "text-green-400";
    if (score >= 50) return "text-yellow-400";
    return "text-red-400";
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 25 }}
        className="relative ml-auto w-full max-w-4xl bg-[#0A0A0A] border-l border-white/10 h-full overflow-hidden flex"
      >
        {/* Left: Settings & Draft List */}
        <div className="w-1/3 border-r border-white/10 flex flex-col">
          <div className="p-4 border-b border-white/10 bg-white/5 space-y-4">
            <div className="flex items-center gap-2">
              <Ghost className="w-5 h-5 text-purple-400" />
              <h2 className="font-bold text-white">Ghost Agent V2</h2>
            </div>

            {/* V2 Controls */}
            <div className="bg-black/20 p-3 rounded-lg border border-white/5 space-y-3">
                <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-neutral-500">Draft Count</span>
                    <div className="flex items-center gap-2 text-xs font-mono text-purple-300">
                        <button onClick={() => setDraftCount(Math.max(1, draftCount - 1))} className="hover:text-white">-</button>
                        <span>{draftCount}</span>
                        <button onClick={() => setDraftCount(Math.min(5, draftCount + 1))} className="hover:text-white">+</button>
                    </div>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-neutral-500">Auto-Schedule</span>
                    <button 
                        onClick={() => setAutoSchedule(!autoSchedule)}
                        className={`w-8 h-4 rounded-full p-0.5 transition-colors ${autoSchedule ? 'bg-purple-500' : 'bg-white/10'}`}
                    >
                        <div className={`w-3 h-3 rounded-full bg-white shadow transition-transform ${autoSchedule ? 'translate-x-4' : 'translate-x-0'}`} />
                    </button>
                </div>
            </div>

            <button
              onClick={handleHunt}
              disabled={isHunting}
              className={`w-full py-3 rounded-lg flex items-center justify-center gap-2 font-bold text-sm transition-all ${
                isHunting 
                  ? 'bg-white/5 text-neutral-500 cursor-wait'
                  : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg hover:shadow-purple-500/25'
              }`}
            >
              {isHunting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  HUNTING...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  EXECUTE
                </>
              )}
            </button>
            {isHunting && <p className="text-[10px] font-mono text-purple-400 text-center animate-pulse">{huntLog}</p>}
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {isHunting ? (
               <div className="space-y-4 p-4">
                  {[...Array(draftCount)].map((_, i) => (
                    <div key={i} className="relative h-16 bg-white/[0.02] border border-white/5 rounded-xl overflow-hidden">
                        <motion.div 
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/10 to-transparent -translate-x-full"
                            animate={{ translateX: ['100%', '-100%'] }}
                            transition={{ repeat: Infinity, duration: 1.5, ease: "linear", delay: i * 0.2 }}
                        />
                    </div>
                  ))}
               </div>
            ) : drafts.filter(d => d.status !== 'discarded').length === 0 ? (
              <div className="p-12 text-center text-neutral-600">
                <div className="relative inline-block mb-4">
                    <Ghost className="w-12 h-12 opacity-20" />
                    <motion.div 
                        className="absolute inset-0 border border-purple-500/20 rounded-full"
                        animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                    />
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-1">STATIONARY MODE</p>
                <p className="text-[9px] opacity-50">Ghost is waiting for coordinates</p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {drafts.filter(d => d.status !== 'discarded').map(draft => (
                  <button
                    key={draft.id}
                    onClick={() => setSelectedDraft(draft)}
                    className={`w-full p-4 text-left hover:bg-white/5 transition-colors ${
                      selectedDraft?.id === draft.id ? 'bg-white/10' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{draft.trend}</p>
                        <p className="text-xs text-neutral-500 mt-0.5">{draft.topic}</p>
                      </div>
                      <div className={`text-xs font-mono font-bold ${getScoreColor(draft.viralityScore)}`}>
                        {draft.viralityScore}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      {draft.status === 'scheduled' && (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-green-500/20 text-green-400 font-bold flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> SCHEDULED
                        </span>
                      )}
                      {draft.status === 'unread' && (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 font-bold">
                          NEW
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Draft Preview */}
        <div className="flex-1 flex flex-col">
          {selectedDraft ? (
            <>
              <div className="p-4 border-b border-white/10 bg-white/5 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-white">{selectedDraft.trend}</h3>
                  <p className="text-xs text-neutral-500 flex items-center gap-2 mt-1">
                    <TrendingUp className="w-3 h-3" />
                    Virality Score: <span className={getScoreColor(selectedDraft.viralityScore)}>{selectedDraft.viralityScore}/100</span>
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                        if (onLoadDraft) onLoadDraft(selectedDraft);
                        onClose();
                    }}
                    className="p-2 hover:bg-blue-500/20 rounded-lg transition-colors"
                    title="Load into Editor"
                  >
                    <Zap className="w-4 h-4 text-blue-400" />
                  </button>
                  <button
                    onClick={() => handleCopy(selectedDraft.assets.textPost)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    title="Copy to clipboard"
                  >
                    <Copy className="w-4 h-4 text-neutral-400" />
                  </button>
                  <button
                    onClick={() => handleDiscard(selectedDraft.id)}
                    className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                    title="Discard"
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-6">
                <div className="prose prose-invert max-w-none">
                  <pre className="whitespace-pre-wrap text-sm text-neutral-200 font-sans leading-relaxed bg-transparent p-0">
                    {selectedDraft.assets.textPost}
                  </pre>
                </div>
                {selectedDraft.assets.imagePrompt && (
                  <div className="mt-6 p-4 rounded-lg bg-white/5 border border-white/10">
                    <p className="text-xs font-mono text-purple-400 mb-2">IMAGE PROMPT</p>
                    <p className="text-sm text-neutral-300">{selectedDraft.assets.imagePrompt}</p>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-neutral-500">
              <div className="text-center">
                <Ghost className="w-16 h-16 mx-auto mb-4 opacity-20" />
                <p>Select a draft to preview</p>
              </div>
            </div>
          )}
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
