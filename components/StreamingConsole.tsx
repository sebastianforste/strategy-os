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

import React, { useState, useEffect, Suspense } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Database, FileText, Bot, Activity, Wifi, Cloud, Server, LayoutDashboard, Search, Grid, Ghost, TrendingUp, Zap } from "lucide-react";
import { SystemVitals, checkVitals } from "../utils/vitals-service";

// Types
import { StreamingConsoleProps, DEFAULT_STARTER_CHIPS } from "./StreamingConsole/types";
import { PersonaId, PERSONAS } from "../utils/personas";
import { SectorId } from "../utils/sectors";

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
const MemoryDashboard = dynamic(() => import("./MemoryDashboard"), { ssr: false });
import LiveVoiceConsole from "./LiveVoiceConsole";
import DeepResearchModal from "./DeepResearchModal";
import HookLabModal from "./HookLabModal";
import TrendMonitor from "./TrendMonitor";
import NetworkDashboard from "./NetworkDashboard";
import MastermindDashboard from "./MastermindDashboard";
import LeadPipeline from "./LeadPipeline";
import OracleDashboard from "./OracleDashboard";
import RepurposingStudio from "./RepurposingStudio";
import LeadMagnetStudio from "./LeadMagnetStudio";
import ViralLab from "./ViralLab";
import GrowthSimulator from "./GrowthSimulator";
import ContentVault from "./ContentVault";
import StrategyAuditor from "./StrategyAuditor";
import CompetitorBench from "./CompetitorBench";
import GlobalCommand from "./GlobalCommand";
import SidebarRail from "./SidebarRail";
import { TrendOpportunity } from "../utils/trend-surfer";
import { EngagementTarget } from "../utils/engagement-agent";
import { evaluateAutoPilot, AutonomousDecision } from "../utils/autonomous-agent";
import { Users } from "lucide-react";

