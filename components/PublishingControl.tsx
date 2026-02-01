"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Clock, Globe, Zap, Check, ChevronDown, Send } from "lucide-react";

export default function PublishingControl() {
  const [isOpen, setIsOpen] = useState(false);
  const [isBoosting, setIsBoosting] = useState(false);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [platforms, setPlatforms] = useState({
    linkedin: true,
    x: true,
    substack: false
  });

  const times = [
    { label: "Today, 10:00 AM", score: 98, reason: "Peak C-Suite Activity" },
    { label: "Tomorrow, 8:45 AM", score: 94, reason: "Morning Commute Optimization" },
    { label: "Friday, 1:00 PM", score: 88, reason: "Lunch Break Engagement" },
  ];

  const handlePublish = () => {
    setIsOpen(false);
    // In a real app, this would trigger the actual API calls
    alert("Assets queued for distribution across the Unfair Network.");
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-black font-bold text-xs rounded-lg transition-all shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:shadow-[0_0_30px_rgba(34,197,94,0.5)]"
      >
        <Send className="w-4 h-4" /> 
        PUBLISH (MULTI-CHANNEL)
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsOpen(false)}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />
            
            {/* Modal */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="absolute top-12 right-0 w-96 bg-[#111] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden"
            >
                {/* Header */}
                <div className="p-4 border-b border-white/10 bg-white/5">
                    <h3 className="text-white font-bold text-sm flex items-center gap-2">
                        <Globe className="w-4 h-4 text-green-500" />
                        Strategic Distribution
                    </h3>
                </div>

                <div className="p-4 space-y-6">
                    
                    {/* Platform Selector */}
                    <div>
                        <label className="text-[10px] uppercase font-bold text-neutral-500 mb-2 block tracking-wider">Target Channels</label>
                        <div className="grid grid-cols-3 gap-2">
                            {Object.entries(platforms).map(([key, active]) => (
                                <button
                                    key={key}
                                    onClick={() => setPlatforms(p => ({ ...p, [key]: !active }))}
                                    className={`py-2 px-3 rounded-lg border text-xs font-bold capitalize transition-all ${
                                        active 
                                        ? "bg-white text-black border-white" 
                                        : "bg-neutral-900 border-neutral-800 text-neutral-500 hover:border-neutral-700"
                                    }`}
                                >
                                    {key}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Smart Schedule */}
                    <div>
                        <label className="text-[10px] uppercase font-bold text-neutral-500 mb-2 block tracking-wider flex items-center justify-between">
                            <span>Smart Schedule (AI)</span>
                            <Clock className="w-3 h-3" />
                        </label>
                        <div className="space-y-2">
                            {times.map((t, i) => (
                                <button
                                    key={i}
                                    onClick={() => setSelectedTime(t.label)}
                                    className={`w-full flex items-center justify-between p-3 rounded-lg border text-left transition-all ${
                                        selectedTime === t.label
                                        ? "bg-indigo-500/20 border-indigo-500/50"
                                        : "bg-neutral-900 border-neutral-800 hover:border-neutral-700"
                                    }`}
                                >
                                    <div>
                                        <div className={`text-xs font-bold ${selectedTime === t.label ? "text-indigo-300" : "text-neutral-300"}`}>{t.label}</div>
                                        <div className="text-[10px] text-neutral-500">{t.reason}</div>
                                    </div>
                                    <div className={`text-xs font-bold ${t.score > 90 ? "text-green-500" : "text-yellow-500"}`}>
                                        {t.score}% match
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Network Boost */}
                    <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 p-4 rounded-xl border border-purple-500/20">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <Zap className="w-4 h-4 text-purple-400" />
                                <span className="text-xs font-bold text-white">Activate Unfair Network</span>
                            </div>
                            <div 
                                onClick={() => setIsBoosting(!isBoosting)}
                                className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${isBoosting ? "bg-purple-500" : "bg-neutral-700"}`}
                            >
                                <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${isBoosting ? "left-6" : "left-1"}`} />
                            </div>
                        </div>
                        <p className="text-[10px] text-purple-300/70 leading-relaxed">
                            Automatically notify "High Value Targets" via DM and email upon publishing.
                        </p>
                    </div>

                    {/* Action */}
                    <button 
                        onClick={handlePublish}
                        className="w-full py-3 bg-white hover:bg-neutral-200 text-black font-bold rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
                    >
                        <Check className="w-4 h-4" /> CONFIRM & QUEUE
                    </button>
                </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
