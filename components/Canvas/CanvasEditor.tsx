"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { RefreshCw, Sparkles, Send, Waves, UserRound, PenLine } from "lucide-react";
import { IntentState } from "@/utils/intent-engine";
import { LensOverlay, Critique } from "./LensOverlay";
import { REPLACEMENTS } from "@/utils/text-processor";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { GhostTextPlugin } from "./GhostTextPlugin";
import { SkeletonDraft } from "./SkeletonDraft";
import { SelectionToolbar } from "./SelectionToolbar";
import { TypographyGuardPlugin } from "@/hooks/useTypographyGuard";
import { $createParagraphNode, $createTextNode, $getRoot } from "lexical";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import type { QualityReport } from "@/utils/content-quality";

function InitialContentPlugin({ content }: { content: string }) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    editor.update(() => {
      const root = $getRoot();
      const editorText = root.getTextContent();

      if (editorText === content) return;
      if (!content.trim() && editorText.trim()) return;

      root.clear();
      const lines = content.split("\n");
      lines.forEach((line) => {
        const paragraph = $createParagraphNode();
        if (line.length > 0) {
          paragraph.append($createTextNode(line));
        }
        root.append(paragraph);
      });
    });
  }, [editor, content]);

  return null;
}

interface CanvasEditorProps {
  content: string;
  setContent: (val: string) => void;
  intentState: IntentState | null;
  isDiffing?: boolean;
  viewMode?: "EDITOR" | "WATERFALL";
  setViewMode?: (mode: "EDITOR" | "WATERFALL") => void;
  onPolish?: () => void;
  onRevise?: (instruction?: string) => void;
  isRevising?: boolean;
  activePersonaName?: string;
  activePersonaDescription?: string;
  activePersonaFeatures?: string[];
  revisionLockFacts?: boolean;
  revisionToneStrength?: number;
  onRevisionLockFactsChange?: (value: boolean) => void;
  onRevisionToneStrengthChange?: (value: number) => void;
  onPublish?: () => void;
  isPublishing?: boolean;
  qualityReport?: QualityReport;
  qualityPlatform?: "linkedin" | "twitter";
}

