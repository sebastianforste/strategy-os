"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles, UserCircle2, TrendingUp, Mic, Book, Linkedin, Twitter, Keyboard, Palette, Target, ShoppingBag } from "lucide-react";
import { PERSONAS, PersonaId } from "../utils/personas";
import { useState } from "react";
import TemplateLibraryModal from "./TemplateLibraryModal";
import VoiceRecorder from "./VoiceRecorder";

interface InputConsoleProps {
  value: string;
  onChange: (val: string) => void;
  onGenerate: () => void;
  isGenerating: boolean;
  personaId: PersonaId;
  setPersonaId: (id: PersonaId) => void;
  viralityScore?: number;
  useNewsjack: boolean;
  setUseNewsjack: (val: boolean) => void;
  platform: "linkedin" | "twitter";
  setPlatform: (val: "linkedin" | "twitter") => void;
  onOpenVisualAlchemist: () => void;
  onOpenRecon: () => void;
  onOpenMastermind: () => void;
}

export default function InputConsole({
  value,
  onChange,
  onGenerate,
  isGenerating,
  personaId,
  setPersonaId,
  viralityScore,
  useNewsjack,
  setUseNewsjack,
  platform,
  setPlatform,
  onOpenVisualAlchemist,
  onOpenRecon,
  onOpenMastermind
}: InputConsoleProps) {
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  
  const getScoreColor = (score?: number) => {
    if (!score || score === 0) return "text-neutral-600";
    if (score >= 75) return "text-green-500";
    if (score >= 50) return "text-blue-500";
    if (score >= 25) return "text-yellow-500";
    return "text-red-500";
  };
// ... [rest of getScoreLabel and render] ...

  return (
    <div className="w-full max-w-3xl mx-auto space-y-4">
      {/* ... [Textarea block] ... */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative group"
      >
        <div className="absolute -inset-0.5 bg-gradient-to-r from-neutral-700 to-neutral-800 rounded-lg blur opacity-30 group-hover:opacity-75 transition duration-1000"></div>
        <div className="relative bg-[#050505] rounded-lg border border-neutral-800 p-1">
          {isVoiceMode ? (
            <div className="w-full h-48 bg-transparent flex items-center justify-center">
              <VoiceRecorder 
                onTranscription={(text) => {
                  onChange(value + (value ? "\n" : "") + text);
                  setIsVoiceMode(false);
                }} 
              />
            </div>
          ) : (
            <textarea
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="Paste high-complexity input here (e.g., Legal Judgment, Technical Report, Market Analysis)..."
              className="w-full h-48 bg-transparent text-white p-6 outline-none resize-none font-mono text-sm leading-relaxed placeholder:text-neutral-600"
            />
          )}
        </div>
      </motion.div>

      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
             {/* Platform Selector */}
             <div className="flex items-center bg-neutral-900 rounded-lg p-1 border border-neutral-800">
                <button
                    onClick={() => setPlatform("linkedin")}
                    className={`p-2 rounded-md transition-all ${platform === "linkedin" ? "bg-blue-600 text-white shadow-lg" : "text-neutral-500 hover:text-white"}`}
                    title="LinkedIn"
                >
                    <Linkedin className="w-4 h-4" />
                </button>
                <button
                    onClick={() => setPlatform("twitter")}
                    className={`p-2 rounded-md transition-all ${platform === "twitter" ? "bg-black text-white shadow-lg border border-neutral-700" : "text-neutral-500 hover:text-white"}`}
                    title="X (Twitter)"
                >
                    <Twitter className="w-4 h-4" />
                </button>
             </div>

            {/* Newsjack Toggle */}
            <div className="flex items-center gap-2 border-r border-neutral-800 pr-4">
                <input 
// ... [Rest of toolbar]
 
                    type="checkbox" 
                    id="newsjack"
                    checked={useNewsjack}
                    onChange={(e) => setUseNewsjack(e.target.checked)}
                    className="w-4 h-4 rounded border-neutral-700 bg-neutral-900 text-blue-500 focus:ring-offset-black"
                />
                <label htmlFor="newsjack" className="text-xs font-mono text-neutral-400 cursor-pointer select-none hover:text-white transition-colors">
                    NEWSJACK
                </label>
            </div>
            {/* Voice Toggle Button */}
            <button
              onClick={() => setIsVoiceMode(!isVoiceMode)}
              className={`p-2 transition-colors rounded-full hover:bg-neutral-800 ${isVoiceMode ? 'text-indigo-400' : 'text-neutral-500 hover:text-white'}`}
              title={isVoiceMode ? "Switch to Typing" : "Switch to Voice"}
            >
              {isVoiceMode ? <Keyboard className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            <button
              onClick={onOpenVisualAlchemist}
              className="p-2 text-neutral-500 hover:text-white transition-colors rounded-full hover:bg-neutral-800"
              title="Visual Alchemist"
            >
              <Palette className="w-4 h-4" />
            </button>

            <button
              onClick={onOpenRecon}
              className="p-2 text-neutral-500 hover:text-white transition-colors rounded-full hover:bg-neutral-800"
              title="Competitive Recon"
            >
              <Target className="w-4 h-4" />
            </button>

            <button
              onClick={onOpenMastermind}
              className="p-2 text-neutral-500 hover:text-white transition-colors rounded-full hover:bg-neutral-800"
              title="Mastermind Market"
            >
              <ShoppingBag className="w-4 h-4" />
            </button>

           <button
             onClick={() => setIsLibraryOpen(true)}
             className="p-2 text-neutral-500 hover:text-white transition-colors rounded-full hover:bg-neutral-800"
             title="Open Template Library"
           >
             <Book className="w-4 h-4" />
           </button>

           <div className="relative">
              <UserCircle2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
              <select
                value={personaId}
                onChange={(e) => setPersonaId(e.target.value as PersonaId)}
                className="bg-neutral-900 border border-neutral-800 text-white text-xs font-mono rounded-full pl-9 pr-4 py-2 appearance-none outline-none focus:border-neutral-600 hover:border-neutral-700 transition-colors"
              >
                {Object.values(PERSONAS).map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
           </div>
           <div className="text-xs text-neutral-500 font-mono hidden sm:block">
             {value.length} chars
           </div>
           {viralityScore !== undefined && viralityScore > 0 && (
             <div className="flex items-center gap-3">
               <div className="text-xs font-mono hidden sm:block">
                 <span className="text-neutral-600">Virality:</span>{" "}
                 <span className={`font-bold ${getScoreColor(viralityScore)}`}>
                   {viralityScore}/100
                 </span>
               </div>
               <div className="flex items-center gap-2">
                 <div className="w-24 h-1.5 bg-neutral-800 rounded-full overflow-hidden hidden sm:block">
                   <motion.div
                     initial={{ width: 0 }}
                     animate={{ width: `${viralityScore}%` }}
                     transition={{ duration: 0.8, ease: "easeOut" }}
                     className={`h-full ${
                       viralityScore >= 75
                         ? "bg-green-500"
                         : viralityScore >= 50
                         ? "bg-blue-500"
                         : viralityScore >= 25
                         ? "bg-yellow-500"
                         : "bg-red-500"
                     }`}
                   />
                 </div>
                 <TrendingUp className={`w-3 h-3 ${getScoreColor(viralityScore)}`} />
               </div>
             </div>
           )}
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onGenerate}
          disabled={isGenerating || !value.trim()}
          className="flex items-center gap-2 px-6 py-3 bg-white text-black font-bold rounded-full text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-200 transition-colors shadow-lg shadow-white/10"
        >
          {isGenerating ? (
            <>
              <Sparkles className="w-4 h-4 animate-spin" />
              <span className="hidden sm:inline">PROCESSING</span>
            </>
          ) : (
            <>
              GENERATE
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </motion.button>
      </div>

      <TemplateLibraryModal 
        isOpen={isLibraryOpen}
        onClose={() => setIsLibraryOpen(false)}
        onSelect={(content) => onChange(content)}
      />
    </div>
  );
}
