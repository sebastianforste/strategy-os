"use client";

import { useState, useEffect, useRef } from "react";
import { Mic, Play, Pause, Download, Volume2, Share2, Sparkles, Headphones } from "lucide-react";
import { generatePodcastScript, PodcastScript, DialogueLine } from "../utils/audio-generator";

interface AudioStudioProps {
  script: string; // Used as the base strategy
  apiKey?: string;
}

export default function AudioStudio({ script, apiKey }: AudioStudioProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [podcastScript, setPodcastScript] = useState<PodcastScript | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeLineIndex, setActiveLineIndex] = useState(-1);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  
  // Voice Assignments
  const [hostVoice, setHostVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [expertVoice, setExpertVoice] = useState<SpeechSynthesisVoice | null>(null);

  useEffect(() => {
    const loadVoices = () => {
      const available = window.speechSynthesis.getVoices();
      setVoices(available);
      
      // Try to assign diverse voices
      // Host: Energetic (e.g. Samantha, Daniel)
      // Expert: Deeper (e.g. Fred, Google UK)
      const host = available.find(v => v.name.includes("Samantha") || v.name.includes("US English")) || available[0];
      const expert = available.find(v => v.name.includes("Daniel") || v.name.includes("UK English Male")) || available[1] || available[0];
      
      setHostVoice(host);
      setExpertVoice(expert);
    };
    
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  const handleGenerateScript = async () => {
    if (!apiKey || isGenerating) return;
    setIsGenerating(true);
    try {
        const generated = await generatePodcastScript(script, apiKey);
        setPodcastScript(generated);
    } catch (e) {
        console.error("Script generation failed", e);
    } finally {
        setIsGenerating(false);
    }
  };

  const playSequence = async (startIndex: number) => {
    if (!podcastScript || startIndex >= podcastScript.lines.length) {
        setIsPlaying(false);
        setActiveLineIndex(-1);
        return;
    }

    setIsPlaying(true);
    setActiveLineIndex(startIndex);

    const line = podcastScript.lines[startIndex];
    const utterance = new SpeechSynthesisUtterance(line.text);
    
    // Assign voice based on speaker
    utterance.voice = line.speaker === 'Host' ? hostVoice : expertVoice;
    
    // Tweak rate/pitch for personality
    utterance.rate = line.speaker === 'Host' ? 1.1 : 0.95; // Host faster, Expert slower
    utterance.pitch = line.speaker === 'Host' ? 1.1 : 0.9;

    utterance.onend = () => {
        if (isPlaying) { // Check if still playing (wasn't paused)
            playSequence(startIndex + 1);
        }
    };
    
    window.speechSynthesis.speak(utterance);
  };

  const handleTogglePlay = () => {
      if (isPlaying) {
          window.speechSynthesis.cancel();
          setIsPlaying(false);
      } else {
          window.speechSynthesis.cancel();
          playSequence(activeLineIndex === -1 ? 0 : activeLineIndex);
      }
  };

  return (
    <div className="w-full bg-[#111] border border-white/10 rounded-2xl p-6 flex flex-col h-[600px]">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pb-6 border-b border-white/5">
             <div>
                 <h2 className="text-xl font-bold text-white flex items-center gap-2">
                     <Headphones className="w-5 h-5 text-indigo-400" />
                     Deep Dive Audio
                 </h2>
                 <p className="text-xs text-neutral-500 mt-1">Convert strategy into a 2-person podcast via AI.</p>
             </div>
             
             {!podcastScript ? (
                 <button 
                    onClick={handleGenerateScript}
                    disabled={isGenerating || !apiKey}
                    className="flex items-center gap-2 px-4 py-2 bg-white text-black font-bold rounded-lg text-xs hover:bg-neutral-200 transition-colors disabled:opacity-50"
                 >
                    {isGenerating ? <Sparkles className="w-4 h-4 animate-spin" /> : <Mic className="w-4 h-4" />}
                    {isGenerating ? "PRODUCING..." : "GENERATE EPISODE"}
                 </button>
             ) : (
                <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-neutral-500">{podcastScript.duration} EST</span>
                    <button 
                        onClick={handleTogglePlay}
                        className="p-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full transition-colors"
                    >
                        {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
                    </button>
                </div>
             )}
        </div>

        {/* Script / Visualizer Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 px-2">
            {!podcastScript ? (
                <div className="h-full flex flex-col items-center justify-center text-neutral-600 gap-4 opacity-50">
                    <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center">
                        <Volume2 className="w-10 h-10" />
                    </div>
                    <p className="text-sm font-mono text-center max-w-xs">
                        Generate a "Deep Dive" to hear two AI hosts debate this strategy in real-time.
                    </p>
                </div>
            ) : (
                <div className="max-w-xl mx-auto space-y-6 pb-20">
                    {podcastScript.title && (
                        <h3 className="text-center text-lg font-bold text-white mb-8 border-b border-white/10 pb-4">
                            "{podcastScript.title}"
                        </h3>
                    )}
                    
                    {podcastScript.lines.map((line, i) => (
                        <div 
                            key={i} 
                            onClick={() => playSequence(i)}
                            className={`flex gap-4 cursor-pointer transition-all duration-300 ${
                                activeLineIndex === i 
                                    ? "opacity-100 scale-105" 
                                    : activeLineIndex !== -1 ? "opacity-30 blur-[1px]" : "opacity-70 hover:opacity-100"
                            }`}
                        >
                            <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold border-2 ${
                                line.speaker === 'Host' 
                                    ? "border-blue-500/50 bg-blue-500/10 text-blue-400" 
                                    : "border-purple-500/50 bg-purple-500/10 text-purple-400"
                            }`}>
                                {line.speaker === 'Host' ? 'HST' : 'EXP'}
                            </div>
                            <div className={`flex-1 p-4 rounded-2xl border ${
                                line.speaker === 'Host'
                                    ? "bg-blue-500/5 border-blue-500/10 rounded-tl-none"
                                    : "bg-purple-500/5 border-purple-500/10 rounded-tr-none"
                            }`}>
                                <p className="text-sm text-neutral-300 leading-relaxed font-medium">
                                    {line.text}
                                </p>
                                <span className="text-[10px] text-neutral-600 uppercase tracking-wider mt-2 block font-bold">
                                    {line.emotion}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    </div>
  );
}