export function CanvasEditor({
  content,
  setContent,
  intentState,
  isDiffing,
  viewMode = "EDITOR",
  setViewMode,
  onPolish,
  onRevise,
  isRevising = false,
  activePersonaName = "The Strategist",
  activePersonaDescription = "Authoritative, cynical, clarity-obsessed.",
  activePersonaFeatures = [],
  revisionLockFacts = true,
  revisionToneStrength = 65,
  onRevisionLockFactsChange,
  onRevisionToneStrengthChange,
  onPublish,
  isPublishing = false,
  qualityReport,
  qualityPlatform = "linkedin",
}: CanvasEditorProps) {
  const [activeLens, setActiveLens] = useState<"SKEPTIC" | "ARCHITECT" | "NONE">("NONE");
  const [revisionInstruction, setRevisionInstruction] = useState("");
  const [critiques] = useState<Critique[]>([
    {
      id: "1",
      range: [30, 50],
      agent: "SKEPTIC",
      message: "Lack of data proof here. Add a metric to increase authority.",
    },
    {
      id: "2",
      range: [100, 150],
      agent: "ARCHITECT",
      message: "This transition is abrupt. Use a pivot sentence.",
    },
  ]);

  const words = content.split(/\s+/).filter(Boolean).length;
  const chars = content.length;
  const personaFeatureList = activePersonaFeatures.slice(0, 4);
  const canRevise = !isRevising && content.trim().length > 0;
  const qualityTopIssues = qualityReport?.reasons?.slice(0, 2) || [];

  const revisionPresets = useMemo(
    () => [
      { label: "Sharper", instruction: "Make it sharper and more decisive while preserving the core claim." },
      { label: "Shorter", instruction: "Condense by about 25% and keep all key claims intact." },
      { label: "More Contrarian", instruction: "Increase the contrarian angle and tighten the argument." },
      { label: "Story Lead", instruction: "Open with a stronger story-driven hook and maintain this persona voice." },
    ],
    []
  );

  const getFoldLineIndex = () => {
    let newlines = 0;
    for (let i = 0; i < content.length; i++) {
      if (content[i] === "\n") newlines++;
      if (newlines === 3) return i;
    }
    return -1;
  };

  const foldIndex = getFoldLineIndex();

  return (
    <main className="relative flex flex-1 flex-col overflow-hidden bg-[color:var(--background)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(90%_40%_at_50%_0%,color-mix(in_oklab,var(--stitch-accent,#7c3bed)_20%,transparent),transparent_75%)]" />

      <header className="sticky top-0 z-30 border-b border-[color:var(--stitch-border,#24282D)] bg-[color:var(--card)] px-4 py-3 backdrop-blur-xl md:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <input
              type="text"
              placeholder="Untitled strategy brief"
              autoComplete="off"
              className="w-[18rem] max-w-full bg-transparent text-base font-semibold text-[color:var(--card-foreground)] placeholder:text-[color:var(--muted-foreground)] focus:outline-none md:text-lg"
            />
            <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-[color:var(--muted-foreground)]">
              {intentState?.intent.replace("_", " ") || "Drafting"} Mode
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden items-center rounded-xl border border-[color:var(--stitch-border,#24282D)] bg-[color:var(--stitch-surface,#16181D)] px-3 py-2 text-[10px] uppercase tracking-[0.16em] text-[color:var(--muted-foreground)] sm:flex">
              Words {words}
            </div>
            <div className="hidden items-center rounded-xl border border-[color:var(--stitch-border,#24282D)] bg-[color:var(--stitch-surface,#16181D)] px-3 py-2 text-[10px] uppercase tracking-[0.16em] text-[color:var(--muted-foreground)] lg:flex">
              Chars {chars}
            </div>

            <div className="flex items-center rounded-xl border border-[color:var(--stitch-border,#24282D)] bg-[color:var(--stitch-surface,#16181D)] p-1">
              <button
                onClick={() => setViewMode?.(viewMode === "EDITOR" ? "WATERFALL" : "EDITOR")}
                className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[10px] uppercase tracking-[0.16em] transition ${
                  viewMode === "WATERFALL"
                    ? "bg-[var(--stitch-accent,#7c3bed)] text-white"
                    : "text-[color:var(--muted-foreground)] hover:text-[color:var(--foreground)]"
                }`}
                title="Waterfall repurposing"
              >
                <RefreshCw size={12} className={viewMode === "WATERFALL" ? "animate-spin-slow" : ""} />
                Waterfall
              </button>
            </div>

            <button
              onClick={onPolish}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[color:var(--stitch-border,#24282D)] px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[color:var(--foreground)] hover:border-[color:var(--stitch-accent,#7c3bed)]/45"
              title="Polish draft"
            >
              <Sparkles size={12} />
              Polish
            </button>

            <button
              onClick={onPublish}
              disabled={isPublishing}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--stitch-accent,#7c3bed)] px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-white shadow-[0_8px_28px_rgba(124,59,237,0.45)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Send size={12} />
              {isPublishing ? "Publishing..." : "Publish"}
            </button>
          </div>
        </div>

        <div className="mt-3 rounded-2xl border border-[color:var(--stitch-border,#24282D)] bg-[color:var(--stitch-surface,#16181D)] p-3">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]">
                <UserRound size={12} />
                Voice Target
              </p>
              <p className="mt-1 text-sm font-semibold text-[color:var(--foreground)]">{activePersonaName}</p>
              <p className="mt-1 max-w-[55ch] text-xs text-[color:var(--muted-foreground)]">{activePersonaDescription}</p>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              {personaFeatureList.map((feature) => (
                <span
                  key={feature}
                  className="rounded-full border border-[var(--stitch-accent,#7c3bed)]/35 bg-[var(--stitch-accent,#7c3bed)]/12 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/80"
                >
                  {feature}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-1.5">
            {revisionPresets.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => setRevisionInstruction(preset.instruction)}
                disabled={isRevising}
                className="rounded-full border border-[color:var(--stitch-border,#24282D)] bg-[color:var(--card)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[color:var(--foreground)] hover:border-[color:var(--stitch-accent,#7c3bed)]/45 disabled:opacity-50"
                aria-label={`Set revision brief to ${preset.label}`}
              >
                {preset.label}
              </button>
            ))}
          </div>

          <div className="mt-3 flex flex-col gap-2 md:flex-row md:items-center">
            <label className="sr-only" htmlFor="persona-revision-instruction">
              Revision instruction
            </label>
            <input
              id="persona-revision-instruction"
              type="text"
              value={revisionInstruction}
              disabled={isRevising}
              onChange={(event) => setRevisionInstruction(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  if (!canRevise) return;
                  onRevise?.(revisionInstruction);
                  setRevisionInstruction("");
                }
              }}
              placeholder={`Revision brief for ${activePersonaName} (optional)`}
              className="h-10 w-full rounded-xl border border-[color:var(--stitch-border,#24282D)] bg-[color:var(--background)] px-3 text-xs text-[color:var(--foreground)] placeholder:text-[color:var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[color:var(--stitch-accent,#7c3bed)]/30"
              aria-label="Persona revision instruction"
            />
            <button
              type="button"
              onClick={() => {
                if (!canRevise) return;
                onRevise?.(revisionInstruction);
                setRevisionInstruction("");
              }}
              disabled={!canRevise}
              className="inline-flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-xl border border-[var(--stitch-accent,#7c3bed)]/45 bg-[var(--stitch-accent,#7c3bed)]/12 px-4 text-[10px] font-semibold uppercase tracking-[0.16em] text-white hover:border-[var(--stitch-accent,#7c3bed)]/65 disabled:cursor-not-allowed disabled:opacity-60"
              aria-label="Revise"
              title={canRevise ? `Revise draft in ${activePersonaName} voice` : "Add draft text before revising"}
            >
              <PenLine size={12} />
              {isRevising ? "Revising..." : "Revise"}
            </button>
          </div>
          <div className="mt-2 grid gap-2 md:grid-cols-[auto_1fr_auto] md:items-center">
            <label className="inline-flex items-center gap-2 rounded-xl border border-[color:var(--stitch-border,#24282D)] bg-[color:var(--background)] px-3 py-2 text-xs text-[color:var(--foreground)]">
              <input
                type="checkbox"
                checked={revisionLockFacts}
                onChange={(event) => onRevisionLockFactsChange?.(event.target.checked)}
                className="size-4 accent-[color:var(--stitch-accent,#7c3bed)]"
                aria-label="Lock factual claims"
              />
              Lock factual claims
            </label>
            <label className="rounded-xl border border-[color:var(--stitch-border,#24282D)] bg-[color:var(--background)] px-3 py-2 text-xs text-[color:var(--foreground)]">
              <div className="mb-1 flex items-center justify-between">
                <span>Persona tone strength</span>
                <span className="font-semibold">{revisionToneStrength}%</span>
              </div>
              <input
                type="range"
                min={10}
                max={100}
                step={5}
                value={revisionToneStrength}
                onChange={(event) => onRevisionToneStrengthChange?.(Number(event.target.value))}
                className="w-full accent-[color:var(--stitch-accent,#7c3bed)]"
                aria-label="Persona tone strength"
              />
            </label>
            <p className="text-[10px] uppercase tracking-[0.16em] text-[color:var(--muted-foreground)]">
              Revision profile
            </p>
          </div>
          <p className="mt-2 text-[10px] uppercase tracking-[0.16em] text-[color:var(--muted-foreground)]">
            Persona-guided rewrite. Preserves argument, upgrades voice.
          </p>

          <div className="mt-2 rounded-xl border border-[color:var(--stitch-border,#24282D)] bg-[color:var(--background)] px-3 py-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[color:var(--muted-foreground)]">
                Quality Gate · {qualityPlatform.toUpperCase()}
              </p>
              <div className="flex items-center gap-2">
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] ${
                    qualityReport?.pass
                      ? "bg-emerald-500/15 text-emerald-400"
                      : "bg-amber-500/15 text-amber-300"
                  }`}
                >
                  {qualityReport?.pass ? "Ready" : "Needs Work"}
                </span>
                <span className="font-mono text-xs text-[color:var(--foreground)]">
                  {qualityReport?.totalScore ?? 0}
                </span>
              </div>
            </div>
            {qualityTopIssues.length > 0 && (
              <p className="mt-1 text-[11px] text-[color:var(--muted-foreground)]">
                {qualityTopIssues.join(" ")}
              </p>
            )}
          </div>
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span className="text-[10px] uppercase tracking-[0.18em] text-white/55">Lens</span>
          {(["SKEPTIC", "ARCHITECT", "NONE"] as const).map((lens) => (
            <button
              key={lens}
              onClick={() => setActiveLens(lens)}
              className={`rounded-lg px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] transition ${
                activeLens === lens
                  ? "bg-white text-black"
                  : "border border-white/10 bg-black/20 text-white/70 hover:text-white"
              }`}
            >
              {lens}
            </button>
          ))}
        </div>
      </header>

      <div className="relative flex-1 overflow-y-auto px-4 pb-48 pt-20 custom-scrollbar md:px-10 md:pb-56 md:pt-24">
        <div className="mx-auto w-full max-w-3xl">
          {viewMode === "WATERFALL" ? (
            <div className="grid gap-6 lg:grid-cols-2">
              <section className="rounded-2xl border border-white/10 bg-black/25 p-5">
                <h4 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/70">
                  Original Draft
                </h4>
                <p className="whitespace-pre-wrap text-base leading-relaxed text-white/80">{content}</p>
              </section>

              <section className="rounded-2xl border border-white/10 bg-black/25 p-5">
                <h4 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--stitch-accent,#7c3bed)]">
                  Waterfall Variants
                </h4>
                <div className="space-y-3">
                  <VariantCard label="Tweet Thread (1/3)">
                    Most strategy is just expensive theater. Real impact is found in the second-order effects no one wants to audit.
                  </VariantCard>
                  <VariantCard label="LinkedIn Short">
                    Stop leverage-speak. Start building actual systems. The death of consultancy theater is already here.
                  </VariantCard>
                </div>
              </section>
            </div>
          ) : isDiffing ? (
            <div className="whitespace-pre-wrap text-xl leading-relaxed text-[var(--stitch-text-primary,#E1E1E1)]">
              {content.split(/\b/).map((word, i) => {
                const lower = word.toLowerCase();
                const replacement = (REPLACEMENTS as Record<string, string>)[lower];
                if (replacement) {
                  return <PhysicsWord key={i} original={word} replacement={replacement} />;
                }
                return <span key={i}>{word}</span>;
              })}
            </div>
          ) : (
            <>
              {intentState?.intent === "LINKEDIN" && content.length > 0 && (
                <div
                  className="pointer-events-none absolute inset-x-6 top-10 h-24 rounded-2xl border border-blue-400/20 bg-blue-400/6 md:inset-x-12"
                  aria-hidden
                />
              )}

              {content === "" && intentState?.intent === "NEWSJACKING" ? (
                <SkeletonDraft />
              ) : (
                <LexicalComposer
                  initialConfig={{
                    namespace: "CanvasEditor",
                    theme: {
                      paragraph: "mb-4",
                      text: {
                        bold: "font-bold",
                        italic: "italic",
                      },
                    },
                    onError: (error) => console.error(error),
                  }}
                >
                  <div className="relative min-h-[68vh] rounded-2xl border border-white/10 bg-[rgba(8,11,16,0.62)] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] md:p-8">
                    <div className="absolute inset-x-0 top-0 h-20 rounded-t-2xl bg-gradient-to-b from-white/[0.03] to-transparent" />
                    <div className="relative z-10 text-[19px] leading-[1.8] text-[var(--stitch-text-primary,#E1E1E1)] md:text-[21px] md:leading-[1.9]">
                      <RichTextPlugin
                        contentEditable={<ContentEditable className="focus:outline-none" />}
                        placeholder={
                          <div className="absolute top-0 text-base text-white/35">
                            Start writing your next high-conviction strategy...
                          </div>
                        }
                        ErrorBoundary={LexicalErrorBoundary}
                      />
                      <HistoryPlugin />
                      <InitialContentPlugin content={content} />
                      <OnChangePlugin
                        onChange={(editorState) => {
                          editorState.read(() => {
                            const fullText = $getRoot().getTextContent();
                            setContent(fullText);
                          });
                        }}
                      />
                      <GhostTextPlugin />
                      <SelectionToolbar />
                      <TypographyGuardPlugin />
                    </div>
                  </div>
                </LexicalComposer>
              )}
            </>
          )}

          {!isDiffing && viewMode === "EDITOR" && (
            <LensOverlay content={content} critiques={critiques} activeLens={activeLens} />
          )}

          {intentState?.intent === "LINKEDIN" && foldIndex !== -1 && (
            <div
              className="pointer-events-none absolute left-0 right-0 z-20 flex justify-center border-t border-dashed border-white/25"
              style={{ top: `${(content.substring(0, foldIndex).split("\n").length * 28) + 28}px` }}
            >
              <span className="rounded-full bg-[rgba(8,10,15,0.95)] px-2 py-0.5 text-[9px] uppercase tracking-[0.14em] text-white/55">
                LinkedIn fold line
              </span>
            </div>
          )}
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: content.length > 5 ? 1 : 0, y: 0 }}
        className="pointer-events-none absolute bottom-8 right-4 rounded-full border border-white/12 bg-black/45 px-3 py-2 text-[10px] uppercase tracking-[0.18em] text-white/70 shadow-xl md:right-8"
      >
        <span className="inline-flex items-center gap-2">
          <Waves size={12} className="text-[var(--stitch-accent,#7c3bed)]" />
          {intentState?.intent.replace("_", " ") || "Drafting"} ({Math.round((intentState?.confidence || 0) * 100)}%)
        </span>
      </motion.div>
    </main>
  );
}

function VariantCard({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <p className="mb-2 text-[10px] uppercase tracking-[0.16em] text-white/55">{label}</p>
      <p className="text-sm leading-relaxed text-white/85">{children}</p>
    </div>
  );
}

function PhysicsWord({ original, replacement }: { original: string; replacement: string }) {
  return (
    <span className="relative mx-1 inline-flex flex-col items-center">
      <motion.span
        initial={{ opacity: 1, y: 0 }}
        animate={{ opacity: 0, y: 50, rotate: 15 }}
        transition={{ duration: 0.6, ease: "easeIn" }}
        className="absolute text-red-400 line-through"
      >
        {original}
      </motion.span>
      <motion.span
        initial={{ opacity: 0, y: -20, scale: 0.8 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 0.4, duration: 0.5, type: "spring", stiffness: 200 }}
        className="font-bold text-emerald-400 underline decoration-2"
      >
        {replacement}
      </motion.span>
    </span>
  );
}
