"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { X, Play, RefreshCw, Users, Activity, BarChart3, Plus, Trash2, Sparkles } from "lucide-react";
import { AUDIENCE, SimulationFeedback, runSimulation, createDynamicPersona, AudienceMember } from "../utils/swarm-service";

interface SimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
}

export default function SimulatorModal({ isOpen, onClose, apiKey }: SimulatorModalProps) {
  const [draft, setDraft] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [feedback, setFeedback] = useState<SimulationFeedback[]>([]);
  const [customMembers, setCustomMembers] = useState<AudienceMember[]>([]);
  const [newPersonaDesc, setNewPersonaDesc] = useState("");
  const [isCreatingPersona, setIsCreatingPersona] = useState(false);
  const [activeTab, setActiveTab] = useState<"default" | "custom">("default");

  // Determine which audience to run against
  const currentAudience = activeTab === "default" ? AUDIENCE : customMembers;

  const startSimulation = async () => {
    if (!draft || !apiKey) return;
    setIsRunning(true);
    setFeedback([]); // Clear previous

    try {
        const audience = activeTab === "custom" ? customMembers : AUDIENCE;
        const results = await runSimulation(draft, audience, apiKey);
        
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

  const handleCreatePersona = async () => {
      if (!newPersonaDesc.trim()) return;
      setIsCreatingPersona(true);
      try {
          const member = await createDynamicPersona(newPersonaDesc, apiKey);
          if (member) {
              setCustomMembers(prev => [...prev, member]);
              setNewPersonaDesc("");
              setActiveTab("custom"); // Switch to custom tab
          }
      } catch (e) {
          console.error("Failed to create persona", e);
      } finally {
          setIsCreatingPersona(false);
      }
  };

  const removeMember = (id: string) => {
      setCustomMembers(prev => prev.filter(m => m.id !== id));
      // If empty, switch back? Maybe not
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
                    <div className="flex gap-4 text-xs font-mono uppercase tracking-widest text-neutral-500 mt-1">
                        <button onClick={() => setActiveTab("default")} className={`hover:text-white transition-colors ${activeTab === "default" ? "text-blue-400 font-bold" : ""}`}>
                            Default Squad
                        </button>
                        <span>|</span>
                        <button onClick={() => setActiveTab("custom")} className={`hover:text-white transition-colors ${activeTab === "custom" ? "text-purple-400 font-bold" : ""}`}>
                            Custom Personas ({customMembers.length})
                        </button>
                    </div>
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
                        {currentAudience.map((persona) => {
                            const response = feedback.find(f => f.memberId === persona.id);
                            const isActive = isRunning && !response;
                            
                            return (
                                <div key={persona.id} className="relative group/persona">
                                    {/* Persona Card */}
                                    <div className={`p-6 rounded-2xl border transition-all duration-500 ${response ? 'bg-neutral-900 border-white/10' : 'bg-transparent border-white/5 opacity-80'}`}>
                                        <div className="flex items-start gap-4">
                                            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-2xl border border-white/10 shadow-lg">
                                                {persona.avatar}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h4 className="text-white font-bold flex items-center gap-2">
                                                            {persona.name}
                                                            {persona.isCustom && <span className="text-[10px] bg-purple-500/20 text-purple-300 px-1.5 rounded border border-purple-500/20">CUSTOM</span>}
                                                        </h4>
                                                        <p className="text-xs text-neutral-500 uppercase">{persona.role}</p>
                                                    </div>
                                                    {response ? (
                                                        <div className="flex items-center gap-2">
                                                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${
                                                                response.reaction === 'love' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                                                                response.reaction === 'hate' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                                                                response.reaction === 'bored' ? 'bg-neutral-500/20 text-neutral-400 border-neutral-500/30' :
                                                                'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                                                            }`}>
                                                                {response.reaction}
                                                            </span>
                                                            {persona.isCustom && (
                                                                <button onClick={() => removeMember(persona.id)} className="text-neutral-600 hover:text-red-400 p-1"><Trash2 className="w-3 h-3" /></button>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        persona.isCustom && <button onClick={() => removeMember(persona.id)} className="text-neutral-600 hover:text-red-400 p-1"><Trash2 className="w-3 h-3" /></button>
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
                        
                        {/* Add Persona Logic */}
                        {activeTab === "custom" && customMembers.length < 5 && (
                             <div className="p-6 rounded-2xl border border-white/5 bg-white/5 border-dashed flex flex-col items-center justify-center gap-4">
                                 {!isCreatingPersona ? (
                                     <div className="w-full">
                                         <input 
                                            type="text" 
                                            value={newPersonaDesc}
                                            onChange={(e) => setNewPersonaDesc(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleCreatePersona()}
                                            placeholder=" Describe a new persona (e.g., 'Angry CTO', 'Gen Z Intern')..."
                                            className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:border-purple-500/50 outline-none"
                                         />
                                         <button 
                                            onClick={handleCreatePersona}
                                            disabled={!newPersonaDesc.trim()}
                                            className="mt-3 w-full py-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-2"
                                         >
                                             <Sparkles className="w-3 h-3" />
                                             GENERATE PERSONA
                                         </button>
                                     </div>
                                 ) : (
                                     <div className="flex items-center gap-2 text-purple-400 animate-pulse">
                                         <RefreshCw className="w-4 h-4 animate-spin" />
                                         <span className="text-sm">Conjuring Persona...</span>
                                     </div>
                                 )}
                             </div>
                        )}
                    </div>
                )}
            </div>
        </div>
      </motion.div>
    </div>
  );
}
