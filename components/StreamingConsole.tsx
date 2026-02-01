
import { useCompletion } from "@ai-sdk/react";
import { useState, useEffect, useRef, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, UserCircle2, Square, Linkedin, Twitter, Brain, Zap, Sparkles, X, Image as ImageIcon, HelpCircle } from "lucide-react";
import { PERSONAS, PersonaId } from "../utils/personas";
import { GeneratedAssets } from "../utils/ai-service";
import { generateSideAssetsAction } from "../actions/generate";
import TemplateLibraryModal from "./TemplateLibraryModal";
import { ApiKeys } from "./SettingsModal";
import { fetchSignals, Signal } from "../utils/signal-service";
import { predictImpact, PredictionResult } from "../utils/predictive-service";
import { getSuggestions, Suggestion } from "../utils/suggestion-service";
import { buildRLHFContext } from "../utils/feedback-service";
import ReactMarkdown from "react-markdown";
import { Gauge, TrendingUp, AlertCircle } from "lucide-react";
import LinkedInPreview from "./previews/LinkedInPreview";
import TwitterPreview from "./previews/TwitterPreview";
import SkeletonLoader from "./SkeletonLoader";
import SwotWidget, { SwotData } from "./widgets/SwotWidget";
import TrendWidget, { TrendData } from "./widgets/TrendWidget";
import { extractWidgets } from "../utils/widget-parser";
import Tooltip from "./Tooltip"; // Assuming a Tooltip component exists or we build simple one

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

