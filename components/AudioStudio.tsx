"use client";

import { useState, useEffect, useRef } from "react";
import { Mic, Play, Pause, Download, Volume2, Share2 } from "lucide-react";

interface AudioStudioProps {
  script: string; // Used as the base for the "Voice Note" or "Podcast"
}

export default function AudioStudio({ script }: AudioStudioProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [voice, setVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  
  useEffect(() => {
    const loadVoices = () => {
      const available = window.speechSynthesis.getVoices();
      setVoices(available);
      // Try to find a good English voice
      const preferred = available.find(v => v.name.includes("Samantha") || v.name.includes("Daniel") || v.name.includes("Google US English"));
      if (preferred) setVoice(preferred);
    };
    
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  const handlePlay = () => {
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(script || "No audio script available. Please switch to the text tab and generate content first.");
    if (voice) utterance.voice = voice;
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    
    utterance.onend = () => setIsPlaying(false);
    
    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
  };

  return (
    <div className="w-full bg-[#111] border border-white/10 rounded-2xl p-8 flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-full max-w-md">
            {/* Visualizer */}
            <div className="h-32 bg-black rounded-2xl border border-white/10 mb-8 flex items-center justify-center px-8 relative overflow-hidden">
                 <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-indigo-500/10 animate-pulse" />
                 <div className="flex items-end gap-1 w-full h-16 justify-center">
                    {Array.from({ length: 24 }).map((_, i) => (
                        <div 
                            key={i} 
                            className={`w-2 bg-indigo-500 rounded-full transition-all duration-100 ${isPlaying ? "animate-bounce" : "h-2"}`} 
                            style={{ 
                                height: isPlaying ? `${Math.random() * 100}%` : "10%",
                                animationDelay: `${i * 0.05}s`
                            }} 
                        />
                    ))}
                 </div>
            </div>

            {/* Controls */}
            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between bg-white/5 rounded-xl p-4 border border-white/10">
                     <div className="flex items-center gap-3">
                        <div className="p-3 bg-white/10 rounded-full">
                            <Mic className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="text-xs text-neutral-400 font-bold uppercase tracking-wider">AI Voice Model</p>
                            <select 
                                className="bg-transparent text-white text-sm font-bold outline-none w-48 truncate"
                                value={voice?.name || ""}
                                onChange={(e) => setVoice(voices.find(v => v.name === e.target.value) || null)}
                            >
                                {voices.map(v => (
                                    <option key={v.name} value={v.name} className="bg-black text-white">{v.name}</option>
                                ))}
                            </select>
                        </div>
                     </div>
                </div>

                <div className="flex gap-3">
                    <button 
                        onClick={handlePlay}
                        className="flex-1 py-4 bg-white text-black font-bold rounded-xl hover:scale-[1.02] transition-transform flex items-center justify-center gap-2"
                    >
                        {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
                        {isPlaying ? "PAUSE PREVIEW" : "PLAY VOICE CLONE"}
                    </button>
                    <button className="px-6 bg-white/10 rounded-xl hover:bg-white/20 transition-colors border border-white/5">
                        <Download className="w-5 h-5 text-white" />
                    </button>
                </div>
            </div>
            
            <p className="text-center text-[10px] text-neutral-500 mt-6 uppercase tracking-widest">
                Podcast Co-Host Mode Active • 44.1kHz High Fidelity
            </p>
        </div>
    </div>
  );
}
