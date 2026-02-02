"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BarChart3, TrendingUp, Lightbulb, RefreshCw, Award, ThumbsUp, MessageSquare, Share2, X, Dna, Sparkles, Loader2 } from "lucide-react";
import { generateAnalyticsReport, AnalyticsInsight } from "../utils/analytics-service";
import { evolvePersona, EvolutionReport } from "../utils/evolution-service";
import { PERSONAS, PersonaId } from "../utils/personas";
import EvolutionModal from "./EvolutionModal";

interface AnalyticsDashboardProps {
    isOpen: boolean;
    onClose: () => void;
    apiKey: string;
    onPersonaMutated?: (mutatedPrompt: string) => void;
}

export default function AnalyticsDashboard({ isOpen, onClose, apiKey, onPersonaMutated }: AnalyticsDashboardProps) {
    const [insights, setInsights] = useState<AnalyticsInsight | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isEvolving, setIsEvolving] = useState(false);
    const [evolutionReport, setEvolutionReport] = useState<EvolutionReport | null>(null);

    useEffect(() => {
        if (isOpen && !insights) {
            loadAnalytics();
        }
    }, [isOpen]);

    const loadAnalytics = async () => {
        setIsLoading(true);
        try {
            // Priority: Try to fetch real-world analytics from DB/API
            const response = await fetch("/api/analytics/dashboard");
            if (response.ok) {
                const data = await response.json();
                setInsights(data);
                return;
            }
            
            // Fallback: Generate intelligence from local archived data + AI synthesis
            console.warn("API Analytics failed, falling back to local.");
            const report = await generateAnalyticsReport(apiKey);
            setInsights(report);
        } catch (e) {
            console.error("Failed to load real-time analytics, falling back to local archive", e);
            const report = await generateAnalyticsReport(apiKey);
            setInsights(report);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRunDarwin = async () => {
        if (!insights || insights.topPerformers.length === 0) {
            alert("Project Darwin requires at least one high-performing post to begin stylistic mutation.");
            return;
        }

        setIsEvolving(true);
        try {
            // Currently evolving the 'cso' persona by default, or the current selected one if we pass it
            const currentPersona = PERSONAS.cso; 
            const report = await evolvePersona(currentPersona, insights.topPerformers, apiKey);
            setEvolutionReport(report);
        } catch (e) {
            alert(`Evolution failed: ${e instanceof Error ? e.message : "Unknown error"}`);
        } finally {
            setIsEvolving(false);
        }
    };

    const handleApplyMutation = (newPrompt: string) => {
        if (onPersonaMutated) {
            onPersonaMutated(newPrompt);
        }
        setEvolutionReport(null);
        alert("Persona DNA successfully updated. Future generations will use the evolved instructions.");
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 z-[80] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-neutral-900 border border-white/10 rounded-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden shadow-2xl flex flex-col"
                >
                    {/* Header */}
                    <div className="p-6 border-b border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl">
                                <BarChart3 className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h3 className="font-bold text-white">Intelligence Dashboard</h3>
                                <p className="text-xs text-neutral-500 font-mono tracking-tighter uppercase">DARWIN ENGINE v4.0</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button 
                                onClick={loadAnalytics} 
                                disabled={isLoading}
                                className="p-2 text-neutral-500 hover:text-white transition-colors"
                            >
                                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                            </button>
                            <button onClick={onClose} className="text-neutral-500 hover:text-white transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center h-64 gap-4">
                                <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
                                <p className="text-sm text-neutral-500 font-mono text-center">SYNCING ENGAGEMENT DATABASE...<br/><span className="text-[10px] opacity-50">EXTRACTING STYLISTIC PATTERNS</span></p>
                            </div>
                        ) : insights ? (
                            <>
                                {/* Stats Row */}
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                    <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                                        <div className="text-3xl font-black text-white">{insights.topPerformers.length}</div>
                                        <div className="text-[10px] text-neutral-500 uppercase tracking-wider mt-1">Top Performers</div>
                                    </div>
                                    <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                                        <div className="text-3xl font-black text-indigo-400">{insights.averageEngagement}</div>
                                        <div className="text-[10px] text-neutral-500 uppercase tracking-wider mt-1">Avg. Eng.</div>
                                    </div>
                                    <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                                        <div className="text-3xl font-black text-green-400">{insights.trendingTopics.length}</div>
                                        <div className="text-[10px] text-neutral-500 uppercase tracking-wider mt-1">Topics</div>
                                    </div>
                                    <div className="p-4 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-xl border border-amber-500/30">
                                        <div className="text-3xl font-black text-amber-400">
                                            {insights.topPerformers.length > 0 
                                                ? Math.round(insights.topPerformers.reduce((acc, p) => acc + (p.performance?.dwellScore || 0), 0) / insights.topPerformers.length)
                                                : 0}
                                        </div>
                                        <div className="text-[10px] text-amber-500 uppercase tracking-wider mt-1">Avg Dwell Score</div>
                                    </div>
                                </div>

                                {/* Persona Leaderboard */}
                                {insights.personaPerformance && Object.keys(insights.personaPerformance).length > 0 && (
                                    <div className="p-5 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md">
                                        <h4 className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                            <Award className="w-3.5 h-3.5 text-indigo-400" /> Persona Performance (Avg. Engagement)
                                        </h4>
                                        <div className="space-y-4">
                                            {Object.entries(insights.personaPerformance)
                                                .sort(([, a], [, b]) => (b as number) - (a as number))
                                                .map(([persona, score]) => (
                                                    <div key={persona} className="space-y-1.5">
                                                        <div className="flex justify-between text-[11px] font-bold">
                                                            <span className="text-neutral-300 uppercase italic">{persona}</span>
                                                            <span className="text-white">{score} XP</span>
                                                        </div>
                                                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                                            <motion.div 
                                                                initial={{ width: 0 }}
                                                                animate={{ width: `${Math.min(100, (score / 100) * 100)}%` }}
                                                                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                                                            />
                                                        </div>
                                                    </div>
                                                ))}
                                        </div>
                                    </div>
                                )}

                                {/* Project Darwin (Evolution) */}
                                <div className="p-6 bg-indigo-500/5 border border-indigo-500/20 rounded-2xl relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                                        <Dna className="w-24 h-24 text-indigo-400" />
                                    </div>
                                    <div className="relative z-10 flex items-center justify-between gap-6">
                                        <div className="space-y-1 flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Sparkles className="w-4 h-4 text-indigo-400" />
                                                <h4 className="text-xs font-black text-indigo-300 uppercase tracking-[0.2em]">Project Darwin Active</h4>
                                            </div>
                                            <p className="text-sm text-white font-bold leading-tight">Self-Evolving Persona Engine</p>
                                            <p className="text-[10px] text-neutral-500 leading-relaxed max-w-sm">
                                                Based on your top {insights.topPerformers.length} performers, the engine can now mutate your persona to replicate winning stylistic traits.
                                            </p>
                                        </div>
                                        <button 
                                            onClick={handleRunDarwin}
                                            disabled={isEvolving || insights.topPerformers.length === 0}
                                            className={`px-6 py-3 rounded-xl text-xs font-black uppercase transition-all flex items-center gap-2 shadow-lg ${
                                                isEvolving ? 'bg-indigo-500/50 text-white cursor-wait' : 'bg-indigo-500 hover:bg-indigo-400 text-white shadow-indigo-500/20'
                                            }`}
                                        >
                                            {isEvolving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Dna className="w-3.5 h-3.5" />}
                                            {isEvolving ? 'Mutating DNA...' : 'Initialize Evolution'}
                                        </button>
                                    </div>
                                </div>

                                {/* Top Performers */}
                                {insights.topPerformers.length > 0 && (
                                    <div className="space-y-3">
                                        <h4 className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest flex items-center gap-2">
                                            <Award className="w-3 h-3 text-amber-500" /> Top Performing Content
                                        </h4>
                                        <div className="space-y-2">
                                            {insights.topPerformers.map((post, i) => (
                                                <div key={post.id} className="p-3 bg-black/30 rounded-lg border border-white/5 flex items-start gap-3">
                                                    <div className="w-6 h-6 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center text-[10px] font-black text-white shrink-0">
                                                        {i + 1}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-xs text-white font-medium truncate">{post.topic}</p>
                                                        <div className="flex items-center gap-3 mt-1 text-[10px] text-neutral-500">
                                                            <span className="flex items-center gap-1 font-mono"><ThumbsUp className="w-2.5 h-2.5" /> {post.performance?.likes || 0}</span>
                                                            <span className="flex items-center gap-1 font-mono"><MessageSquare className="w-2.5 h-2.5" /> {post.performance?.comments || 0}</span>
                                                            <span className="flex items-center gap-1 font-mono"><Share2 className="w-2.5 h-2.5" /> {post.performance?.shares || 0}</span>
                                                            <span className="flex items-center gap-1 font-mono text-indigo-400"><Sparkles className="w-2.5 h-2.5" /> Dwell: {post.performance?.dwellScore || 0}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* AI Recommendations */}
                                {insights.recommendations.length > 0 && (
                                    <div className="space-y-3">
                                        <h4 className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest flex items-center gap-2">
                                            <Lightbulb className="w-3 h-3 text-amber-400" /> Strategic Recommendations
                                        </h4>
                                        <div className="p-4 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-xl border border-indigo-500/20 space-y-3 shadow-[0_0_30px_rgba(99,102,241,0.05)]">
                                            {insights.recommendations.map((rec, i) => (
                                                <div key={i} className="flex items-start gap-2">
                                                    <TrendingUp className="w-3 h-3 text-indigo-400 mt-0.5 shrink-0" />
                                                    <p className="text-xs text-neutral-300 leading-relaxed italic">"{rec}"</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {insights.topPerformers.length === 0 && (
                                    <div className="text-center py-12 text-neutral-500">
                                        <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-30" />
                                        <p className="text-sm font-bold text-white">No performance data yet.</p>
                                        <p className="text-xs mt-1 max-w-xs mx-auto">Add metrics to your archived strategies in the Vault to see insights and unlock Project Darwin.</p>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="text-center py-12 text-neutral-500 flex flex-col items-center">
                                <ShieldAlert className="w-8 h-8 mb-2 opacity-50" />
                                <p>Failed to load intelligence report</p>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>

            <EvolutionModal 
                isOpen={!!evolutionReport}
                onClose={() => setEvolutionReport(null)}
                report={evolutionReport}
                onApply={handleApplyMutation}
            />
        </>
    );
}

// Sub-component for ShieldAlert since it wasn't imported
function ShieldAlert({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/>
            <path d="M12 8v4"/>
            <path d="M12 16h.01"/>
        </svg>
    )
}
