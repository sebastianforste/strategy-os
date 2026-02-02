/**
 * STREAMING CONSOLE - The Command Center of StrategyOS
 * ----------------------------------------------------
 * Phase 17 Refactored Modular Architecture
 * 
 * Features:
 * - Newsjacking & Signal Analysis
 * - Swarm Intelligence Council
 * - Multi-Modal Generation (Text, Video, Audio)
 * - Agentic Loop (Self-Improving Research)
 * - Strategy Archive & Cloud SQL Persistence
 */

"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Database, FileText, Bot } from "lucide-react";

// Types
import { StreamingConsoleProps, DEFAULT_STARTER_CHIPS } from "./StreamingConsole/types";

// Hooks
import { useInput } from "./StreamingConsole/hooks/useInput";
import { useGeneration } from "./StreamingConsole/hooks/useGeneration";

// Components
import ToolBar from "./StreamingConsole/ToolBar";
import InputArea from "./StreamingConsole/InputArea";
import OutputArea from "./StreamingConsole/OutputArea";
import PredictionPanel from "./StreamingConsole/PredictionPanel";
import StrategyCanvas from "./StrategyCanvas";

// Modals
import TemplateLibraryModal from "./TemplateLibraryModal";
import ComplianceExportModal from "./ComplianceExportModal";
import PostingApprovalModal from "./PostingApprovalModal";
import VoiceTrainerModal from "./VoiceTrainerModal";
import AssetGallery from "./AssetGallery";
import ClonePersonaModal from "./ClonePersonaModal";
import AnalyticsDashboard from "./AnalyticsDashboard";
import ScheduleQueueDashboard from "./ScheduleQueueDashboard";
import BatchGeneratorModal from "./BatchGeneratorModal";
import AccountSettingsModal from "./AccountSettingsModal";
import TeamSettingsModal from "./TeamSettingsModal";
import TerminalConsole from "./TerminalConsole";
import LiveSession from "./Voice/LiveSession";

// Services
import { getTrainingPosts } from "../utils/voice-training-service";
import { getCustomPersonas } from "../utils/persona-store";
import { processInputAgentic } from "../actions/generate";
import { ResearchProgress } from "../utils/research-service";
import { createPostingJob } from "../utils/posting-agent";
import { logger } from "../utils/logger";

const log = logger.scope("StreamingConsole");