// Services
import { getTrainingPosts } from "../utils/voice-training-service";
import { getCustomPersonas } from "../utils/persona-store";
import { processInputAgentic } from "../actions/generate";
import { ResearchProgress } from "../utils/research-service";
import { GeneratedAssets } from "../utils/ai-service";
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
  const [viewMode, setViewMode] = useState<"feed" | "canvas" | "network" | "mastermind" | "boardroom" | "apps">("mastermind");
  const [useAgenticMode, setUseAgenticMode] = useState(false);
  const [useTerminalMode, setUseTerminalMode] = useState(false);
  const [trainingExamples, setTrainingExamples] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [customPersonas, setCustomPersonas] = useState<any[]>([]);
  const [outputFormat, setOutputFormat] = useState<"text" | "video" | "audio">("text");
  
  // Lifted State for Mastermind
  const [allTrends, setAllTrends] = useState<TrendOpportunity[]>([]);
  const [allEngagementTargets, setAllEngagementTargets] = useState<EngagementTarget[]>([]);
  const [isAutoPilot, setIsAutoPilot] = useState(false);
  const [autoPilotThreshold, setAutoPilotThreshold] = useState(85);
  const [autoPilotPlatforms, setAutoPilotPlatforms] = useState<string[]>(['linkedin']);
  const [decisions, setDecisions] = useState<AutonomousDecision[]>([]);

  const [isTeamMode, setIsTeamMode] = useState(false);
  const [coworkerName, setCoworkerName] = useState("");
  const [coworkerRole, setCoworkerRole] = useState("");
  const [coworkerRelation, setCoworkerRelation] = useState("");
  
  // Sector Selection (Phase 23)
  const [sectorId, setSectorId] = useState<SectorId>("general");

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
  const [isTeamPanelOpen, setIsTeamPanelOpen] = useState(false);
  const [isMemoryOpen, setIsMemoryOpen] = useState(false);
  const [isLiveSessionOpen, setIsLiveSessionOpen] = useState(false);
  const [isDeepResearchOpen, setIsDeepResearchOpen] = useState(false);
  const [isHookLabOpen, setIsHookLabOpen] = useState(false);
  const [isLeadPipelineOpen, setIsLeadPipelineOpen] = useState(false);
  const [isOracleOpen, setIsOracleOpen] = useState(false);
  const [isRepurposingOpen, setIsRepurposingOpen] = useState(false);
  const [isLeadMagnetOpen, setIsLeadMagnetOpen] = useState(false);
  const [isViralLabOpen, setIsViralLabOpen] = useState(false);
  const [isGrowthSimulatorOpen, setIsGrowthSimulatorOpen] = useState(false);
  const [isVaultOpen, setIsVaultOpen] = useState(false);
  const [isAuditorOpen, setIsAuditorOpen] = useState(false);
  const [isCompetitorOpen, setIsCompetitorOpen] = useState(false);
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [isRedPhonePulsing, setIsRedPhonePulsing] = useState(true); // Default to on for HUD effect

  // Persistence State
  const [currentPostingJob, setCurrentPostingJob] = useState<any>(null);
  const [prediction, setPrediction] = useState<any>(null);
  const [ragConcepts, setRagConcepts] = useState<string[]>([]);

  const [clicheCheckText, setClicheCheckText] = useState<string | null>(null);

  // --- AUTO-PILOT LOGIC ---
  const runAutoPilotCheck = async (content: string) => {
    if (!isAutoPilot || !apiKeys.gemini) return;
    
    log.info("Auto-Pilot active. Evaluating content...", { length: content.length });
    
    try {
        const { checkFacts } = await import("../utils/fact-checker");
        const { calculateAuthorityScore } = await import("../utils/authority-scorer");
        const { generateMastermindBriefing } = await import("../utils/mastermind-briefing");

        const facts = await checkFacts(content, apiKeys.gemini, process.env.NEXT_PUBLIC_SERPER_API_KEY || "");
        const integrityScore = facts.length > 0 ? Math.round((facts.filter(r => r.verdict === 'verified').length / facts.length) * 100) : 100;
        const authority = calculateAuthorityScore(content);
        
        // Use existing briefing or generate a quick one for context
        const contextBriefing = await generateMastermindBriefing(allTrends, allEngagementTargets, 0, apiKeys.gemini);

        const decisionList = await evaluateAutoPilot(
            content, 
            { integrity: integrityScore, authority: authority.score },
            autoPilotPlatforms as any[], // Casting for now
            contextBriefing,
            autoPilotThreshold
        );

        setDecisions(prev => [...decisionList, ...prev]);
        log.info(`${decisionList.length} Auto-Pilot decisions made`);
    } catch (e) {
        log.error("Auto-Pilot evaluation failed", e);
    }
  };

  const handleGenerationComplete = (result: string | GeneratedAssets) => {
    const textContent = typeof result === 'string' ? result : result.textPost;
    
    if (typeof result !== 'string' && result.ragConcepts) {
      setRagConcepts(result.ragConcepts);
    }
    
    onGenerationComplete(result);
    if (textContent) runAutoPilotCheck(textContent);
  };

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
  } = useInput({ apiKeys, useNewsjack, initialValue });

  const {
    handleGenerate,
    stop,
    setCompletion,
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
    personaId: personaId as PersonaId,
    useNewsjack,
    useRAG,
    useFewShot,
    useSwarm,
    platform,
    images,
    signals,
    trainingExamples,
    isTeamMode,
    coworkerName,
    coworkerRole,
    coworkerRelation,
    customPersonas,
    outputFormat,
    sectorId,
    onGenerationComplete: handleGenerationComplete,
    onError: (msg) => setLocalError(msg),
  });

  // --- EFFECTS ---
  useEffect(() => {
    async function loadData() {
      if (useFewShot) {
        const posts = await getTrainingPosts();
        if (posts.length > 0) {
          const examples = posts
            .slice(0, 5)
            .map((p: { content: string }, i: number) => `EXAMPLE ${i + 1}:\n${p.content}`)
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

  // --- SHORTCUTS ---
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsCommandOpen(prev => !prev);
      }
    };
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, []);

  const handleCommandPersonaSelect = (id: PersonaId) => {
    if (setPersonaId) setPersonaId(id);
    log.info(`Persona switched via command: ${id}`);
  };

  const handleCommandToolSelect = (toolId: string) => {
    switch (toolId) {
      case "vault": setIsVaultOpen(true); break;
      case "hook": setIsHookLabOpen(true); break;
      case "viral": setIsViralLabOpen(true); break;
      case "growth": setIsGrowthSimulatorOpen(true); break;
      case "batch": setIsBatchOpen(true); break;
      default: break;
    }
  };

  const handleCommandActionSelect = (actionId: string) => {
    switch (actionId) {
      case "gen": 
        if (useAgenticMode) handleAgenticGenerate();
        else handleGenerate(input);
        break;
      case "clear":
        setInput("");
        setImages([]);
        setCompletion("");
        break;
      default: break;
    }
  };

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
      handleGenerationComplete(result.textPost);
    } catch (e) {
      log.error("Agentic generation failed", e);
      setLocalError("Agentic research floor failed. Please try standard generation.");
    } finally {
      setIsAgenticRunning(false);
    }
  };

  const handleTrendSelect = (trend: TrendOpportunity) => {
      const context = `
CONTEXT: ${trend.headline}
SOURCE: ${trend.context}
GOAL: Newsjack this trend with a ${trend.suggestedAngle} angle.
MODE: High Authority
      `.trim();
      setInput(context);
      setUseAgenticMode(true);
      // Optional: Auto-scroll to generator or highlight input
  };

  // --- RENDER ---
  return (
    <div className="w-full flex">
      {/* Sidebar Rail - Operational Context */}
      <SidebarRail 
        activeView={viewMode}
        onViewChange={setViewMode}
        isGhostActive={useAgenticMode}
        onToggleGhost={() => setUseAgenticMode(!useAgenticMode)}
        onOpenSearch={() => setIsCommandOpen(true)}
        onOpenRedPhone={() => setIsLiveSessionOpen(true)}
        onOpenDeepResearch={() => setIsDeepResearchOpen(true)}
      />

      <div className={`flex-1 w-full max-w-6xl mx-auto space-y-4 pb-20 pl-24 transition-all duration-500 pr-4 ${useAgenticMode ? 'grayscale' : ''}`}>
        
        {/* Top Bar - Intelligence & Search (Minimized for vertical space) */}
        <div className="flex items-center justify-between gap-6 py-4">
            <div className="flex-1 relative group max-w-2xl">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                    <Search className="w-4 h-4 text-neutral-500 group-hover:text-white transition-colors" />
                </div>
                <input 
                    type="text" 
                    placeholder="Search intelligence, trends, or agent commands... (Cmd+K)"
                    className="w-full bg-black/40 backdrop-blur-xl border border-white/[0.06] rounded-2xl py-2.5 pl-12 pr-4 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-indigo-500/50 focus:shadow-[0_0_20px_rgba(99,102,241,0.15)] transition-all hover:bg-black/60 shadow-[0_4px_20px_rgba(0,0,0,0.3)]"
                    onClick={() => setIsCommandOpen(true)}
                    readOnly
                />
            </div>
            
            <div className="flex items-center gap-4">
                {/* Mode Toggle (Ghost Mode) in Top Bar as requested */}
                <button 
                    onClick={() => setUseAgenticMode(!useAgenticMode)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${useAgenticMode ? 'bg-cyan-500/10 border-cyan-500/50 text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.2)]' : 'bg-white/5 border-white/10 text-neutral-500 hover:text-neutral-300'}`}
                >
                    <div className={`w-1.5 h-1.5 rounded-full ${useAgenticMode ? 'bg-cyan-400 animate-pulse' : 'bg-neutral-600'}`} />
                    <span className="text-[10px] font-black tracking-widest uppercase">
                        {useAgenticMode ? 'Ghost: On' : 'Ghost: Off'}
                    </span>
                    <Ghost className={`w-3.5 h-3.5 ${useAgenticMode ? 'text-cyan-400' : 'text-neutral-500'}`} />
                </button>
            </div>
        </div>

        {/* Vitals Bar - System Health Pulse */}
        <div className="flex items-center justify-between px-6 py-2 bg-[#0c0c0c]/50 backdrop-blur-sm border border-white/5 rounded-2xl mx-4">
            <div className="flex items-center gap-6">
                {/* Network */}
                <div className="flex items-center gap-2 group relative">
                    <div className={`w-1.5 h-1.5 rounded-full ${props.vitals?.network === 'online' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-red-500'}`} />
                    <span className="text-[9px] font-mono text-neutral-500 uppercase tracking-widest flex items-center gap-1.5">
                        <Wifi className="w-2.5 h-2.5" /> NET: <span className={props.vitals?.network === 'online' ? 'text-green-500/80' : 'text-red-500/80'}>{props.vitals?.network || 'CHECKING'}</span>
                    </span>
                </div>
                
                {/* Gemini API */}
                <div className="flex items-center gap-2 group relative">
                    <div className={`w-1.5 h-1.5 rounded-full ${props.vitals?.api === 'online' ? 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]' : props.vitals?.api === 'limited' ? 'bg-yellow-500' : 'bg-red-500'}`} />
                    <span className="text-[9px] font-mono text-neutral-500 uppercase tracking-widest flex items-center gap-1.5">
                        <Cloud className="w-2.5 h-2.5" /> API: <span className={props.vitals?.api === 'online' ? 'text-indigo-400' : 'text-red-400'}>{props.vitals?.api || 'CHECKING'}</span>
                    </span>
                </div>

                {/* Database */}
                <div className="flex items-center gap-2 group relative">
                    <div className={`w-1.5 h-1.5 rounded-full ${props.vitals?.database === 'connected' ? 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]' : 'bg-red-500'}`} />
                    <span className="text-[9px] font-mono text-neutral-500 uppercase tracking-widest flex items-center gap-1.5">
                        <Server className="w-2.5 h-2.5" /> DB: <span className={props.vitals?.database === 'connected' ? 'text-blue-400' : 'text-red-400'}>{props.vitals?.database || 'CHECKING'}</span>
                    </span>
                </div>
            </div>

            <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsMemoryOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1 bg-white/5 border border-white/5 rounded-md text-[10px] font-bold text-neutral-400 hover:text-white transition-all"
              >
                <Brain className="w-3 h-3 text-indigo-400" />
                MEMORY
              </button>
              <div className="w-px h-6 bg-white/5 mx-1" />
              {/* Latency */}
              <div className="flex items-center gap-2">
                  <Activity className="w-3 h-3 text-neutral-600" />
                  <span className="text-[9px] font-mono text-neutral-600">{props.vitals?.latencyMs || 0}ms</span>
              </div>
            </div>
        </div>
      
        {/* View Switches */}
        {viewMode === 'mastermind' && (
          <MastermindDashboard 
            apiKey={apiKeys.gemini} 
            trends={allTrends}
            engagementTargets={allEngagementTargets}
            queueCount={0} 
            onViewChange={setViewMode}
            isAutoPilot={isAutoPilot}
            setIsAutoPilot={setIsAutoPilot}
            decisions={decisions}
            autoPilotThreshold={autoPilotThreshold}
            setAutoPilotThreshold={setAutoPilotThreshold}
            autoPilotPlatforms={autoPilotPlatforms}
            setAutoPilotPlatforms={setAutoPilotPlatforms}
            initialView={clicheCheckText ? 'cliche_killer' : undefined}
            initialClicheText={clicheCheckText || undefined}
            onClearClicheText={() => setClicheCheckText(null)}
          />
        )}

        {viewMode === 'feed' && (
          <div className="w-full animate-in fade-in duration-500">
            <TrendMonitor 
              apiKey={apiKeys.gemini} 
              onSelectTrend={handleTrendSelect} 
              onTrendsFetched={setAllTrends}
            />
          </div>
        )}

        {viewMode === 'canvas' && (
          <div className="w-full animate-in fade-in duration-500">
             <StrategyCanvas apiKey={apiKeys.gemini || ""} />
          </div>
        )}

        {viewMode === 'network' && (
           <div className="w-full animate-in fade-in duration-500">
              <NetworkDashboard 
                apiKey={apiKeys.gemini} 
                onTargetsScouted={setAllEngagementTargets}
              />
           </div>
        )}

        {viewMode === 'boardroom' && (
           <div className="w-full animate-in fade-in duration-500">
              <OracleDashboard isOpen={true} onClose={() => setViewMode('mastermind')} />
           </div>
        )}

        {viewMode === 'apps' && (
           <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-in fade-in slide-in-from-bottom-4">
              <AppIconCard label="Lead Magnet Studio" onClick={() => setIsLeadMagnetOpen(true)} icon={<LayoutDashboard className="text-amber-400" />} />
              <AppIconCard label="Hook Lab" onClick={() => setIsHookLabOpen(true)} icon={<Zap className="text-indigo-400" />} />
              <AppIconCard label="Viral Lab" onClick={() => setIsViralLabOpen(true)} icon={<Brain className="text-red-400" />} />
              <AppIconCard label="Growth Simulator" onClick={() => setIsGrowthSimulatorOpen(true)} icon={<Activity className="text-emerald-400" />} />
              <AppIconCard label="Batch Generator" onClick={() => setIsBatchOpen(true)} icon={<Grid className="text-pink-400" />} />
              <AppIconCard label="Asset Gallery" onClick={() => setIsGalleryOpen(true)} icon={<Database className="text-blue-400" />} />
           </div>
        )}

        {/* --- STRATEGIST INPUT AREA (Unified) --- */}
        {(viewMode === 'mastermind' || viewMode === 'feed' || viewMode === 'network') && (
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
                  starterChips={DEFAULT_STARTER_CHIPS}
                  isTeamMode={isTeamMode}
                  coworkerName={coworkerName}
                  setCoworkerName={setCoworkerName}
                  coworkerRole={coworkerRole}
                  setCoworkerRole={setCoworkerRole}
                  coworkerRelation={coworkerRelation}
                  setCoworkerRelation={setCoworkerRelation}
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
                  isTeamMode={isTeamMode}
                  setIsTeamMode={setIsTeamMode}
                  onOpenHookLab={() => setIsHookLabOpen(true)}
                onOpenLeadMagnet={() => setIsLeadMagnetOpen(true)}
                onOpenViralLab={() => setIsViralLabOpen(true)}
                onOpenGrowthSimulator={() => setIsGrowthSimulatorOpen(true)}
                onOpenVault={() => setIsVaultOpen(true)}
                onOpenCompetitor={() => setIsCompetitorOpen(true)}
                sectorId={sectorId}
                setSectorId={setSectorId}
              />
                
                <div className="absolute bottom-4 right-4 flex items-center gap-3 z-[60]">
                  <OutputFormatSelector format={outputFormat} setFormat={setOutputFormat} />
                  <PlatformIcon platform={platform} />
                  
                  <button
                    onClick={useAgenticMode ? handleAgenticGenerate : () => handleGenerate(input)}
                    disabled={(!input.trim() && images.length === 0) || isAgenticRunning}
                    className={`group relative flex items-center gap-2 px-8 py-4 font-bold rounded-xl text-sm hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed ${useAgenticMode ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-[0_0_30px_rgba(34,211,238,0.4)]' : 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)]'}`}
                  >
                    {isAgenticRunning ? (
                      <><span className="animate-spin">⚡</span> {agenticPhase.substring(0, 15)}...</>
                    ) : useAgenticMode ? (
                      <><Bot className="w-4 h-4" /> AGENTIC</>
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
                  onNewGeneration={() => setCompletion("")}
                  apiKey={apiKeys.gemini || ""}
                  personaId={personaId as PersonaId}
                  onUpdateCompletion={setCompletion}
                  onOpenRepurposing={() => setIsRepurposingOpen(true)}
                  onOpenAuditor={() => setIsAuditorOpen(true)}
                  ragConcepts={ragConcepts}
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
      <ScheduleQueueDashboard isOpen={isScheduleOpen} onClose={() => setIsScheduleOpen(false)} apiKey={apiKeys.gemini} />
      <LiveVoiceConsole isOpen={isLiveSessionOpen} onClose={() => setIsLiveSessionOpen(false)} />
      <DeepResearchModal isOpen={isDeepResearchOpen} onClose={() => setIsDeepResearchOpen(false)} apiKey={apiKeys.gemini} />
      
      <BatchGeneratorModal 
        isOpen={isBatchOpen} 
        onClose={() => setIsBatchOpen(false)} 
        apiKey={apiKeys.gemini || ""} 
        onComplete={() => setIsScheduleOpen(true)}
      />
      
      <AnalyticsDashboard isOpen={isAnalyticsOpen} onClose={() => setIsAnalyticsOpen(false)} apiKey={apiKeys.gemini || ""} onPersonaMutated={() => {}} />
      <HookLabModal isOpen={isHookLabOpen} onClose={() => setIsHookLabOpen(false)} apiKey={apiKeys.gemini || ""} onSelect={(hook: string) => setInput((prev: string) => hook + "\n" + prev)} />
      <LeadPipeline isOpen={isLeadPipelineOpen} onClose={() => setIsLeadPipelineOpen(false)} />
      <OracleDashboard isOpen={isOracleOpen} onClose={() => setIsOracleOpen(false)} />
      <RepurposingStudio isOpen={isRepurposingOpen} onClose={() => setIsRepurposingOpen(false)} initialContent={completion} apiKey={apiKeys.gemini} />
      <LeadMagnetStudio isOpen={isLeadMagnetOpen} onClose={() => setIsLeadMagnetOpen(false)} apiKey={apiKeys.gemini} />
      <ViralLab isOpen={isViralLabOpen} onClose={() => setIsViralLabOpen(false)} apiKey={apiKeys.gemini} />
      <GrowthSimulator isOpen={isGrowthSimulatorOpen} onClose={() => setIsGrowthSimulatorOpen(false)} />
      <ContentVault isOpen={isVaultOpen} onClose={() => setIsVaultOpen(false)} />
      <StrategyAuditor isOpen={isAuditorOpen} onClose={() => setIsAuditorOpen(false)} content={completion} apiKey={apiKeys.gemini} />
      <CompetitorBench 
        isOpen={isCompetitorOpen} 
        onClose={() => setIsCompetitorOpen(false)} 
        niche={customPersonas.find(p => p.id === personaId)?.description || PERSONAS[personaId as keyof typeof PERSONAS]?.topics?.[0] || "General"}
        apiKey={apiKeys.gemini}
        onStealLogic={(template) => {
          setInput(template);
          setIsCompetitorOpen(false);
        }}
      />
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

      <GlobalCommand 
        isOpen={isCommandOpen}
        onClose={() => setIsCommandOpen(false)}
        onSelectPersona={handleCommandPersonaSelect}
        onTriggerTool={handleCommandToolSelect}
        onTriggerAction={handleCommandActionSelect}
      />

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
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function OutputFormatSelector({ format, setFormat }: { format: string; setFormat: (f: any) => void }) {
  return (
    <div className="flex items-center bg-black/40 backdrop-blur-md rounded-lg p-0.5 border border-white/10">
      <button onClick={() => setFormat("text")} className={`p-1.5 rounded-md transition-all ${format === "text" ? "bg-white/10 text-white shadow-sm" : "text-neutral-400 hover:text-white hover:bg-white/5"}`}><FileText className="w-3.5 h-3.5" /></button>
      <button onClick={() => setFormat("video")} className={`p-1.5 rounded-md transition-all ${format === "video" ? "bg-red-500/20 text-red-300 shadow-sm ring-1 ring-red-500/20" : "text-neutral-400 hover:text-white hover:bg-white/5"}`} title="Video Script"><Brain className="w-3.5 h-3.5" /></button>
      <button onClick={() => setFormat("audio")} className={`p-1.5 rounded-md transition-all ${format === "audio" ? "bg-purple-500/20 text-purple-300 shadow-sm ring-1 ring-purple-500/20" : "text-neutral-400 hover:text-white hover:bg-white/5"}`} title="Audio Narration"><Database className="w-3.5 h-3.5" /></button>
    </div>
  );
}

function PlatformIcon({ platform }: { platform: "linkedin" | "twitter" }) {
  return (
    <div className={`p-1.5 rounded-lg border ${platform === 'linkedin' ? 'bg-blue-600/20 border-blue-500/30 text-blue-300 shadow-[0_0_10px_rgba(37,99,235,0.1)]' : 'bg-white/10 border-white/10 text-white'}`}>
       <span className="text-[10px] font-black uppercase tracking-tight">{platform === 'linkedin' ? 'Li' : 'X'}</span>
    </div>
  );
}

function AppIconCard({ label, onClick, icon }: { label: string, onClick: () => void, icon: React.ReactNode }) {
    return (
        <button 
            onClick={onClick}
            className="group relative p-6 bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl hover:border-indigo-500/40 hover:bg-black/60 hover:shadow-[0_0_30px_rgba(99,102,241,0.15)] transition-all duration-300 text-left flex flex-col gap-4 overflow-hidden"
        >
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.05] via-transparent to-purple-500/[0.05] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="p-3 bg-white/10 rounded-2xl w-fit group-hover:scale-110 group-hover:bg-white/20 transition-all duration-300 shadow-inner">
                {icon}
            </div>
            <div>
                <h3 className="text-sm font-black text-white group-hover:text-indigo-200 transition-colors duration-300 uppercase tracking-wider">{label}</h3>
                <p className="text-[10px] text-neutral-400 mt-1 uppercase tracking-tight font-mono group-hover:text-neutral-300">Execute Operational Module</p>
            </div>
        </button>
    );
}
