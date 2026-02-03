"use client";

import { useState, useEffect, useRef } from "react";
import { detectCliches, detectClichesAI, ClicheViolation } from "../utils/cliche-detector";
import { AlertTriangle, Check, RefreshCw, Type, Sparkles, BrainCircuit } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ClicheHighlighterProps {
  initialText?: string;
  onClose: () => void;
  apiKey?: string;
}

export default function ClicheHighlighter({ initialText = "", onClose, apiKey }: ClicheHighlighterProps) {
  const [text, setText] = useState(initialText);
  const [violations, setViolations] = useState<ClicheViolation[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [lastScannedText, setLastScannedText] = useState("");
  
  // Instant Regex Check
  useEffect(() => {
    const instantMatches = detectCliches(text);
    // Keep AI matches if text hasn't changed significantly (simple heurisitc)
    // For now, we just reset purely on edit to keep it clean, or we could merge.
    // Let's reset regex matches but allow re-scanning.
    setViolations(instantMatches);
    setLastScannedText(""); // Reset AI state on edit
  }, [text]);

  const handleDeepScan = async () => {
      if (!apiKey || isScanning) return;
      setIsScanning(true);
      
      const currentRegex = detectCliches(text);
      try {
          const aiMatches = await detectClichesAI(text, apiKey);
          
          // Merge duplicates (prefer AI replacement if overlap)
          const merged = [...currentRegex];
          aiMatches.forEach(aiV => {
              if (!merged.some(m => m.index === aiV.index)) {
                  merged.push(aiV);
              }
          });
          
          setViolations(merged.sort((a, b) => a.index - b.index));
          setLastScannedText(text);
      } catch (e) {
          console.error("Scan failed", e);
      } finally {
          setIsScanning(false);
      }
  };

  const handleFix = (violation: ClicheViolation) => {
    const before = text.substring(0, violation.index);
    const after = text.substring(violation.index + violation.length);
    setText(before + violation.replacement + after);
  };

  const score = Math.max(0, 100 - (violations.length * 10));
  const getScoreColor = (s: number) => {
      if (s > 90) return "text-green-500";
      if (s > 70) return "text-yellow-500";
      return "text-red-500";
  };

  return (
    <div className="w-full h-full p-6 bg-[#0a0a0a] text-white flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
                <Type className="text-red-500" />
                Cliche Killer
            </h2>
            <p className="text-neutral-500 text-sm">Anti-Generic Defense System</p>
        </div>
        <div className="flex items-center gap-6">
            <div className="text-right">
                <p className={`text-3xl font-bold ${getScoreColor(score)}`}>{score}</p>
                <p className="text-[10px] text-neutral-500 uppercase tracking-wider">Authority Score</p>
            </div>
            <button onClick={onClose} className="p-2 bg-neutral-800 rounded-full hover:bg-neutral-700 transition">
                <Check className="w-4 h-4 text-white" />
            </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 min-h-0">
          {/* Editor */}
          <div className="bg-[#111] border border-white/10 rounded-xl p-4 flex flex-col relative">
              <textarea 
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Paste your content here to check for 'AI Slop'..."
                  className="w-full h-full bg-transparent resize-none focus:outline-none text-neutral-300 font-mono leading-relaxed relative z-10"
              />
              
              {/* Deep Scan Trigger */}
              <div className="absolute bottom-4 right-4 z-20">
                  <button 
                      onClick={handleDeepScan}
                      disabled={isScanning || text.length < 10 || text === lastScannedText}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all ${
                          text === lastScannedText ? 'bg-green-500/20 text-green-400 cursor-default' :
                          'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg hover:shadow-indigo-500/20'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                      {isScanning ? (
                          <>
                            <RefreshCw className="w-3 h-3 animate-spin" />
                            Scanning...
                          </>
                      ) : text === lastScannedText ? (
                          <>
                             <Check className="w-3 h-3" />
                             Scanned
                          </>
                      ) : (
                          <>
                            <BrainCircuit className="w-3 h-3" />
                            Deep Scan
                          </>
                      )}
                  </button>
              </div>
          </div>

          {/* Analysis */}
          <div className="bg-[#111] border border-white/10 rounded-xl p-4 overflow-y-auto">
              <h3 className="text-xs font-bold text-neutral-500 uppercase mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-500" />
                  Detected Weakness ({violations.length})
              </h3>
              
              <div className="space-y-2">
                  <AnimatePresence>
                      {violations.map((v, i) => (
                          <motion.div 
                              key={`${v.word}-${i}`}
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, height: 0 }}
                              className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center justify-between group hover:bg-red-500/20 transition-colors"
                          >
                              <div>
                                  <p className="text-sm font-bold text-red-400 line-through decoration-red-500/50">{v.word}</p>
                                  <p className="text-xs text-neutral-400">Try: <span className="text-green-400 font-bold">{v.replacement}</span></p>
                              </div>
                              <button 
                                  onClick={() => handleFix(v)}
                                  className="px-3 py-1 bg-red-500/20 hover:bg-green-500/20 text-red-400 hover:text-green-400 text-xs font-bold rounded transition-colors"
                              >
                                  Fix
                              </button>
                          </motion.div>
                      ))}
                  </AnimatePresence>
                  
                  {violations.length === 0 && text.length > 0 && (
                      <div className="p-8 text-center text-neutral-500 italic">
                          No cliches detected. You sound human.
                      </div>
                  )}
                  {text.length === 0 && (
                       <div className="p-8 text-center text-neutral-600 border border-dashed border-white/5 rounded-lg">
                          Paste text to begin analysis.
                      </div>
                  )}
              </div>
          </div>
      </div>
    </div>
  );
}
