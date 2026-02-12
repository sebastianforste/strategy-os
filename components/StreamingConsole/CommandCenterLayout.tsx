"use client";


import React, { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import StrategyArchive from "./StrategyArchive";
import {
  Zap,
  Settings,
  Terminal,
  ChevronDown,
  Bolt,
  CheckSquare,
  Square,
  Activity,
  Wifi,
  Cloud,
  Server,
  LayoutDashboard,
  Search,
  Grid,
  Ghost,
  TrendingUp,
  RefreshCw,
  Sparkles,
  History,
  Building2,
  Anchor,
  Palette,
  Target,
  ShoppingBag,
  Mic,
  Users,
  BookOpen,
  Cpu
} from "lucide-react";
import AutonomousControl from "../AutonomousControl";
import { ConsoleState } from "./types";
import { SectorId, SECTORS } from "../../utils/sectors";
import dynamic from "next/dynamic";
import { SystemVitals } from "../../utils/vitals-service";
import { PersonaId, PERSONAS } from "../../utils/personas";
import PresenceBar from "../PresenceBar";

const ListeningRadar = dynamic(() => import("../ListeningRadar"), { ssr: false });
const AvatarFactory = dynamic(() => import("../AvatarFactory"), { ssr: false });

export interface CommandCenterHelperProps {
  input: string;
  setInput: (val: string) => void;
  onGenerate: () => void;
  isGenerating: boolean;
  completion: string;
  vitals?: SystemVitals;
  personaId: PersonaId;
  setPersonaId: (id: PersonaId) => void;
  sectorId: SectorId;
  setSectorId: (id: SectorId) => void;
  useRAG: boolean;
  setUseRAG: (val: boolean) => void;
  useNewsjack: boolean;
  setUseNewsjack: (val: boolean) => void;
  useSwarm: boolean;
  setUseSwarm: (val: boolean) => void;
  assets?: import("../../utils/ai-service").GeneratedAssets | null;
  // Input Features
  images: string[];
  onRemoveImage: (index: number) => void;
  isDragActive: boolean;
  getRootProps: any;
  getInputProps: any;
  dynamicChips: { label: string; prompt: string }[];
  signals: any[]; // Using any to avoid importing Signal type or should import it
  isFetchingSignals: boolean;
  // Additional props for full potential
  phaseLogs?: string[];
  onOpenSettings?: () => void;
  onOpenHookLab?: () => void;
  showArchive: boolean;
  setShowArchive: (val: boolean) => void;
  onOpenVisualAlchemist?: () => void;
  onOpenRecon?: () => void;
  onOpenMastermind?: () => void;
  onOpenBoardroom?: () => void;
  onOpenNarrative?: () => void;
  onOpenVoiceStudio?: () => void;
  onToggleRadar?: (enabled: boolean) => void;
  onTriggerAutonomousDraft?: () => void;
  onOpenIdeaFactory?: () => void;
  outputSlot?: React.ReactNode;
  children?: React.ReactNode;
  mode: 'post' | 'reply';
  setMode: (mode: 'post' | 'reply') => void;
  isFloating?: boolean;
}

export default function CommandCenterLayout({
  input,
  setInput,
  onGenerate,
  isGenerating,
  completion,
  vitals,
  personaId,
  setPersonaId,
  sectorId,
  setSectorId,
  useRAG,
  setUseRAG,
  useNewsjack,
  setUseNewsjack,
  useSwarm,
  setUseSwarm,
  // assets, // Already in props below
  images,
  onRemoveImage,
  isDragActive,
  getRootProps,
  getInputProps,
  dynamicChips,
  signals,
  isFetchingSignals,
  phaseLogs = [],
  onOpenSettings,
  onOpenHookLab,
  showArchive,
  setShowArchive,
  onOpenVisualAlchemist,
  onOpenRecon,
  onOpenMastermind,
  onOpenBoardroom,
  onOpenNarrative,
  onOpenVoiceStudio,
  onToggleRadar,
  onTriggerAutonomousDraft,
  assets,
  onOpenIdeaFactory,
  outputSlot,
  children,
  mode,
  setMode,
  isFloating,
}: CommandCenterHelperProps) {
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);

  // Auto-scroll output
  useEffect(() => {
    if (outputRef.current) {
        outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [completion, phaseLogs]);

  // Command Palette Shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
       if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
          e.preventDefault();
          // This should ideally trigger the global command palette
          // For now, let's just focus the input if it's empty
          if (!input && textareaRef.current) {
             textareaRef.current.focus();
          }
       }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [input]);

  const starterChips = [
    { label: "Thought Leadership", icon: Zap, prompt: "Draft a high-status thought leadership post about..." },
    { label: "Market Dismantle", icon: Target, prompt: "Analysis: Dismantle the current market trend of..." },
    { label: "Personal Brand", icon: Sparkles, prompt: "Story: Create a personal brand narrative about..." }
  ];

  // Adjust textarea height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    }
  }, [input]);

  return (
    <div className={`relative flex w-full flex-col overflow-hidden transition-all duration-500 ${isFloating ? 'h-auto bg-transparent border-none shadow-none' : 'h-full liquid-panel text-white font-sans selection:bg-brand-600/30'}`}>
      
      {/* BACKGROUND EFFECTS */}
      {!isFloating && (
        <>
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-brand-600/10 rounded-full blur-[120px] pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-96 h-96 bg-blue-600/5 rounded-full blur-[120px] pointer-events-none"></div>
        </>
      )}

      {/* HEADER / VITALS */}
      {!isFloating && (
        <header className="flex items-center justify-between px-8 py-6 z-10 border-b border-white/[0.03]">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Terminal className="w-5 h-5 text-brand-500" />
            Command Center
          </h1>
          <div className="flex items-center gap-4 mt-1">
             {/* API VITAL */}
             <div className="flex items-center gap-1.5" title="Gemini API Status">
                <div className={`w-1.5 h-1.5 rounded-full ${vitals?.api === 'online' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-red-500'}`} />
                <span className="text-[10px] uppercase tracking-widest text-white/40 font-bold">API</span>
             </div>
             {/* DB VITAL */}
             <div className="flex items-center gap-1.5" title="Database Connection">
                <div className={`w-1.5 h-1.5 rounded-full ${vitals?.database === 'connected' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-red-500'}`} />
                <span className="text-[10px] uppercase tracking-widest text-white/40 font-bold">DB</span>
             </div>
             {/* NET VITAL */}
             <div className="flex items-center gap-1.5" title="Network Latency">
                <div className={`w-1.5 h-1.5 rounded-full ${vitals?.network === 'online' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-red-500'}`} />
                <span className="text-[10px] uppercase tracking-widest text-white/40 font-bold">NET: {vitals?.latencyMs || 0}ms</span>
             </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
           {/* Uptime Badge (Static for now, could be real) */}
           <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.05]">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-xs font-mono text-emerald-400">99.9% UPTIME</span>
           </div>

           <button 
             onClick={() => setShowArchive(!showArchive)}
             className={`flex items-center justify-center w-9 h-9 rounded-full border transition-all ${showArchive ? 'bg-brand-600 border-brand-500 text-white' : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 text-white/70 hover:text-white'}`}
             title="Toggle Strategy Archive"
           >
             <History className="w-4 h-4" />
           </button>

           <button 
             onClick={onOpenHookLab}
             className="flex items-center justify-center w-9 h-9 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all text-white/70 hover:text-white"
             title="Open Hook Lab"
           >
             <Anchor className="w-4 h-4" />
           </button>

           <button 
             onClick={onOpenSettings}
             className="flex items-center justify-center w-9 h-9 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all text-white/70 hover:text-white"
           >
             <Settings className="w-4 h-4" />
           </button>
        </div>
      </header>
      )}

      {/* MAIN CONTENT AREA */}
      <main className={`flex-1 overflow-y-auto custom-scrollbar z-10 flex flex-col gap-6 ${isFloating ? 'p-4 pb-4' : 'p-6 pb-32'}`}>
        
        {/* DYNAMIC VIEW CONTENT */}
        {children}

        {/* AUTONOMOUS CONTROL (Phase 45) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
            <AutonomousControl 
                onToggleRadar={onToggleRadar}
                onTriggerDraft={onTriggerAutonomousDraft}
            />
            <ListeningRadar />
        </div>

        {/* AVATAR SYNTHESIS (Phase 50) */}
        {assets && (
            <div className="mt-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
                <AvatarFactory 
                    videoScript={assets.videoScript || ""}
                    textPost={assets.textPost || ""}
                  />
            </div>
        )}

        {/* INPUT BUFFER SECTION */}
        <div className="group relative">
           <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-brand-600/30 to-purple-600/30 opacity-0 group-focus-within:opacity-100 transition duration-500 blur-sm"></div>
           <div className="relative flex flex-col bg-[#0f111a]/80 backdrop-blur-3xl rounded-2xl border border-white/10 transition-all duration-300 group-focus-within:border-brand-500/50 shadow-2xl">
              
              {/* Toolbar Label */}
              <div className="flex items-center justify-between px-5 pt-4 pb-2">
                 <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-brand-400 uppercase tracking-widest">Input Buffer</span>
                    {isGenerating && <span className="flex h-1.5 w-1.5 rounded-full bg-brand-400 animate-pulse"/>}
                 </div>
                 <div className="flex items-center gap-2">
                    <kbd className="hidden md:inline-flex items-center gap-1 px-2 py-1 rounded bg-white/5 border border-white/10 text-[10px] text-white/40 font-sans">
                       CMD + ENTER
                    </kbd>
                 </div>
              </div>
              
              {/* Drag & Drop Zone Wrapper */}
              <div {...getRootProps()} className="relative flex-1">
                 <input {...getInputProps()} />
                 
                 {/* Drag Overlay */}
                 {isDragActive && (
                    <div className="absolute inset-0 bg-brand-500/10 backdrop-blur-sm flex items-center justify-center border-2 border-brand-500 border-dashed rounded-xl z-20 m-2">
                       <div className="text-center text-brand-400 font-bold">
                          Drop to Analyze
                       </div>
                    </div>
                 )}

                 {/* Chips & Signals */}
                 <div className="px-5 pt-2 flex flex-wrap gap-2">
                    {/* Dynamic Chips */}
                    {dynamicChips.map((chip, idx) => (
                       <button
                          key={idx}
                          onClick={() => setInput(chip.prompt)}
                          className="flex items-center gap-1.5 px-2 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] text-white/50 hover:text-white hover:border-white/20 transition-all"
                       >
                          <Sparkles className="w-3 h-3 text-amber-400" />
                          {chip.label}
                       </button>
                    ))}
                    
                    {/* Signals Loading */}
                    {isFetchingSignals && (
                       <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-white/5 border border-white/5 rounded text-[10px] text-white/40 animate-pulse">
                          <Zap className="w-3 h-3" /> Scanning...
                       </span>
                    )}

                    {/* Active Signals */}
                    {signals.map((s, i) => (
                       <div key={i} className="inline-flex items-center gap-1.5 px-2 py-1 bg-red-500/10 border border-red-500/20 rounded-full text-[10px] text-red-300">
                          <Zap className="w-3 h-3 text-red-400" />
                          {s.value}
                       </div>
                    ))}
                 </div>

                 {/* ZEN START OVERLAY (Phase 24) */}
                 {!input && images.length === 0 && (
                   <div className="absolute inset-0 p-6 pb-20 pointer-events-none flex flex-col gap-4 z-10">
                     <motion.h2 
                       initial={{ opacity: 0, y: 10 }}
                       animate={{ opacity: 1, y: 0 }}
                       className="text-white/80 text-3xl font-black uppercase tracking-tighter"
                     >
                       Zen Start
                     </motion.h2>
                     <motion.p 
                       initial={{ opacity: 0, y: 10 }}
                       animate={{ opacity: 1, y: 0 }}
                       transition={{ delay: 0.1 }}
                       className="text-neutral-500 text-sm uppercase tracking-widest font-mono"
                     >
                       Select a strategic objective to begin
                     </motion.p>
                     <div className="flex flex-wrap gap-2 mt-4 pointer-events-auto">
                       {starterChips.map((chip, i) => (
                          <button 
                            key={i}
                            onClick={() => setInput(chip.prompt)}
                            className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-[10px] text-neutral-400 hover:text-white hover:bg-white/10 hover:border-brand-500/50 transition-all uppercase tracking-widest font-black group"
                          >
                            <chip.icon className="w-3 h-3 text-brand-400 group-hover:scale-110 transition-transform" />
                            {chip.label}
                          </button>
                       ))}
                     </div>
                   </div>
                 )}

                 <textarea
                   ref={textareaRef}
                   value={input}
                   onChange={(e) => setInput(e.target.value)}
                   onKeyDown={(e) => {
                     if ((e.metaKey || e.ctrlKey) && e.key === "Enter" && !isGenerating) {
                       e.preventDefault();
                       onGenerate();
                     }
                   }}
                   disabled={isGenerating}
                   className={`w-full bg-transparent border-none text-white focus:ring-0 placeholder:text-white/20 text-lg leading-relaxed font-light resize-none outline-none relative z-0 transition-all ${isFloating ? 'min-h-[60px] md:min-h-[80px] px-2 py-2' : 'px-5 py-3 min-h-[120px] md:min-h-[160px]'}`}
                   placeholder={mode === 'reply' ? "Enter technical rebuttal or contrarian angle..." : "Enter command or high-level strategic objective..."}
                 />

                 {/* Image Previews */}
                 {images.length > 0 && (
                    <div className="px-5 pb-4 flex gap-2">
                       {images.map((img, i) => (
                          <div key={i} className="relative group/img" onClick={(e) => e.stopPropagation()}>
                             <img src={img} alt="Upload" className="w-12 h-12 object-cover rounded-lg border border-white/20" />
                             <button
                                onClick={(e) => { e.stopPropagation(); onRemoveImage(i); }}
                                className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover/img:opacity-100 transition-opacity"
                             >
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                             </button>
                          </div>
                       ))}
                    </div>
                 )}
              </div>
            
            {/* INPUT BUFFER TOOLBAR */}
            <div className="absolute right-4 bottom-4 flex items-center gap-2 z-30">
               <button 
                  onClick={onOpenVoiceStudio}
                  className="p-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-all"
                  title="Voice Lab"
               >
                  <Mic className="w-4 h-4" />
               </button>
               <button 
                  onClick={onOpenVisualAlchemist}
                  className="p-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-all"
                  title="Visual Alchemist"
               >
                  <Palette className="w-4 h-4" />
               </button>
               <button 
                  onClick={onOpenRecon}
                  className="p-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-all"
                  title="Competitive Recon"
               >
                  <Target className="w-4 h-4" />
               </button>
               <button 
                  onClick={onOpenMastermind}
                  className="p-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-all"
                  title="Mastermind Market"
               >
                  <ShoppingBag className="w-4 h-4" />
               </button>
               <button 
                  onClick={onOpenBoardroom}
                  className="p-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-all"
                  title="Boardroom Debate"
               >
                  <Users className="w-4 h-4" />
               </button>
               <PresenceBar />
            </div>
            <div className="flex items-center gap-2">
               <button 
                  onClick={onOpenNarrative}
                  className="p-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-all"
                  title="Narrative Architect"
               >
                  <BookOpen className="w-4 h-4" />
               </button>
               <button 
                  onClick={onOpenIdeaFactory}
                  className="p-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-all"
                  title="Idea Factory"
               >
                  <Cpu className="w-4 h-4" />
               </button>
            </div>
         </div>
      </div>

        {/* TERMINAL OUTPUT SLOT (Standardized Phase 2) */}
        {outputSlot}

      </main>

      {/* FLOATING ACTION BAR (Bottom Control Deck) */}
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#080a0f] via-[#080a0f] to-transparent z-20">
         <div className="liquid-glass rounded-2xl p-4 shadow-2xl flex flex-col md:flex-row gap-4 items-center justify-between">
            
            {/* LEFT: Persona & Settings */}
            <div className="flex items-center gap-4 w-full md:w-auto">
               <div className="relative group min-w-[200px] flex-1 md:flex-none">
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                     <Sparkles className="w-4 h-4 text-brand-400" />
                  </div>
                  <select 
                    value={personaId} 
                    onChange={(e) => setPersonaId(e.target.value as PersonaId)}
                    className="w-full appearance-none bg-white/5 border border-white/10 hover:border-white/20 transition-colors rounded-xl py-2.5 pl-10 pr-10 text-sm text-white focus:outline-none focus:border-brand-500/50 cursor-pointer font-medium"
                  >
                     {Object.entries(PERSONAS).map(([id, p]) => (
                       <option key={id} value={id} className="bg-[#080a0f] text-white">
                         {p.name}
                       </option>
                     ))}
                  </select>
                  <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                     <ChevronDown className="w-4 h-4 text-white/30" />
                  </div>
               </div>

               {/* SECTOR SELECTOR (Phase 23) */}
               <div className="relative group min-w-[200px] flex-1 md:flex-none">
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                     <Building2 className="w-4 h-4 text-brand-400" />
                  </div>
                  <select 
                    value={sectorId} 
                    onChange={(e) => setSectorId(e.target.value as SectorId)}
                    className="w-full appearance-none bg-white/5 border border-white/10 hover:border-white/20 transition-colors rounded-xl py-2.5 pl-10 pr-10 text-sm text-white focus:outline-none focus:border-brand-500/50 cursor-pointer font-medium"
                  >
                     {Object.entries(SECTORS).map(([id, s]) => (
                       <option key={id} value={id} className="bg-[#080a0f] text-white">
                         {s.name}
                       </option>
                     ))}
                  </select>
                  <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                     <ChevronDown className="w-4 h-4 text-white/30" />
                  </div>
               </div>
            </div>

            {/* CENTER: Toggles */}
            <div className="flex items-center gap-6 px-4 py-2 bg-black/20 rounded-xl border border-white/5">
               {/* RAG Toggle */}
               <label className="flex items-center gap-2 cursor-pointer group select-none">
                  {useRAG ? (
                    <CheckSquare className="w-4 h-4 text-brand-500" />
                  ) : (
                    <Square className="w-4 h-4 text-white/20 group-hover:text-white/40" />
                  )}
                  <div className="flex flex-col">
                    <span className={`text-[10px] font-bold uppercase tracking-widest ${useRAG ? 'text-white' : 'text-white/40 group-hover:text-white/60'}`}>RAG</span>
                    <input type="checkbox" checked={useRAG} onChange={(e) => setUseRAG(e.target.checked)} className="hidden" />
                  </div>
               </label>
               
               <div className="w-px h-6 bg-white/10"></div>

               {/* Newsjack Toggle */}
               <label className="flex items-center gap-2 cursor-pointer group select-none">
                  {useNewsjack ? (
                    <CheckSquare className="w-4 h-4 text-brand-500" />
                  ) : (
                    <Square className="w-4 h-4 text-white/20 group-hover:text-white/40" />
                  )}
                  <div className="flex flex-col">
                    <span className={`text-[10px] font-bold uppercase tracking-widest ${useNewsjack ? 'text-white' : 'text-white/40 group-hover:text-white/60'}`}>Newsjack</span>
                    <input type="checkbox" checked={useNewsjack} onChange={(e) => setUseNewsjack(e.target.checked)} className="hidden" />
                  </div>
               </label>

               <div className="w-px h-6 bg-white/10"></div>

               {/* Swarm Toggle */}
               <label className="flex items-center gap-2 cursor-pointer group select-none">
                  {useSwarm ? (
                    <CheckSquare className="w-4 h-4 text-brand-500" />
                  ) : (
                    <Square className="w-4 h-4 text-white/20 group-hover:text-white/40" />
                  )}
                  <div className="flex flex-col">
                    <span className={`text-[10px] font-bold uppercase tracking-widest ${useSwarm ? 'text-white' : 'text-white/40 group-hover:text-white/60'}`}>Swarm</span>
                    <input type="checkbox" checked={useSwarm} onChange={(e) => setUseSwarm(e.target.checked)} className="hidden" />
                  </div>
               </label>
            </div>

            {/* RIGHT: Generate Button */}
            <button
               onClick={onGenerate}
               disabled={!input.trim() || isGenerating}
               className={`relative group overflow-hidden px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${isGenerating ? 'bg-secondary text-white/50' : 'bg-brand-600 hover:bg-brand-500 text-white shadow-[0_0_20px_rgba(124,58,237,0.4)]'}`}
            >
               {isGenerating ? (
                 <>
                   <RefreshCw className="w-4 h-4 animate-spin" />
                   <span>EXECUTING...</span>
                 </>
               ) : (
                 <>
                   <span className="relative z-10">INITIALIZE</span>
                   <Bolt className="w-4 h-4 relative z-10 trigger-icon" />
                   {/* Button Glow Effect */}
                   <div className="absolute inset-0 bg-gradient-to-r from-brand-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                 </>
               )}
            </button>
         </div>
      </div>

      {/* KEYBOARD HUD: Quick Reference */}
      <div className="absolute bottom-32 left-1/2 -translate-x-1/2 flex items-center gap-6 px-6 py-2 bg-black/60 backdrop-blur-3xl border border-white/5 rounded-full z-[15] shadow-2xl pointer-events-none">
         <div className="flex items-center gap-2">
            <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[9px] text-white/40 font-mono">⌘ K</kbd>
            <span className="text-[9px] text-neutral-500 uppercase tracking-widest font-black">Commands</span>
         </div>
         <div className="w-px h-3 bg-white/10" />
         <div className="flex items-center gap-2">
            <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[9px] text-white/40 font-mono">⌘ ↵</kbd>
            <span className="text-[9px] text-neutral-500 uppercase tracking-widest font-black">Synthesize</span>
         </div>
         <div className="w-px h-3 bg-white/10" />
         <div className="flex items-center gap-2">
            <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[9px] text-white/40 font-mono">/ (Slash)</kbd>
            <span className="text-[9px] text-neutral-500 uppercase tracking-widest font-black">Quick Action</span>
         </div>
      </div>

      {/* STRATEGY ARCHIVE SIDEBAR */}
      <StrategyArchive isOpen={showArchive} onClose={() => setShowArchive(false)} />

    </div>
  );
}
