/**
 * ToolBar Component
 * -----------------
 * The control bar with all feature toggles and navigation buttons.
 * Extracted from StreamingConsole for maintainability.
 */

"use client";

import { UserCircle2, Zap, Brain, Sparkles, Users, Mic, Bot, FileText, Command, Database, Calendar, Ghost, BarChart3 } from "lucide-react";
import { PERSONAS, PersonaId, Persona } from "../../utils/personas";

export interface ToolBarProps {
  // Persona
  personaId: PersonaId;
  setPersonaId: (id: PersonaId) => void;
  customPersonas: Persona[];
  
  // Feature toggles
  useNewsjack: boolean;
  setUseNewsjack: (val: boolean) => void;
  useRAG: boolean;
  setUseRAG: (val: boolean) => void;
  useFewShot: boolean;
  setUseFewShot: (val: boolean) => void;
  useSwarm: boolean;
  setUseSwarm: (val: boolean) => void;
  useAgenticMode: boolean;
  setUseAgenticMode: (val: boolean) => void;
  
  // Modal openers
  setIsLiveSessionOpen: (val: boolean) => void;
  setIsVoiceTrainerOpen: (val: boolean) => void;
  setIsComplianceOpen: (val: boolean) => void;
  setUseTerminalMode: (val: boolean) => void;
  setIsGalleryOpen: (val: boolean) => void;
  setIsAnalyticsOpen: (val: boolean) => void;
  setIsScheduleOpen: (val: boolean) => void;
  setIsBatchOpen: (val: boolean) => void;
  setIsAccountSettingsOpen: (val: boolean) => void;
  setIsTeamSettingsOpen: (val: boolean) => void;
}

