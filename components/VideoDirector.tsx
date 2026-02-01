"use client";

import { useState } from "react";
import { Play, Pause, Scissors, Film, Music, Mic, Monitor, Download, Zap } from "lucide-react";
import { motion } from "framer-motion";

interface VideoDirectorProps {
  script: string;
}

export default function VideoDirector({ script }: VideoDirectorProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  // Parse script into rudimentary scenes based on newlines/formatting
  const scenes = script.split(/\n\n/).filter(line => line.trim().length > 0).map((line, i) => ({
    id: i,
    content: line,
    duration: 5 + Math.random() * 5 // Mock duration
  }));

  return (
    <div className="w-full bg-black border border-white/10 rounded-2xl overflow-hidden flex flex-col h-[600px]">
      {/* Viewport */}
      <div className="flex-1 bg-neutral-900 relative flex items-center justify-center">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
        <div className="text-center p-8 max-w-lg z-10">
           {!isPlaying ? (
             <div className="flex flex-col items-center gap-4 text-neutral-500">
               <Film className="w-16 h-16 opacity-20" />
               <p className="text-sm font-mono uppercase tracking-widest">AI Director Standby</p>
             </div>
           ) : (
             <motion.div 
               initial={{ opacity: 0 }} 
               animate={{ opacity: 1 }}
               className="text-white text-xl font-bold font-serif leading-relaxed"
             >
               "{scenes[Math.floor(progress / 100 * scenes.length)]?.content || "Scene rendering..."}"
             </motion.div>
           )}
        </div>
        
        {/* Overlay UI */}
        <div className="absolute top-4 right-4 flex gap-2">
            <button className="p-2 bg-black/50 backdrop-blur rounded-lg border border-white/10 text-white text-xs font-bold hover:bg-white/10 flex items-center gap-2">
                <Monitor className="w-3 h-3" /> 9:16
            </button>
            <button className="p-2 bg-indigo-500/20 backdrop-blur rounded-lg border border-indigo-500/50 text-indigo-300 text-xs font-bold hover:bg-indigo-500/30 flex items-center gap-2">
                <Zap className="w-3 h-3" /> GENERATE AVATAR
            </button>
        </div>
      </div>

      {/* Timeline Controls */}
      <div className="h-64 bg-neutral-950 border-t border-white/10 flex flex-col">
        {/* Toolbar */}
        <div className="h-12 border-b border-white/5 flex items-center px-4 gap-4">
             <button 
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition-transform"
             >
                {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
             </button>
             <div className="h-4 w-px bg-white/10" />
             <div className="flex gap-2">
                <button className="p-2 hover:bg-white/10 rounded"><Scissors className="w-4 h-4 text-neutral-400" /></button>
                <button className="p-2 hover:bg-white/10 rounded"><Music className="w-4 h-4 text-neutral-400" /></button>
                <button className="p-2 hover:bg-white/10 rounded"><Mic className="w-4 h-4 text-neutral-400" /></button>
             </div>
             <div className="flex-1" />
             <button className="flex items-center gap-2 text-xs font-bold text-neutral-400 hover:text-white px-3 py-1.5 rounded-lg border border-transparent hover:border-white/10 transition-colors">
                <Download className="w-3 h-3" /> EXPORT MP4
             </button>
        </div>

        {/* Tracks */}
        <div className="flex-1 p-4 overflow-x-auto custom-scrollbar">
            <div className="space-y-2 min-w-[800px]">
                {/* Video Track */}
                <div className="flex h-16 bg-neutral-900 rounded-lg overflow-hidden border border-white/5 relative">
                    <div className="absolute left-0 top-0 bottom-0 bg-indigo-500/20 w-1 border-r border-indigo-500 z-10" />
                    {scenes.map((scene, i) => (
                        <div key={i} className="flex-1 border-r border-white/5 p-2 text-[10px] text-neutral-500 font-mono truncate hover:bg-white/5 transition-colors cursor-pointer border-l border-white/5">
                            SCENE {i + 1}
                        </div>
                    ))}
                </div>
                {/* Audio Track */}
                <div className="flex h-12 bg-neutral-900/50 rounded-lg overflow-hidden border border-white/5 items-center px-2">
                    <div className="w-full h-8 flex items-center gap-1 opacity-30">
                         {Array.from({ length: 50 }).map((_, i) => (
                             <div key={i} className="flex-1 bg-white rounded-full" style={{ height: `${20 + Math.random() * 80}%` }} />
                         ))}
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
