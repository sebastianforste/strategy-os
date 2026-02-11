"use client";

import React from "react";
import { motion } from "framer-motion";
import { Activity, Database, Radio, User, Zap } from "lucide-react";
import { IntentState } from "@/utils/intent-engine";
import { PERSONAS } from "@/utils/personas";

interface LeftRailProps {
  intentState: IntentState;
  isTensioned?: boolean;
  activePersonaId: string;
  onPersonaChange: (id: string) => void;
}

export function LeftRail({ intentState, isTensioned, activePersonaId, onPersonaChange }: LeftRailProps) {
  const [stats, setStats] = React.useState<{ avgViralityScore?: number } | null>(null);

  React.useEffect(() => {
    fetch("/api/analytics/team")
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch((err) => console.error(err));
  }, []);

  const activePersona = PERSONAS[activePersonaId as keyof typeof PERSONAS] || PERSONAS.cso;
  const features = activePersona.features || [];
  const virality = Math.max(0, Math.min(100, stats?.avgViralityScore || 78));

  return (
    <motion.aside
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: isTensioned ? 0.6 : 1, x: 0 }}
      transition={{ duration: 0.25 }}
      className="h-full w-full overflow-hidden rounded-3xl border border-white/10 bg-[rgba(15,18,24,0.78)] backdrop-blur-2xl"
    >
      <div className="flex h-full flex-col">
        <div className="border-b border-white/10 px-5 py-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/60">Studio</p>
          <h2 className="mt-1 text-lg font-semibold text-white">Personas</h2>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto p-4 custom-scrollbar">
          <section className="space-y-2">
            {Object.entries(PERSONAS).map(([id, persona]) => {
              const isActive = activePersonaId === id;
              return (
                <button
                  key={id}
                  onClick={() => onPersonaChange(id)}
                  className={`w-full rounded-xl border px-3 py-3 text-left transition ${
                    isActive
                      ? "border-[var(--stitch-accent,#7c3bed)]/50 bg-[var(--stitch-accent,#7c3bed)]/14 text-white"
                      : "border-white/10 bg-white/[0.03] text-white/80 hover:border-white/20 hover:bg-white/[0.06]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex size-8 items-center justify-center rounded-lg bg-black/30">
                      <User size={15} />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{persona.name}</p>
                      <p className="truncate text-[10px] uppercase tracking-[0.2em] text-white/50">
                        {id}
                      </p>
                    </div>
                    {isActive && <span className="ml-auto size-2 rounded-full bg-[var(--stitch-accent,#7c3bed)]" />}
                  </div>
                </button>
              );
            })}
          </section>

          <section className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/60">Capabilities</p>
              <Zap size={13} className="text-[var(--stitch-accent,#7c3bed)]" />
            </div>
            <div className="space-y-2">
              {features.includes("RAG") && <CapabilityRow icon={Database} label="RAG Layer" isActive />}
              {features.includes("NEWSJACK") && (
                <CapabilityRow
                  icon={Radio}
                  label="Newsjack"
                  isActive={intentState.intent === "NEWSJACKING"}
                />
              )}
              {features.includes("PERFORMANCE") && (
                <CapabilityRow icon={Activity} label="Performance" isActive />
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <div className="mb-2 flex items-center justify-between text-[10px] uppercase tracking-[0.18em] text-white/60">
              <span>Virality Index</span>
              <span className="font-mono text-white">{virality}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/10">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${virality}%` }}
                transition={{ duration: 0.7, ease: "easeOut" }}
                className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-[var(--stitch-accent,#7c3bed)]"
              />
            </div>
          </section>
        </div>

        <div className="border-t border-white/10 px-5 py-4">
          <p className="text-sm font-semibold text-white">Sebastian</p>
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/50">Operator</p>
        </div>
      </div>
    </motion.aside>
  );
}

function CapabilityRow({
  icon: Icon,
  label,
  isActive,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  isActive: boolean;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
      <div className="flex items-center gap-2.5">
        <Icon size={14} className="text-white/70" />
        <span className="text-xs text-white/90">{label}</span>
      </div>
      <span className={`size-2 rounded-full ${isActive ? "bg-emerald-400" : "bg-white/20"}`} />
    </div>
  );
}
