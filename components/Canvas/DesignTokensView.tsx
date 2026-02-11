"use client";

import React from "react";
import { Zap, Palette, Type, Maximize2 } from "lucide-react";
import theme from "../../theme.json";

export function DesignTokensView() {
  const { colors, typography, spacing } = theme.theme;

  return (
    <div className="space-y-5 rounded-2xl border border-white/12 bg-[rgba(11,14,21,0.92)] p-4 shadow-[0_20px_55px_rgba(0,0,0,0.5)] backdrop-blur-2xl">
      <header className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <Zap size={14} className="text-[var(--stitch-accent,#7c3bed)]" />
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white">Stitch DNA</span>
        </div>
        <span className="inline-flex items-center gap-1 text-[9px] uppercase tracking-[0.14em] text-emerald-300">
          <span className="size-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
          Synced
        </span>
      </header>

      <section className="space-y-3">
        <SectionTitle icon={Palette} label="Color Palette" />
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(colors).map(([key, value]) => {
            if (typeof value === "string") {
              return (
                <ColorSwatch key={key} label={key} value={value} />
              );
            }
            return Object.entries(value).map(([subKey, subValue]) => (
              <ColorSwatch key={`${key}-${subKey}`} label={`${key}.${subKey}`} value={subValue} />
            ));
          })}
        </div>
      </section>

      <section className="space-y-2">
        <SectionTitle icon={Type} label="Typography" />
        <div className="rounded-xl border border-white/10 bg-black/20 p-3 text-xs text-white/75">
          <p className="font-semibold text-white">{typography.sans.split(",")[0]}</p>
          <p className="mt-1 text-[11px] text-white/55">Mono: {typography.mono.split(",")[0]}</p>
        </div>
      </section>

      <section className="space-y-2">
        <SectionTitle icon={Maximize2} label="Layout Metrics" />
        <div className="rounded-xl border border-white/10 bg-black/20 p-3 text-xs text-white/75">
          <p>Rail width: <span className="font-semibold text-white">{spacing.railWidth}</span></p>
          <p className="mt-1">Base gap: <span className="font-semibold text-white">{spacing.gap}</span></p>
        </div>
      </section>
    </div>
  );
}

function SectionTitle({
  icon: Icon,
  label,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.16em] text-white/60">
      <Icon size={12} />
      <span>{label}</span>
    </div>
  );
}

function ColorSwatch({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.03] p-2">
      <div className="mb-2 size-6 rounded-md border border-white/10" style={{ backgroundColor: value }} />
      <p className="truncate text-[10px] uppercase tracking-[0.1em] text-white/70">{label}</p>
      <p className="truncate text-[10px] text-white/45">{value}</p>
    </div>
  );
}
