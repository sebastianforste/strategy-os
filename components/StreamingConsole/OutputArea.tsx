/**
 * OutputArea Component
 * -------------------
 * Displays the generated output, previews, widgets, and loading states.
 * Extracted from StreamingConsole for maintainability.
 */

"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Bot, FileText, Clapperboard } from "lucide-react";
import SkeletonLoader from "../SkeletonLoader";
import LinkedInPreview from "../previews/LinkedInPreview";
import TwitterPreview from "../previews/TwitterPreview";
import SwotWidget, { SwotData } from "../widgets/SwotWidget";
import TrendWidget, { TrendData } from "../widgets/TrendWidget";
import { extractWidgets } from "../../utils/widget-parser";
import type { Citation } from "../../utils/citations";

export interface OutputAreaProps {
  isLoading: boolean;
  completion: string;
  localError: string | null;
  platform: "linkedin" | "twitter";
  onReset: () => void;
  onPublish: () => void;
  onNewGeneration: () => void;
  apiKey: string; // Add apiKey prop
  onUpdateCompletion?: (text: any) => void;
  onOpenRepurposing?: () => void;
  onOpenAuditor?: () => void;
  onOpenVideoArchitect?: () => void;
  ragConcepts?: string[];
  citations?: Citation[];
}

import { detectCliches, ClicheViolation } from "../../utils/cliche-detector";
import { calculateAuthorityScore, AuthorityScore } from "../../utils/authority-scorer";
import { useState, useMemo, useEffect } from "react";
import { AlertTriangle, X, Flame, ShieldCheck, Info, Zap, RefreshCw, Layers, ShieldAlert } from "lucide-react";
import RoastModal from "../RoastModal";
import { refineAuthorityAction, scoreViralityAction } from "../../actions/generate";
import { PersonaId } from "../../utils/personas";
import { sentinelService, SafetyReport } from "../../utils/sentinel-service";
import { StyleMemoryService, StyleDelta } from "../../utils/style-memory-service";
import { predictImpact, PredictionResult } from "../../utils/predictive-service";
import { Brain, Check, TrendingUp, BarChart3, ChevronDown, ChevronUp } from "lucide-react";