export default function ToolBar({
  personaId,
  setPersonaId,
  customPersonas,
  useNewsjack,
  setUseNewsjack,
  useRAG,
  setUseRAG,
  useFewShot,
  setUseFewShot,
  useSwarm,
  setUseSwarm,
  useAgenticMode,
  setUseAgenticMode,
  setIsLiveSessionOpen,
  setIsVoiceTrainerOpen,
  setIsComplianceOpen,
  setUseTerminalMode,
  setIsGalleryOpen,
  setIsAnalyticsOpen,
  setIsScheduleOpen,
  setIsBatchOpen,
  setIsAccountSettingsOpen,
  setIsTeamSettingsOpen,
}: ToolBarProps) {
  const allPersonas = [...Object.values(PERSONAS), ...customPersonas];

  return (
    <div className="border-t border-white/5 bg-white/5 p-3 flex flex-wrap items-center justify-between gap-4 rounded-b-xl backdrop-blur-md">
      <div className="flex items-center gap-4">
        {/* Persona Selector */}
        <div className="flex items-center gap-2">
          <UserCircle2 className="w-4 h-4 text-neutral-400" />
          <select
            value={personaId}
            onChange={(e) => setPersonaId(e.target.value as PersonaId)}
            className="bg-transparent text-sm text-neutral-300 font-medium outline-none cursor-pointer hover:text-white transition-colors"
          >
            {allPersonas.map((p) => (
              <option key={p.id} value={p.id} className="bg-neutral-900">
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div className="w-px h-4 bg-white/10" />

        {/* Feature Toggles */}
        <div className="flex items-center gap-2">
          <ToggleButton
            active={useNewsjack}
            onClick={() => setUseNewsjack(!useNewsjack)}
            activeClass="bg-red-500/20 text-red-400 shadow-[0_0_10px_rgba(248,113,113,0.3)]"
            title="Newsjack: Inject trending news"
            icon={<Zap className="w-4 h-4" />}
          />
          <ToggleButton
            active={useRAG}
            onClick={() => setUseRAG(!useRAG)}
            activeClass="bg-purple-500/20 text-purple-400 shadow-[0_0_10px_rgba(192,132,252,0.3)]"
            title="Strategy Brain: Use internal knowledge"
            icon={<Brain className="w-4 h-4" />}
          />
          <ToggleButton
            active={useFewShot}
            onClick={() => setUseFewShot(!useFewShot)}
            activeClass="bg-amber-500/20 text-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.3)]"
            title="Mirroring: Mimic best performing style"
            icon={<Sparkles className="w-4 h-4" />}
          />
          <ToggleButton
            active={useSwarm}
            onClick={() => setUseSwarm(!useSwarm)}
            activeClass="bg-indigo-500/20 text-indigo-400 shadow-[0_0_10px_rgba(99,102,241,0.3)]"
            title="Council of Agents: Hardens your strategy through adversarial debate"
            icon={<Users className="w-4 h-4" />}
          />

          <IconButton
            onClick={() => setIsVoiceTrainerOpen(true)}
            hoverClass="hover:text-amber-400"
            title="Train Voice Model"
            icon={<Mic className="w-4 h-4" />}
          />

          <button
             onClick={() => setIsLiveSessionOpen(true)}
             className="px-3 py-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 hover:text-indigo-300 border border-indigo-500/30 flex items-center gap-2 text-xs font-bold transition-all"
          >
             <span className="relative flex h-2 w-2">
               <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
               <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
             </span>
             LIVE
          </button>

          <ToggleButton
            active={useAgenticMode}
            onClick={() => setUseAgenticMode(!useAgenticMode)}
            activeClass="bg-cyan-500/20 text-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.3)] ring-1 ring-cyan-400/50"
            title="Agentic Mode: Autonomous research + self-improving loop"
            icon={<Bot className="w-4 h-4" />}
          />

          <IconButton
            onClick={() => setIsComplianceOpen(true)}
            hoverClass="hover:text-green-400"
            title="Compliance & Audit Logs"
            icon={<FileText className="w-4 h-4" />}
          />

          <IconButton
            onClick={() => setUseTerminalMode(true)}
            hoverClass="hover:text-white"
            title="Terminal Mode"
            icon={<Command className="w-4 h-4" />}
          />

          <IconButton
            onClick={() => setIsGalleryOpen(true)}
            hoverClass="hover:text-blue-400"
            title="Strategy Vault"
            icon={<Database className="w-4 h-4" />}
          />

          <IconButton
            onClick={() => setIsAnalyticsOpen(true)}
            hoverClass="hover:text-emerald-400"
            title="Analytics"
            icon={<BarChart3 className="w-4 h-4" />}
          />

          <IconButton
            onClick={() => setIsScheduleOpen(true)}
            hoverClass="hover:text-orange-400"
            title="Schedule Queue"
            icon={<Calendar className="w-4 h-4" />}
          />

          <IconButton
            onClick={() => setIsBatchOpen(true)}
            hoverClass="hover:text-pink-400"
            title="Batch Generator"
            icon={<Ghost className="w-4 h-4" />}
          />

          <IconButton
            onClick={() => setIsTeamSettingsOpen(true)}
            hoverClass="hover:text-indigo-400"
            title="Team Settings"
            icon={<Users className="w-4 h-4" />}
          />
        </div>
      </div>

      {/* Right side: Account Settings */}
      <button
        onClick={() => setIsAccountSettingsOpen(true)}
        className="text-xs text-neutral-500 hover:text-white transition-colors"
      >
        Settings
      </button>
    </div>
  );
}

// --- Helper Components ---

interface ToggleButtonProps {
  active: boolean;
  onClick: () => void;
  activeClass: string;
  title: string;
  icon: React.ReactNode;
}

function ToggleButton({ active, onClick, activeClass, title, icon }: ToggleButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`p-2 rounded-lg transition-all ${
        active ? activeClass : "text-neutral-500 hover:text-neutral-300 hover:bg-white/5"
      }`}
      title={title}
    >
      {icon}
    </button>
  );
}

interface IconButtonProps {
  onClick: () => void;
  hoverClass: string;
  title: string;
  icon: React.ReactNode;
}

function IconButton({ onClick, hoverClass, title, icon }: IconButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`p-2 rounded-lg text-neutral-500 ${hoverClass} hover:bg-white/5 transition-colors`}
      title={title}
    >
      {icon}
    </button>
  );
}
