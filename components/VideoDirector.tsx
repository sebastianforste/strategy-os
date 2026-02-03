import { useState, useEffect } from "react";
import { Play, Pause, Scissors, Film, Music, Mic, Monitor, Download, Zap, Loader2, Users } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { StoryboardLine, generateStoryboard } from "../utils/video-generator";
import { generateVideoVisualsAction } from "../actions/generate";

interface VideoDirectorProps {
  script: string;
  apiKey?: string;
}

export default function VideoDirector({ script, apiKey }: VideoDirectorProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [storyboard, setStoryboard] = useState<StoryboardLine[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentSceneIdx, setCurrentSceneIdx] = useState(0);
  const [sceneImages, setSceneImages] = useState<string[]>([]);
  const [isGeneratingVisuals, setIsGeneratingVisuals] = useState(false);
  const [isAvatarEnabled, setIsAvatarEnabled] = useState(false);

  useEffect(() => {
    async function initVideo() {
        if (!apiKey || !script) return;
        setIsLoading(true);
        try {
            const data = await generateStoryboard(script, apiKey);
            setStoryboard(data);
            
            // Phase 53: Visual Synthesis
            setIsGeneratingVisuals(true);
            const images = await generateVideoVisualsAction(data, apiKey);
            setSceneImages(images);
            setIsGeneratingVisuals(false);
        } catch (e) {
            console.error("Video initialization failed", e);
        } finally {
            setIsLoading(false);
        }
    }
    initVideo();
  }, [script, apiKey]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && storyboard.length > 0) {
      interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            setIsPlaying(false);
            return 0;
          }
          const next = prev + 1;
          // Determine current scene based on progress
          const sceneIdx = Math.floor((next / 100) * storyboard.length);
          if (sceneIdx !== currentSceneIdx && sceneIdx < storyboard.length) {
            setCurrentSceneIdx(sceneIdx);
          }
          return next;
        });
      }, 100); // adjust playback speed
    }
    return () => clearInterval(interval);
  }, [isPlaying, storyboard, currentSceneIdx]);

  if (isLoading) {
    return (
        <div className="w-full bg-black border border-white/10 rounded-2xl h-[600px] flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
                <p className="text-xs font-mono text-neutral-500 uppercase tracking-widest">Mastering Cinematic Sequence...</p>
            </div>
        </div>
    );
  }

  const currentScene = storyboard[currentSceneIdx];

  return (
    <div className="w-full bg-black border border-white/10 rounded-2xl overflow-hidden flex flex-col h-[600px]">
      {/* Viewport */}
      <div className="flex-1 bg-neutral-900 relative flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/10 to-transparent" />
        
        <AnimatePresence mode="wait">
            {currentScene && (
                <motion.div 
                    key={currentSceneIdx}
                    initial={{ scale: 1.1, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1 }}
                    className="absolute inset-0"
                >
                    {/* Scene Background */}
                    <div className="w-full h-full bg-black relative">
                        {sceneImages[currentSceneIdx] ? (
                            <img 
                                src={sceneImages[currentSceneIdx]} 
                                alt={currentScene.text}
                                className="w-full h-full object-cover opacity-60"
                            />
                        ) : (
                            <div className="w-full h-full bg-neutral-900 flex items-center justify-center">
                                <Film className="w-12 h-12 text-neutral-800 animate-pulse" />
                            </div>
                        )}
                        
                        {/* Phase 55: Avatar Overlay (Digital Twin) */}
                        {isAvatarEnabled && (
                            <motion.div 
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="absolute bottom-12 right-12 w-48 h-48 rounded-full border-2 border-indigo-500 overflow-hidden shadow-2xl z-20 bg-neutral-800"
                            >
                                <div className="absolute inset-0 flex items-center justify-center text-indigo-500">
                                    <Users className="w-12 h-12 animate-pulse" />
                                </div>
                                <div className="absolute bottom-2 left-0 right-0 text-center">
                                    <span className="text-[8px] font-black text-white px-2 py-0.5 bg-indigo-500 rounded-full">AI TWIN</span>
                                </div>
                            </motion.div>
                        )}

                        {/* Animated Caption */}
                        <div className="absolute inset-0 flex items-center justify-center p-12 bg-black/40">
                            <motion.div 
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.5 }}
                                className="text-center"
                            >
                                <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase mb-4 drop-shadow-2xl">
                                    {currentScene.text}
                                </h2>
                                <div className="h-1 w-24 bg-indigo-500 mx-auto rounded-full mb-4" />
                            </motion.div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>

        {!isPlaying && !currentScene && (
          <div className="text-center p-8 max-w-lg z-10">
              <div className="flex flex-col items-center gap-4 text-neutral-500">
                <Film className="w-16 h-16 opacity-20" />
                <p className="text-sm font-mono uppercase tracking-widest">AI Director Standby</p>
              </div>
          </div>
        )}
        
        {/* Overlay UI */}
        <div className="absolute top-4 right-4 flex gap-2">
            <button 
                onClick={() => setIsAvatarEnabled(!isAvatarEnabled)}
                className={`p-2 backdrop-blur rounded-lg border text-[10px] font-bold transition-all flex items-center gap-2 ${isAvatarEnabled ? 'bg-indigo-500 text-white border-indigo-400' : 'bg-black/50 border-white/10 text-neutral-400 hover:bg-white/10'}`}
            >
                <Users className="w-3 h-3" /> DIGITAL TWIN
            </button>
            <button className="p-2 bg-black/50 backdrop-blur rounded-lg border border-white/10 text-white text-[10px] font-bold hover:bg-white/10 flex items-center gap-2">
                <Monitor className="w-3 h-3" /> 9:16 VERTICAL
            </button>
        </div>
        
        {isGeneratingVisuals && (
            <div className="absolute bottom-4 left-4 p-3 bg-black/80 backdrop-blur-md rounded-xl border border-white/5 flex items-center gap-3">
                <Loader2 className="w-4 h-4 text-indigo-500 animate-spin" />
                <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest">Synthesizing Scene Visuals...</span>
            </div>
        )}
      </div>

      {/* Timeline Controls */}
      <div className="h-48 bg-neutral-950 border-t border-white/10 flex flex-col">
        {/* Progress Bar */}
        <div className="w-full h-1 bg-white/5 cursor-pointer relative" onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - rect.left;
            setProgress((x / rect.width) * 100);
        }}>
            <div className="absolute h-full bg-indigo-500" style={{ width: `${progress}%` }} />
        </div>

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
             <button className="flex items-center gap-2 text-[10px] font-bold text-neutral-400 hover:text-white px-3 py-1.5 rounded-lg border border-transparent hover:border-white/10 transition-colors">
                <Download className="w-3 h-3" /> EXPORT MP4
             </button>
        </div>

        {/* Tracks */}
        <div className="flex-1 p-4 overflow-x-auto custom-scrollbar">
            <div className="space-y-2 min-w-full">
                {/* Visual Track */}
                <div className="flex h-16 bg-neutral-900 rounded-lg overflow-hidden border border-white/5 relative">
                    <div className="absolute -left-12 top-0 bottom-0 w-10 flex items-center justify-center bg-neutral-900 border-r border-white/5 z-10">
                        <Film className="w-3 h-3 text-neutral-500" />
                    </div>
                    {storyboard.map((scene, i) => (
                        <div 
                            key={i} 
                            onClick={() => {
                                setCurrentSceneIdx(i);
                                setProgress((i / storyboard.length) * 100);
                            }}
                            className={`flex-1 border-r border-white/5 p-2 text-[8px] font-mono transition-colors cursor-pointer flex flex-col justify-between relative group ${currentSceneIdx === i ? 'bg-indigo-500/10 text-indigo-300' : 'text-neutral-500 hover:bg-white/5'}`}
                        >
                            {sceneImages[i] && (
                                <img src={sceneImages[i]} className="absolute inset-0 w-full h-full object-cover opacity-20 pointer-events-none group-hover:opacity-40 transition-opacity" />
                            )}
                            <span className="relative z-10">SCENE {i + 1}</span>
                            <span className="truncate relative z-10">{scene.text}</span>
                        </div>
                    ))}
                </div>

                {/* Avatar Track (Digital Twin) */}
                <div className="flex h-10 bg-neutral-900 rounded-lg overflow-hidden border border-white/5 relative">
                    <div className="absolute -left-12 top-0 bottom-0 w-10 flex items-center justify-center bg-neutral-900 border-r border-white/5 z-10">
                        <Users className="w-3 h-3 text-neutral-500" />
                    </div>
                    {storyboard.map((_, i) => (
                        <div 
                            key={i} 
                            className={`flex-1 border-r border-white/5 transition-colors flex items-center justify-center ${isAvatarEnabled ? 'bg-indigo-500/5' : ''}`}
                        >
                            {isAvatarEnabled && <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />}
                        </div>
                    ))}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