export default function OutputArea({
  isLoading,
  completion,
  localError,
  platform,
  onReset,
  onPublish,
  onNewGeneration,
  apiKey,
  personaId,
  onUpdateCompletion, 
  onOpenRepurposing,
  onOpenAuditor,
  onOpenVideoArchitect,
  ragConcepts = [],
  citations = []
}: OutputAreaProps & { personaId: PersonaId; onUpdateCompletion?: (text: string) => void; onOpenRepurposing?: () => void; onOpenAuditor?: () => void; onOpenVideoArchitect?: () => void; ragConcepts?: string[]; citations?: Citation[] }) {
  const [cliches, setCliches] = useState<ClicheViolation[]>([]);
  const [showClicheReport, setShowClicheReport] = useState(false);
  const [isRoastOpen, setIsRoastOpen] = useState(false);
  const [showAuthorityDetails, setShowAuthorityDetails] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [isPredicting, setIsPredicting] = useState(false);
  const [showPrediction, setShowPrediction] = useState(false);

  const authScore = useMemo(() => calculateAuthorityScore(completion), [completion]);
  const safetyReport = useMemo(() => sentinelService.scanForRisks(completion), [completion]);
  const [showSafetyModal, setShowSafetyModal] = useState(false);

  // Style Memory
  const [isLearningStyle, setIsLearningStyle] = useState(false);
  const [hasLearnedStyle, setHasLearnedStyle] = useState(false);
  const [originalText, setOriginalText] = useState(completion);

  // Detect if user has edited
  const isEdited = useMemo(() => {
    return completion !== originalText && completion.trim().length > 0;
  }, [completion, originalText]);

  // Reset original text when a NEW generation arrives (handled by parent onNewGeneration ideally, but we can sync)
  useEffect(() => {
    if (isLoading) {
        setHasLearnedStyle(false);
    }
    if (!isLoading && completion && !originalText) {
        setOriginalText(completion);
    }
  }, [isLoading, completion]);

  const handleLearnEdits = async () => {
    if (!apiKey || !onUpdateCompletion) return;
    setIsLearningStyle(true);
    
    try {
        const service = new StyleMemoryService(apiKey);
        const delta = await service.calculateStyleDelta(originalText, completion);
        service.saveDelta(personaId, delta);
        setHasLearnedStyle(true);
        setOriginalText(completion); // Mark this as the new baseline
    } catch (e) {
        console.error("Style learning failed:", e);
    } finally {
        setIsLearningStyle(false);
        setTimeout(() => setHasLearnedStyle(false), 3000);
    }
  };

  const handleRefine = async () => {
    setIsRefining(true);
    try {
      const refined = await refineAuthorityAction(completion, apiKey, personaId);
      if (onUpdateCompletion) {
        onUpdateCompletion(refined as any);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsRefining(false);
    }
  };

  const handleScan = () => {
    const found = detectCliches(completion);
    setCliches(found);
    setShowClicheReport(true);
  };

  const handlePredict = async () => {
    if (!apiKey || !completion) return;
    setIsPredicting(true);
    try {
      const result = await scoreViralityAction(completion, apiKey, personaId);
      setPrediction(result as any);
      setShowPrediction(true);
    } catch (e) {
      console.error("Prediction failed:", e);
    } finally {
      setIsPredicting(false);
    }
  };
  return (
    <div className="w-full h-auto min-h-[12rem] bg-transparent text-white p-6 prose prose-invert prose-sm max-w-none relative">
      {isLoading && !completion && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
          <div className="w-full h-full p-6 flex flex-col justify-center">
            <SkeletonLoader />
            <div className="mt-4 text-center">
              <span className="text-xs font-mono text-purple-300/80 animate-pulse tracking-[0.2em] uppercase bg-black/50 px-2 py-1 rounded backdrop-blur-sm border border-purple-500/20">
                Synthesizing Strategy...
              </span>
            </div>
          </div>
        </div>
      )}

      {localError && (
        <div className="flex flex-col items-center justify-center h-48 text-center space-y-4">
          <div className="p-4 bg-red-950/30 border border-red-900/50 rounded-xl backdrop-blur-md max-w-sm shadow-xl">
            <p className="text-sm text-red-400 font-mono">{localError}</p>
          </div>
          <button
            onClick={onReset}
            className="text-xs text-neutral-500 hover:text-white underline underline-offset-4"
          >
            RESET
          </button>
        </div>
      )}

      {!localError && completion && (
        <div className="space-y-6">
          {/* Authority Scorer & Cliche Scanner Bar */}
          <div className="flex flex-col gap-3">
             <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                <div className="flex items-center gap-3">
                   <div className={`p-2 rounded-xl scale-90 ${authScore.score > 70 ? 'bg-purple-500/20 text-purple-400' : 'bg-neutral-500/20 text-neutral-400'}`}>
                      <ShieldCheck className="w-5 h-5" />
                   </div>
                   <div>
                      <div className="flex items-center gap-2">
                         <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest">Authority Level</span>
                         <span className="text-[10px] font-bold text-white uppercase">{authScore.level}</span>
                      </div>
                      <div className="w-32 h-1 bg-white/10 rounded-full mt-1 overflow-hidden">
                         <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${authScore.score}%` }}
                            className={`h-full ${authScore.score > 70 ? 'bg-purple-500' : authScore.score > 40 ? 'bg-blue-500' : 'bg-neutral-500'}`}
                         />
                      </div>
                   </div>
                </div>
                <div className="flex items-center gap-2">
                   {authScore.score < 75 && (
                      <button 
                        onClick={handleRefine}
                        disabled={isRefining}
                        className={`px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white text-[10px] font-bold rounded-xl transition-all border border-white/10 flex items-center gap-2 ${isRefining ? 'opacity-50' : ''}`}
                      >
                         {isRefining ? (
                            <RefreshCw className="w-3 h-3 animate-spin" />
                         ) : (
                            <Zap className="w-3 h-3 text-yellow-500" />
                         )}
                         REFINE PRESENCE
                      </button>
                   )}
                   <button 
                      onClick={() => setShowAuthorityDetails(!showAuthorityDetails)}
                      className="p-2 hover:bg-white/5 rounded-lg transition-all text-neutral-500 hover:text-white"
                      title="Show Authority Breakdown"
                   >
                      <Info className="w-4 h-4" />
                   </button>
                    <button 
                       onClick={handlePredict}
                       disabled={isPredicting}
                       className="px-4 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 text-[10px] font-bold rounded-xl transition-all border border-indigo-500/20 flex items-center gap-2"
                    >
                       {isPredicting ? <RefreshCw className="w-3 h-3 animate-spin" /> : <TrendingUp className="w-3 h-3" />}
                       PREDICT PERFORMANCE
                    </button>
                    <button 
                       onClick={handleScan}
                       className="px-4 py-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 text-[10px] font-bold rounded-xl transition-all border border-purple-500/20"
                    >
                       SCAN CLICHES
                    </button>
                 </div>
              </div>

              <AnimatePresence>
                {showPrediction && prediction && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-6 bg-indigo-500/5 border border-indigo-500/20 rounded-2xl mb-4 relative">
                        <div className="flex items-center justify-between mb-6">
                            <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                <BarChart3 className="w-4 h-4" /> Predictive Intelligence
                            </h4>
                            <button onClick={() => setShowPrediction(false)} className="text-neutral-500 hover:text-white">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Visual Score */}
                            <div className="flex flex-col items-center justify-center border-r border-white/5 pr-4">
                                <div className="relative w-24 h-24">
                                    <svg className="w-full h-full" viewBox="0 0 100 100">
                                        <circle 
                                            cx="50" cy="50" r="45" 
                                            fill="none" 
                                            stroke="rgba(255,255,255,0.05)" 
                                            strokeWidth="8" 
                                        />
                                        <motion.circle 
                                            cx="50" cy="50" r="45" 
                                            fill="none" 
                                            stroke="url(#scoreGradient)" 
                                            strokeWidth="8" 
                                            strokeDasharray="283"
                                            initial={{ strokeDashoffset: 283 }}
                                            animate={{ strokeDashoffset: 283 - (283 * prediction.score) / 100 }}
                                            strokeLinecap="round"
                                        />
                                        <defs>
                                            <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                                <stop offset="0%" stopColor="#6366f1" />
                                                <stop offset="100%" stopColor="#a855f7" />
                                            </linearGradient>
                                        </defs>
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className="text-2xl font-black text-white">{prediction.score}</span>
                                        <span className="text-[7px] text-neutral-500 uppercase font-mono">Virality</span>
                                    </div>
                                </div>
                                <p className="text-[10px] text-neutral-400 italic mt-4 text-center">"{prediction.critique}"</p>
                            </div>

                            {/* Breakdown & Tips */}
                            <div className="space-y-4">
                                <div className="space-y-3">
                                    <BreakdownRow label="Hook Strength" value={prediction.breakdown.hookStrength} color="bg-indigo-500" />
                                    <BreakdownRow label="Retainability" value={prediction.breakdown.retainability} color="bg-blue-500" />
                                    <BreakdownRow label="Virality Potential" value={prediction.breakdown.viralityPotential} color="bg-purple-500" />
                                </div>

                                <div className="space-y-2">
                                    <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Growth Tactics</p>
                                    <div className="space-y-1.5">
                                        {prediction.improvementTips.map((tip, i) => (
                                            <div key={i} className="flex items-start gap-2 text-xs text-neutral-300">
                                                <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5 shrink-0" />
                                                {tip}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

             <AnimatePresence>
                {showAuthorityDetails && (
                   <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                   >
                      <div className="p-4 bg-neutral-900 border border-white/5 rounded-2xl mb-4 text-xs space-y-4">
                         <div className="grid grid-cols-2 gap-4">
                            {Object.entries(authScore.breakdown).map(([key, val]) => (
                               <div key={key}>
                                  <div className="flex justify-between text-[10px] uppercase text-neutral-500 mb-1">
                                     <span>{key}</span>
                                     <span>{val}%</span>
                                  </div>
                                  <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                     <div className="h-full bg-neutral-500" style={{ width: `${val}%` }} />
                                  </div>
                               </div>
                            ))}
                         </div>
                         {authScore.suggestions.length > 0 && (
                            <div className="pt-2 border-t border-white/5">
                               <p className="text-[10px] font-bold text-neutral-400 uppercase mb-2">Refinement Suggestions</p>
                               <ul className="space-y-1">
                                  {authScore.suggestions.map((s, i) => (
                                     <li key={i} className="flex items-center gap-2 text-neutral-500">
                                        <div className="w-1 h-1 bg-purple-500 rounded-full" />
                                        {s}
                                     </li>
                                  ))}
                               </ul>
                            </div>
                         )}
                      </div>
                   </motion.div>
                )}
             </AnimatePresence>
          </div>

          {/* Cliche Report Panel */}
          <AnimatePresence>
            {showClicheReport && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-red-950/20 border border-red-500/20 rounded-xl overflow-hidden mb-4"
              >
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-bold text-red-200 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-400" />
                      Cliche Report ({cliches.length} found)
                    </h4>
                    <button onClick={() => setShowClicheReport(false)} className="text-neutral-500 hover:text-white">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  
                  {cliches.length === 0 ? (
                     <p className="text-sm text-green-400">✅ Clean content! No weak words detected.</p>
                  ) : (
                    <div className="space-y-2">
                      {cliches.map((c, i) => (
                        <div key={i} className="flex items-center justify-between text-xs bg-red-500/10 p-2 rounded border border-red-500/10">
                          <span className="text-red-300 font-mono line-through opacity-70">{c.word}</span>
                          <span className="text-neutral-400">→</span>
                          <span className="text-green-300 font-bold">{c.replacement}</span>
                        </div>
                      ))}
                    </div>
                )}

                {/* Learn My Edits Button */}
                {isEdited && (
                    <div className="flex justify-center mt-2">
                        <button 
                            onClick={handleLearnEdits}
                            disabled={isLearningStyle || hasLearnedStyle}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all border text-xs font-bold ${
                                hasLearnedStyle 
                                ? 'bg-green-500/20 text-green-400 border-green-500/20' 
                                : 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border-amber-500/20'
                            }`}
                        >
                            {isLearningStyle ? (
                                <RefreshCw className="w-3 h-3 animate-spin" />
                            ) : hasLearnedStyle ? (
                                <Check className="w-3 h-3" />
                            ) : (
                                <Brain className="w-3 h-3" />
                            )}
                            {isLearningStyle ? 'Analyzing Style...' : hasLearnedStyle ? 'Style Updated 🧠' : 'Learn My Edits'}
                        </button>
                    </div>
                )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Widget Parsing */}
          {(() => {
            const { cleanContent, widgets } = extractWidgets(completion);

            return (
              <>
                {/* Native-style Preview Card */}
                <div className="flex justify-center py-2">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={platform}
                      initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
                      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                      exit={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
                      transition={{ duration: 0.5, ease: "circOut" }}
                      className="w-full flex justify-center"
                    >
                      {platform === "linkedin" ? (
                        <LinkedInPreview content={cleanContent} />
                      ) : (
                        <TwitterPreview content={cleanContent} />
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Widgets Area */}
                <AnimatePresence>
                  {widgets.map((widget, idx) => (
                    <motion.div
                      key={`widget-${idx}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 * idx }}
                    >
                      {widget.type === "swot" && <SwotWidget data={widget.data as SwotData} />}
                      {widget.type === "trend" && <TrendWidget data={widget.data as TrendData} />}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </>
            );
          })()}

          {isLoading && completion && (
            <div className="flex justify-center">
              <motion.span
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-mono animate-pulse"
              >
                <Sparkles className="w-3 h-3" />
                Generating...
              </motion.span>
            </div>
          )}

          {!isLoading && completion && (
            <div className="flex flex-col gap-4">
              {/* Strategic Grounding (RAG) */}
              {ragConcepts.length > 0 && (
                <div className="p-4 bg-indigo-500/5 border border-indigo-500/20 rounded-2xl">
                  <h4 className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Brain className="w-4 h-4" />
                    Strategic Grounding (RAG)
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {ragConcepts.map((concept, i) => (
                      <span key={i} className="text-[10px] px-3 py-1 bg-indigo-500/10 text-indigo-300 rounded-lg border border-indigo-500/10">
                        {concept}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Sources Used (Citations) */}
              {citations.length > 0 && (
                <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl">
                  <h4 className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Sources Used
                  </h4>
                  <div className="space-y-2">
                    {citations.slice(0, 10).map((c, i) => {
                      const label = (c.title || c.url || c.id).toString();
                      return (
                        <div key={`${c.id}-${i}`} className="flex items-start justify-between gap-3 text-xs">
                          <div className="min-w-0">
                            <div className="text-[10px] text-neutral-500 font-mono uppercase tracking-widest">
                              {c.source} {typeof c.chunkIndex === "number" ? `• chunk ${c.chunkIndex + 1}` : ""}
                            </div>
                            {c.url ? (
                              <a
                                href={c.url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-emerald-200 hover:text-white underline underline-offset-4 break-words"
                              >
                                {label}
                              </a>
                            ) : (
                              <div className="text-emerald-200 break-words">{label}</div>
                            )}
                          </div>
                          <div className="text-[10px] text-neutral-600 font-mono shrink-0">{i + 1}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="mt-4 p-5 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-white/5 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4 backdrop-blur-sm">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-500/20 rounded-2xl shadow-lg shadow-blue-500/10">
                    <Bot className="w-6 h-6 text-blue-400" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold text-white">Autonomous Agent Ready</p>
                    <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-mono">
                      Platform: {platform}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    {/* Sentinel Badge */}
                    <div 
                        className={`px-3 py-2 rounded-xl flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider cursor-pointer transition-all hover:scale-105 ${sentinelService.getSeverityColor(safetyReport.overallSeverity)} text-white`}
                        onClick={() => setShowSafetyModal(true)}
                        title="Brand Safety Status"
                    >
                        <ShieldCheck className="w-4 h-4" />
                        {sentinelService.getSeverityLabel(safetyReport.overallSeverity)}
                    </div>
                    
                    <button
                      onClick={() => {
                          if (!safetyReport.isPublishable) {
                              setShowSafetyModal(true);
                          } else {
                              onPublish();
                          }
                      }}
                      className={`flex-1 sm:flex-initial px-8 py-3 font-black rounded-2xl text-[10px] tracking-tighter transition-all shadow-xl ${safetyReport.isPublishable ? 'bg-white text-black hover:scale-105 shadow-white/5' : 'bg-red-600 text-white cursor-not-allowed opacity-70'}`}
                    >
                      {safetyReport.isPublishable ? 'PUBLISH NOW' : 'BLOCKED'}
                    </button>
                </div>
              </div>

              {/* Safety Report Modal */}
              <AnimatePresence>
                  {showSafetyModal && (
                      <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
                          onClick={() => setShowSafetyModal(false)}
                      >
                          <motion.div
                              initial={{ scale: 0.9 }}
                              animate={{ scale: 1 }}
                              exit={{ scale: 0.9 }}
                              onClick={(e) => e.stopPropagation()}
                              className="bg-neutral-900 border border-white/10 rounded-2xl p-6 max-w-lg w-full shadow-2xl"
                          >
                              <div className="flex items-center justify-between mb-6">
                                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                      <ShieldCheck className={`w-5 h-5 ${safetyReport.isPublishable ? 'text-green-400' : 'text-red-400'}`} />
                                      Sentinel Safety Report
                                  </h3>
                                  <button onClick={() => setShowSafetyModal(false)} className="text-neutral-500 hover:text-white">
                                      <X className="w-5 h-5" />
                                  </button>
                              </div>
                              {safetyReport.flags.length === 0 ? (
                                  <p className="text-sm text-green-400">✅ All clear! No brand safety issues detected.</p>
                              ) : (
                                  <div className="space-y-3 max-h-80 overflow-y-auto custom-scrollbar">
                                      {safetyReport.flags.map((flag, i) => (
                                          <div key={i} className={`p-4 rounded-xl border ${flag.severity === 'HIGH' || flag.severity === 'CRITICAL' ? 'bg-red-500/10 border-red-500/30' : flag.severity === 'MEDIUM' ? 'bg-yellow-500/10 border-yellow-500/30' : 'bg-blue-500/10 border-blue-500/30'}`}>
                                              <div className="flex items-center justify-between mb-2">
                                                  <span className="text-xs font-bold uppercase text-neutral-400">{flag.category}</span>
                                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${sentinelService.getSeverityColor(flag.severity)} text-white`}>{flag.severity}</span>
                                              </div>
                                              <p className="text-sm text-neutral-200 mb-2">{flag.description}</p>
                                              <p className="text-xs text-neutral-500 italic">💡 {flag.suggestion}</p>
                                          </div>
                                      ))}
                                  </div>
                              )}
                          </motion.div>
                      </motion.div>
                  )}
              </AnimatePresence>

               {/* Roast Button */}
               <div className="flex justify-center">
                  <button 
                    onClick={() => setIsRoastOpen(true)}
                    className="flex items-center gap-2 text-xs text-red-400 hover:text-red-300 transition-colors opacity-50 hover:opacity-100"
                  >
                    <Flame className="w-3 h-3" />
                  </button>
               </div>

               {/* Repurpose Button */}
               {onOpenRepurposing && (
                   <div className="flex justify-center mt-2">
                      <button 
                        onClick={onOpenRepurposing}
                        className="flex items-center gap-2 px-4 py-2 bg-pink-500/10 hover:bg-pink-500/20 text-pink-400 text-xs font-bold rounded-xl transition-all border border-pink-500/20"
                      >
                        <Layers className="w-3 h-3" />
                        Repurpose (Synthesize 3 Variants)
                      </button>
                   </div>
               )}

               {/* Audit Strategy Button */}
               {onOpenAuditor && (
                   <div className="flex justify-center mt-2">
                       <button 
                           onClick={onOpenAuditor}
                           className="flex items-center gap-2 px-4 py-2 bg-indigo-500/10 hover:bg-indigo-600/20 text-indigo-400 text-xs font-bold rounded-xl transition-all border border-indigo-500/20"
                       >
                           <ShieldAlert className="w-3 h-3" />
                           Audit Strategy (Red Team)
                       </button>
                   </div>
               )}
                {/* Video Architect Button */}
                {onOpenVideoArchitect && (
                    <div className="flex justify-center mt-2">
                        <button 
                            onClick={onOpenVideoArchitect}
                            className="flex items-center gap-2 px-4 py-2 bg-brand-500/10 hover:bg-brand-600/20 text-brand-400 text-xs font-bold rounded-xl transition-all border border-brand-500/20"
                        >
                            <Clapperboard className="w-3 h-3" />
                            Architect Video
                        </button>
                    </div>
                )}

              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                onClick={onNewGeneration}
                className="mx-auto text-xs text-neutral-500 hover:text-white underline underline-offset-4 block transition-colors my-4"
              >
                NEW GENERATION
              </motion.button>
            </div>
          )}
        </div>
      )}
      <RoastModal isOpen={isRoastOpen} onClose={() => setIsRoastOpen(false)} postContent={completion} apiKey={apiKey} />
    </div>
  );
}

function BreakdownRow({ label, value, color }: { label: string, value: number, color: string }) {
    return (
        <div>
            <div className="flex justify-between text-[10px] uppercase text-neutral-500 mb-1">
                <span>{label}</span>
                <span className="text-white font-mono">{value}%</span>
            </div>
            <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${value}%` }}
                    className={`h-full ${color}`}
                />
            </div>
        </div>
    );
}
