"use client";

import React from "react";
import { motion } from "framer-motion";
import { Clock3, Rocket, ShieldCheck } from "lucide-react";
import { IntentState } from "@/utils/intent-engine";
import { getAuditLogs, AuditEntry } from "@/utils/audit-service";

interface RightRailProps {
  content: string;
  intentState: IntentState;
}

export function RightRail({ content, intentState }: RightRailProps) {
  const [logs, setLogs] = React.useState<AuditEntry[]>([]);

  const fetchLogs = async () => {
    try {
      const data = await getAuditLogs({ limit: 24 });
      setLogs(data);
    } catch (e) {
      console.error("Failed to fetch logs", e);
    }
  };

  React.useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 5000);
    return () => clearInterval(interval);
  }, []);

  const latest = logs[0];

  return (
    <aside className="h-full w-full overflow-hidden rounded-3xl border border-white/10 bg-[rgba(15,18,24,0.78)] backdrop-blur-2xl">
      <div className="flex h-full flex-col">
        <div className="border-b border-white/10 px-5 py-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/60">Audit</p>
          <h3 className="mt-1 text-lg font-semibold text-white">Runtime Telemetry</h3>
        </div>

        <div className="grid grid-cols-2 gap-2 border-b border-white/10 p-4">
          <MetricCard label="Events" value={String(logs.length)} icon={Rocket} />
          <MetricCard
            label="Intent"
            value={intentState.intent.replace("_", " ")}
            icon={ShieldCheck}
          />
        </div>

        <div className="border-b border-white/10 px-4 py-3">
          <div className="rounded-xl border border-white/10 bg-black/20 px-3 py-2">
            <p className="text-[10px] uppercase tracking-[0.18em] text-white/60">Latest Action</p>
            <p className="mt-1 text-xs font-semibold text-white">{latest?.action || "No activity yet"}</p>
            <p className="mt-1 line-clamp-2 text-[11px] text-white/60">
              {latest?.output || "Generate, polish, and publish events will stream here."}
            </p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-3">
          {logs.length > 0 ? (
            <div className="space-y-2">
              {logs.map((entry) => (
                <LogCard key={entry.id} entry={entry} />
              ))}
            </div>
          ) : (
            <div className="flex h-40 items-center justify-center rounded-2xl border border-dashed border-white/10 text-xs uppercase tracking-[0.2em] text-white/50">
              Telemetry idle
            </div>
          )}
        </div>

        <div className="border-t border-white/10 px-5 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
              <span className="text-[10px] uppercase tracking-[0.2em] text-white/70">Synchronized</span>
            </div>
            <span className="text-[10px] text-white/50">v13.0</span>
          </div>
          <p className="mt-2 line-clamp-1 text-[10px] text-white/50">
            Draft length: {Math.max(0, content.trim().length)} characters
          </p>
        </div>
      </div>
    </aside>
  );
}

function MetricCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/20 px-3 py-2">
      <div className="flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-[0.16em] text-white/60">{label}</span>
        <Icon size={13} className="text-white/50" />
      </div>
      <p className="mt-1 line-clamp-1 text-xs font-semibold text-white">{value}</p>
    </div>
  );
}

function LogCard({ entry }: { entry: AuditEntry }) {
  const time = new Date(entry.timestamp).toLocaleTimeString([], { hour12: false });

  return (
    <motion.article
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-white/10 bg-white/[0.03] p-3"
    >
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <p className="truncate text-[10px] font-semibold uppercase tracking-[0.14em] text-white/75">{entry.action}</p>
        <div className="flex items-center gap-1 text-[10px] text-white/45">
          <Clock3 size={11} />
          <span>{time}</span>
        </div>
      </div>
      <p className="line-clamp-2 text-[11px] text-white/65">{entry.output}</p>
      <p className="mt-2 text-[10px] text-white/45">{entry.durationMs}ms</p>
    </motion.article>
  );
}
