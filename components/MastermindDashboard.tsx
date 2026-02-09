"use client";

import { useState, useEffect } from "react";
import { LayoutDashboard, Zap, Target, ListTodo, Activity, ArrowUpRight, Sparkles, Loader2, RefreshCw, Cpu, ShieldCheck, History, MessageSquare, Mic, Type } from "lucide-react";
import { generateMastermindBriefing, MastermindBriefing } from "../utils/mastermind-briefing";
import { AutonomousDecision } from "../utils/autonomous-agent";
import { findCollaborativeArticles, CollaborativeArticle } from "../utils/collaborative-agent";
import { calculateTopVoiceScore } from "../utils/authority-scorer";
import { oracleService, TrendForecast } from "../utils/oracle-service";
import EngagementDeck from "./EngagementDeck";
import MediaKit from "./MediaKit";
import ClicheHighlighter from "./ClicheHighlighter";
import { motion, AnimatePresence } from "framer-motion";

interface MastermindDashboardProps {
    apiKey?: string;
    trends: any[];
    engagementTargets: any[];
    queueCount: number;
    onViewChange: (view: 'feed' | 'canvas' | 'network' | 'mastermind') => void;
    isAutoPilot: boolean;
    setIsAutoPilot: (val: boolean) => void;
    decisions: AutonomousDecision[];
    autoPilotThreshold: number;
    setAutoPilotThreshold: (val: number) => void;
    autoPilotPlatforms: string[];
    setAutoPilotPlatforms: (platforms: string[]) => void;
    initialView?: string;
    initialClicheText?: string;
    onClearClicheText?: () => void;
}

