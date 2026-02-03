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
import { buttonVariants } from "../../utils/animations";

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
}: ToolBarProps) {
  const [showTools, setShowTools] = useState<'config' | 'dashboards' | null>(null);
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

            {/* Config Popover (Progressive Disclosure) */}
            <div className="relative">
                <button
                    onClick={() => setShowTools(showTools === 'config' ? null : 'config')}
                    className={`p-2 rounded-lg transition-colors border ${showTools === 'config' ? 'bg-white/10 text-white border-white/20' : 'text-neutral-400 hover:text-white border-transparent hover:bg-white/5'}`}
                    title="Configuration"
                >
                    <Settings className="w-4 h-4" />
                </button>

                <AnimatePresence>
                    {showTools === 'config' && (
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute left-0 bottom-full mb-2 w-64 bg-[#0c0c0c] border border-white/10 rounded-2xl p-3 shadow-2xl z-50 flex flex-col gap-2"
                        >
                            <p className="text-[10px] uppercase font-bold text-neutral-500 px-1">Active Modules</p>
                            <div className="flex flex-wrap gap-2">
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
                                  title="Strategy Brain"
                                  icon={<Brain className="w-4 h-4" />}
                                />
                                <ToggleButton
                                  active={useFewShot}
                                  onClick={() => setUseFewShot(!useFewShot)}
                                  activeClass="bg-amber-500/20 text-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.3)]"
                                  title="Mirroring"
                                  icon={<Sparkles className="w-4 h-4" />}
                                />
                                <ToggleButton
                                  active={useSwarm}
                                  onClick={() => setUseSwarm(!useSwarm)}
                                  activeClass="bg-indigo-500/20 text-indigo-400 shadow-[0_0_10px_rgba(99,102,241,0.3)]"
                                  title="Council of Agents"
                                  icon={<Users className="w-4 h-4" />}
                                />
                                <ToggleButton
                                    active={useAgenticMode}
                                    onClick={() => setUseAgenticMode(!useAgenticMode)}
                                    activeClass="bg-cyan-500/20 text-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.3)] ring-1 ring-cyan-400/50"
                                    title="Agentic Mode"
                                    icon={<Bot className="w-4 h-4" />}
                                />
                            </div>
                            
                            <div className="h-px bg-white/5 my-1" />
                            
                            <button 
                                onClick={() => setIsVoiceTrainerOpen(true)}
                                className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/5 transition-colors text-xs text-neutral-300 hover:text-white"
                            >
                                <Mic className="w-4 h-4 text-amber-400" />
                                <span>Voice Trainer</span>
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

          {/* Tools Dropdown */}
          <div className="relative">
              <button 
                onClick={() => setShowTools(showTools === 'dashboards' ? null : 'dashboards')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all ${showTools === 'dashboards' ? 'bg-white text-black border-white' : 'bg-white/5 text-neutral-400 border-white/10 hover:border-white/20'}`}
              >
                <LayoutGrid className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">Dashboards</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${showTools ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {showTools === 'dashboards' && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 bottom-full mb-2 w-64 bg-[#0c0c0c] border border-white/10 rounded-2xl p-2 shadow-2xl z-50 grid grid-cols-3 gap-1"
                    >
                        <ToolItem onClick={() => { setIsAnalyticsOpen(true); setShowTools(null); }} label="Stats" icon={<BarChart3 className="w-4 h-4" />} color="text-emerald-400" />
                        <ToolItem onClick={() => { setIsScheduleOpen(true); setShowTools(null); }} label="Queue" icon={<Calendar className="w-4 h-4" />} color="text-orange-400" />
                        <ToolItem onClick={() => { setIsBatchOpen(true); setShowTools(null); }} label="Batch" icon={<Ghost className="w-4 h-4" />} color="text-pink-400" />
                        <ToolItem onClick={() => { onOpenHookLab(); setShowTools(null); }} label="Hooks" icon={<Sparkles className="w-4 h-4" />} color="text-indigo-400" />
                        <ToolItem onClick={() => { onOpenLeadMagnet(); setShowTools(null); }} label="Leads" icon={<Anchor className="w-4 h-4" />} color="text-amber-400" />
                        <ToolItem onClick={() => { onOpenViralLab(); setShowTools(null); }} label="Viral" icon={<Zap className="w-4 h-4" />} color="text-red-400" />
                        <ToolItem onClick={() => { onOpenGrowthSimulator(); setShowTools(null); }} label="Growth" icon={<TrendingUp className="w-4 h-4" />} color="text-amber-400" />
                        <ToolItem onClick={() => { onOpenVault(); setShowTools(null); }} label="Vault" icon={<Database className="w-4 h-4" />} color="text-blue-400" />
                        <ToolItem onClick={() => { onOpenCompetitor(); setShowTools(null); }} label="Rivals" icon={<Target className="w-4 h-4" />} color="text-neutral-400" />
                        
                        <div className="col-span-3 h-px bg-white/5 my-1" />
                        
                        <ToolItem onClick={() => { setIsComplianceOpen(true); setShowTools(null); }} label="Audit" icon={<FileText className="w-4 h-4" />} color="text-green-400" />
                        <ToolItem onClick={() => { setIsVoiceTrainerOpen(true); setShowTools(null); }} label="Voice" icon={<Mic className="w-4 h-4" />} color="text-amber-400" />
                        <ToolItem onClick={() => { setIsTeamSettingsOpen(true); setShowTools(null); }} label="Team" icon={<Users className="w-4 h-4" />} color="text-indigo-400" />
                    </motion.div>
                )}
              </AnimatePresence>
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

function ToolItem({ onClick, label, icon, color }: { onClick: () => void, label: string, icon: React.ReactNode, color: string }) {
    return (
        <button 
            onClick={onClick}
            className="flex flex-col items-center justify-center p-3 rounded-xl hover:bg-white/5 transition-all gap-1.5 group"
        >
            <div className={`${color} group-hover:scale-110 transition-transform`}>
                {icon}
            </div>
            <span className="text-[8px] font-bold text-neutral-500 uppercase tracking-tighter">{label}</span>
        </button>
    );
}