export default function StreamingConsole(props: StreamingConsoleProps) {
  const {
    initialValue,
    onGenerationComplete,
    apiKeys,
    personaId,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    setPersonaId,
    useNewsjack,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    setUseNewsjack,
    useRAG,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    setUseRAG,
    useFewShot,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    setUseFewShot,
    useSwarm,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    setUseSwarm,
    platform,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    setPlatform,
    onError,
  } = props;

  // --- STATE ---
  const [viewMode, setViewMode] = useState<"feed" | "canvas">("feed");
  const [useAgenticMode, setUseAgenticMode] = useState(false);
  const [useTerminalMode, setUseTerminalMode] = useState(false);
  const [trainingExamples, setTrainingExamples] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [customPersonas, setCustomPersonas] = useState<any[]>([]);
  const [outputFormat, setOutputFormat] = useState<"text" | "video" | "audio">("text");
  
  // Agentic Mode State
  const [isAgenticRunning, setIsAgenticRunning] = useState(false);
  const [agenticPhase, setAgenticPhase] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [agenticScore, setAgenticScore] = useState<number | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [agenticIteration, setAgenticIteration] = useState(0);

  // Modals Visibility
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [isVoiceTrainerOpen, setIsVoiceTrainerOpen] = useState(false);
  const [isComplianceOpen, setIsComplianceOpen] = useState(false);
  const [isPostingModalOpen, setIsPostingModalOpen] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [isCloneModalOpen, setIsCloneModalOpen] = useState(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [isBatchOpen, setIsBatchOpen] = useState(false);
  const [isAccountSettingsOpen, setIsAccountSettingsOpen] = useState(false);
  const [isTeamSettingsOpen, setIsTeamSettingsOpen] = useState(false);
  const [isLiveSessionOpen, setIsLiveSessionOpen] = useState(false);

  // Persistence State
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [currentPostingJob, setCurrentPostingJob] = useState<any>(null);

  // --- HOOKS ---
  const {
    input,
    setInput,
    images,
    setImages,
    signals,
    isFetchingSignals,
    dynamicChips,
    getRootProps,
    getInputProps,
    isDragActive,
    removeImage,
    prediction,
    setPrediction,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } = useInput({ apiKeys, useNewsjack, initialValue }) as any;

  const {
    handleGenerate,
    completion,
    isLoading,
    isSwarmRunning,
    swarmMessages,
    activeSwarmRole,
    setSwarmMessages,
    localError,
    setLocalError,
  } = useGeneration({
    apiKeys,
    personaId,
    useNewsjack,
    useRAG,
    useFewShot,
    useSwarm,
    platform,
    images,
    signals,
    trainingExamples,
    customPersonas,
    outputFormat,
    onGenerationComplete,
    onError,
  });

  // --- EFFECTS ---
  useEffect(() => {
    async function loadData() {
      if (useFewShot) {
        const posts = await getTrainingPosts();
        if (posts.length > 0) {
          const examples = posts
            .slice(0, 5)
            .map((p, i) => `EXAMPLE ${i + 1}:\n${p.content}`)
            .join("\n\n---\n\n");
          setTrainingExamples(examples);
        }
      } else {
        setTrainingExamples("");
      }

      const customs = await getCustomPersonas();
      setCustomPersonas(customs);
    }
    loadData();
  }, [useFewShot, isVoiceTrainerOpen]);

  // --- AGENTIC GEN ---
  const handleAgenticGenerate = async () => {
    log.info("Starting Agentic Generation", { input: input.substring(0, 50) });
    setIsAgenticRunning(true);
    setAgenticPhase("Initializing research...");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setSwarmMessages([{ agent: "System", role: "synthesizer", content: "Initializing deep research phase...", timestamp: new Date().toISOString() } as any]);
    setAgenticScore(null);
    setAgenticIteration(0);
    setLocalError(null);

    try {
      const result = await processInputAgentic(
        input,
        { gemini: apiKeys.gemini, serper: apiKeys.serper },
        personaId,
        {
          onResearchProgress: (progress: ResearchProgress) => {
            setAgenticPhase(progress.message);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
            setSwarmMessages(prev => [...prev, { agent: "Researcher", role: "realist", content: progress.message, timestamp: new Date().toISOString() } as any]);
          },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onCouncilProgress: (progress: any) => {
            setAgenticPhase(progress.message);
            if (progress.audit_log) {
              setSwarmMessages(prev => [...prev, progress.audit_log]);
            } else {
              setSwarmMessages(prev => [...prev, { agent: "Council", role: "synthesizer", content: progress.message, timestamp: new Date().toISOString() } as any]);
            }
            setAgenticIteration(progress.iteration);
            if (progress.score) setAgenticScore(progress.score);
          },
          viralityThreshold: 75,
          maxIterations: 3
        }
      );

      // Handle final output
      onGenerationComplete(result.textPost);
    } catch (e) {
      log.error("Agentic generation failed", e);
      setLocalError("Agentic research floor failed. Please try standard generation.");
    } finally {
      setIsAgenticRunning(false);
    }
  };

  // --- RENDER ---
  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 pb-20">
      
      {/* View Switcher */}
      <div className="flex justify-center mb-8">
        <div className="flex items-center p-1 bg-black/40 border border-white/10 rounded-full backdrop-blur-md">
          <ViewButton
            active={viewMode === "feed"}
            onClick={() => setViewMode("feed")}
            label="FEED"
            icon={<FileText className="w-3 h-3" />}
          />
          <ViewButton
            active={viewMode === "canvas"}
            onClick={() => setViewMode("canvas")}
            label="CANVAS"
            icon={<Database className="w-3 h-3" />}
          />
        </div>
      </div>

      {viewMode === "canvas" ? (
        <div className="w-full animate-in fade-in duration-500">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Brain className="w-5 h-5 text-indigo-400" />
                Infinite Strategy Canvas
              </h2>
              <p className="text-xs text-neutral-400 mt-1">
                Drag, drop, and connect your strategic assets on a 2D plane.
              </p>
            </div>
          </div>
          <StrategyCanvas apiKey={apiKeys.gemini || ""} />
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative group"
        >
          <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-3xl blur opacity-20 group-hover:opacity-30 transition duration-1000"></div>
          <div className={`relative liquid-panel rounded-3xl p-1 overflow-hidden transition-all duration-700 ${!isLoading && completion ? 'highlight-flash' : ''}`}>
            
            {!isLoading && !completion && !localError ? (
              <div className="flex flex-col">
                <InputArea
                  input={input}
                  setInput={setInput}
                  images={images}
                  removeImage={removeImage}
                  dynamicChips={dynamicChips}
                  signals={signals}
                  isFetchingSignals={isFetchingSignals}
                  useNewsjack={useNewsjack}
                  isDragActive={isDragActive}
                  getRootProps={getRootProps}
                  getInputProps={getInputProps}
                  swarmMessages={swarmMessages}
                  activeSwarmRole={activeSwarmRole}
                  isSwarmRunning={isSwarmRunning}
                  isAgenticRunning={isAgenticRunning}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  starterChips={DEFAULT_STARTER_CHIPS as any}
                />
                <PredictionPanel
                  prediction={prediction}
                  onClear={() => setPrediction(null)}
                />
                <ToolBar
                  {...props}
                  customPersonas={customPersonas}
                  useAgenticMode={useAgenticMode}
                  setUseAgenticMode={setUseAgenticMode}
                  setIsVoiceTrainerOpen={setIsVoiceTrainerOpen}
                  setIsComplianceOpen={setIsComplianceOpen}
                  setUseTerminalMode={setUseTerminalMode}
                  setIsGalleryOpen={setIsGalleryOpen}
                  setIsAnalyticsOpen={setIsAnalyticsOpen}
                  setIsScheduleOpen={setIsScheduleOpen}
                  setIsBatchOpen={setIsBatchOpen}
                  setIsAccountSettingsOpen={setIsAccountSettingsOpen}
                  setIsTeamSettingsOpen={setIsTeamSettingsOpen}
                  setIsLiveSessionOpen={setIsLiveSessionOpen}
                />
                
                <div className="absolute bottom-4 right-4 flex items-center gap-3 z-30">
                  <OutputFormatSelector format={outputFormat} setFormat={setOutputFormat} />
                  <PlatformIcon platform={platform} />
                  
                  <button
                    onClick={useAgenticMode ? handleAgenticGenerate : () => handleGenerate(input)}
                    disabled={(!input.trim() && images.length === 0) || isAgenticRunning}
                    className={`group relative flex items-center gap-2 px-5 py-2 font-bold rounded-lg text-xs hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed ${useAgenticMode ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/20' : 'bg-white text-black'}`}
                  >
                    {isAgenticRunning ? (
                      <><span className="animate-spin">⚡</span> {agenticPhase.substring(0, 15)}...</>
                    ) : useAgenticMode ? (
                      <><Bot className="w-3 h-3" /> AGENTIC</>
                    ) : (
                      <><span>GENERATE</span></>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <OutputArea
                isLoading={isLoading}
                completion={completion}
                localError={localError}
                platform={platform}
                onReset={() => { setLocalError(null); setImages([]); setInput(""); }}
                onPublish={() => {
                  const job = createPostingJob(completion, platform, images[0]);
                  setCurrentPostingJob(job);
                  setIsPostingModalOpen(true);
                }}
                onNewGeneration={() => { setLocalError(null); }}
              />
            )}
          </div>
        </motion.div>
      )}

      {/* Footer Meta */}
      <div className="px-2 text-center opacity-30 hover:opacity-100 transition-opacity">
        <p className="text-[10px] text-neutral-600 uppercase tracking-widest font-mono">StrategyOS v2.1 • Multi-Modal Kernel</p>
      </div>

      <TemplateLibraryModal isOpen={isLibraryOpen} onClose={() => setIsLibraryOpen(false)} onSelect={setInput} />
      <ComplianceExportModal isOpen={isComplianceOpen} onClose={() => setIsComplianceOpen(false)} />
      <VoiceTrainerModal isOpen={isVoiceTrainerOpen} onClose={() => setIsVoiceTrainerOpen(false)} apiKey={apiKeys.gemini} />
      <AccountSettingsModal isOpen={isAccountSettingsOpen} onClose={() => setIsAccountSettingsOpen(false)} />
      <TeamSettingsModal isOpen={isTeamSettingsOpen} onClose={() => setIsTeamSettingsOpen(false)} />
      <ScheduleQueueDashboard isOpen={isScheduleOpen} onClose={() => setIsScheduleOpen(false)} />
      <LiveSession isOpen={isLiveSessionOpen} onClose={() => setIsLiveSessionOpen(false)} />
      
      <BatchGeneratorModal 
        isOpen={isBatchOpen} 
        onClose={() => setIsBatchOpen(false)} 
        apiKey={apiKeys.gemini || ""} 
        onComplete={() => setIsScheduleOpen(true)}
      />
      
      <AnalyticsDashboard isOpen={isAnalyticsOpen} onClose={() => setIsAnalyticsOpen(false)} apiKey={apiKeys.gemini || ""} onPersonaMutated={() => {}} />
      
      <PostingApprovalModal
        isOpen={isPostingModalOpen}
        onClose={() => setIsPostingModalOpen(false)}
        job={currentPostingJob}
        onSuccess={(url) => window.open(url, "_blank")}
      />

      <AnimatePresence>
        {isGalleryOpen && <AssetGallery onClose={() => setIsGalleryOpen(false)} />}
        {isCloneModalOpen && <ClonePersonaModal onClose={() => setIsCloneModalOpen(false)} apiKey={apiKeys.gemini} onPersonaCreated={(p) => setCustomPersonas(prev => [...prev, p])} />}
      </AnimatePresence>

      {useTerminalMode && (
        <TerminalConsole
          onGenerate={async (val) => { setInput(val); handleGenerate(val); }}
          isLoading={isLoading}
          completion={completion}
          onClose={() => setUseTerminalMode(false)}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          phaseLogs={swarmMessages.map(m => `[${(m as any).agent}] ${(m as any).content}`)}
        />
      )}
    </div>
  );
}

function ViewButton({ active, onClick, label, icon }: { active: boolean; onClick: () => void; label: string; icon: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-6 py-2 rounded-full text-xs font-bold transition-all ${active ? 'bg-white text-black' : 'text-neutral-500 hover:text-white'}`}
    >
      {icon} {label}
    </button>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function OutputFormatSelector({ format, setFormat }: { format: string; setFormat: (f: any) => void }) {
  return (
    <div className="flex items-center bg-black/40 rounded-lg p-0.5 border border-white/5">
      <button onClick={() => setFormat("text")} className={`p-1.5 rounded-md transition-all ${format === "text" ? "bg-white/10 text-white" : "text-neutral-500 hover:text-white"}`}><FileText className="w-3.5 h-3.5" /></button>
      <button onClick={() => setFormat("video")} className={`p-1.5 rounded-md transition-all ${format === "video" ? "bg-red-500/20 text-red-400" : "text-neutral-500 hover:text-white"}`} title="Video Script"><Brain className="w-3.5 h-3.5" /></button>
      <button onClick={() => setFormat("audio")} className={`p-1.5 rounded-md transition-all ${format === "audio" ? "bg-purple-500/20 text-purple-400" : "text-neutral-500 hover:text-white"}`} title="Audio Narration"><Database className="w-3.5 h-3.5" /></button>
    </div>
  );
}

function PlatformIcon({ platform }: { platform: "linkedin" | "twitter" }) {
  return (
    <div className={`p-1.5 rounded-lg border border-white/5 ${platform === 'linkedin' ? 'bg-blue-600/20 text-blue-400' : 'bg-white/10 text-white'}`}>
       <span className="text-[10px] font-bold uppercase">{platform === 'linkedin' ? 'Li' : 'X'}</span>
    </div>
  );
}
