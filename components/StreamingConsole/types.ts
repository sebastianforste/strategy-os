/**
 * SHARED TYPES - StreamingConsole Module
 * --------------------------------------
 * Centralized type definitions for the StreamingConsole component family.
 */

import { Signal } from "../../utils/signal-service";
import { PredictionResult } from "../../utils/predictive-service";
import { Suggestion } from "../../utils/suggestion-service";
import { ApiKeys } from "../SettingsModal";
import { PersonaId, Persona } from "../../utils/personas";
import { GeneratedAssets } from "../../utils/ai-service";
import { PostingJob } from "../../utils/posting-agent";
import { SwarmMessage } from "../../utils/swarm-service";
import { SystemVitals } from "../../utils/vitals-service";
import { SectorId } from "../../utils/sectors";

export interface StreamingConsoleProps {
  initialValue: string;
  onGenerationComplete: (result: string | GeneratedAssets) => void;
  apiKeys: ApiKeys;
  personaId: PersonaId;
  setPersonaId: (id: PersonaId) => void;
  useNewsjack: boolean;
  setUseNewsjack: (val: boolean) => void;
  useRAG: boolean;
  setUseRAG: (val: boolean) => void;
  useFewShot: boolean;
  setUseFewShot: (val: boolean) => void;
  useSwarm: boolean;
  setUseSwarm: (val: boolean) => void;
  platform: "linkedin" | "twitter";
  setPlatform: (val: "linkedin" | "twitter") => void;
  isTeamMode: boolean;
  setIsTeamMode: (val: boolean) => void;
  vitals?: SystemVitals;
  onError?: (msg: string) => void;
  sectorId: SectorId;
  setSectorId: (id: SectorId) => void;
  onOpenVoiceStudio?: () => void;
  onToggleRadar?: (enabled: boolean) => void;
  onTriggerAutonomousDraft?: () => void;
  onOpenIdeaFactory?: () => void;
  onOpenVisualAlchemist?: () => void;
  onOpenRecon?: () => void;
  onOpenMastermind?: () => void;
  onOpenBoardroom?: () => void;
  onOpenNarrative?: () => void;
}

export interface ConsoleState {
  // Core
  input: string;
  setInput: (val: string) => void;
  images: string[];
  setImages: (val: string[]) => void;
  
  // UI State
  isLibraryOpen: boolean;
  setIsLibraryOpen: (val: boolean) => void;
  isVoiceTrainerOpen: boolean;
  setIsVoiceTrainerOpen: (val: boolean) => void;
  isComplianceOpen: boolean;
  setIsComplianceOpen: (val: boolean) => void;
  isPostingModalOpen: boolean;
  setIsPostingModalOpen: (val: boolean) => void;
  isGalleryOpen: boolean;
  setIsGalleryOpen: (val: boolean) => void;
  isCloneModalOpen: boolean;
  setIsCloneModalOpen: (val: boolean) => void;
  isAnalyticsOpen: boolean;
  setIsAnalyticsOpen: (val: boolean) => void;
  isScheduleOpen: boolean;
  setIsScheduleOpen: (val: boolean) => void;
  isBatchOpen: boolean;
  setIsBatchOpen: (val: boolean) => void;
  isAccountSettingsOpen: boolean;
  setIsAccountSettingsOpen: (val: boolean) => void;
  
  // Suggestions & Signals
  suggestions: Suggestion[];
  setSuggestions: (val: Suggestion[]) => void;
  showSuggestions: boolean;
  setShowSuggestions: (val: boolean) => void;
  signals: Signal[];
  setSignals: (val: Signal[]) => void;
  isFetchingSignals: boolean;
  setIsFetchingSignals: (val: boolean) => void;
  
  // Prediction
  prediction: PredictionResult | null;
  setPrediction: (val: PredictionResult | null) => void;
  isPredicting: boolean;
  setIsPredicting: (val: boolean) => void;
  
  // Agentic Mode
  useAgenticMode: boolean;
  setUseAgenticMode: (val: boolean) => void;
  agenticPhase: string;
  setAgenticPhase: (val: string) => void;
  agenticScore: number | null;
  setAgenticScore: (val: number | null) => void;
  agenticIteration: number;
  setAgenticIteration: (val: number) => void;
  isAgenticRunning: boolean;
  setIsAgenticRunning: (val: boolean) => void;
  
  // Swarm
  swarmMessages: SwarmMessage[];
  setSwarmMessages: (val: SwarmMessage[] | ((prev: SwarmMessage[]) => SwarmMessage[])) => void;
  activeSwarmRole: string | null;
  setActiveSwarmRole: (val: string | null) => void;
  isSwarmRunning: boolean;
  setIsSwarmRunning: (val: boolean) => void;
  
  // Multi-Modal
  outputFormat: "text" | "video" | "audio";
  setOutputFormat: (val: "text" | "video" | "audio") => void;
  viewMode: "feed" | "canvas";
  setViewMode: (val: "feed" | "canvas") => void;
  dynamicChips: { label: string; prompt: string }[];
  setDynamicChips: (val: { label: string; prompt: string }[]) => void;
  isMultiModalLoading: boolean;
  setIsMultiModalLoading: (val: boolean) => void;
  
  // Voice
  isListening: boolean;
  setIsListening: (val: boolean) => void;
  trainingExamples: string;
  setTrainingExamples: (val: string) => void;
  
  // Terminal
  useTerminalMode: boolean;
  setUseTerminalMode: (val: boolean) => void;
  
  // Publishing
  currentPostingJob: PostingJob | null;
  setCurrentPostingJob: (val: PostingJob | null) => void;
  isDirectPublishing: boolean;
  setIsDirectPublishing: (val: boolean) => void;
  
  // Personas
  customPersonas: Persona[];
  setCustomPersonas: (val: Persona[]) => void;
  vitals: SystemVitals;
  setVitals: (val: SystemVitals) => void;
  sectorId: SectorId;
  setSectorId: (val: SectorId) => void;
}

export interface StarterChip {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  prompt: string;
}

export const DEFAULT_STARTER_CHIPS: StarterChip[] = [
  { label: "Analyze a Trend", icon: () => null, prompt: "Analyze the latest trend in [Industry]..." },
  { label: "Strategic Pivot", icon: () => null, prompt: "Why most companies fail at [Strategy]..." },
  { label: "Contrarian Take", icon: () => null, prompt: "Everyone thinks [X] is good, but actually..." },
  { label: "Team Kudos", icon: () => null, prompt: "Ghostwrite a post for [Name] ([Role]) about their achievement: [Project/Win]. Use an authentic, high-performer voice." },
];
