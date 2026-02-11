/**
 * ToolBar Component
 * -----------------
 * The control bar with all feature toggles and navigation buttons.
 * Extracted from StreamingConsole for maintainability.
 */

"use client";

import { UserCircle2, Zap, Brain, Sparkles, Users, Mic, Bot, FileText, Command, Database, Calendar, Ghost, BarChart3, LayoutGrid, Settings, Anchor, TrendingUp, Plus, Trash2, Save, Download, Grid, Share2, Copy, History, Target, MoreHorizontal, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { PERSONAS, PersonaId, Persona } from "../../utils/personas";
import { SECTORS, SectorId, Sector } from "../../utils/sectors";
import { buttonVariants } from "../../utils/animations";

export interface ToolBarProps {
  // Persona
  personaId: PersonaId;
  setPersonaId: (id: PersonaId) => void;
  customPersonas: Persona[];
  
  // Sector
  sectorId: SectorId;
  setSectorId: (id: SectorId) => void;

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
  isTeamMode: boolean;
  setIsTeamMode: (val: boolean) => void;
  onOpenHookLab: () => void;
  onOpenLeadMagnet: () => void;
  onOpenViralLab: () => void;
  onOpenGrowthSimulator: () => void;
  onOpenVault: () => void;
  onOpenCompetitor: () => void;
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
  isTeamMode,
  setIsTeamMode,
  onOpenHookLab,
  onOpenLeadMagnet,
  onOpenViralLab,
  onOpenGrowthSimulator,
  onOpenVault,
  onOpenCompetitor,
  sectorId,
  setSectorId,
}: ToolBarProps) {
  const [showTools, setShowTools] = useState<'config' | 'dashboards' | null>(null);
  const allPersonas = [...Object.values(PERSONAS), ...customPersonas];
  const activeSector = SECTORS[sectorId] || SECTORS.general;

  return (
    <div className="border-t border-white/[0.03] bg-white/[0.01] p-4 flex flex-wrap items-center justify-between gap-4 rounded-b-2xl backdrop-blur-xl">
      <div className="flex items-center gap-6">
        {/* Persona Selector - Simplified */}
        <div className="flex items-center gap-3 group relative">
          <UserCircle2 className="w-4 h-4 text-neutral-500 group-hover:text-white transition-colors" />
          <div className="flex flex-col">
            <span className="text-[8px] font-bold text-neutral-600 uppercase tracking-widest">Persona</span>
            <select
                value={personaId}
                onChange={(e) => setPersonaId(e.target.value as PersonaId)}
                className="bg-transparent text-xs text-neutral-300 font-bold outline-none cursor-pointer hover:text-white transition-colors"
            >
                {allPersonas.map((p) => (
                <option key={p.id} value={p.id} className="bg-[#0c1117] text-white">
                    {p.name}
                </option>
                ))}
            </select>
          </div>
        </div>

        <div className="w-px h-6 bg-white/[0.05]" />

        {/* Sector Selector - Simplified */}
        <div className="flex items-center gap-3 group relative">
            <LayoutGrid className="w-4 h-4 text-neutral-500 group-hover:text-white transition-colors" />
            <div className="flex flex-col">
                <span className="text-[8px] font-bold text-neutral-600 uppercase tracking-widest">Sector</span>
                <div className="relative">
                    <button className="text-xs text-neutral-300 font-bold hover:text-white transition-colors pr-4">
                        {activeSector.name}
                    </button>
                    <select
                        value={sectorId}
                        onChange={(e) => setSectorId(e.target.value as SectorId)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    >
                        {Object.values(SECTORS).map((s) => (
                        <option key={s.id} value={s.id} className="bg-neutral-900 border-none">
                            {s.name}
                        </option>
                        ))}
                    </select>
                </div>
            </div>
        </div>

        {/* Primary Controls */}
        <div className="flex items-center gap-2">
            {/* Live Session - High Status */}
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

        {/* Unified Controls Popover */}
        <div className="flex items-center gap-2">
            <div className="relative">
                <button
                    onClick={() => setShowTools(showTools === 'config' ? null : 'config')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all border ${showTools === 'config' ? 'bg-white text-black border-white' : 'bg-white/[0.03] text-neutral-400 border-white/[0.05] hover:border-white/20'}`}
                >
                    <Settings className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Studio</span>
                </button>

                <AnimatePresence>
                    {showTools === 'config' && (
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute right-0 bottom-full mb-3 w-72 bg-[#0A0A0A] border border-white/[0.08] rounded-2xl p-4 shadow-[0_30px_60px_rgba(0,0,0,0.8)] z-50 flex flex-col gap-4"
                        >
                            <div>
                                <p className="text-[9px] font-bold text-neutral-600 uppercase tracking-widest mb-3">Power Switches</p>
                                <div className="grid grid-cols-5 gap-2">
                                    <ToggleButton active={useNewsjack} onClick={() => setUseNewsjack(!useNewsjack)} activeClass="bg-red-500/20 text-red-400 ring-1 ring-red-500/30" title="Research" icon={<Zap className="w-4 h-4" />} />
                                    <ToggleButton active={useRAG} onClick={() => setUseRAG(!useRAG)} activeClass="bg-blue-500/20 text-blue-400 ring-1 ring-blue-500/30" title="Knowledge" icon={<Brain className="w-4 h-4" />} />
                                    <ToggleButton active={useFewShot} onClick={() => setUseFewShot(!useFewShot)} activeClass="bg-amber-500/20 text-amber-400 ring-1 ring-amber-500/30" title="Mirroring" icon={<Sparkles className="w-4 h-4" />} />
                                    <ToggleButton active={useSwarm} onClick={() => setUseSwarm(!useSwarm)} activeClass="bg-indigo-500/20 text-indigo-400 ring-1 ring-indigo-500/30" title="Council" icon={<Users className="w-4 h-4" />} />
                                    <ToggleButton active={useAgenticMode} onClick={() => setUseAgenticMode(!useAgenticMode)} activeClass="bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/30" title="Agentic" icon={<Bot className="w-4 h-4" />} />
                                </div>
                            </div>
                            
                            <div className="h-px bg-white/[0.05]" />
                            
                            <div className="grid grid-cols-2 gap-2">
                                <ToolItem compact onClick={() => { setIsAnalyticsOpen(true); setShowTools(null); }} label="Analytics" icon={<BarChart3 className="w-4 h-4" />} color="text-neutral-400" />
                                <ToolItem compact onClick={() => { setIsScheduleOpen(true); setShowTools(null); }} label="Schedule" icon={<Calendar className="w-4 h-4" />} color="text-neutral-400" />
                                <ToolItem compact onClick={() => { setIsVoiceTrainerOpen(true); setShowTools(null); }} label="Voice DNA" icon={<Mic className="w-4 h-4" />} color="text-neutral-400" />
                                <ToolItem compact onClick={() => { onOpenGrowthSimulator(); setShowTools(null); }} label="Growth" icon={<TrendingUp className="w-4 h-4" />} color="text-neutral-400" />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
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
    <motion.button
      onClick={onClick}
      variants={buttonVariants}
      initial="idle"
      whileHover="hover"
      whileTap="tap"
      className={`p-2 rounded-lg transition-colors ${
        active ? activeClass : "text-neutral-500 hover:text-neutral-300 hover:bg-white/5"
      }`}
      title={title}
    >
      {icon}
    </motion.button>
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
    <motion.button
      onClick={onClick}
      variants={buttonVariants}
      initial="idle"
      whileHover="hover"
      whileTap="tap"
      className={`p-2 rounded-lg text-neutral-500 ${hoverClass} hover:bg-white/5 transition-colors`}
      title={title}
    >
      {icon}
    </motion.button>
  );
}

function ToolItem({ onClick, label, icon, color, compact }: { onClick: () => void, label: string, icon: React.ReactNode, color: string, compact?: boolean }) {
    return (
        <button 
            onClick={onClick}
            className={`flex items-center justify-start px-4 py-3 rounded-xl hover:bg-white/5 transition-all gap-4 group border border-transparent hover:border-white/[0.05] ${compact ? 'col-span-1' : 'col-span-1'}`}
        >
            <div className={`${color} group-hover:scale-110 transition-transform`}>
                {icon}
            </div>
            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">{label}</span>
        </button>
    );
}
