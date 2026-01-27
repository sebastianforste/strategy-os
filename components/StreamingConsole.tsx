
import { useCompletion } from "@ai-sdk/react";
import { useState, useEffect, useRef, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, UserCircle2, Square, Linkedin, Twitter, Brain, Zap, Sparkles, X, Image as ImageIcon } from "lucide-react";
import { PERSONAS, PersonaId } from "../utils/personas";
import { GeneratedAssets } from "../utils/ai-service";
import { generateSideAssetsAction } from "../actions/generate";
import TemplateLibraryModal from "./TemplateLibraryModal";
import { ApiKeys } from "./SettingsModal";
import { getSuggestions, Suggestion } from "../utils/suggestion-service";
import { buildRLHFContext } from "../utils/feedback-service";
import ReactMarkdown from "react-markdown";
import LinkedInPreview from "./previews/LinkedInPreview";
import TwitterPreview from "./previews/TwitterPreview";
import SkeletonLoader from "./SkeletonLoader";
import SwotWidget, { SwotData } from "./widgets/SwotWidget";
import TrendWidget, { TrendData } from "./widgets/TrendWidget";
import { extractWidgets } from "../utils/widget-parser";

interface StreamingConsoleProps {
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
  const [images, setImages] = useState<string[]>([]); // Base64 strings
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced suggestion fetching
  useEffect(() => {
    // ... suggestion logic
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

  // Sync with prop updates
  useEffect(() => {
    if (initialValue && initialValue !== input) {
        setInput(initialValue);
    }
  }, [initialValue]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach(file => {
      const reader = new FileReader();
      reader.onabort = () => console.log('file reading was aborted');
      reader.onerror = () => console.log('file reading has failed');
      reader.onload = () => {
        const binaryStr = reader.result as string;
        // Keep the data URL prefix usually? Yes.
        setImages(prev => [...prev, binaryStr]);
      };
      reader.readAsDataURL(file);
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
      onDrop, 
      accept: { 'image/*': [] },
      maxFiles: 3 
  });

  const removeImage = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setImages(prev => prev.filter((_, i) => i !== index));
  };


  const handleSelectSuggestion = (angle: string) => {
    setInput(angle);
    setShowSuggestions(false);
  };

  const [localError, setLocalError] = useState<string | null>(null);

  // Vercel AI SDK Hook
  const { complete, completion, isLoading, stop, setCompletion } = useCompletion({
    api: "/api/generate",
    streamProtocol: "text",
    body: {
        apiKeys,
        personaId,
        forceTrends: useNewsjack,
        useRAG, 
        platform,
        images, // Pass images to API
    },
    onFinish: (_prompt: string, result: string) => {
        // ... onFinish logic
        console.log("[Streaming] Finished. Length:", result.length);
        if (result && result.length > 5) {
            onGenerationComplete(result);
            if (apiKeys.gemini) {
                generateSideAssetsAction(result, { gemini: apiKeys.gemini }, personaId)
                    .then(sideAssets => {
                        onGenerationComplete({
                            textPost: result,
                            ...sideAssets
                        });
                    })
                    .catch(e => console.error("Side asset generation failed:", e));
            }
        } else {
            setLocalError("Generation failed (Empty Output). Please try again or check settings.");
        }
    },
    onError: (err: unknown) => {
        // ... onError logic
        console.error("Streaming Error:", err);
        const msg = err instanceof Error ? err.message : "Streaming failed";
        let userMsg = msg;
        if (msg.includes("429") || msg.includes("Quota") || msg.includes("RESOURCE_EXHAUSTED")) {
             userMsg = "Rate Limit Exceeded. You've hit your Google Gemini Free Tier daily limit (20 reqs). Please wait or try again later.";
        }
        setLocalError(userMsg);
        if (onError) onError(userMsg);
    }
  });

  const handleGenerate = async () => {
      if (!input.trim() && images.length === 0) return; // Allow generation if image is present? No, usually need text guidance.
      
      if (!apiKeys.gemini) {
          setLocalError("Gemini API Key is required. Please configure it in Settings.");
          if (onError) onError("Gemini API Key is required. Please configure it in Settings.");
          return;
      }
      
      setLocalError(null);
      setCompletion("");

      console.log("[Streaming] Starting generation...", { personaId, useFewShot, useRAG, hasApiKey: !!apiKeys.gemini });
      
      let fewShotContent = "";
      if (useFewShot) {
          try {
             // ... few shot logic
             const { getTopRatedPosts } = await import("../utils/history-service");
             const topPosts = getTopRatedPosts(personaId, 3);
             if (topPosts.length > 0) {
                 fewShotContent = topPosts.map((p, i) => `
                Example ${i + 1} (Rated ${p.performance?.rating}):
                """
                ${p.assets.textPost.substring(0, 500)}${p.assets.textPost.length > 500 ? '...' : ''}
                """
                `).join("\n");
             }
          } catch (e) {
              console.warn("Failed to load history for context:", e);
          }
      }

      complete(input, {
          body: {
              apiKeys,
              personaId,
              forceTrends: useNewsjack,
              useRAG,
              platform,
              fewShotExamples: fewShotContent,
              rlhfContext: buildRLHFContext(),
              images // Ensure images are sent
          }
      });
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative group"
      >
        <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-1000 animate-tilt"></div>
        <div className="relative glass-panel rounded-xl p-1 min-h-[12rem] bg-black/40 overflow-hidden">
          {/* Specular Highlight */}
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/50 to-transparent opacity-70" />
          <div className="absolute top-0 left-0 w-full h-[40%] bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
          
          {!isLoading && !completion && !localError ? (
              <div {...getRootProps()} className="relative h-full flex flex-col">
                <input {...getInputProps()} />
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                  placeholder="What strategy do you want to build today? (Or drop an image)"
                  className="w-full h-48 bg-transparent text-white p-6 outline-none resize-none font-mono text-base leading-relaxed placeholder:text-neutral-700 selection:bg-purple-500/30 z-10"
                />
                
                {/* Drag Overlay */}
                {isDragActive && (
                    <div className="absolute inset-0 bg-indigo-500/10 backdrop-blur-sm flex items-center justify-center border-2 border-indigo-500 border-dashed rounded-lg z-20">
                        <div className="text-center text-indigo-400 font-bold">
                            <ImageIcon className="w-8 h-8 mx-auto mb-2" />
                            <p>Drop to Analyze</p>
                        </div>
                    </div>
                )}
                
                {/* Image Previews */}
                {images.length > 0 && (
                    <div className="absolute bottom-4 left-6 flex gap-2 z-20">
                        {images.map((img, i) => (
                            <div key={i} className="relative group/img">
                                <img src={img} alt="Upload" className="w-12 h-12 object-cover rounded-lg border border-white/20" />
                                <button 
                                    onClick={(e) => removeImage(i, e)}
                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover/img:opacity-100 transition-opacity"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
              </div>
          ) : (
              // ... Loading/Error/Result view (unchanged structure)
              <div className="w-full h-auto min-h-[12rem] bg-transparent text-white p-6 prose prose-invert prose-sm max-w-none relative">
                  {(isLoading && !completion) && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                           <div className="w-full h-full p-6 flex flex-col justify-center">
                                <SkeletonLoader />
                                <div className="mt-4 text-center">
                                    <span className="text-xs font-mono text-purple-300/80 animate-pulse tracking-[0.2em] uppercase bg-black/50 px-2 py-1 rounded backdrop-blur-sm border border-purple-500/20">
                                        Synthesizing Strategy...
                                    </span>
                                </div>
                           </div>
                      </div>
                  )}

                  {localError && (
                      <div className="flex flex-col items-center justify-center h-48 text-center space-y-4">
                          <div className="p-4 bg-red-950/30 border border-red-900/50 rounded-xl backdrop-blur-md max-w-sm shadow-xl">
                              <p className="text-sm text-red-400 font-mono">{localError}</p>
                          </div>
                          <button 
                            onClick={() => { setLocalError(null); setCompletion(""); }}
                            className="text-xs text-neutral-500 hover:text-white underline underline-offset-4"
                          >
                            RESET
                          </button>
                      </div>
                  )}

                  {!localError && (
                      <div className="space-y-6">
                        {/* Widget Parsing */}
                        {(() => {
                            const { cleanContent, widgets } = extractWidgets(completion);
                            
                            return (
                                <>
                                    {/* Native-style Preview Card with Cinematic Entrance */}
                                    <div className="flex justify-center py-2">
                                        <AnimatePresence mode="wait">
                                            <motion.div
                                                key={platform}
                                                initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
                                                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                                                exit={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
                                                transition={{ duration: 0.5, ease: "circOut" }}
                                                className="w-full flex justify-center"
                                            >
                                                {platform === 'linkedin' ? (
                                                    <LinkedInPreview content={cleanContent} />
                                                ) : (
                                                    <TwitterPreview content={cleanContent} />
                                                )}
                                            </motion.div>
                                        </AnimatePresence>
                                    </div>
                                    
                                    {/* Widgets Area */}
                                    <AnimatePresence>
                                        {widgets.map((widget, idx) => (
                                            <motion.div
                                                key={`widget-${idx}`}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.2 * idx }}
                                            >
                                                {widget.type === 'swot' && (
                                                    <SwotWidget data={widget.data as SwotData} />
                                                )}
                                                {widget.type === 'trend' && (
                                                    <TrendWidget data={widget.data as TrendData} />
                                                )}
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </>
                            );
                        })()}
                        
                        {isLoading && completion && (
                            <div className="flex justify-center">
                                <motion.span 
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-mono animate-pulse"
                                >
                                    <Sparkles className="w-3 h-3" />
                                    Generating...
                                </motion.span>
                            </div>
                        )}

                        {!isLoading && completion && (
                             <motion.button 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.5 }}
                                onClick={() => { setCompletion(""); }}
                                className="mx-auto text-xs text-neutral-500 hover:text-white underline underline-offset-4 block transition-colors"
                             >
                               NEW GENERATION
                             </motion.button>
                        )}
                      </div>
                  )}
              </div>
          )}
        </div>
      </motion.div>
      
      {/* ... Footer logic remains the same */}
      <div className="flex justify-between items-center px-2">
         {/* ... (Unchanged footer content) */}
         <div className="flex items-center gap-4">
             {/* Platform Selector */}
             <div className="flex items-center bg-black/40 backdrop-blur-md rounded-full p-1 border border-white/10">
                <button onClick={() => setPlatform("linkedin")} className={`p-2 rounded-full transition-all ${platform === "linkedin" ? "bg-blue-600 text-white shadow-[0_0_10px_rgba(37,99,235,0.5)]" : "text-neutral-500 hover:text-white"}`} title="LinkedIn"><Linkedin className="w-4 h-4" /></button>
                <button onClick={() => setPlatform("twitter")} className={`p-2 rounded-full transition-all ${platform === "twitter" ? "bg-white text-black shadow-[0_0_10px_rgba(255,255,255,0.5)]" : "text-neutral-500 hover:text-white"}`} title="X (Twitter)"><Twitter className="w-4 h-4" /></button>
             </div>
             
             {/* Toggles */}
             <div className="flex items-center gap-2 pl-4">
                {/* Newsjacker */}
                <button 
                    onClick={() => setUseNewsjack(!useNewsjack)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium transition-all border ${useNewsjack ? "bg-red-500/10 text-red-400 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.2)]" : "bg-black/40 text-neutral-500 border-white/5 hover:border-white/20"}`}
                >
                    <Zap className="w-3 h-3" />
                    Newsjack
                </button>

                {/* RAG Toggle */}
                <button 
                    onClick={() => setUseRAG(!useRAG)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium transition-all border ${useRAG ? "bg-purple-500/10 text-purple-400 border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.2)]" : "bg-black/40 text-neutral-500 border-white/5 hover:border-white/20"}`}
                >
                    <Brain className="w-3 h-3" />
                    Strategy Brain
                </button>

                {/* Mirroring Toggle */}
                <button 
                    onClick={() => setUseFewShot(!useFewShot)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium transition-all border ${useFewShot ? "bg-amber-500/10 text-amber-400 border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.2)]" : "bg-black/40 text-neutral-500 border-white/5 hover:border-white/20"}`}
                >
                    <Sparkles className="w-3 h-3" />
                    Mirroring
                </button>
             </div>
             
             {/* Persona Selector */}
             <div className="relative group">
                <div className="absolute inset-0 bg-neutral-800/50 rounded-full blur-sm group-hover:bg-neutral-700/50 transition-all" />
                <UserCircle2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 z-10" />
                <select
                    value={personaId}
                    onChange={(e) => setPersonaId(e.target.value as PersonaId)}
                    className="relative z-10 bg-black/40 border border-white/10 text-white text-xs font-mono rounded-full pl-9 pr-8 py-2 appearance-none outline-none focus:border-white/30 hover:border-white/30 transition-all cursor-pointer min-w-[140px]"
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
               className="flex items-center gap-2 px-6 py-3 bg-red-600/20 text-red-500 border border-red-500/50 font-bold rounded-full text-xs hover:bg-red-600/30 transition-colors backdrop-blur-sm"
             >
                 <Square className="w-3 h-3 fill-current" />
                 ABORT
             </button>
         ) : (
            <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 0 25px rgba(255, 255, 255, 0.3)" }}
                whileTap={{ scale: 0.95 }}
                onClick={handleGenerate}
                disabled={!input.trim() && images.length === 0}
                className="group relative flex items-center gap-3 px-8 py-3 bg-white text-black font-bold rounded-full text-xs disabled:opacity-50 disabled:cursor-not-allowed transition-all tracking-wider overflow-hidden"
            >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent translate-x-[-200%] group-hover:animate-[shimmer_1.5s_infinite]" />
                <span className="relative z-10">INITIATE SEQUENCE</span>
                <ArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform" />
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