export default function MastermindDashboard({ 
    apiKey, trends, engagementTargets, queueCount, onViewChange, 
    isAutoPilot, setIsAutoPilot, decisions,
    autoPilotThreshold, setAutoPilotThreshold, 
    autoPilotPlatforms, setAutoPilotPlatforms,
    initialView, initialClicheText, onClearClicheText 
}: MastermindDashboardProps) {
    const [briefing, setBriefing] = useState<MastermindBriefing | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [topVoiceProgress, setTopVoiceProgress] = useState(0);
    const [topPredictions, setTopPredictions] = useState<TrendForecast[]>([]);
    const [collabOpportunities, setCollabOpportunities] = useState<CollaborativeArticle[]>([]);

    useEffect(() => {
        // Load Top Voice & Oracle data
        const loadExtras = async () => {
            if (!apiKey) return;
            
            try {
                // Real Live Search for Collab Articles
                const articles = await findCollaborativeArticles("AI Agents", apiKey);
                setCollabOpportunities(articles.slice(0, 2));

                // Mock score for now until we pull real posts
                const score = calculateTopVoiceScore(["Strategy AI", "Strategy Growth", "Strategy Tech", "Leadership AI", "Sales AI"]).consistencyScore; 
                setTopVoiceProgress(score); 
                
                // Real Oracle Predictions
                // Real Oracle Predictions (Internal + External)
                const predictions = await oracleService.forecastTrendingTopics(apiKey, "AI Agents");
                setTopPredictions(predictions.slice(0, 3));
            } catch (e) {
                console.error("Failed to load dashboard extras", e);
            }
        };
        loadExtras();
    }, [apiKey]);

    const refreshBriefing = async () => {
        if (!apiKey || isLoading) return;
        setIsLoading(true);
        try {
            const data = await generateMastermindBriefing(trends, engagementTargets, queueCount, apiKey);
            setBriefing(data);
        } catch (e) {
            console.error("Briefing failed", e);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        refreshBriefing();
    }, [trends.length, engagementTargets.length, apiKey]);

    // View State for Deck
    const [viewMode, setViewMode] = useState<"dashboard" | "viral_deck" | "media_kit" | "cliche_killer">(
        (initialView as any) === 'cliche_killer' ? 'cliche_killer' : "dashboard"
    );
    const [draftText, setDraftText] = useState(initialClicheText || "");

    useEffect(() => {
        if (initialView === 'cliche_killer') {
             setViewMode('cliche_killer');
             if (initialClicheText) setDraftText(initialClicheText);
        }
    }, [initialView, initialClicheText]);

    if (viewMode === "viral_deck") {
        return (
            <div className="w-full h-full"> 
                <button onClick={() => setViewMode("dashboard")} className="mb-4 text-xs text-neutral-400 hover:text-white flex items-center gap-1">
                    ← Back to Dashboard
                </button>
                <EngagementDeck apiKey={apiKey || ""} />
            </div>
        );
    }

    if (viewMode === "media_kit") {
        return (
            <div className="w-full h-full"> 
                <button onClick={() => setViewMode("dashboard")} className="mb-4 text-xs text-neutral-400 hover:text-white flex items-center gap-1">
                    ← Back to Dashboard
                </button>
                <MediaKit apiKey={apiKey} />
            </div>
        );
    }

    if (viewMode === "cliche_killer") {
        return (
            <div className="w-full h-full"> 
                <button onClick={() => setViewMode("dashboard")} className="mb-4 text-xs text-neutral-400 hover:text-white flex items-center gap-1">
                    ← Back to Dashboard
                </button>
                <ClicheHighlighter 
                    initialText={draftText} 
                    apiKey={apiKey}
                    onClose={() => {
                        setViewMode("dashboard");
                        if (onClearClicheText) onClearClicheText();
                    }} 
                />
            </div>
        );
    }

    return (
        <div className="w-full space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Top Grid: Status Vitals */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard 
                    label="TREND SIGNALS" 
                    value={trends.length.toString()} 
                    trend="+4 NEW" 
                    icon={<Zap className="w-4 h-4 text-yellow-400" />} 
                    onClick={() => onViewChange('feed')}
                />
                <StatCard 
                    label="NETWORK TARGETS" 
                    value={engagementTargets.length.toString()} 
                    trend="READY" 
                    icon={<Target className="w-4 h-4 text-pink-400" />} 
                    onClick={() => onViewChange('network')}
                />
                <StatCard 
                    label="SCHEDULE QUEUE" 
                    value={queueCount.toString()} 
                    trend="ACTIVE" 
                    icon={<ListTodo className="w-4 h-4 text-blue-400" />} 
                    onClick={() => onViewChange('canvas')}
                />
                <StatCard 
                    label="MASTERMIND STATUS" 
                    value="SYNCED" 
                    icon={<Activity className="w-4 h-4 text-green-400" />} 
                />
                <RadialGaugeCard 
                    label="STRATEGIC ALIGNMENT" 
                    value={30} 
                    status="OFF TRACK"
                    color="#ef4444"
                />
            </div>

            {/* Oracle & Top Voice Panel */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Oracle Insights Preview */}
                <div className="bg-black/40 backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6 relative overflow-hidden group hover:border-purple-500/20 transition-all duration-300">
                     <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 to-transparent pointer-events-none" />
                     <div className="flex items-center justify-between mb-6 relative z-10">
                        <h3 className="text-sm font-bold text-white flex items-center gap-2">
                             <Target className="w-4 h-4 text-purple-400" />
                             Oracle Forecasts
                        </h3>
                        <span className="text-[10px] text-purple-300 font-mono font-bold tracking-wide">NEXT 7 DAYS</span>
                     </div>
                     <div className="space-y-3 relative z-10">
                         {topPredictions.length === 0 ? (
                             <div className="flex items-center gap-2 py-2">
                                 <ThinkingLoader />
                                 <span className="text-xs text-neutral-500 italic animate-pulse">Analysis pending...</span>
                             </div>
                         ) : (
                             topPredictions.map((pred, i) => (
                                    <div key={i} className="p-3 bg-white/5 rounded-lg border border-white/5 flex items-center justify-between group/item">
                                        <div className="flex flex-col">
                                            <span className="text-xs text-neutral-200 font-medium">{pred.topic}</span>
                                            <span className={`text-[9px] font-bold uppercase tracking-wider ${
                                                pred.source === "External" ? "text-purple-400" : "text-green-500"
                                            }`}>
                                                {pred.source === "External" ? "Market Signal" : "Validated"}
                                            </span>
                                        </div>
                                        <span className={`text-[10px] font-mono ${
                                            pred.source === "External" ? "text-purple-400 animate-pulse" : "text-green-400"
                                        }`}>+{Math.round(pred.momentum)} VELOCITY</span>
                                    </div>
                             ))
                         )}
                     </div>
                </div>

                {/* Collaborative Opportunities */}
                <div className="bg-black/40 backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6 relative overflow-hidden group hover:border-orange-500/20 transition-all duration-300">
                     <div className="absolute inset-0 bg-gradient-to-br from-orange-900/10 to-transparent pointer-events-none" />
                     <div className="flex items-center justify-between mb-6 relative z-10">
                        <h3 className="text-sm font-bold text-white flex items-center gap-2">
                             <Sparkles className="w-4 h-4 text-orange-400" />
                             Top Voice Opportunities
                        </h3>
                        <span className="text-[10px] text-orange-300 font-mono font-bold tracking-wide">GOLD BADGE PROTOCOL</span>
                     </div>
                     <div className="space-y-3 relative z-10">
                         {collabOpportunities.map((art, i) => (
                             <div key={i} className="p-3 bg-orange-500/5 rounded-lg border border-orange-500/20 hover:border-orange-500/40 transition-colors cursor-pointer group/item">
                                 <div className="flex items-start justify-between">
                                    <p className="text-xs text-neutral-100 font-medium line-clamp-1 group-hover/item:text-orange-200 transition-colors">{art.title}</p>
                                    <ArrowUpRight className="w-3 h-3 text-neutral-600 group-hover/item:text-orange-400" />
                                 </div>
                                 <div className="flex items-center gap-3 mt-2">
                                     <span className="text-[9px] text-neutral-400">{art.currentContributions} contributions</span>
                                     <span className="text-[9px] text-orange-500/80 font-bold">{art.badgePotential}% POTENTIAL</span>
                                 </div>
                             </div>
                         ))}
                     </div>
                </div>

                {/* Viral Engine Entry */}
                <div onClick={() => setViewMode("viral_deck")} className="bg-black/40 backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6 flex items-center justify-between group cursor-pointer hover:border-indigo-500/30 hover:shadow-[0_0_25px_rgba(99,102,241,0.1)] transition-all duration-300">
                     <div className="flex items-center gap-4">
                        <div className="p-3 bg-indigo-500/10 rounded-xl group-hover:scale-110 transition-transform">
                            <MessageSquare className="w-6 h-6 text-indigo-500" />
                        </div>
                        <div>
                            <h3 className="font-bold text-white">Viral Engine</h3>
                            <p className="text-xs text-neutral-400 group-hover:text-neutral-300 transition-colors">Farm engagement.</p>
                        </div>
                     </div>
                     <div className="flex items-center gap-2">
                         <span className="text-[10px] font-mono text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded uppercase">3 Opps</span>
                         <ArrowUpRight className="w-4 h-4 text-neutral-600 group-hover:text-indigo-400" />
                     </div>
                </div>

                {/* Media Agent Entry */}
                <div onClick={() => setViewMode("media_kit")} className="bg-black/40 backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6 flex items-center justify-between group cursor-pointer hover:border-pink-500/30 hover:shadow-[0_0_25px_rgba(236,72,153,0.1)] transition-all duration-300">
                     <div className="flex items-center gap-4">
                        <div className="p-3 bg-pink-500/10 rounded-xl group-hover:scale-110 transition-transform">
                            <Mic className="w-6 h-6 text-pink-500" />
                        </div>
                        <div>
                            <h3 className="font-bold text-white">Media Agent</h3>
                            <p className="text-xs text-neutral-400 group-hover:text-neutral-300 transition-colors">Podcast outreach.</p>
                        </div>
                     </div>
                     <div className="flex items-center gap-2">
                         <span className="text-[10px] font-mono text-pink-400 bg-pink-500/10 px-2 py-1 rounded uppercase">Auto</span>
                         <ArrowUpRight className="w-4 h-4 text-neutral-600 group-hover:text-pink-400" />
                     </div>
                </div>

                {/* Cliche Killer Entry */}
                <div onClick={() => setViewMode("cliche_killer")} className="bg-black/40 backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6 flex items-center justify-between group cursor-pointer hover:border-red-500/30 hover:shadow-[0_0_25px_rgba(239,68,68,0.1)] transition-all duration-300">
                     <div className="flex items-center gap-4">
                        <div className="p-3 bg-red-500/10 rounded-xl group-hover:scale-110 transition-transform">
                            <Type className="w-6 h-6 text-red-500" />
                        </div>
                        <div>
                            <h3 className="font-bold text-white">Cliche Killer</h3>
                            <p className="text-xs text-neutral-400 group-hover:text-neutral-300 transition-colors">Anti-generic defense.</p>
                        </div>
                     </div>
                     <div className="flex items-center gap-2">
                         <span className="text-[10px] font-mono text-red-400 bg-red-500/10 px-2 py-1 rounded uppercase">Active</span>
                         <ArrowUpRight className="w-4 h-4 text-neutral-600 group-hover:text-red-400" />
                     </div>
                </div>
            </div>


            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Briefing: High Density AI Intelligence */}
                <div className="lg:col-span-2 bg-black/40 backdrop-blur-xl border border-white/[0.06] rounded-3xl p-8 relative overflow-hidden group hover:border-indigo-500/20 transition-all duration-500">
                    <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:opacity-40 transition-opacity">
                        <Sparkles className="w-16 h-16 text-indigo-500" />
                    </div>
                    
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-8">
                             <h2 className="text-xl font-bold text-white flex items-center gap-3">
                                <LayoutDashboard className="w-6 h-6 text-indigo-400" />
                                Chief of Staff Briefing
                             </h2>
                             <button 
                                onClick={refreshBriefing}
                                className="p-2 hover:bg-white/5 rounded-full transition-colors text-neutral-500"
                             >
                                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                             </button>
                        </div>

                        {isLoading ? (
                            <div className="h-40 flex flex-col items-center justify-center gap-4 text-indigo-400">
                                <Loader2 className="w-8 h-8 animate-spin" />
                                <p className="text-xs font-mono animate-pulse">SYNTHESIZING MARKET INTELLIGENCE...</p>
                            </div>
                        ) : briefing ? (
                            <div className="space-y-8">
                                <div>
                                    <p className="text-lg text-white leading-relaxed font-medium italic mb-2 drop-shadow-md">
                                        "{briefing.summary}"
                                    </p>
                                    <div className="h-1 w-20 bg-indigo-500/50 rounded-full" />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {briefing.priorities.map((p, i) => (
                                        <div key={i} className="p-5 bg-white/5 border border-white/5 rounded-2xl hover:border-white/10 transition-colors">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                                    p.impact === 'High' ? 'bg-red-500/10 text-red-400' : 'bg-blue-500/10 text-blue-400'
                                                }`}>
                                                    {p.impact} IMPACT
                                                </span>
                                                <ArrowUpRight className="w-3 h-3 text-neutral-600" />
                                            </div>
                                            <p className="text-sm font-bold text-white mb-1">{p.task}</p>
                                            <p className="text-xs text-neutral-400">{p.reason}</p>
                                        </div>
                                    ))}
                                </div>

                                <div className="pt-6 border-t border-white/5">
                                    <p className="text-[10px] text-neutral-600 font-bold uppercase tracking-[0.2em]">VIBE CHECK</p>
                                    <p className="text-neutral-300 mt-1 font-mono text-xs">{briefing.vibeCheck}</p>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-20 opacity-50">
                                <p className="text-sm">Scout some trends or targets to generate a briefing.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Quick Action Side Panel */}
                <div className="space-y-6">
                    {/* Auto-Pilot Toggle */}
                    <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl mb-4">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 bg-indigo-500 rounded-lg">
                                    <Cpu className="w-3 h-3 text-white" />
                                </div>
                                <span className="text-[10px] font-black text-white uppercase tracking-tighter">Auto-Pilot</span>
                            </div>
                            <button 
                                onClick={() => setIsAutoPilot(!isAutoPilot)}
                                className={`w-10 h-5 rounded-full relative transition-colors ${isAutoPilot ? 'bg-indigo-500' : 'bg-neutral-800'}`}
                            >
                                <motion.div 
                                    animate={{ x: isAutoPilot ? 20 : 2 }}
                                    className="absolute top-1 w-3 h-3 bg-white rounded-full"
                                />
                            </button>
                        </div>

                        {isAutoPilot && (
                            <motion.div 
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="space-y-4 pt-2 border-t border-indigo-500/10"
                            >
                                {/* Threshold Slider */}
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <label className="text-[8px] font-bold text-neutral-500 uppercase">Quality Threshold</label>
                                        <span className="text-[10px] font-mono text-indigo-400">{autoPilotThreshold}%</span>
                                    </div>
                                    <input 
                                        type="range" 
                                        min="70" 
                                        max="99" 
                                        value={autoPilotThreshold}
                                        onChange={(e) => setAutoPilotThreshold(parseInt(e.target.value))}
                                        className="w-full h-1 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                                    />
                                    <p className="text-[7px] text-neutral-600 italic">Posts below {autoPilotThreshold}% will be held for review.</p>
                                </div>

                                {/* Platform Multi-Select */}
                                <div className="space-y-2">
                                    <label className="text-[8px] font-bold text-neutral-500 uppercase">Approved Channels</label>
                                    <div className="flex flex-wrap gap-1">
                                        {['linkedin', 'x', 'substack'].map(platform => (
                                            <button
                                                key={platform}
                                                onClick={() => {
                                                    if (autoPilotPlatforms.includes(platform)) {
                                                        setAutoPilotPlatforms(autoPilotPlatforms.filter(p => p !== platform));
                                                    } else {
                                                        setAutoPilotPlatforms([...autoPilotPlatforms, platform]);
                                                    }
                                                }}
                                                className={`px-2 py-1 rounded-md text-[8px] font-black uppercase transition-all border ${
                                                    autoPilotPlatforms.includes(platform)
                                                    ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300'
                                                    : 'bg-neutral-900 border-neutral-800 text-neutral-600'
                                                }`}
                                            >
                                                {platform}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </div>
                        <p className="text-[10px] text-neutral-400 leading-relaxed">
                            {isAutoPilot 
                                ? "Ghost Agent is active. High-integrity posts will be distributed autonomously." 
                                : "Manual approval required for all distribution."}
                        </p>

                    <div className="bg-indigo-600 rounded-3xl p-6 text-white shadow-xl shadow-indigo-600/10">
                        <h3 className="font-bold mb-2">Execute Daily Strategy</h3>
                        <p className="text-xs text-indigo-100 mb-6 opacity-80 leading-relaxed">
                            Market signals suggest focusing on 'Authority' today. Run a Volume Gen for maximum footprint.
                        </p>
                        <button 
                            onClick={() => onViewChange('feed')}
                            className="w-full py-3 bg-white text-indigo-600 font-black rounded-xl text-xs hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg hover:shadow-indigo-500/25 flex items-center justify-center gap-2"
                        >
                            GENERATE TODAY'S ASSETS
                        </button>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
                        <div className="flex items-center gap-2 text-white text-sm font-bold mb-4">
                            <History className="w-4 h-4 text-neutral-500" />
                            <span>Decision Log</span>
                        </div>
                        <div className="space-y-3">
                            {decisions.length === 0 ? (
                                <p className="text-[10px] text-neutral-600 italic">No autonomous decisions yet.</p>
                            ) : (
                                decisions.slice(0, 3).map((d, i) => (
                                    <div key={i} className="p-3 bg-black/20 rounded-xl border border-white/5">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-tighter">{d.action}</span>
                                            <span className="text-[8px] text-neutral-600">{d.platform.toUpperCase()}</span>
                                        </div>
                                        <p className="text-[10px] text-neutral-400 line-clamp-1">{d.reason}</p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
                        <h3 className="text-white text-sm font-bold mb-4">Latest Trends</h3>
                        <div className="space-y-3">
                            {trends.slice(0, 3).map((t, i) => (
                                <div key={i} className="flex items-center gap-3 text-xs text-neutral-400 p-2 hover:bg-white/5 rounded-lg transition-colors cursor-pointer" onClick={() => onViewChange('feed')}>
                                    <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
                                    <span className="line-clamp-1">{t.headline || t.title}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ label, value, trend, icon, onClick }: { label: string, value: string, trend?: string, icon: React.ReactNode, onClick?: () => void }) {
    return (
        <div 
            onClick={onClick}
            className={`bg-black/40 backdrop-blur-xl border border-white/[0.06] rounded-2xl p-5 hover:border-indigo-500/30 hover:shadow-[0_0_30px_rgba(99,102,241,0.08)] transition-all duration-300 group ${onClick ? 'cursor-pointer' : ''} shadow-[0_4px_20px_rgba(0,0,0,0.3)]`}
        >
            <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-white/[0.06] rounded-lg group-hover:scale-110 group-hover:bg-white/[0.1] transition-all duration-300">
                    {icon}
                </div>
                {trend && <span className="text-[10px] font-bold text-indigo-400/80 uppercase tracking-widest">{trend}</span>}
            </div>
            <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-[0.2em] group-hover:text-neutral-300 transition-colors">{label}</p>
            <p className="text-2xl font-black text-white mt-1 uppercase tracking-tighter">{value}</p>
        </div>
    );
}

function RadialGaugeCard({ label, value, status, color }: { label: string, value: number, status: string, color: string }) {
    return (
        <div className="relative bg-[#0c0c0c] border border-red-500/20 rounded-2xl p-5 shadow-[0_0_30px_rgba(239,68,68,0.05)] overflow-hidden group">
            {/* Pulsing Background Glow */}
            <div className="absolute inset-0 bg-red-500/5 animate-pulse" />
            
            <div className="relative z-10 flex flex-col items-center">
                <div className="relative w-20 h-20 mb-3">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                        <circle 
                            cx="50" cy="50" r="42" 
                            fill="none" 
                            stroke="rgba(255,255,255,0.03)" 
                            strokeWidth="10" 
                        />
                        <motion.circle 
                            cx="50" cy="50" r="42" 
                            fill="none" 
                            stroke={color} 
                            strokeWidth="10" 
                            strokeDasharray="264"
                            initial={{ strokeDashoffset: 264 }}
                            animate={{ strokeDashoffset: 264 - (264 * value) / 100 }}
                            strokeLinecap="round"
                            className="drop-shadow-[0_0_8px_rgba(239,68,68,0.4)]"
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-xl font-black text-white">{value}%</span>
                    </div>
                </div>
                
                <div className="text-center">
                    <p className="text-[9px] text-neutral-500 font-black uppercase tracking-[0.2em] mb-1">{label}</p>
                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-red-500/10 border border-red-500/20 rounded-full">
                        <div className="w-1 h-1 bg-red-500 rounded-full animate-ping" />
                        <span className="text-[9px] font-black text-red-500 uppercase tracking-widest">{status}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ThinkingLoader() {
    return (
        <div className="flex items-center gap-0.5 h-3">
            {[...Array(4)].map((_, i) => (
                <motion.div
                    key={i}
                    className="w-0.5 bg-purple-500/50 rounded-full"
                    animate={{ 
                        height: ["20%", "100%", "20%"],
                        opacity: [0.3, 1, 0.3]
                    }}
                    transition={{ 
                        duration: 0.8, 
                        repeat: Infinity, 
                        delay: i * 0.1,
                        ease: "easeInOut" 
                    }}
                />
            ))}
        </div>
    );
}
