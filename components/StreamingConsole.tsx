
import { useCompletion } from "@ai-sdk/react";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, UserCircle2, Square, Linkedin, Twitter, Brain, Zap, Sparkles } from "lucide-react";
import { PERSONAS, PersonaId } from "../utils/personas";
import TemplateLibraryModal from "./TemplateLibraryModal";
import { ApiKeys } from "./SettingsModal";
import { getSuggestions, Suggestion } from "../utils/suggestion-service";
import ReactMarkdown from "react-markdown";

interface StreamingConsoleProps {
  initialValue: string;
  onGenerationComplete: (text: string) => void;
  apiKeys: ApiKeys;
  personaId: PersonaId;
  setPersonaId: (id: PersonaId) => void;
  useNewsjack: boolean;
  setUseNewsjack: (val: boolean) => void;
  useRAG: boolean;
  setUseRAG: (val: boolean) => void;
  useFewShot: boolean;
  setUseFewShot: (val: boolean) => void;
  platform: "linkedin" | "twitter";
  setPlatform: (val: "linkedin" | "twitter") => void;
  onError?: (msg: string) => void;
}

export default function StreamingConsole({
  initialValue,
  onGenerationComplete,
  apiKeys,
  personaId,
  setPersonaId,
  useNewsjack,
  setUseNewsjack,
  useRAG,
  setUseRAG,
  useFewShot,
  setUseFewShot,
  platform,
  setPlatform,
  onError
}: StreamingConsoleProps) {
  const [input, setInput] = useState(initialValue);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced suggestion fetching
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (input.length >= 5 && input.length < 100 && !input.includes("\n") && apiKeys.gemini) {
        try {
          const results = await getSuggestions(input, apiKeys.gemini);
          setSuggestions(results);
          setShowSuggestions(results.length > 0);
        } catch (e) {
          console.error("Suggestions failed:", e);
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 800);
    
    debounceRef.current = timer;
    return () => clearTimeout(timer);
  }, [input, apiKeys.gemini]);

  const handleSelectSuggestion = (angle: string) => {
    setInput(angle);
    setShowSuggestions(false);
  };

  // Vercel AI SDK Hook
  const { complete, completion, isLoading, stop } = useCompletion({
    api: "/api/generate",
    body: {
        apiKeys,
        personaId,
        forceTrends: useNewsjack,
        useRAG, // Pass the new flag
        useFewShot, // Pass few-shot flag
        platform
    },
    onFinish: (_prompt: string, result: string) => {
        onGenerationComplete(result);
    },
    onError: (err: unknown) => {
        console.error("Streaming Error:", err);
        const msg = err instanceof Error ? err.message : "Streaming failed";
        if (onError) {
          onError(msg);
        } else {
          alert(msg);
        }
    }
  });

  return (
    <div className="w-full max-w-3xl mx-auto space-y-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative group"
      >
        <div className="absolute -inset-0.5 bg-gradient-to-r from-neutral-700 to-neutral-800 rounded-lg blur opacity-30 group-hover:opacity-75 transition duration-1000"></div>
        <div className="relative bg-[#050505] rounded-lg border border-neutral-800 p-1 min-h-[12rem]">
          {!isLoading && !completion ? (
              <>
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                  placeholder="Paste high-complexity input here..."
                  className="w-full h-48 bg-transparent text-white p-6 outline-none resize-none font-mono text-sm leading-relaxed placeholder:text-neutral-600"
                />
                
                {/* Suggestions Dropdown */}
                <AnimatePresence>
                  {showSuggestions && suggestions.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute left-4 right-4 bottom-4 bg-neutral-900 border border-neutral-700 rounded-lg overflow-hidden shadow-xl z-10"
                    >
                      <div className="px-3 py-2 border-b border-neutral-800 flex items-center gap-2 text-xs text-neutral-500">
                        <Sparkles className="w-3 h-3" />
                        <span>Try these angles:</span>
                      </div>
                      {suggestions.map((s) => (
                        <button
                          key={s.id}
                          onClick={() => handleSelectSuggestion(s.angle)}
                          className="w-full text-left px-4 py-3 text-sm text-neutral-300 hover:bg-neutral-800 hover:text-white transition-colors border-b border-neutral-800 last:border-b-0"
                        >
                          {s.angle}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
          ) : (
              <div className="w-full h-auto min-h-[12rem] bg-transparent text-white p-6 prose prose-invert prose-sm max-w-none">
                  <ReactMarkdown>{completion}</ReactMarkdown>
                  {isLoading && <span className="inline-block w-2 h-4 bg-white ml-1 animate-pulse"/>}
              </div>
          )}
        </div>
      </motion.div>

      <div className="flex justify-between items-center">
         <div className="flex items-center gap-4">
             {/* Platform Selector */}
             <div className="flex items-center bg-neutral-900 rounded-lg p-1 border border-neutral-800">
                <button onClick={() => setPlatform("linkedin")} className={`p-2 rounded-md transition-all ${platform === "linkedin" ? "bg-blue-600 text-white" : "text-neutral-500 hover:text-white"}`} title="LinkedIn"><Linkedin className="w-4 h-4" /></button>
                <button onClick={() => setPlatform("twitter")} className={`p-2 rounded-md transition-all ${platform === "twitter" ? "bg-black text-white border border-neutral-700" : "text-neutral-500 hover:text-white"}`} title="X (Twitter)"><Twitter className="w-4 h-4" /></button>
             </div>
             
             {/* Toggles */}
             <div className="flex items-center gap-2 border-l border-neutral-800 pl-4">
                {/* Newsjacker */}
                <button 
                    onClick={() => setUseNewsjack(!useNewsjack)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${useNewsjack ? "bg-red-900/30 text-red-400 border border-red-900" : "bg-neutral-900 text-neutral-500 border border-neutral-800 hover:border-neutral-700"}`}
                >
                    <Zap className="w-3 h-3" />
                    Newsjack
                </button>

                {/* RAG Toggle */}
                <button 
                    onClick={() => setUseRAG(!useRAG)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${useRAG ? "bg-purple-900/30 text-purple-400 border border-purple-900" : "bg-neutral-900 text-neutral-500 border border-neutral-800 hover:border-neutral-700"}`}
                >
                    <Brain className="w-3 h-3" />
                    Strategy Brain
                </button>

                {/* Mirroring Toggle */}
                <button 
                    onClick={() => setUseFewShot(!useFewShot)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${useFewShot ? "bg-amber-900/30 text-amber-400 border border-amber-900" : "bg-neutral-900 text-neutral-500 border border-neutral-800 hover:border-neutral-700"}`}
                >
                    <Sparkles className="w-3 h-3" />
                    Mirroring
                </button>
             </div>
             
             {/* Persona Selector */}
             <div className="relative">
                <UserCircle2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                <select
                    value={personaId}
                    onChange={(e) => setPersonaId(e.target.value as PersonaId)}
                    className="bg-neutral-900 border border-neutral-800 text-white text-xs font-mono rounded-full pl-9 pr-4 py-2 appearance-none outline-none focus:border-neutral-600 hover:border-neutral-700 transition-colors"
                >
                    {Object.values(PERSONAS).map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                </select>
            </div>
         </div>

         {isLoading ? (
             <button
               onClick={() => stop()}
               className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white font-bold rounded-full text-sm hover:bg-red-700 transition-colors"
             >
                 <Square className="w-4 h-4 fill-white" />
                 STOP
             </button>
         ) : (
            <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => complete(input)}
                disabled={!input.trim()}
                className="flex items-center gap-2 px-6 py-3 bg-white text-black font-bold rounded-full text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-200 transition-colors shadow-lg shadow-white/10"
            >
                GENERATE STREAM
                <ArrowRight className="w-4 h-4" />
            </motion.button>
         )}
      </div>

      <TemplateLibraryModal 
        isOpen={isLibraryOpen}
        onClose={() => setIsLibraryOpen(false)}
        onSelect={(content) => setInput(content)}
      />
    </div>
  );
}
