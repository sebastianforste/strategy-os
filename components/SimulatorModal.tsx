"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { X, Play, RefreshCw, Users, Activity, BarChart3 } from "lucide-react";
import { AUDIENCE, SimulationFeedback, runSimulation } from "../utils/swarm-service";

interface SimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
}

export default function SimulatorModal({ isOpen, onClose, apiKey }: SimulatorModalProps) {
  const [draft, setDraft] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [feedback, setFeedback] = useState<SimulationFeedback[]>([]);

  const startSimulation = async () => {
    if (!draft || !apiKey) return;
    setIsRunning(true);
    setFeedback([]); // Clear previous

    try {
        const results = await runSimulation(draft, apiKey);
        
        // Staggered reveal effect
        for (const res of results) {
            await new Promise(r => setTimeout(r, 800)); // Simulate reading time
            setFeedback(prev => [...prev, res]);
        }

    } catch (e) {
        console.error("Simulation error", e);
    } finally {
        setIsRunning(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-full max-w-5xl h-[700px] bg-[#0A0A0A] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="h-16 border-b border-white/10 flex items-center justify-between px-8 bg-black/40">
            <div className="flex items-center gap-4">
                <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/30">
                    <Users className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                    <h3 className="text-white font-bold text-lg">Audience Simulator (v2027)</h3>
                    <p className="text-xs text-neutral-500 uppercase tracking-widest">Synthetic Focus Group</p>
                </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <X className="w-5 h-5 text-neutral-400" />
            </button>
        </div>

        <div className="flex-1 flex overflow-hidden">
            {/* Left: Input Area */}
            <div className="w-1/3 border-r border-white/10 p-6 flex flex-col bg-black/20">
                <label className="text-xs font-bold text-neutral-400 mb-2 uppercase">Content to Test</label>
                <textarea 
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder="Paste your LinkedIn post, email draft, or strategy here..."
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white resize-none outline-none focus:border-white/30 transition-colors custom-scrollbar"
                />
                <button 
                    onClick={startSimulation}
                    disabled={isRunning || !draft}
                    className="mt-4 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isRunning ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                    RUN SIMULATION
                </button>
            </div>

            {/* Right: Results Grid */}
            <div className="flex-1 bg-neutral-900/50 p-8 overflow-y-auto">
                {feedback.length === 0 && !isRunning ? (
                    <div className="h-full flex flex-col items-center justify-center text-neutral-600">
                        <Activity className="w-16 h-16 mb-4 opacity-20" />
                        <p>Waiting for input signal...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6">
                        {AUDIENCE.map((persona) => {
                            const response = feedback.find(f => f.memberId === persona.id);
                            const isActive = isRunning && !response;
                            
                            return (
                                <div key={persona.id} className="relative">
                                    {/* Persona Card */}
                                    <div className={`p-6 rounded-2xl border transition-all duration-500 ${response ? 'bg-neutral-900 border-white/10' : 'bg-transparent border-white/5 opacity-50'}`}>
                                        <div className="flex items-start gap-4">
                                            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-2xl border border-white/10 shadow-lg">
                                                {persona.avatar}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h4 className="text-white font-bold">{persona.name}</h4>
                                                        <p className="text-xs text-neutral-500 uppercase">{persona.role}</p>
                                                    </div>
                                                    {response && (
                                                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${
                                                            response.reaction === 'love' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                                                            response.reaction === 'hate' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                                                            response.reaction === 'bored' ? 'bg-neutral-500/20 text-neutral-400 border-neutral-500/30' :
                                                            'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                                                        }`}>
                                                            {response.reaction}
                                                        </span>
                                                    )}
                                                </div>
                                                
                                                <div className="mt-4 min-h-[40px]">
                                                    {response ? (
                                                        <motion.p 
                                                            initial={{ opacity: 0 }} 
                                                            animate={{ opacity: 1 }}
                                                            className="text-sm text-neutral-300 leading-relaxed italic"
                                                        >
                                                            &quot;{response.comment}&quot;
                                                        </motion.p>
                                                    ) : isActive ? (
                                                        <div className="flex items-center gap-2 text-xs text-blue-400 animate-pulse">
                                                            <div className="w-2 h-2 bg-blue-400 rounded-full" />
                                                            Reading...
                                                        </div>
                                                    ) : (
                                                        <p className="text-xs text-neutral-600">Waiting...</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
      </motion.div>
    </div>
  );
}
