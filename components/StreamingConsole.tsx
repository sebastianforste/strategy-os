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
import CommandCenterLayout from "./StreamingConsole/CommandCenterLayout";

// Modals
import TemplateLibraryModal from "./TemplateLibraryModal";
import RichTooltip from "./ui/RichTooltip";
import ComplianceExportModal from "./ComplianceExportModal";
import PostingApprovalModal from "./PostingApprovalModal";
import VoiceTrainerModal from "./VoiceTrainerModal";
import AssetGallery from "./AssetGallery";
import ClonePersonaModal from "./ClonePersonaModal";
import AnalyticsDashboard from "./AnalyticsDashboard";
import ScheduleQueueDashboard from "./ScheduleQueueDashboard";
import BatchGeneratorModal from "./BatchGeneratorModal";
import SettingsModal from "./SettingsModal";
import TeamSettingsModal from "./TeamSettingsModal";
import TerminalConsole from "./TerminalConsole";
import VideoStudio from "./VideoStudio";
const MemoryDashboard = dynamic(() => import("./MemoryDashboard"), { ssr: false });
const MastermindDashboard = dynamic(() => import("./MastermindDashboard"), { 
    ssr: false,
    loading: () => (
        <div className="flex items-center justify-center p-20 bg-[#030303]/40 backdrop-blur-3xl rounded-3xl border border-white/5">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
                <p className="text-[10px] text-indigo-400 font-mono uppercase tracking-[0.2em] animate-pulse font-black">Syncing Mastermind...</p>
            </div>
        </div>
    )
});
import LiveVoiceConsole from "./LiveVoiceConsole";
import DeepResearchModal from "./DeepResearchModal";
import HookLabModal from "./HookLabModal";
import TrendMonitor from "./TrendMonitor";
import NetworkDashboard from "./NetworkDashboard";
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
import LeadDashboard from "./LeadDashboard";
import AppMarketplace from "./AppMarketplace";
import ResourceLibrary from "./ResourceLibrary";
import AgentTrainer from "./AgentTrainer";
import Scheduler from "./Scheduler";
import PermissionsDashboard from "./PermissionsDashboard";
import ContentRefresher from "./ContentRefresher";
import MonetizationDashboard from "./MonetizationDashboard";
import StrategyGamified from "./StrategyGamified";
import APIDashboard from "./APIDashboard";
import CollaborativeWhiteboard from "./CollaborativeWhiteboard";
import ABTestingEngine from "./ABTestingEngine";
import DataIngestor from "./DataIngestor";
import NarrativeEngine from "./NarrativeEngine";
import ExecutiveReporter from "./ExecutiveReporter";
import Web3Social from "./Web3Social";
import MarketIntelligence from "./MarketIntelligence";
import PredictiveAnalytics from "./PredictiveAnalytics";
import RelationshipDashboard from "./RelationshipDashboard";
import VideoStudioView from "./VideoStudio";
import AgencyHub from "./AgencyHub";
import ReputationProfile from "./ReputationProfile";
import ComplianceSandbox from "./ComplianceSandbox";
import HardwareSync from "./HardwareSync";
import NewsletterFactory from "./NewsletterFactory";
import SEOOptimizer from "./SEOOptimizer";
import PeerReviewSystem from "./PeerReviewSystem";
import ExtensionMarketplace from "./ExtensionMarketplace";
import LandingGenerator from "./LandingGenerator";
import SelfCorrectionConsole from "./SelfCorrectionConsole";
import StyleTransformer from "./StyleTransformer";
import AgentSwarm from "./AgentSwarm";
import RevenueIntelligence from "./RevenueIntelligence";
import VoiceV2Studio from "./VoiceV2Studio";
import KnowledgeGraph from "./KnowledgeGraph";
import AudienceSimulator from "./AudienceSimulator";
import VisualAlchemistV3 from "./VisualAlchemistV3";
import StreamDirector from "./StreamDirector";
import ComplianceShield from "./ComplianceShield";
import PerformanceMatrix from "./PerformanceMatrix";
import NeuralSEO from "./NeuralSEO";
import AlphaMarket from "./AlphaMarket";
import HardwareSyncV2 from "./HardwareSyncV2";
import NewsletterV2 from "./NewsletterV2";
import AutonomousExit from "./AutonomousExit";
// import VideoStudio from "./VideoStudio"; // Remove duplicate import if any
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
import type { Citation } from "../utils/citations";

