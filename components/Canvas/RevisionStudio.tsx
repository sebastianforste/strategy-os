"use client";

import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, RotateCcw, SlidersHorizontal, X } from "lucide-react";
import type { QualityReport } from "@/utils/content-quality";

export interface RevisionParagraph {
  id: number;
  original: string;
  revised: string;
  changed: boolean;
  accepted: boolean;
}

interface RevisionStudioProps {
  isOpen: boolean;
  personaName: string;
  lockFacts: boolean;
  toneStrength: number;
  isRevising: boolean;
  paragraphs: RevisionParagraph[];
  qualityReport: QualityReport | null;
  onClose: () => void;
  onApply: () => void;
  onAcceptAll: () => void;
  onRejectAll: () => void;
  onParagraphDecision: (id: number, accepted: boolean) => void;
  onLockFactsChange: (value: boolean) => void;
  onToneStrengthChange: (value: number) => void;
  onRegenerate: () => void;
}

function splitWordTokens(text: string): string[] {
  return text.split(/(\s+)/g);
}

function normalizeToken(token: string): string {
  return token.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function renderHighlightedRevised(original: string, revised: string): React.ReactNode {
  const originals = new Set(
    splitWordTokens(original)
      .map(normalizeToken)
      .filter(Boolean)
  );

  return splitWordTokens(revised).map((token, index) => {
    const normalized = normalizeToken(token);
    const changed = normalized && !originals.has(normalized);

    if (!changed) return <React.Fragment key={`${token}-${index}`}>{token}</React.Fragment>;

    return (
      <mark
        key={`${token}-${index}`}
        className="rounded bg-[color:var(--stitch-accent,#7c3bed)]/22 px-0.5 text-[color:var(--stitch-text-primary,#E1E1E1)]"
      >
        {token}
      </mark>
    );
  });
}

export function RevisionStudio({
  isOpen,
  personaName,
  lockFacts,
  toneStrength,
  isRevising,
  paragraphs,
  qualityReport,
  onClose,
  onApply,
  onAcceptAll,
  onRejectAll,
  onParagraphDecision,
  onLockFactsChange,
  onToneStrengthChange,
  onRegenerate,
}: RevisionStudioProps) {
  const changedCount = paragraphs.filter((p) => p.changed).length;
  const acceptedCount = paragraphs.filter((p) => p.changed && p.accepted).length;
  const canApply = Boolean(qualityReport?.pass) && !isRevising;
  const qualityReasons = qualityReport?.reasons?.slice(0, 3) || [];
  const qualityDimensions = qualityReport
    ? [
        { label: "Persona", score: qualityReport.dimensions.personaFidelity.score },
        { label: "Facts", score: qualityReport.dimensions.factualStability.score },
        { label: "Novelty", score: qualityReport.dimensions.novelty.score },
        { label: "Readability", score: qualityReport.dimensions.readability.score },
        { label: "Platform", score: qualityReport.dimensions.platformFit.score },
      ]
    : [];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            aria-label="Close revision studio"
            className="fixed inset-0 z-[118] bg-black/70 backdrop-blur-md"
          />

          <motion.section
            role="dialog"
            aria-modal="true"
            aria-label="Revision Studio"
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-x-3 bottom-3 top-20 z-[119] flex flex-col overflow-hidden rounded-3xl border border-[color:var(--stitch-border,#24282D)] bg-[color:var(--stitch-background,#080A0F)] shadow-[0_30px_90px_rgba(0,0,0,0.6)] md:inset-x-8 md:top-16"
          >
            <header className="border-b border-[color:var(--stitch-border,#24282D)] bg-[color:var(--card)] px-4 py-3 md:px-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[color:var(--muted-foreground)]">
                    Revision Studio
                  </p>
                  <h3 className="mt-1 text-base font-semibold text-[color:var(--card-foreground)] md:text-lg">
                    {personaName} rewrite review
                  </h3>
                  <p className="mt-1 text-xs text-[color:var(--muted-foreground)]">
                    {acceptedCount} accepted of {changedCount} changed paragraphs
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="inline-flex size-9 items-center justify-center rounded-xl border border-[color:var(--stitch-border,#24282D)] bg-[color:var(--stitch-surface,#16181D)] text-[color:var(--muted-foreground)] hover:text-[color:var(--foreground)]"
                    aria-label="Close revision studio"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>

              <div className="mt-3 grid gap-3 md:grid-cols-[1fr_1fr_auto] md:items-end">
                <label className="flex items-center gap-2 rounded-xl border border-[color:var(--stitch-border,#24282D)] bg-[color:var(--stitch-surface,#16181D)] px-3 py-2 text-xs text-[color:var(--foreground)]">
                  <input
                    type="checkbox"
                    checked={lockFacts}
                    onChange={(event) => onLockFactsChange(event.target.checked)}
                    className="size-4 accent-[color:var(--stitch-accent,#7c3bed)]"
                    aria-label="Lock factual claims"
                  />
                  Lock factual claims
                </label>

                <label className="rounded-xl border border-[color:var(--stitch-border,#24282D)] bg-[color:var(--stitch-surface,#16181D)] px-3 py-2 text-xs text-[color:var(--foreground)]">
                  <div className="mb-1 flex items-center justify-between">
                    <span className="inline-flex items-center gap-1">
                      <SlidersHorizontal size={12} />
                      Tone strength
                    </span>
                    <span className="font-semibold">{toneStrength}%</span>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={100}
                    step={5}
                    value={toneStrength}
                    onChange={(event) => onToneStrengthChange(Number(event.target.value))}
                    aria-label="Persona tone strength"
                    className="w-full accent-[color:var(--stitch-accent,#7c3bed)]"
                  />
                </label>

                <button
                  type="button"
                  onClick={onRegenerate}
                  disabled={isRevising}
                  className="inline-flex items-center justify-center gap-1 rounded-xl border border-[color:var(--stitch-border,#24282D)] bg-[color:var(--stitch-surface,#16181D)] px-3 py-2 text-xs font-semibold text-[color:var(--foreground)] hover:border-[color:var(--stitch-accent,#7c3bed)]/45 disabled:opacity-60"
                >
                  <RotateCcw size={13} />
                  {isRevising ? "Regenerating..." : "Regenerate"}
                </button>
              </div>

              {qualityReport && (
                <div className="mt-3 rounded-xl border border-[color:var(--stitch-border,#24282D)] bg-[color:var(--stitch-surface,#16181D)] p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[color:var(--muted-foreground)]">
                      Revision Quality
                    </p>
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] ${
                          qualityReport.pass
                            ? "bg-emerald-500/15 text-emerald-400"
                            : "bg-amber-500/15 text-amber-300"
                        }`}
                      >
                        {qualityReport.pass ? "Pass" : "Blocked"}
                      </span>
                      <span className="font-mono text-xs text-[color:var(--foreground)]">{qualityReport.totalScore}</span>
                    </div>
                  </div>

                  <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
                    {qualityDimensions.map((dimension) => (
                      <div key={dimension.label}>
                        <div className="mb-1 flex items-center justify-between text-[10px] text-[color:var(--muted-foreground)]">
                          <span>{dimension.label}</span>
                          <span>{dimension.score}</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-white/10">
                          <div
                            className={`h-1.5 rounded-full ${
                              dimension.score >= 75 ? "bg-emerald-400" : "bg-amber-400"
                            }`}
                            style={{ width: `${Math.max(4, Math.min(100, dimension.score))}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {qualityReasons.length > 0 && (
                    <p className="mt-2 text-[11px] text-[color:var(--muted-foreground)]">
                      {qualityReasons.join(" ")}
                    </p>
                  )}
                </div>
              )}
            </header>

            <div className="flex-1 overflow-y-auto p-3 custom-scrollbar md:p-4">
              <div className="space-y-3">
                {paragraphs.map((paragraph, index) => (
                  <article
                    key={paragraph.id}
                    className="rounded-2xl border border-[color:var(--stitch-border,#24282D)] bg-[color:var(--card)] p-3 md:p-4"
                  >
                    <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[color:var(--muted-foreground)]">
                        Paragraph {index + 1}
                      </p>
                      <div className="flex items-center gap-2">
                        {paragraph.changed && (
                          <span className="rounded-full border border-[color:var(--stitch-accent,#7c3bed)]/40 bg-[color:var(--stitch-accent,#7c3bed)]/12 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[color:var(--foreground)]">
                            Changed
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => onParagraphDecision(paragraph.id, true)}
                          className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold ${
                            paragraph.accepted
                              ? "bg-[color:var(--stitch-accent,#7c3bed)] text-white"
                              : "border border-[color:var(--stitch-border,#24282D)] text-[color:var(--foreground)]"
                          }`}
                        >
                          Accept
                        </button>
                        <button
                          type="button"
                          onClick={() => onParagraphDecision(paragraph.id, false)}
                          className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold ${
                            !paragraph.accepted
                              ? "bg-[color:var(--stitch-text-secondary,#8A8D91)] text-[color:var(--background)]"
                              : "border border-[color:var(--stitch-border,#24282D)] text-[color:var(--foreground)]"
                          }`}
                        >
                          Keep original
                        </button>
                      </div>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2">
                      <section className="rounded-xl border border-[color:var(--stitch-border,#24282D)] bg-[color:var(--stitch-surface,#16181D)] p-3">
                        <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[color:var(--muted-foreground)]">
                          Original
                        </p>
                        <p className="whitespace-pre-wrap text-sm leading-relaxed text-[color:var(--foreground)]/88">
                          {paragraph.original || " "}
                        </p>
                      </section>
                      <section className="rounded-xl border border-[color:var(--stitch-border,#24282D)] bg-[color:var(--stitch-surface,#16181D)] p-3">
                        <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[color:var(--muted-foreground)]">
                          Revised
                        </p>
                        <p className="whitespace-pre-wrap text-sm leading-relaxed text-[color:var(--foreground)]/96">
                          {renderHighlightedRevised(paragraph.original, paragraph.revised)}
                        </p>
                      </section>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-[color:var(--stitch-border,#24282D)] bg-[color:var(--card)] px-4 py-3 md:px-6">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onAcceptAll}
                  className="rounded-lg border border-[color:var(--stitch-border,#24282D)] bg-[color:var(--stitch-surface,#16181D)] px-3 py-2 text-xs text-[color:var(--foreground)] hover:border-[color:var(--stitch-accent,#7c3bed)]/45"
                >
                  Accept all
                </button>
                <button
                  type="button"
                  onClick={onRejectAll}
                  className="rounded-lg border border-[color:var(--stitch-border,#24282D)] bg-[color:var(--stitch-surface,#16181D)] px-3 py-2 text-xs text-[color:var(--foreground)] hover:border-[color:var(--stitch-accent,#7c3bed)]/45"
                >
                  Keep all originals
                </button>
              </div>

              <button
                type="button"
                onClick={onApply}
                disabled={!canApply}
                className="inline-flex items-center gap-1 rounded-xl bg-[color:var(--stitch-accent,#7c3bed)] px-4 py-2 text-xs font-semibold text-white shadow-[0_10px_30px_rgba(124,59,237,0.45)] hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-55"
              >
                <Check size={14} />
                Apply selected revision
              </button>
            </footer>
          </motion.section>
        </>
      )}
    </AnimatePresence>
  );
}
