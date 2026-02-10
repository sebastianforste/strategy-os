"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Video, Mic, Share2, Play, Download, Sparkles, CheckCircle, ArrowRight, Zap, Loader2 } from "lucide-react";
import { prepareHeyGenScript, prepareElevenLabsScript, handoffToAvatarService } from "../utils/media-export";

interface AvatarFactoryProps {
    videoScript: string;
    textPost: string;
}

export default function AvatarFactory({ videoScript, textPost }: AvatarFactoryProps) {
    const [activePlatform, setActivePlatform] = useState<'heygen' | 'elevenlabs'>('heygen');
    const [isDeploying, setIsDeploying] = useState(false);
    const [deployedJobId, setDeployedJobId] = useState<string | null>(null);

    const scripts = {
        heygen: prepareHeyGenScript(videoScript),
        elevenlabs: prepareElevenLabsScript(textPost)
    };

    const handleDeploy = async () => {
        setIsDeploying(true);
        const result = await handoffToAvatarService({
            platform: activePlatform,
            text: scripts[activePlatform]
        });
        setDeployedJobId(result.jobId);
        setIsDeploying(false);
    };

    return (
        <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-6 overflow-hidden">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-violet-500/10 text-violet-400">
                        <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-white font-medium">Avatar Synthesis</h3>
                        <p className="text-xs text-white/40 uppercase tracking-widest">Text to Human Pipeline</p>
                    </div>
                </div>
            </div>

            <div className="flex gap-2 mb-6">
                <button 
                    onClick={() => setActivePlatform('heygen')}
                    className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 ${
                        activePlatform === 'heygen' 
                            ? "bg-white/10 border-white/20 text-white" 
                            : "bg-white/5 border-transparent text-white/40"
                    }`}
                >
                    <Video className="w-4 h-4" />
                    HEYGEN (VIDEO)
                </button>
                <button 
                    onClick={() => setActivePlatform('elevenlabs')}
                    className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 ${
                        activePlatform === 'elevenlabs' 
                            ? "bg-white/10 border-white/20 text-white" 
                            : "bg-white/5 border-transparent text-white/40"
                    }`}
                >
                    <Mic className="w-4 h-4" />
                    ELEVENLABS (AUDIO)
                </button>
            </div>

            <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Optimized Script</span>
                    <button className="text-[10px] text-violet-400 font-bold hover:underline">EDIT SCRIPT</button>
                </div>
                <div className="bg-white/5 border border-white/5 rounded-2xl p-4 min-h-[120px]">
                    <p className="text-[11px] text-white/60 font-mono leading-relaxed whitespace-pre-wrap">
                        {scripts[activePlatform]}
                    </p>
                </div>
            </div>

            {!deployedJobId ? (
                <button 
                    onClick={handleDeploy}
                    disabled={isDeploying}
                    className="w-full py-4 bg-violet-500 hover:bg-violet-400 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-violet-500/20"
                >
                    {isDeploying ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>SYNTHESIZING...</span>
                        </>
                    ) : (
                        <>
                            <Zap className="w-4 h-4" />
                            <span>DEPLOY TO {activePlatform.toUpperCase()}</span>
                        </>
                    )}
                </button>
            ) : (
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-emerald-400" />
                        <div>
                            <span className="text-[10px] font-bold text-emerald-400 uppercase">Deployed Successfully</span>
                            <p className="text-[10px] text-emerald-400/60 font-mono">ID: {deployedJobId}</p>
                        </div>
                    </div>
                    <button className="p-2 hover:bg-white/10 rounded-lg text-emerald-400 transition-all">
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            )}
        </div>
    );
}
