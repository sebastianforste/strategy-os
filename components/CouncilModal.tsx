"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Play, RefreshCw, Mic, Zap } from "lucide-react";
import { COUNCIL, CouncilMessage, runCouncilTurn, synthesizeDebate } from "../utils/swarm-service";

interface CouncilModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
  onAdoptStrategy?: (draft: string) => void;
}

export default function CouncilModal({ isOpen, onClose, apiKey, onAdoptStrategy }: CouncilModalProps) {
  const [topic, setTopic] = useState("");
  const [isDebating, setIsDebating] = useState(false);
  const [messages, setMessages] = useState<CouncilMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const startDebate = async () => {
    if (!topic || !apiKey) return;
    setIsDebating(true);
    setMessages([]);

    // Sequence: Visionary -> Skeptic -> Visionary -> Skeptic -> Editor
    const turns = ["visionary", "skeptic", "visionary", "skeptic", "editor"];
    
    const currentHistory: CouncilMessage[] = [];

    for (const speakerId of turns) {
      // Small delay for "thinking" effect
      await new Promise(r => setTimeout(r, 1500));
      
      try {
        const text = await runCouncilTurn(topic, currentHistory, speakerId, apiKey);
        
        const newMessage: CouncilMessage = { memberId: speakerId, content: text };
        setMessages(prev => [...prev, newMessage]);
        currentHistory.push(newMessage);
      } catch (e) {
        console.error("Debate error", e);
        break;
      }
    }

    // FINAL SYNTHESIS STEP
    const synthesis = await synthesizeDebate(topic, currentHistory, apiKey);
    if (synthesis) {
        setMessages(prev => [...prev, { memberId: "editor", content: synthesis }]);
    }

    setIsDebating(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-full max-w-4xl h-[600px] bg-[#0A0A0A] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex"
      >
        {/* Sidebar - Council Members */}
        <div className="w-64 bg-black/40 border-r border-white/10 p-6 flex flex-col gap-6">
          <h2 className="text-sm font-bold text-white tracking-widest uppercase mb-4">The Council</h2>
          
          {COUNCIL.map(member => (
            <div key={member.id} className="flex items-center gap-3 opacity-60 hover:opacity-100 transition-opacity">
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-xl shadow-inner border border-white/5">
                {member.avatar}
              </div>
              <div>
                <p className="text-sm font-bold text-white">{member.name}</p>
                <p className="text-[10px] text-neutral-400 uppercase">{member.role}</p>
              </div>
            </div>
          ))}
          
          <div className="mt-auto pt-6 border-t border-white/10">
             <p className="text-xs text-neutral-500">
               &quot;If you want to go fast, go alone. If you want to go far, go together.&quot;
             </p>
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
            {/* Header */}
            <div className="h-16 border-b border-white/10 flex items-center justify-between px-6">
                <div>
                    <h3 className="text-white font-bold">Swarm Intelligence Chamber</h3>
                    <p className="text-xs text-neutral-500 flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${isDebating ? 'bg-green-500 animate-pulse' : 'bg-neutral-600'}`} />
                        {isDebating ? "DEBATE IN SESSION" : "IDLE"}
                    </p>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                    <X className="w-5 h-5 text-neutral-400" />
                </button>
            </div>

            {/* Chat Log */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gradient-to-b from-black/20 to-black/5">
                {messages.length === 0 && !isDebating ? (
                    <div className="h-full flex flex-col items-center justify-center text-center opacity-30">
                        <div className="w-24 h-24 rounded-full border-2 border-white/10 flex items-center justify-center mb-4">
                            <Mic className="w-10 h-10 text-white" />
                        </div>
                        <p className="text-sm">Enter a topic to convene the council.</p>
                    </div>
                ) : (
                    messages.map((msg, idx) => {
                        const member = COUNCIL.find(m => m.id === msg.memberId);
                        const isEditor = msg.memberId === "editor";
                        
                        return (
                            <motion.div 
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`flex gap-4 ${isEditor ? 'mt-8 p-4 bg-purple-500/10 border border-purple-500/30 rounded-xl' : ''}`}
                            >
                                <div className="flex-shrink-0">
                                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                                        {member?.avatar}
                                    </div>
                                </div>
                                <div>
                                    <div className="flex items-baseline gap-2 mb-1">
                                        <span className={`text-xs font-bold ${isEditor ? 'text-purple-400' : 'text-neutral-300'}`}>
                                            {member?.name}
                                        </span>
                                        <span className="text-[10px] text-neutral-500 uppercase">{member?.role}</span>
                                    </div>
                                    <p className="text-sm text-neutral-200 leading-relaxed">
                                        {msg.content}
                                    </p>
                                    {isEditor && onAdoptStrategy && (
                                        <button 
                                            onClick={() => onAdoptStrategy(msg.content)}
                                            className="mt-4 px-4 py-2 bg-purple-500 text-white text-[10px] font-bold rounded-lg hover:bg-purple-600 transition-colors flex items-center gap-2"
                                        >
                                            <Zap className="w-3 h-3" />
                                            ADOPT THIS STRATEGY
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-6 border-t border-white/10 bg-black/40">
                <div className="flex gap-2">
                    <input 
                        type="text" 
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder="What strategy should the council debate?"
                        disabled={isDebating}
                        className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:border-white/30 outline-none transition-colors disabled:opacity-50"
                        onKeyDown={(e) => e.key === "Enter" && startDebate()}
                    />
                    <button 
                        onClick={startDebate}
                        disabled={isDebating || !topic}
                        className="px-6 bg-white text-black font-bold rounded-lg hover:bg-neutral-200 transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                        {isDebating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                        CONVENE
                    </button>
                </div>
            </div>
        </div>
      </motion.div>
    </div>
  );
}
