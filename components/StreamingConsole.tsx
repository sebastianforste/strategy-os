
import { useCompletion } from "ai/react";
import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, UserCircle2, Square, Linkedin, Twitter, Brain, Zap } from "lucide-react";
import { PERSONAS, PersonaId } from "../utils/personas";
import TemplateLibraryModal from "./TemplateLibraryModal";
import { ApiKeys } from "./SettingsModal";

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
  platform: "linkedin" | "twitter";
  setPlatform: (val: "linkedin" | "twitter") => void;
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
  platform,
  setPlatform
}: StreamingConsoleProps) {
  const [input, setInput] = useState(initialValue);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);

  // Vercel AI SDK Hook
  const { complete, completion, isLoading, stop } = useCompletion({
    api: "/api/generate",
    body: {
        apiKeys,
        personaId,
        forceTrends: useNewsjack,
        useRAG, // Pass the new flag
        platform
    },
    onFinish: (prompt, result) => {
        onGenerationComplete(result);
    },
    onError: (err) => {
        console.error("Streaming Error:", err);
        alert("Streaming failed. Check console.");
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
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Paste high-complexity input here..."
                className="w-full h-48 bg-transparent text-white p-6 outline-none resize-none font-mono text-sm leading-relaxed placeholder:text-neutral-600"
              />
          ) : (
              <div className="w-full h-auto min-h-[12rem] bg-transparent text-white p-6 font-mono text-sm leading-relaxed whitespace-pre-wrap">
                  {completion}
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
