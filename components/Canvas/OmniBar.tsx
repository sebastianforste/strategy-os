"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Command, SendHorizonal, Sparkles } from "lucide-react";
import { useSoundEngine } from "@/hooks/useSoundEngine";
import { MechanicalOdometer } from "./MechanicalOdometer";
import { getAuditLogs } from "@/utils/audit-service";

interface OmniBarProps {
  onCommand: (cmd: string, args: string) => void;
  onDraft: (topic: string) => void;
  onUrl: (url: string) => void;
  onPublish: () => void;
  onTensionChange?: (isTensioned: boolean) => void;
  onActuate?: () => void;
  onModeChange?: (mode: 'MANUAL' | 'APERTURE' | 'PROGRAM') => void;
  viralScore?: number;
  currentMode?: 'MANUAL' | 'APERTURE' | 'PROGRAM';
  commandHints?: string[];
}

export function OmniBar({ 
  onCommand, onDraft, onUrl, onPublish, onTensionChange, onActuate, onModeChange, 
  viralScore = 85, currentMode = "PROGRAM", commandHints = ["/polish", "/publish", "/preview linkedin", "/settings", "/persona cso"]
}: OmniBarProps) {
  const [input, setInput] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { play } = useSoundEngine();
  const [sessionSecs, setSessionSecs] = useState(0);

  // Session timer for odometer
  useEffect(() => {
    const timer = setInterval(() => setSessionSecs(s => s + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleFocus = () => {
      inputRef.current?.focus();
    };
    window.addEventListener("strategyos:focus-omnibar", handleFocus as EventListener);
    return () => window.removeEventListener("strategyos:focus-omnibar", handleFocus as EventListener);
  }, []);

  const [logsCount, setLogsCount] = useState(0);

  // Poll audit-service for cycle count
  useEffect(() => {
    const checkLogs = async () => {
      try {
        const logs = await getAuditLogs();
        setLogsCount(logs.length);
      } catch (e) {
        console.error("Audit polling failed", e);
      }
    };
    checkLogs();
    const interval = setInterval(checkLogs, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    onActuate?.();

    if (input.startsWith("/")) {
      const [cmd, ...args] = input.slice(1).split(" ");
      if (cmd === "analyze") {
        play("HARMONIC_MAJOR_CHORD");
        onCommand("analyze", args.join(" "));
      } else {
        onCommand(cmd, args.join(" "));
      }
    }
    else if (/^(http|https):\/\/[^ "]+$/.test(input.trim())) {
      onUrl(input.trim());
    }
    else {
      onDraft(input);
    }

    setInput("");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    onTensionChange?.(e.target.value.trim().length > 0);
  };

  const handleModeSwitch = () => {
    const modes: ('MANUAL' | 'APERTURE' | 'PROGRAM')[] = ['MANUAL', 'APERTURE', 'PROGRAM'];
    const nextIndex = (modes.indexOf(currentMode) + 1) % modes.length;
    play("TACTILE_CLICK");
    onModeChange?.(modes[nextIndex]);
  };

  const hasInput = input.trim().length > 0;

  return (
    <div className="w-full flex items-center gap-3 md:gap-4 isolate">
      <div className="hidden xl:flex items-center gap-5 rounded-2xl border border-white/10 bg-[rgba(20,24,31,0.85)] px-4 py-3 shadow-[0_10px_30px_rgba(0,0,0,0.35)]">
        <MechanicalOdometer value={logsCount} label="Cycles" digits={3} />
        <div className="h-8 w-px bg-white/10" />
        <MechanicalOdometer value={Math.floor(sessionSecs / 60)} label="Min" digits={2} />
      </div>

      <motion.form
        onSubmit={handleSubmit}
        animate={{ width: "100%" }}
        transition={{ stiffness: 400, damping: 30 }}
        className={`relative flex-1 flex items-center rounded-2xl border bg-[rgba(10,14,20,0.86)] backdrop-blur-2xl shadow-[0_18px_55px_rgba(0,0,0,0.45)] transition-all ${
          isFocused ? "border-[var(--stitch-accent,#7c3bed)] ring-2 ring-[color:var(--stitch-accent,#7c3bed)]/20" : "border-white/10"
        }`}
      >
        <div className="pl-4 md:pl-5 text-[var(--stitch-muted,#8A8D91)]">
          <Command size={18} className={isFocused ? "text-white" : "text-[var(--stitch-muted,#8A8D91)]"} />
        </div>

        <input
          ref={inputRef}
          type="text"
          autoComplete="off"
          value={input}
          onChange={handleInputChange}
          onFocus={() => {
            setIsFocused(true);
            play("TACTILE_CLICK");
          }}
          onBlur={() => {
            setIsFocused(false);
            onTensionChange?.(false);
          }}
          placeholder="What strategy do you want to build today?"
          className="flex-1 bg-transparent py-4 px-3 text-sm md:text-base text-white focus:outline-none placeholder:text-[var(--stitch-muted,#8A8D91)]/70"
          aria-label="Omni command input"
        />

        <div className="pr-2 flex items-center gap-1.5">
          <span className="hidden lg:inline-flex items-center rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-2 py-1 text-[10px] font-bold text-emerald-300">
            Viral {viralScore}
          </span>
          <button
            type="button"
            onClick={() => {
              play("TACTILE_CLICK");
              onPublish();
            }}
            className="hidden md:inline-flex items-center gap-1 rounded-xl border border-white/10 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-white/80 hover:text-white hover:border-white/20"
          >
            <Sparkles size={12} />
            Publish
          </button>
          <motion.button 
            type="submit"
            onClick={() => play("SWIPE_WHIRR")}
            disabled={!hasInput}
            aria-label="Initiate sequence"
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className={`inline-flex items-center gap-1.5 px-3 md:px-4 py-2 rounded-xl text-[10px] md:text-[11px] font-bold uppercase tracking-[0.16em] transition-all ${
              hasInput
                ? "bg-[var(--stitch-accent,#7c3bed)] text-white border border-[var(--stitch-accent,#7c3bed)]/30 shadow-[0_8px_30px_rgba(124,59,237,0.4)]"
                : "bg-transparent text-[var(--stitch-muted,#8A8D91)] border border-white/10 cursor-not-allowed"
            }`}
          >
            <SendHorizonal size={13} />
            Execute
          </motion.button>
        </div>

        <AnimatePresence>
          {isFocused && input === "" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute -top-12 left-0 right-0 hidden md:flex justify-center gap-2"
            >
              {commandHints.map((cmd) => (
                <div key={cmd} className="px-3 py-1 rounded-full border border-white/10 bg-black/50 text-[10px] text-[var(--stitch-muted,#8A8D91)] font-semibold uppercase tracking-[0.16em]">
                  {cmd}
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.form>

      <div className="hidden md:flex flex-col items-center gap-1 group">
         <motion.div 
           className="size-12 md:size-14 rounded-full bg-[rgba(20,24,31,0.9)] border-2 border-white/15 flex items-center justify-center cursor-pointer relative shadow-[0_10px_30px_rgba(0,0,0,0.45)] hover:border-[var(--stitch-accent,#7c3bed)]/60 transition-colors"
           animate={{ rotate: ["MANUAL", "APERTURE", "PROGRAM"].indexOf(currentMode) * 45 }}
           onClick={handleModeSwitch}
         >
            <div className="absolute top-1.5 h-3 w-1 rounded-full bg-[var(--stitch-accent,#7c3bed)] shadow-[0_0_12px_rgba(124,59,237,0.7)]" />
            <div className="text-[10px] font-black text-white/60 select-none">M.A.P</div>
         </motion.div>
         <span className="text-[8px] font-bold text-white/90 uppercase tracking-[0.3em] h-2">{currentMode}</span>
      </div>
    </div>
  );
}
