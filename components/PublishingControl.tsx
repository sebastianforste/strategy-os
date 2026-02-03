"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Clock, Globe, Zap, Check, Send, Linkedin, Twitter, FileText, MessageSquare, Hash, Loader2 } from "lucide-react";
import { dispatchToPlatform, DistributionPlatform } from "../utils/distribution-agent";

interface PublishingControlProps {
    content: string;
    imageUrl?: string;
    personaId?: string;
    title?: string;
}

export default function PublishingControl({ content, imageUrl, personaId, title }: PublishingControlProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [platforms, setPlatforms] = useState<Record<DistributionPlatform, boolean>>({
    linkedin: true,
    x: true,
    substack: false,
    discord: false,
    slack: false
  });

  const times = [
    { label: "Today, 10:00 AM", score: 98, reason: "Peak C-Suite Activity" },
    { label: "Tomorrow, 8:45 AM", score: 94, reason: "Morning Commute Optimization" },
    { label: "Friday, 1:00 PM", score: 88, reason: "Lunch Break Engagement" },
  ];

  const handlePublish = async () => {
    const activePlatforms = Object.entries(platforms)
        .filter(([_, active]) => active)
        .map(([platform]) => platform as DistributionPlatform);

    if (activePlatforms.length === 0) {
        alert("Select at least one platform to distribute.");
        return;
    }

    setIsPublishing(true);
    let successCount = 0;

    try {
        for (const platform of activePlatforms) {
            const result = await dispatchToPlatform({
                platform,
                content,
                imageUrl,
                personaId,
                title
            });
            if (result.success) successCount++;
        }

        alert(`Successfully queued for ${successCount}/${activePlatforms.length} platforms.`);
        setIsOpen(false);
    } catch (e) {
        alert("Distribution failed. Check connection.");
    } finally {
        setIsPublishing(false);
    }
  };

  const platformIcons: Record<DistributionPlatform, any> = {
    linkedin: Linkedin,
    x: Twitter,
    substack: FileText,
    discord: Hash,
    slack: MessageSquare
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 text-red-400 border border-red-500/50 rounded-md text-[10px] font-bold uppercase tracking-wider hover:bg-red-500 hover:text-white transition-all shadow-[0_0_20px_rgba(239,68,68,0.2)]"
      >
        <Send className="w-3.5 h-3.5" /> 
        GHOST DISPATCH
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsOpen(false)}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90]"
            />
            
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl z-[100] overflow-hidden"
            >
                <div className="p-5 border-b border-white/10 bg-gradient-to-br from-red-500/10 to-transparent">
                    <h3 className="text-white font-bold text-sm flex items-center gap-2">
                        <Globe className="w-4 h-4 text-red-500 animate-pulse" />
                        Ghost Mode: Multi-Chain Distribution
                    </h3>
                </div>

                <div className="p-5 space-y-6">
                    <div>
                        <label className="text-[10px] uppercase font-bold text-neutral-500 mb-3 block tracking-widest">Active Channels</label>
                        <div className="grid grid-cols-5 gap-2">
                            {(Object.keys(platforms) as DistributionPlatform[]).map((key) => {
                                const Icon = platformIcons[key];
                                const active = platforms[key];
                                return (
                                    <button
                                        key={key}
                                        onClick={() => setPlatforms(p => ({ ...p, [key]: !active }))}
                                        className={`flex flex-col items-center justify-center py-3 rounded-xl border transition-all gap-2 ${
                                            active 
                                            ? "bg-white/10 border-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.2)]" 
                                            : "bg-black/40 border-white/5 text-neutral-500 hover:border-white/10"
                                        }`}
                                        title={key.toUpperCase()}
                                    >
                                        <Icon className={`w-5 h-5 ${active ? "text-red-500" : ""}`} />
                                        <span className="text-[8px] font-bold uppercase tracking-tighter">{key}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div>
                        <label className="text-[10px] uppercase font-bold text-neutral-500 mb-3 block tracking-widest flex items-center justify-between">
                            <span>Intelligence Window</span>
                            <Clock className="w-3 h-3" />
                        </label>
                        <div className="space-y-2">
                            {times.map((t, i) => (
                                <button
                                    key={i}
                                    onClick={() => setSelectedTime(t.label)}
                                    className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                                        selectedTime === t.label
                                        ? "bg-red-500/10 border-red-500/50"
                                        : "bg-black/60 border-white/5 hover:border-white/20"
                                    }`}
                                >
                                    <div>
                                        <div className={`text-[11px] font-bold ${selectedTime === t.label ? "text-red-400" : "text-neutral-300"}`}>{t.label}</div>
                                        <div className="text-[9px] text-neutral-500">{t.reason}</div>
                                    </div>
                                    <div className={`text-[11px] font-black ${t.score > 90 ? "text-red-500" : "text-yellow-600"}`}>
                                        {t.score}%
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    <button 
                        onClick={handlePublish}
                        disabled={isPublishing}
                        className="w-full py-4 bg-white hover:bg-neutral-200 text-black font-black rounded-xl text-xs transition-all flex items-center justify-center gap-2 shadow-xl"
                    >
                        {isPublishing ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin text-red-600" />
                                EXECUTING GHOST PROTOCOL...
                            </>
                        ) : (
                            <>
                                <Check className="w-4 h-4" /> INITIATE DISPATCH
                            </>
                        )}
                    </button>
                </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
