"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import { X, Check, Edit2, MessageSquare, ThumbsUp, Send } from "lucide-react";
import { generateSmartReplies, SmartReply } from "../utils/comment-generator";
import { findEngagementOpportunities, EngagementOpportunity } from "../utils/network-graph";

interface EngagementDeckProps {
  apiKey: string;
}

export default function EngagementDeck({ apiKey }: EngagementDeckProps) {
  const [opportunities, setOpportunities] = useState<EngagementOpportunity[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [replies, setReplies] = useState<SmartReply[]>([]);
  const [selectedReply, setSelectedReply] = useState<SmartReply | null>(null);
  const [stats, setStats] = useState({ sent: 0, skipped: 0 });
  
  // Motion values
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-30, 30]);
  const opacity = useTransform(x, [-150, 0, 150], [0.5, 1, 0.5]);
  const bg = useTransform(x, [-100, 0, 100], ["#ef4444", "#171717", "#22c55e"]);

  useEffect(() => {
    const load = async () => {
      const opps = await findEngagementOpportunities(apiKey, "AI Agents"); // Defaulting niche to AI Agents for now
      setOpportunities(opps);
      if (opps.length > 0) {
        await loadReplies(opps[0]);
      }
    };
    load();
  }, []);

  const loadReplies = async (opp: EngagementOpportunity) => {
    const generated = await generateSmartReplies(opp.postSnippet, "cso", apiKey);
    setReplies(generated);
    setSelectedReply(generated[0]); // Default to first
  };

  const handleSwipe = async (direction: "left" | "right") => {
    if (direction === "right") {
        console.log(`[Viral Engine] Sent reply to ${opportunities[currentIndex].creator.handle}: "${selectedReply?.text}"`);
        setStats(s => ({ ...s, sent: s.sent + 1 }));
    } else {
        setStats(s => ({ ...s, skipped: s.skipped + 1 }));
    }

    // Move to next
    const nextIndex = currentIndex + 1;
    if (nextIndex < opportunities.length) {
        setCurrentIndex(nextIndex);
        await loadReplies(opportunities[nextIndex]);
        x.set(0); // Reset position
    } else {
        // End of deck
        setOpportunities([]);
    }
  };

  const currentOpp = opportunities[currentIndex];

  if (!currentOpp) {
    return (
        <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
            <div className="p-4 bg-green-500/10 rounded-full animate-pulse">
                <Check className="w-12 h-12 text-green-500" />
            </div>
            <h3 className="text-2xl font-bold text-white">Deck Cleared!</h3>
            <p className="text-neutral-500">You've engaged with all high-value targets for now.</p>
            <div className="flex gap-4 text-xs font-mono mt-8">
                <span className="text-green-400">{stats.sent} SENT</span>
                <span className="text-red-400">{stats.skipped} SKIPPED</span>
            </div>
        </div>
    );
  }

  return (
    <div className="relative w-full h-[600px] flex flex-col">
        {/* Header Stats */}
        <div className="flex justify-between items-center mb-6 px-2">
            <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-indigo-500" />
                    Viral Engine
                </h2>
                <p className="text-xs text-neutral-500">Engagement Farming Mode</p>
            </div>
            <div className="text-right">
                <p className="text-2xl font-bold text-white">{stats.sent}</p>
                <p className="text-[10px] text-neutral-500 uppercase tracking-wider">Replies Sent</p>
            </div>
        </div>

        {/* Card Area */}
        <div className="relative flex-1 flex items-center justify-center perspective-1000">
             <motion.div
                style={{ x, rotate, backgroundColor: bg }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                onDragEnd={(e, { offset, velocity }) => {
                    const swipe = offset.x; // Access x directly
                    if (swipe > 100) handleSwipe("right");
                    else if (swipe < -100) handleSwipe("left");
                }}
                className="absolute w-full max-w-sm bg-[#171717] border border-white/10 rounded-3xl p-6 shadow-2xl cursor-grab active:cursor-grabbing"
             >
                {/* Creator Profile */}
                <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-neutral-800 rounded-full flex items-center justify-center font-bold text-lg">
                        {currentOpp.creator.name[0]}
                    </div>
                    <div>
                        <h3 className="font-bold text-white">{currentOpp.creator.name}</h3>
                        <p className="text-xs text-neutral-400">{currentOpp.creator.handle} • {currentOpp.creator.followers / 1000}k followers</p>
                    </div>
                    <span className="ml-auto text-[10px] font-mono text-red-400 bg-red-500/10 px-2 py-1 rounded">
                        {currentOpp.urgency}
                    </span>
                </div>

                {/* Post Content */}
                <div className="bg-white/5 p-4 rounded-xl mb-6">
                    <p className="text-sm text-neutral-300 italic">"{currentOpp.postSnippet}"</p>
                </div>

                {/* Reply Generator */}
                <div className="space-y-3">
                    <p className="text-[10px] text-neutral-500 uppercase font-bold">Select Reply Strategy</p>
                    {replies.map((r) => (
                        <div 
                            key={r.id}
                            onClick={() => setSelectedReply(r)}
                            className={`p-3 rounded-xl border transition-all cursor-pointer ${
                                selectedReply?.id === r.id 
                                ? 'bg-indigo-600 border-indigo-500' 
                                : 'bg-white/5 border-white/5 hover:bg-white/10'
                            }`}
                        >
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-white/70">{r.style}</span>
                                {selectedReply?.id === r.id && <Check className="w-3 h-3 text-white" />}
                            </div>
                            <p className="text-xs text-white line-clamp-2">{r.text}</p>
                        </div>
                    ))}
                </div>

                {/* Action Hints */}
                <div className="absolute top-1/2 -translate-y-1/2 left-4 pointer-events-none opacity-0 transition-opacity" style={{ opacity: useTransform(x, [-50, -100], [0, 1]) as any }}>
                    <div className="bg-red-500 text-white p-4 rounded-full shadow-xl rotate-12">
                        <X className="w-8 h-8" />
                    </div>
                </div>
                <div className="absolute top-1/2 -translate-y-1/2 right-4 pointer-events-none opacity-0 transition-opacity" style={{ opacity: useTransform(x, [50, 100], [0, 1]) as any }}>
                    <div className="bg-green-500 text-white p-4 rounded-full shadow-xl -rotate-12">
                         <Send className="w-8 h-8" />
                    </div>
                </div>

             </motion.div>
        </div>

        {/* Footer Actions */}
        <div className="h-20 flex items-center justify-center gap-8">
            <button onClick={() => handleSwipe("left")} className="p-4 bg-neutral-800 rounded-full text-red-500 hover:bg-neutral-700 transition">
                <X className="w-6 h-6" />
            </button>
            <button className="p-3 bg-neutral-800 rounded-full text-neutral-400 hover:bg-neutral-700 transition">
                <Edit2 className="w-5 h-5" />
            </button>
            <button onClick={() => handleSwipe("right")} className="p-4 bg-indigo-600 rounded-full text-white hover:bg-indigo-500 transition shadow-lg shadow-indigo-600/20">
                <Send className="w-6 h-6" />
            </button>
        </div>
    </div>
  );
}