const STARTER_CHIPS = [
  { label: "Analyze a Trend", icon: Zap, prompt: "Analyze the latest trend in [Industry]..." },
  { label: "Strategic Pivot", icon: Brain, prompt: "Why most companies fail at [Strategy]..." },
  { label: "Contrarian Take", icon: Sparkles, prompt: "Everyone thinks [X] is good, but actually..." },
];

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
  const [signals, setSignals] = useState<Signal[]>([]);
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [isPredicting, setIsPredicting] = useState(false);
  const [isFetchingSignals, setIsFetchingSignals] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const signalDebounceRef = useRef<NodeJS.Timeout | null>(null);

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

  // Debounced Signal Fetching (Newsjacking)
  useEffect(() => {
    if (!useNewsjack || !apiKeys.serper || !apiKeys.gemini) {
      setSignals([]);
      return;
    }

    const timer = setTimeout(async () => {
      if (input.length >= 4 && !input.includes("\n")) {
         setIsFetchingSignals(true);
         try {
           const results = await fetchSignals(input, { serper: apiKeys.serper, gemini: apiKeys.gemini });
           setSignals(results);
         } catch (e) {
           console.error("Signal fetch failed", e);
         } finally {
           setIsFetchingSignals(false);
         }
      }
    }, 1500); // 1.5s debounce to avoid spamming Serper

    signalDebounceRef.current = timer;
    return () => clearTimeout(timer);
  }, [input, useNewsjack, apiKeys.serper, apiKeys.gemini]);

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
      maxFiles: 3,
      noClick: true // Disable click-to-upload, drag only
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
        signals // Pass signals to API
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
              images, // Ensure images are sent
              signals // Ensure signals are sent
          }
      });
  };

  const handlePredict = async () => {
      if (!input || input.length < 50) {
          setLocalError("Draft is too short to predict impact (min 50 chars).");
          return;
      }
      setIsPredicting(true);
      try {
          const result = await predictImpact(input, apiKeys.gemini);
          setPrediction(result);
      } catch (e) {
          console.error("Prediction failed:", e);
      } finally {
          setIsPredicting(false);
      }
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative group"
      >
        <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-3xl blur opacity-20 group-hover:opacity-30 transition duration-1000"></div>
        <div className={`relative liquid-panel rounded-3xl p-1 overflow-hidden transition-all duration-700 ${!isLoading && completion ? 'highlight-flash' : ''}`}>
          
          {!isLoading && !completion && !localError ? (
              <div className="relative flex flex-col min-h-[16rem]">
                <div {...getRootProps()} className="relative flex-1 flex flex-col">
                  <input {...getInputProps()} />
                  <textarea
                    value={input}
                    onChange={(e) => { setInput(e.target.value); if(prediction) setPrediction(null); }}
                    onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                    placeholder=" " // Empty placeholder to control custom empty state
                    className="w-full flex-1 bg-transparent text-white p-6 outline-none resize-none font-mono text-base leading-relaxed z-10 peer"
                  />
                  
                  {/* Signals Area */}
                  {useNewsjack && (signals.length > 0 || isFetchingSignals) && (
                      <div className="px-6 pb-4 z-20">
                          <div className="flex flex-wrap gap-2">
                              {isFetchingSignals && (
                                <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-white/5 border border-white/5 rounded text-[10px] text-neutral-400 animate-pulse">
                                    <Zap className="w-3 h-3" /> Scanning...
                                </span>
                              )}
                              {signals.map((s, i) => (
                                  <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    key={i}
                                    className="group/signal relative inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 hover:border-red-500/40 rounded-full cursor-help transition-colors"
                                  >
                                      <Zap className="w-3 h-3 text-red-400" />
                                      <span className="text-xs font-medium text-red-200">{s.value}</span>
                                      
                                      {/* Hover Tooltip */}
                                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-neutral-900 border border-white/10 rounded-lg shadow-xl opacity-0 group-hover/signal:opacity-100 pointer-events-none transition-opacity z-50">
                                          <p className="text-[10px] text-neutral-500 uppercase tracking-widest">{s.source}</p>
                                          <p className="text-xs text-white leading-tight mt-1 truncate">{s.url}</p>
                                      </div>
                                  </motion.div>
                              ))}
                          </div>
                      </div>
                  )}

                  {/* PREDICTION RESULTS */}
                  {prediction && (
                      <div className="mb-6 mx-6 mt-2 p-4 bg-neutral-900/50 border border-purple-500/20 rounded-xl relative overflow-hidden group/prediction">
                           <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-purple-500 to-indigo-500" />
                           <div className="flex items-start justify-between gap-4">
                               <div>
                                   <div className="flex items-center gap-2 mb-1">
                                       <TrendingUp className="w-4 h-4 text-purple-400" />
                                       <span className="text-xs font-bold text-white uppercase tracking-wider">Predictive Score</span>
                                   </div>
                                   <div className="flex items-baseline gap-1">
                                       <span className="text-3xl font-black text-white">{prediction.score}</span>
                                       <span className="text-sm text-neutral-500">/100</span>
                                   </div>
                               </div>
                               
                               <div className="text-right">
                                   <button onClick={() => setPrediction(null)} className="text-neutral-600 hover:text-white transition-colors"><X className="w-4 h-4" /></button>
                               </div>
                           </div>

                           <div className="mt-3 grid grid-cols-3 gap-2">
                               <div className="bg-white/5 p-2 rounded text-center">
                                   <div className="text-[10px] text-neutral-500 uppercase">Hook</div>
                                   <div className={`font-mono text-sm ${prediction.breakdown.hookStrength > 70 ? 'text-green-400' : 'text-yellow-400'}`}>{prediction.breakdown.hookStrength}%</div>
                               </div>
                               <div className="bg-white/5 p-2 rounded text-center">
                                   <div className="text-[10px] text-neutral-500 uppercase">Retain</div>
                                   <div className={`font-mono text-sm ${prediction.breakdown.retainability > 70 ? 'text-green-400' : 'text-yellow-400'}`}>{prediction.breakdown.retainability}%</div>
                               </div>
                               <div className="bg-white/5 p-2 rounded text-center">
                                   <div className="text-[10px] text-neutral-500 uppercase">Viral</div>
                                   <div className={`font-mono text-sm ${prediction.breakdown.viralityPotential > 70 ? 'text-green-400' : 'text-yellow-400'}`}>{prediction.breakdown.viralityPotential}%</div>
                               </div>
                           </div>
                           
                           {prediction.score < 80 && (
                               <div className="mt-3 pt-3 border-t border-white/5">
                                   <div className="flex items-center gap-1.5 mb-2 text-amber-400/80 text-xs font-semibold">
                                       <AlertCircle className="w-3 h-3" />
                                       Optimization Tips
                                   </div>
                                   <ul className="space-y-1">
                                       {prediction.improvementTips.map((tip, i) => (
                                           <li key={i} className="text-xs text-neutral-300 pl-3 relative before:content-['•'] before:absolute before:left-0 before:text-neutral-500">{tip}</li>
                                       ))}
                                   </ul>
                               </div>
                           )}
                      </div>
                  )}

                  {/* Custom Empty State / Placeholder */}
                  {!input && images.length === 0 && (
                      <div className="absolute inset-0 p-6 pointer-events-none flex flex-col gap-4 z-20">
                          <p className="text-neutral-500 text-lg">What strategy are we building today?</p>
                          <div className="flex flex-wrap gap-2 mt-2 pointer-events-auto">
                              {STARTER_CHIPS.map((chip) => (
                                  <button
                                     key={chip.label}
                                     onClick={(e) => { e.stopPropagation(); setInput(chip.prompt); }}
                                     className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-full text-xs text-neutral-400 hover:text-white transition-colors"
                                  >
                                      <chip.icon className="w-3 h-3" />
                                      {chip.label}
                                  </button>
                              ))}
                          </div>
                          
                          <div className="mt-auto flex items-center gap-2 text-neutral-600 text-xs">
                              <ImageIcon className="w-4 h-4" />
                              <span>Drop images here to analyze</span>
                          </div>
                      </div>
                  )}

                  
                  {/* Drag Overlay */}
                  {isDragActive && (
                      <div className="absolute inset-0 bg-indigo-500/10 backdrop-blur-sm flex items-center justify-center border-2 border-indigo-500 border-dashed rounded-xl z-20">
                          <div className="text-center text-indigo-400 font-bold">
                              <ImageIcon className="w-8 h-8 mx-auto mb-2" />
                              <p>Drop to Analyze</p>
                          </div>
                      </div>
                  )}
                  
                  {/* Image Previews */}
                  {images.length > 0 && (
                      <div className="px-6 pb-2 flex gap-2 z-20">
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

                  {/* CONTROL BAR */}
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
                                  {Object.values(PERSONAS).map((p) => (
                                  <option key={p.id} value={p.id} className="bg-neutral-900">{p.name}</option>
                                  ))}
                              </select>
                          </div>

                          <div className="w-px h-4 bg-white/10" />

                          {/* Simplified Toggles */}
                          <div className="flex items-center gap-1">
                              <button 
                                  onClick={() => setUseNewsjack(!useNewsjack)}
                                  className={`p-2 rounded-lg transition-all ${useNewsjack ? 'bg-red-500/20 text-red-400 shadow-[0_0_10px_rgba(248,113,113,0.3)]' : 'text-neutral-500 hover:text-neutral-300 hover:bg-white/5'}`}
                                  title="Newsjack: Inject trending news"
                              >
                                  <Zap className="w-4 h-4" />
                              </button>
                              <button 
                                  onClick={() => setUseRAG(!useRAG)}
                                  className={`p-2 rounded-lg transition-all ${useRAG ? 'bg-purple-500/20 text-purple-400 shadow-[0_0_10px_rgba(192,132,252,0.3)]' : 'text-neutral-500 hover:text-neutral-300 hover:bg-white/5'}`}
                                  title="Strategy Brain: Use internal knowledge"
                              >
                                  <Brain className="w-4 h-4" />
                              </button>
                              <button 
                                  onClick={() => setUseFewShot(!useFewShot)}
                                  className={`p-2 rounded-lg transition-all ${useFewShot ? 'bg-amber-500/20 text-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.3)]' : 'text-neutral-500 hover:text-neutral-300 hover:bg-white/5'}`}
                                  title="Mirroring: Mimic best performing style"
                              >
                                  <Sparkles className="w-4 h-4" />
                              </button>
                          </div>
                      </div>

                      <div className="flex items-center gap-3">
                           {/* Platform Switcher */}
                           <div className="flex items-center bg-black/40 rounded-lg p-0.5 border border-white/5">
                              <button onClick={() => setPlatform("linkedin")} className={`p-1.5 rounded-md transition-all ${platform === "linkedin" ? "bg-blue-600 text-white" : "text-neutral-500 hover:text-white"}`} title="LinkedIn"><Linkedin className="w-3.5 h-3.5" /></button>
                              <button onClick={() => setPlatform("twitter")} className={`p-1.5 rounded-md transition-all ${platform === "twitter" ? "bg-white text-black" : "text-neutral-500 hover:text-white"}`} title="X (Twitter)"><Twitter className="w-3.5 h-3.5" /></button>
                           </div>

                           <button
                              onClick={handleGenerate}
                              disabled={!input.trim() && images.length === 0}
                              className="group relative flex items-center gap-2 px-5 py-2 bg-white text-black font-bold rounded-lg text-xs hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                           >
                              <span>GENERATE</span>
                              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                           </button>
                      </div>

                  </div>

                </div>
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
      
      {/* Settings / Footer links can go here if needed, but primary controls are now in the bar */}
      <div className="px-2 text-center">
         <p className="text-[10px] text-neutral-600 uppercase tracking-widest font-mono">StrategyOS v2.0</p>
      </div>

      <TemplateLibraryModal 
        isOpen={isLibraryOpen}
        onClose={() => setIsLibraryOpen(false)}
        onSelect={(content) => setInput(content)}
      />
    </div>
  );
}
