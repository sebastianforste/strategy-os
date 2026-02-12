"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Film, Video, Scissors, Play, Download, Share2, Sparkles, MessageSquare, History, Bookmark, Hash, Quote, ChevronRight, Activity, Filter, Settings2, Clapperboard, MonitorPlay, Waves, CheckCircle, RefreshCw, AlertCircle } from "lucide-react";
import { generateVideoScriptAction } from "../actions/generate";
import { VideoScript as VideoScriptType } from "../utils/video-service";

interface VideoScript {
    id: string;
    title: string;
    hook: string;
    duration: string;
    vibe: string;
    status: 'Draft' | 'Final' | 'Storyboarded';
}

const SCRIPTS: VideoScript[] = [
    { id: 'v1', title: 'The Agentic Era Manifesto', hook: 'The mouse is dead. Commands are everything...', duration: '58s', vibe: 'Cinematic / Authoritative', status: 'Storyboarded' },
    { id: 'v2', title: 'Micro-SaaS to Macro-Engine', hook: 'How I scaled my logic without scaling my team...', duration: '45s', vibe: 'High-Energy / Minimalist', status: 'Draft' },
    { id: 'v3', title: 'Prompting as a High-Art', hook: 'Why your AI is failing (Hint: It is your input)...', duration: '62s', vibe: 'Documentary / Noir', status: 'Final' },
];

