"use client";

/**
 * TERMINAL CONSOLE - 2028 High-Velocity Mode
 * 
 * A pure text-based interface for power users.
 * Optimized for speed and focus.
 */

import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Terminal, Send, Command, Loader2, Database, Shield, Zap } from "lucide-react";

interface TerminalConsoleProps {
  onGenerate: (input: string) => Promise<void>;
  isLoading: boolean;
  completion: string;
  onClose: () => void;
  phaseLogs?: string[];
}

export default function TerminalConsole({ onGenerate, isLoading, completion, onClose, phaseLogs = [] }: TerminalConsoleProps) {
  const [input, setInput] = useState("");
  const [logs, setLogs] = useState<{ type: "input" | "output" | "system" | "proc"; text: string }[]>([
    { type: "system", text: "StrategyOS v2.0 // TERMINAL_MODE ENABLED" },
    { type: "system", text: "Ready for strategic input..." }
  ]);
  const [lastPhaseCount, setLastPhaseCount] = useState(0);

  // Synchronize phaseLogs to terminal logs
  useEffect(() => {
    if (phaseLogs.length > lastPhaseCount) {
      const newPhases = phaseLogs.slice(lastPhaseCount);
      setLogs(prev => [...prev, ...newPhases.map(p => ({ type: "proc" as const, text: p }))]);
      setLastPhaseCount(phaseLogs.length);
    }
  }, [phaseLogs, lastPhaseCount]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const handleCommand = async (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = input.trim().toLowerCase();
    if (!cmd || isLoading) return;

    setLogs(prev => [...prev, { type: "input", text: input }]);
    const currentInput = input;
    setInput("");
    
    // Internal Terminal Commands
    if (cmd === "help") {
      setLogs(prev => [...prev, { type: "system", text: "UNAVAILABLE COMMANDS // v3.0\n--------------------------\nHELP        : Display this menu\nSCAN        : Intercept real-time signals\nGEN [topic] : Generate tactical strategy\nVAULT       : Open strategy archive\nEXIT        : Return to GUI" }]);
      return;
    }
    
    if (cmd === "scan") {
      setLogs(prev => [...prev, { type: "proc", text: "Scanning global news feeds..." }]);
      // Trigger scan logic (mock or real)
      return;
    }

    if (cmd === "exit") {
      onClose();
      return;
    }
    
    await onGenerate(currentInput);
  };

  // Log completion when it arrives
  useEffect(() => {
    if (completion && !isLoading) {
      setLogs(prev => [...prev, { type: "output", text: completion }]);
    }
  }, [completion, isLoading]);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed inset-0 bg-black z-50 flex flex-col font-mono text-sm"
    >
      {/* Header */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between text-neutral-500">
        <div className="flex items-center gap-3">
          <Terminal className="w-4 h-4" />
          <span className="text-[10px] tracking-widest uppercase">Strategy_Console // v3.0</span>
        </div>
        <div className="flex items-center gap-6 text-[10px]">
          <span className="flex items-center gap-1"><Database className="w-3 h-3" /> RAG_ACTIVE</span>
          <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> AUDIT_ON</span>
          <button onClick={onClose} className="hover:text-white transition-colors">[EXIT_TERMINAL]</button>
        </div>
      </div>

      {/* Log Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
        {logs.map((log, i) => (
          <div key={i} className={`flex gap-3 ${
            log.type === "input" ? "text-blue-400" : 
            log.type === "output" ? "text-neutral-300" : 
            log.type === "proc" ? "text-purple-400" :
            "text-amber-500/80"
          }`}>
            <span className="shrink-0 opacity-40">
              {log.type === "input" ? ">" : log.type === "output" ? "STRAT:" : log.type === "proc" ? "PROC:" : "SYS:"}
            </span>
            <div className="whitespace-pre-wrap leading-relaxed max-w-2xl">
              {log.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-3 text-purple-400 animate-pulse">
            <span className="shrink-0 opacity-40">PROC:</span>
            <span>Generating strategic synthesis...</span>
          </div>
        )}
      </div>

      {/* Input Area */}
      <form onSubmit={handleCommand} className="p-6 bg-neutral-950/50 border-t border-white/5 flex items-center gap-4">
        <span className="text-blue-500 font-bold">$</span>
        <input 
          autoFocus
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="ENTER COMMAND OR TOPIC..."
          className="bg-transparent flex-1 outline-none text-white selection:bg-blue-500/30"
          disabled={isLoading}
        />
        <button 
          type="submit" 
          disabled={isLoading || !input.trim()}
          className="p-2 text-neutral-500 hover:text-white transition-colors disabled:opacity-20"
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </button>
      </form>
    </motion.div>
  );
}