const log = logger.scope("StreamingConsole");

type Capabilities = {
  authenticated: boolean;
  hasGeminiKey: boolean;
  hasSerperKey: boolean;
  connectedProviders: { linkedin: boolean; twitter: boolean; google: boolean };
  features: Record<string, boolean>;
};

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
    onError,
    isFloating,
  } = props;

  // --- STATE ---
  // --- STATE ---
  const [viewMode, setViewMode] = useState<"feed" | "canvas" | "network" | "mastermind" | "boardroom" | "apps" | "lead_crm" | "marketplace" | "library" | "trainer" | "scheduler" | "security" | "refresh" | "billing" | "arena" | "analytics" | "api" | "whiteboard" | "labs" | "ingest" | "narrative" | "reports" | "web3" | "market" | "predict" | "crm" | "video" | "agency" | "reputation" | "compliance" | "hardware" | "newsletter" | "seo" | "audit" | "store" | "funnel" | "recursive" | "style_v2" | "swarm_v2" | "revenue_v2" | "voice_v2" | "graph_v2" | "sim_v2" | "visual_v3" | "stream_v2" | "compliance_v2" | "agency_v2" | "seo_v3" | "market_v2" | "hardware_v3" | "news_v3" | "exit_v2">("mastermind");
  const [useAgenticMode, setUseAgenticMode] = useState(false);
  const [useTerminalMode, setUseTerminalMode] = useState(false);
  const [trainingExamples, setTrainingExamples] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [customPersonas, setCustomPersonas] = useState<any[]>([]);
  const [outputFormat, setOutputFormat] = useState<"text" | "video" | "audio">("text");
  const [consoleMode, setConsoleMode] = useState<'post' | 'reply'>('post'); 
  
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
  const [assets, setAssets] = useState<GeneratedAssets | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [agenticScore, setAgenticScore] = useState<number | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [agenticIteration, setAgenticIteration] = useState(0);

  // Modals Visibility
  const [showArchive, setShowArchive] = useState(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [isVoiceTrainerOpen, setIsVoiceTrainerOpen] = useState(false);
  const [isComplianceOpen, setIsComplianceOpen] = useState(false);
  const [isPostingModalOpen, setIsPostingModalOpen] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [isCloneModalOpen, setIsCloneModalOpen] = useState(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [isBatchOpen, setIsBatchOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
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
  const [citations, setCitations] = useState<Citation[]>([]);
  const [capabilities, setCapabilities] = useState<Capabilities | null>(null);

  const [clicheCheckText, setClicheCheckText] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/capabilities")
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        setCapabilities(data as Capabilities);
      })
      .catch(() => {
        if (cancelled) return;
        setCapabilities(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // --- AUTO-PILOT LOGIC ---
  const runAutoPilotCheck = async (content: string) => {
    if (!isAutoPilot || !apiKeys.gemini) return;
    if (capabilities && !capabilities.features?.autopilot) return;
    
    log.info("Auto-Pilot active. Evaluating content...", { length: content.length });
    
    try {
        const { calculateAuthorityScore } = await import("../utils/authority-scorer");
        const { generateMastermindBriefing } = await import("../utils/mastermind-briefing");

        const factsRes = await fetch("/api/fact-check", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ content }),
        });
        const factsData = await factsRes.json().catch(() => ({}));
        const facts = Array.isArray((factsData as any).results) ? ((factsData as any).results as any[]) : [];
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
    
    if (typeof result !== 'string') {
      setAssets(result);
      if (result.ragConcepts) {
        setRagConcepts(result.ragConcepts);
      }
      if (result.citations) {
        setCitations(result.citations);
      } else {
        setCitations([]);
      }
    } else {
      // Create a partial assets object if only string is received
      setAssets({ textPost: result } as GeneratedAssets);
      setCitations([]);
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
    isReplyMode: (outputFormat as any) === "reply", // Temporary hack if outputFormat isn't synced
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
      case "settings": setIsSettingsOpen(true); break;
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
      case "/post":
        setConsoleMode('post');
        setOutputFormat('text');
        break;
      case "/reply":
        setConsoleMode('reply');
        setOutputFormat('text');
        break;
      case "research":
      case "/research":
        setUseAgenticMode(true);
        handleAgenticGenerate();
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
        onOpenVoiceStudio={props.onOpenVoiceStudio || (() => {})}
      />

         <div className={`flex-1 h-screen w-full pl-24 transition-all duration-700 pr-4 py-4 relative ${useAgenticMode ? 'grayscale' : ''}`}>
           {/* Ghost Mode Trail Effect */}
           <AnimatePresence>
             {useAgenticMode && (
               <motion.div 
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 exit={{ opacity: 0 }}
                 className="absolute inset-0 pointer-events-none z-0 overflow-hidden"
               >
                 <motion.div 
                   animate={{ 
                     opacity: [0.03, 0.08, 0.03],
                     scale: [1, 1.02, 1],
                   }}
                   transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                   className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-purple-500/10"
                 />
                 <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 contrast-150 brightness-150" />
               </motion.div>
             )}
           </AnimatePresence>

           <CommandCenterLayout
            input={input}
            setInput={setInput}
            onGenerate={useAgenticMode ? handleAgenticGenerate : () => handleGenerate(input)}
            isGenerating={isLoading || isAgenticRunning}
            completion={completion}
            vitals={props.vitals}
            personaId={personaId as PersonaId}
            setPersonaId={(id) => setPersonaId(id)}
            sectorId={sectorId}
            setSectorId={setSectorId}
            useRAG={useRAG}
            setUseRAG={setUseRAG}
            useNewsjack={useNewsjack}
            setUseNewsjack={setUseNewsjack}
            useSwarm={useSwarm}
            setUseSwarm={setUseSwarm}
            images={images}
            onRemoveImage={(i) => removeImage(i, { stopPropagation: () => {} } as any)}
            isDragActive={isDragActive}
            getRootProps={getRootProps}
            getInputProps={getInputProps}
            dynamicChips={dynamicChips}
            signals={signals}
            isFetchingSignals={isFetchingSignals}
            phaseLogs={swarmMessages.map(m => `[${(m as any).agent}] ${(m as any).content}`)}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onOpenHookLab={() => setIsHookLabOpen(true)}
            showArchive={showArchive}
            setShowArchive={setShowArchive}
            onOpenVisualAlchemist={() => props.onOpenVisualAlchemist?.()}
            onOpenRecon={() => props.onOpenRecon?.()}
            onOpenMastermind={() => props.onOpenMastermind?.()}
            onOpenBoardroom={() => props.onOpenBoardroom?.()}
            onOpenNarrative={() => props.onOpenNarrative?.()}
            onOpenVoiceStudio={props.onOpenVoiceStudio}
            onToggleRadar={props.onToggleRadar}
            onTriggerAutonomousDraft={props.onTriggerAutonomousDraft}
            mode={consoleMode}
            setMode={setConsoleMode}
            isFloating={isFloating}
            outputSlot={
              (completion || isLoading || localError) && (
                <OutputArea 
                  isLoading={isLoading}
                  completion={completion}
                  localError={localError}
                  platform={platform as any || 'linkedin'}
                  onReset={() => setCompletion("")}
                  onPublish={() => setIsPostingModalOpen(true)}
                  onNewGeneration={() => {}}
                  apiKey={apiKeys.gemini || ""}
                  personaId={personaId as PersonaId}
	                  onOpenVideoArchitect={() => setViewMode('video')}
	                  ragConcepts={ragConcepts}
	                  citations={citations}
	                />
	              )
	            }
         >
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
                  canScan={Boolean(capabilities?.hasGeminiKey && capabilities?.hasSerperKey)}
                  disabledReason={
                    capabilities
                      ? "Requires stored Gemini + Serper keys (Settings -> API Keys)."
                      : "Loading capabilities..."
                  }
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

            {viewMode === 'lead_crm' && (
                <div className="w-full animate-in fade-in duration-500">
                    <LeadDashboard />
                </div>
            )}

            {viewMode === 'marketplace' && (
                <div className="w-full animate-in fade-in duration-500">
                    <AppMarketplace />
                </div>
            )}

            {viewMode === 'library' && (
                <div className="w-full animate-in fade-in duration-500">
                    <ResourceLibrary />
                </div>
            )}

            {viewMode === 'trainer' && (
                <div className="w-full animate-in fade-in duration-500">
                    <AgentTrainer />
                </div>
            )}

            {viewMode === 'scheduler' && (
                <div className="w-full animate-in fade-in duration-500">
                    <Scheduler />
                </div>
            )}

            {viewMode === 'security' && (
                <div className="w-full animate-in fade-in duration-500">
                    <PermissionsDashboard />
                </div>
            )}

            {viewMode === 'refresh' && (
                <div className="w-full animate-in fade-in duration-500">
                    <ContentRefresher />
                </div>
            )}

            {viewMode === 'billing' && (
                <div className="w-full animate-in fade-in duration-500">
                    <MonetizationDashboard />
                </div>
            )}

            {viewMode === 'arena' && (
                <div className="w-full animate-in fade-in duration-500">
                    <StrategyGamified />
                </div>
            )}

            {viewMode === 'analytics' && (
                <div className="w-full animate-in fade-in duration-500">
                    <AnalyticsDashboard isOpen={true} onClose={() => setViewMode('mastermind')} apiKey={apiKeys.gemini} />
                </div>
            )}

            {viewMode === 'api' && (
                <div className="w-full animate-in fade-in duration-500">
                    <APIDashboard />
                </div>
            )}

            {viewMode === 'whiteboard' && (
                <div className="w-full animate-in fade-in duration-500">
                    <CollaborativeWhiteboard />
                </div>
            )}

            {viewMode === 'labs' && (
                <div className="w-full animate-in fade-in duration-500">
                    <ABTestingEngine />
                </div>
            )}

            {viewMode === 'ingest' && (
                <div className="w-full animate-in fade-in duration-500">
                    <DataIngestor />
                </div>
            )}

            {viewMode === 'narrative' && (
                <div className="w-full animate-in fade-in duration-500">
                    <NarrativeEngine />
                </div>
            )}

            {viewMode === 'reports' && (
                <div className="w-full animate-in fade-in duration-500">
                    <ExecutiveReporter />
                </div>
            )}

            {viewMode === 'web3' && (
                <div className="w-full animate-in fade-in duration-500">
                    <Web3Social />
                </div>
            )}

            {viewMode === 'market' && (
                <div className="w-full animate-in fade-in duration-500">
                    <MarketIntelligence />
                </div>
            )}

            {viewMode === 'predict' && (
                <div className="w-full animate-in fade-in duration-500">
                    <PredictiveAnalytics />
                </div>
            )}

            {viewMode === 'crm' && (
                <div className="w-full animate-in fade-in duration-500">
                    <RelationshipDashboard />
                </div>
            )}

            {viewMode === 'video' && (
                <div className="w-full animate-in fade-in duration-500">
                    <VideoStudioView content={completion} apiKey={apiKeys.gemini} />
                </div>
            )}

            {viewMode === 'agency' && (
                <div className="w-full animate-in fade-in duration-500">
                    <AgencyHub />
                </div>
            )}

            {viewMode === 'reputation' && (
                <div className="w-full animate-in fade-in duration-500">
                    <ReputationProfile />
                </div>
            )}

            {viewMode === 'compliance' && (
                <div className="w-full animate-in fade-in duration-500">
                    <ComplianceSandbox />
                </div>
            )}

            {viewMode === 'hardware' && (
                <div className="w-full animate-in fade-in duration-500">
                    <HardwareSync />
                </div>
            )}

            {viewMode === 'newsletter' && (
                <div className="w-full animate-in fade-in duration-500">
                    <NewsletterFactory />
                </div>
            )}

            {viewMode === 'seo' && (
                <div className="w-full animate-in fade-in duration-500">
                    <SEOOptimizer />
                </div>
            )}

            {viewMode === 'audit' && (
                <div className="w-full animate-in fade-in duration-500">
                    <PeerReviewSystem />
                </div>
            )}

            {viewMode === 'store' && (
                <div className="w-full animate-in fade-in duration-500">
                    <ExtensionMarketplace />
                </div>
            )}

            {viewMode === 'funnel' && (
                <div className="w-full animate-in fade-in duration-500">
                    <LandingGenerator />
                </div>
            )}

            {viewMode === 'recursive' && (
                <div className="w-full animate-in fade-in duration-500">
                    <SelfCorrectionConsole />
                </div>
            )}

            {viewMode === 'style_v2' && (
                <div className="w-full animate-in fade-in duration-500">
                    <StyleTransformer />
                </div>
            )}

            {viewMode === 'swarm_v2' && (
                <div className="w-full animate-in fade-in duration-500">
                    <AgentSwarm />
                </div>
            )}

            {viewMode === 'revenue_v2' && (
                <div className="w-full animate-in fade-in duration-500">
                    <RevenueIntelligence />
                </div>
            )}

            {viewMode === 'voice_v2' && (
                <div className="w-full animate-in fade-in duration-500">
                    <VoiceV2Studio />
                </div>
            )}

            {viewMode === 'graph_v2' && (
                <div className="w-full animate-in fade-in duration-500">
                    <KnowledgeGraph />
                </div>
            )}

            {viewMode === 'sim_v2' && (
                <div className="w-full animate-in fade-in duration-500">
                    <AudienceSimulator />
                </div>
            )}

            {viewMode === 'visual_v3' && (
                <div className="w-full animate-in fade-in duration-500">
                    <VisualAlchemistV3 />
                </div>
            )}

            {viewMode === 'stream_v2' && (
                <div className="w-full animate-in fade-in duration-500">
                    <StreamDirector />
                </div>
            )}

            {viewMode === 'compliance_v2' && (
                <div className="w-full animate-in fade-in duration-500">
                    <ComplianceShield />
                </div>
            )}

            {viewMode === 'agency_v2' && (
                <div className="w-full animate-in fade-in duration-500">
                    <PerformanceMatrix />
                </div>
            )}

            {viewMode === 'seo_v3' && (
                <div className="w-full animate-in fade-in duration-500">
                    <NeuralSEO />
                </div>
            )}

            {viewMode === 'market_v2' && (
                <div className="w-full animate-in fade-in duration-500">
                    <AlphaMarket />
                </div>
            )}

            {viewMode === 'hardware_v3' && (
                <div className="w-full animate-in fade-in duration-500">
                    <HardwareSyncV2 />
                </div>
            )}

            {viewMode === 'news_v3' && (
                <div className="w-full animate-in fade-in duration-500">
                    <NewsletterV2 />
                </div>
            )}

            {viewMode === 'exit_v2' && (
                <div className="w-full animate-in fade-in duration-500">
                    <AutonomousExit />
                </div>
            )}
         </CommandCenterLayout>
      </div>

    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function OutputFormatSelector({ format, setFormat }: { format: string; setFormat: (f: any) => void }) {
  return (
    <div className="flex items-center bg-black/40 backdrop-blur-md rounded-lg p-0.5 border border-white/10">
      
      <RichTooltip 
        content="Text Post"
        trigger={
           <button onClick={() => setFormat("text")} className={`p-1.5 rounded-md transition-all ${format === "text" ? "bg-white/10 text-white shadow-sm" : "text-neutral-400 hover:text-white hover:bg-white/5"}`}><FileText className="w-3.5 h-3.5" /></button>
        }
      />

      <RichTooltip 
        content="Video Script"
        trigger={
          <button onClick={() => setFormat("video")} className={`p-1.5 rounded-md transition-all ${format === "video" ? "bg-red-500/20 text-red-300 shadow-sm ring-1 ring-red-500/20" : "text-neutral-400 hover:text-white hover:bg-white/5"}`}><Brain className="w-3.5 h-3.5" /></button>
        }
      />

      <RichTooltip 
        content="Audio Narration"
        trigger={
          <button onClick={() => setFormat("audio")} className={`p-1.5 rounded-md transition-all ${format === "audio" ? "bg-purple-500/20 text-purple-300 shadow-sm ring-1 ring-purple-500/20" : "text-neutral-400 hover:text-white hover:bg-white/5"}`}><Database className="w-3.5 h-3.5" /></button>
        }
      />

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