export default function VideoStudio({ content = "", apiKey = "" }: { content?: string; apiKey?: string }) {
    const [scripts, setScripts] = useState<VideoScript[]>(SCRIPTS);
    const [isSynthesizing, setIsSynthesizing] = useState(false);
    const [activeScript, setActiveScript] = useState<VideoScriptType | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [retryPath, setRetryPath] = useState<string | null>(null);

    const handleSynthesize = async () => {
        if (!content || !apiKey) {
            setError("Content and API Key required for architecture.");
            return;
        }

        setIsSynthesizing(true);
        setError(null);
        
        try {
            const result = await generateVideoScriptAction(content, apiKey, "linkedin") as any;
            if (result.success && result.data) {
                setActiveScript(result.data);
                setRetryPath(null);
                // Add to archive
                const newEntry: VideoScript = {
                    id: `v-${Date.now()}`,
                    title: result.data.title,
                    hook: result.data.hook,
                    duration: `${result.data.totalDuration}s`,
                    vibe: 'Generated Context',
                    status: 'Final'
                };
                setScripts([newEntry, ...scripts]);
            } else {
                setError(result.error || "Generation failed.");
                if (result.isRateLimit && result.retryPath) {
                    setRetryPath(result.retryPath);
                }
            }
        } catch (e) {
            setError("Linguistic bridge failed.");
        } finally {
            setIsSynthesizing(false);
        }
    };

    return (
        <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-8 min-h-[700px]">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12">
                <div className="flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-brand-500/10 text-brand-400 border border-brand-500/20">
                        <Film className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white uppercase tracking-tight">Video Architect</h2>
                        <p className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-mono mt-1">High-Status Video Scripting & Storyboards</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button 
                        onClick={handleSynthesize}
                        disabled={isSynthesizing}
                        className="px-6 py-2.5 bg-brand-500 text-white rounded-xl text-[10px] font-black tracking-widest hover:scale-105 transition-all shadow-lg shadow-brand-500/20 uppercase flex items-center gap-2"
                    >
                        {isSynthesizing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                        <span>{isSynthesizing ? "Composing..." : "Generate Script"}</span>
                    </button>
                    <button className="p-2.5 bg-white/5 border border-white/10 rounded-xl text-white/40 hover:text-white transition-all">
                        <Clapperboard className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* STUDIO OPS */}
                <div className="space-y-8">
                    <div className="grid grid-cols-2 gap-4">
                        <StudioPhase icon={<MonitorPlay />} label="Talking Head" active />
                        <StudioPhase icon={<Waves />} label="B-Roll Engine" />
                        <StudioPhase icon={<Scissors />} label="Auto-Cutter" />
                        <StudioPhase icon={<Video />} label="Cinema 4D Sync" />
                    </div>

                    <div className="p-10 bg-white/[0.02] border border-white/5 rounded-3xl relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-1 h-full bg-brand-500" />
                        <div className="flex items-center gap-3 mb-6">
                            <Play className="w-4 h-4 text-brand-400" />
                            <h4 className="text-[10px] font-black text-white uppercase tracking-widest">
                                {activeScript ? `Active: ${activeScript.title}` : "Active Draft: Manifesto V2"}
                            </h4>
                        </div>
                        
                        <div className="min-h-[150px]">
                            {activeScript ? (
                                <div className="space-y-6">
                                    <div className="p-4 bg-brand-500/5 rounded-2xl border border-brand-500/10">
                                        <p className="text-xs font-bold text-brand-400 uppercase tracking-widest mb-1">Scroll-Stopping Hook</p>
                                        <p className="text-sm text-white font-medium leading-relaxed italic">"{activeScript.hook}"</p>
                                    </div>
                                    
                                    <div className="space-y-3">
                                        <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Storyboard Scenes</p>
                                        <div className="max-h-[250px] overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                                            {activeScript.scenes.map((scene) => (
                                                <div key={scene.id} className="p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-white/10 transition-all group/scene">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="text-brand-400 font-black uppercase text-[8px]">Scene {scene.id} • {scene.duration}s</span>
                                                        <span className="text-[8px] text-white/20 uppercase tracking-widest">{scene.transition}</span>
                                                    </div>
                                                    <p className="text-[11px] text-white/90 font-medium mb-2">{scene.visual}</p>
                                                    <div className="pl-3 border-l-2 border-brand-500/30">
                                                        <p className="text-[10px] text-white/50 leading-relaxed italic">"{scene.voiceover}"</p>
                                                    </div>
                                                    {scene.textOverlay && (
                                                        <div className="mt-2 text-[9px] font-mono text-cyan-400/70 bg-cyan-400/5 px-2 py-1 rounded inline-block">
                                                            Overlay: {scene.textOverlay}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Multi-Modal Assets */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-white/5">
                                        <div>
                                            <p className="text-[9px] font-black text-brand-400 uppercase tracking-widest mb-2">AI Thumbnail Prompt</p>
                                            <p className="text-[10px] text-white/40 leading-relaxed line-clamp-3 bg-black/40 p-3 rounded-xl border border-white/5 italic">
                                                {activeScript.thumbnailPrompt}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black text-brand-400 uppercase tracking-widest mb-2">Platform Tags</p>
                                            <div className="flex flex-wrap gap-1.5">
                                                {activeScript.hashtags.map((tag, i) => (
                                                    <span key={i} className="text-[9px] font-mono text-brand-400/60 hover:text-brand-400 transition-colors cursor-default">
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-sm text-white/40 leading-relaxed italic mb-8">
                                    {error ? (
                                        <div className="space-y-4">
                                            <span className="text-rose-400 flex items-center gap-2 font-bold"><AlertCircle className="w-4 h-4" /> {error}</span>
                                            {retryPath && (
                                                <div className="p-3 bg-amber-500/5 border border-amber-500/10 rounded-xl text-[10px] text-amber-500/80">
                                                    Resilience Mode: Try the <span className="font-bold underline">{retryPath}</span> instead.
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        "\"Visual: Close up on user’s eye. Reflection of code scrolling. Deep bass hit. Voiceover: The mouse is a relic. Your thoughts are the cursor...\""
                                    )}
                                </p>
                            )}
                        </div>

                        <div className="flex gap-4 mt-8">
                            <button className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg text-[9px] font-black text-white uppercase tracking-widest transition-all">
                                {activeScript ? "View Full Markdown" : "View Full Script"}
                            </button>
                            <button className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg text-[9px] font-black text-white uppercase tracking-widest transition-all">
                                {activeScript ? "Copy Thumb Prompt" : "Export Storyboard"}
                            </button>
                        </div>
                    </div>

                    <div className="p-6 border border-white/5 rounded-2xl flex items-center justify-between cursor-pointer hover:bg-white/5 transition-all">
                        <div className="flex items-center gap-3">
                            <Activity className={`w-4 h-4 ${activeScript ? "text-emerald-400" : "text-white/20"}`} />
                            <span className="text-[10px] font-bold text-white uppercase tracking-tight">
                                {activeScript ? "Audio Waveform Mastered" : "Production Engine Idle"}
                            </span>
                        </div>
                        {activeScript && <CheckCircle className="w-4 h-4 text-emerald-500" />}
                    </div>
                </div>

                {/* ARCHIVE */}
                <div className="space-y-6">
                    <h3 className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-4">Production Archive</h3>
                    
                    <div className="space-y-4">
                        {scripts.map((script) => (
                            <motion.div
                                key={script.id}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="p-6 bg-white/5 border border-white/5 rounded-3xl group hover:border-brand-500/20 transition-all cursor-pointer relative overflow-hidden"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-[9px] font-mono text-white/20 uppercase tracking-tighter">{script.duration}</span>
                                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${
                                        script.status === 'Storyboarded' ? 'bg-brand-500 text-black' : 'bg-white/10 text-white/40'
                                    }`}>
                                        {script.status}
                                    </span>
                                </div>
                                <h4 className="text-sm font-bold text-white uppercase tracking-tight mb-2 group-hover:text-brand-400 transition-colors">{script.title}</h4>
                                <p className="text-[11px] text-white/40 italic leading-relaxed line-clamp-1 mb-4">"{script.hook}"</p>
                                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                    <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">{script.vibe}</span>
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button className="p-2 text-white/40 hover:text-white"><Download className="w-3.5 h-3.5" /></button>
                                        <button className="p-2 text-white/40 hover:text-white"><Share2 className="w-3.5 h-3.5" /></button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <button className="w-full py-4 border border-dashed border-white/10 hover:border-brand-500/20 hover:bg-white/5 rounded-2xl text-[10px] font-black text-white/20 hover:text-white uppercase tracking-[0.2em] transition-all">
                        Load More Scenes
                    </button>
                </div>
            </div>
        </div>
    );
}

function StudioPhase({ icon, label, active }: { icon: React.ReactNode, label: string, active?: boolean }) {
    return (
        <button className={`p-6 rounded-3xl border flex flex-col items-center gap-3 transition-all ${
            active ? "bg-white/10 border-white/20 text-white" : "bg-white/[0.02] border-white/5 text-white/20 hover:text-white hover:bg-white/10"
        }`}>
            <div className="p-2">{icon}</div>
            <span className="text-[9px] font-black uppercase tracking-widest">{label}</span>
        </button>
    );
}

