"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Ghost, X, Sparkles, AlertTriangle, ArrowRight, RefreshCw, Send, Bell } from "lucide-react";
import { GhostDraft } from "../utils/ghost-agent";
import { runGhostAgentAction } from "../actions/generate";
import { sendToWebhook } from "../utils/scheduler-service";
import { sendSlackMessage, sendTelegramMessage, sendMSTeamsMessage } from "../utils/notification-service";

interface GhostInboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
  onLoadDraft: (draft: GhostDraft) => void;
}

export default function GhostInboxModal({ isOpen, onClose, apiKey, onLoadDraft }: GhostInboxModalProps) {
  const [isHunting, setIsHunting] = useState(false);
  const [drafts, setDrafts] = useState<GhostDraft[]>([]);
  const [log, setLog] = useState<string>("");

  const handleWakeAgent = async () => {
    if (!apiKey) {
      alert("Please configure Gemini API Key first.");
      return;
    }

    setIsHunting(true);
    setLog("Initializing Agent...");

    try {
      // Simulate steps for UI effect
      setTimeout(() => setLog("Scanning Sectors..."), 800);
      setTimeout(() => setLog("Hunting for Conflict..."), 1500);
      setTimeout(() => setLog("Drafting Content..."), 2500);

      const result = await runGhostAgentAction(apiKey);
      
      // V2 returns array, V1 returned single object - handle both
      const newDrafts = Array.isArray(result) ? result : [result];
      setDrafts(prev => [...newDrafts, ...prev]);
      setLog("Agent Asleep.");
    } catch (e) {
      console.error(e);
      setLog("Agent Failed.");
    } finally {
      setIsHunting(false);
    }
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
            <div className={`p-2 rounded-full ${isHunting ? 'bg-purple-500/20 animate-pulse' : 'bg-white/10'}`}>
                <Ghost className={`w-5 h-5 ${isHunting ? 'text-purple-400' : 'text-white'}`} />
            </div>
            <div>
                <h2 className="text-xl font-bold text-white">Ghost Agent</h2>
                <p className="text-xs text-neutral-400 font-mono">
                    STATUS: {isHunting ? <span className="text-purple-400">HUNTING</span> : "ASLEEP"}
                </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X className="w-5 h-5 text-neutral-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
            {/* Action Area */}
            <div className="mb-8 flex flex-col items-center justify-center py-8 border border-dashed border-white/10 rounded-xl bg-black/20">
                {isHunting ? (
                    <div className="text-center space-y-3">
                        <div className="w-12 h-12 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
                        <p className="text-sm font-mono text-purple-300">{log}</p>
                    </div>
                ) : (
                    <div className="text-center space-y-4">
                        <p className="text-sm text-neutral-400 max-w-md mx-auto">
                            The Agent will select a random sector, hunt for breaking conflict news, and draft a viral post autonomously.
                        </p>
                        <button
                            onClick={handleWakeAgent}
                            className="flex items-center gap-2 px-6 py-3 bg-white text-black font-bold rounded-full hover:bg-neutral-200 transition-all shadow-[0_0_15px_rgba(255,255,255,0.3)]"
                        >
                            <Sparkles className="w-4 h-4" />
                            WAKE AGENT
                        </button>
                    </div>
                )}
            </div>

            {/* Inbox */}
            <div className="space-y-4">
                <h3 className="text-xs font-bold text-neutral-500 tracking-widest uppercase">Draft Inbox ({drafts.length})</h3>
                
                <div className="max-h-[300px] overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                    {drafts.length === 0 ? (
                        <div className="text-center py-8 text-neutral-600 italic">
                            No drafts yet. Wake the agent.
                        </div>
                    ) : (
                        drafts.map((draft) => (
                            <div key={draft.id} className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-colors group">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-xs font-mono text-purple-400 bg-purple-900/20 px-2 py-1 rounded">{draft.topic}</span>
                                    <span className="text-xs text-neutral-500">{new Date(draft.createdAt).toLocaleTimeString()}</span>
                                </div>
                                <h4 className="text-sm font-bold text-white mb-2 line-clamp-1">
                                    &quot;{draft.trend}&quot;
                                </h4>
                                <p className="text-xs text-neutral-400 line-clamp-2 mb-4">
                                    {draft.assets.textPost}
                                </p>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => {
                                            onLoadDraft(draft);
                                            onClose();
                                        }}
                                        className="flex-1 flex items-center justify-center gap-2 py-2 bg-white/10 hover:bg-white/20 rounded text-xs font-bold text-white transition-colors"
                                    >
                                        LOAD INTO EDITOR
                                        <ArrowRight className="w-3 h-3" />
                                    </button>
                                    <button 
                                        onClick={async () => {
                                            const result = await sendToWebhook({ content: draft.assets.textPost, platform: "linkedin" });
                                            alert(result.message);
                                        }}
                                        className="flex items-center justify-center gap-1 px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 rounded text-xs font-bold text-blue-400 transition-colors"
                                        title="Send to Scheduler"
                                    >
                                        <Send className="w-3 h-3" />
                                    </button>
                                    <button 
                                        onClick={async () => {
                                            const msg = `📝 *New Draft from Ghost Agent*\n\n*Topic:* ${draft.topic}\n*Trend:* ${draft.trend}\n\n${draft.assets.textPost.substring(0, 200)}...`;
                                            
                                            const slackRes = await sendSlackMessage(msg);
                                            const teamsRes = await sendMSTeamsMessage(msg, `New Draft: ${draft.topic}`);
                                            
                                            let resultMsg = "";
                                            if (slackRes.success) resultMsg += "Slack ✅ ";
                                            if (teamsRes.success) resultMsg += "Teams ✅ ";
                                            
                                            if (!slackRes.success && !teamsRes.success) {
                                                const tgRes = await sendTelegramMessage(msg);
                                                if(tgRes.success) resultMsg += "Telegram ✅";
                                                else resultMsg = "Failed to send to any channel. Configure in Settings.";
                                            }
                                            
                                            alert(resultMsg);
                                        }}
                                        className="flex items-center justify-center gap-1 px-3 py-2 bg-green-500/20 hover:bg-green-500/30 rounded text-xs font-bold text-green-400 transition-colors"
                                        title="Push to Slack/Teams/Telegram"
                                    >
                                        <Bell className="w-3 h-3" />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
      </motion.div>
    </div>
  );
}
