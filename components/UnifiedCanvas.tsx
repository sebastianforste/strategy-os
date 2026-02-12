"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Activity,
  BookOpen,
  Command,
  CornerDownLeft,
  Monitor,
  PanelLeft,
  PanelRight,
  SlidersHorizontal,
  Smartphone,
  X,
} from "lucide-react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { detectIntent } from "@/utils/intent-engine";
import { polishText, PolishResult } from "@/utils/text-processor";
import { OmniBar } from "./Canvas/OmniBar";
import { DevicePreview } from "./Canvas/DevicePreview";
import { TactileNewsroom, ContentBlock } from "./Canvas/TactileNewsroom";
import { DailyBriefing } from "./Canvas/DailyBriefing";
import { LeftRail } from "./Canvas/LeftRail";
import { RightRail } from "./Canvas/RightRail";
import { CanvasEditor } from "./Canvas/CanvasEditor";
import { ManifestoView } from "./Canvas/ManifestoView";
import { HighStatusErrorBoundary } from "./HighStatusErrorBoundary";
import { useSoundEngine } from "@/hooks/useSoundEngine";
import { useLayoutMode } from "@/hooks/useLayoutMode";
import { TestCertificate } from "./Overlay/TestCertificate";
import { DesignTokensView } from "./Canvas/DesignTokensView";
import { RevisionStudio, type RevisionParagraph } from "./Canvas/RevisionStudio";
import { processInput, reviseWithPersonaAction } from "@/actions/generate";
import { saveHistory, getHistory, clearHistory, HistoryItem } from "@/utils/history-service";
import { logAudit } from "@/utils/audit-service";
import { PERSONAS } from "@/utils/personas";
import type { Persona, PersonaId } from "@/utils/personas";
import { getCustomPersonas } from "@/utils/persona-store";
import { evaluateContentQuality, summarizeQualityFailures } from "@/utils/content-quality";
import type { QualityReport } from "@/utils/content-quality";
import type { ShellAction, ShellPanel } from "@/types/shell-ui";
import Toast, { ToastType } from "./Toast";
import { ApiKeys } from "./SettingsModal";
import type { Citation } from "@/utils/citations";
import dynamic from "next/dynamic";
import HistorySidebar from "./HistorySidebar";
import VoiceTrainerModal from "./VoiceTrainerModal";
import AnalyticsDashboard from "./AnalyticsDashboard";

const SettingsModal = dynamic(() => import("./SettingsModal"), {
  ssr: false,
});

const INITIAL_BLOCKS: ContentBlock[] = [
  { id: "1", type: "TEXT", content: "Most strategy is just expensive theater." },
  {
    id: "2",
    type: "TEXT",
    content: "Real impact is found in the second-order effects no one wants to audit.",
  },
];

function blocksToText(items: ContentBlock[]) {
  return items.map((b) => b.content).join("\n\n");
}

function splitParagraphs(text: string): string[] {
  return text
    .split(/\n{2,}/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function buildRevisionParagraphs(originalText: string, revisedText: string): RevisionParagraph[] {
  const original = splitParagraphs(originalText);
  const revised = splitParagraphs(revisedText);
  const max = Math.max(original.length, revised.length, 1);
  const rows: RevisionParagraph[] = [];

  for (let index = 0; index < max; index += 1) {
    const originalParagraph = original[index] || "";
    const revisedParagraph = revised[index] || originalParagraph;
    const changed = originalParagraph !== revisedParagraph;
    rows.push({
      id: index,
      original: originalParagraph,
      revised: revisedParagraph,
      changed,
      accepted: true,
    });
  }

  return rows;
}

function composeRevisionText(paragraphs: RevisionParagraph[]): string {
  return paragraphs
    .map((paragraph) => (paragraph.accepted ? paragraph.revised : paragraph.original))
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .join("\n\n");
}

function HeaderActionButton({
  label,
  ariaLabel,
  icon,
  onClick,
  active = false,
}: {
  label: string;
  ariaLabel?: string;
  icon: React.ReactNode;
  onClick: () => void;
  active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={ariaLabel || label}
      className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition ${
        active
          ? "border-[var(--stitch-accent,#7c3bed)]/50 bg-[var(--stitch-accent,#7c3bed)]/18 text-white"
          : "border-white/10 bg-[rgba(16,20,28,0.86)] text-white/78 hover:border-white/20 hover:text-white"
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

export function UnifiedCanvas() {
  const [blocks, setBlocks] = useState<ContentBlock[]>(INITIAL_BLOCKS);
  const [content, setContent] = useState(blocksToText(INITIAL_BLOCKS));
  const [intentState, setIntentState] = useState(detectIntent(blocksToText(INITIAL_BLOCKS)));
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isRevising, setIsRevising] = useState(false);
  const [polishedResult, setPolishedResult] = useState<PolishResult | null>(null);
  const [showDiff, setShowDiff] = useState(false);
  const [viewMode, setViewMode] = useState<"EDITOR" | "WATERFALL" | "PREVIEW">("EDITOR");
  const [previewPlatform, setPreviewPlatform] = useState<"LINKEDIN" | "TWITTER">("LINKEDIN");
  const [showBriefing, setShowBriefing] = useState(false);
  const [showManifesto, setShowManifesto] = useState(false);
  const [currentMode, setCurrentMode] = useState<"MANUAL" | "APERTURE" | "PROGRAM">("PROGRAM");
  const [isBlurring, setIsBlurring] = useState(false);
  const [showCertificate, setShowCertificate] = useState(false);
  const [activeHash, setActiveHash] = useState("");
  const [showTokens, setShowTokens] = useState(false);
  const [isTensioned, setIsTensioned] = useState(false);
  const [isActuating, setIsActuating] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isVoiceTrainingOpen, setIsVoiceTrainingOpen] = useState(false);
  const [isGhostOpen, setIsGhostOpen] = useState(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [isToolsDrawerOpen, setIsToolsDrawerOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [commandPaletteQuery, setCommandPaletteQuery] = useState("");
  const [customPersonas, setCustomPersonas] = useState<Persona[]>([]);
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [apiKeys, setApiKeys] = useState<ApiKeys>({ gemini: "", serper: "" });
  const [hasConfiguredGeminiKey, setHasConfiguredGeminiKey] = useState(false);
  const [hasLoadedKeyState, setHasLoadedKeyState] = useState(false);
  const [lastCitations, setLastCitations] = useState<Citation[]>([]);
  const [revisionLockFacts, setRevisionLockFacts] = useState(true);
  const [revisionToneStrength, setRevisionToneStrength] = useState(65);
  const [isRevisionStudioOpen, setIsRevisionStudioOpen] = useState(false);
  const [revisionParagraphs, setRevisionParagraphs] = useState<RevisionParagraph[]>([]);
  const [revisionSourceText, setRevisionSourceText] = useState("");
  const [lastRevisionInstruction, setLastRevisionInstruction] = useState("");
  const [quickKey, setQuickKey] = useState("");
  const [isTestingKey, setIsTestingKey] = useState(false);
  const [activePanel, setActivePanel] = useState<ShellPanel>("NONE");
  const [onboardingMessage, setOnboardingMessage] = useState<{ text: string; type: ToastType } | null>(
    null
  );
  const [toast, setToast] = useState<{ message: string; type: ToastType; isVisible: boolean }>({
    message: "",
    type: "success",
    isVisible: false,
  });
  const publishDraftRef = useRef<() => void>(() => {});

  const layoutMode = useLayoutMode();
  const isDesktop = layoutMode === "desktop";
  const isTablet = layoutMode === "tablet";

  const { play } = useSoundEngine();
  const showToast = (message: string, type: ToastType = "success") => {
    setToast({ message, type, isVisible: true });
  };
  const staticPersonaIds = useMemo(() => new Set(Object.keys(PERSONAS)), []);

  const clearLegacyLocalKeys = () => {
    localStorage.removeItem("strategyos_keys");
    localStorage.removeItem("strategyos_gemini_key");
    localStorage.removeItem("strategyos_serper_key");
  };

  const refreshServerKeyStatus = async () => {
    try {
      const response = await fetch("/api/validate-key", { cache: "no-store" });
      const data = await response.json();
      if (response.ok && data.success) {
        setHasConfiguredGeminiKey(Boolean(data.configured));
      }
    } catch {
      // no-op: onboarding flow still allows re-entry
    } finally {
      setHasLoadedKeyState(true);
    }
  };

  const persistKeysToServer = async (keys: ApiKeys, silent = false): Promise<boolean> => {
    const gemini = (keys.gemini || "").trim();
    const serper = (keys.serper || "").trim();

    if (!gemini) {
      try {
        await fetch("/api/validate-key", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ clear: true }),
        });
      } finally {
        setApiKeys({ ...keys, gemini: "", serper });
        setQuickKey("");
        setHasConfiguredGeminiKey(false);
      }
      return true;
    }

    try {
      const response = await fetch("/api/validate-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: gemini, serper, persist: true }),
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        if (!silent) {
          setOnboardingMessage({
            text: data.error || "Failed to store API keys on the server.",
            type: "error",
          });
        }
        return false;
      }

      setApiKeys({ ...keys, gemini, serper });
      setHasConfiguredGeminiKey(true);
      return true;
    } catch {
      if (!silent) {
        setOnboardingMessage({ text: "Could not store keys right now.", type: "error" });
      }
      return false;
    }
  };

  useEffect(() => {
    const bootstrapKeys = async () => {
      await refreshServerKeyStatus();

      try {
        const saved = localStorage.getItem("strategyos_keys");
        const legacyGemini = localStorage.getItem("strategyos_gemini_key") || "";
        const legacySerper = localStorage.getItem("strategyos_serper_key") || "";
        const parsed = saved
          ? (JSON.parse(saved) as ApiKeys)
          : legacyGemini || legacySerper
            ? ({ gemini: legacyGemini, serper: legacySerper } as ApiKeys)
            : null;

        if (!parsed?.gemini?.trim()) return;

        setQuickKey(parsed.gemini || "");
        const persisted = await persistKeysToServer(parsed, true);
        if (persisted) {
          clearLegacyLocalKeys();
          setQuickKey("");
        }
      } catch (e) {
        console.error("Failed to migrate legacy API keys", e);
      }
    };

    void bootstrapKeys();
  }, []);

  const loadHistoryItems = async () => {
    const items = await getHistory();
    setHistoryItems(items);
  };

  useEffect(() => {
    if (isHistoryOpen) {
      void loadHistoryItems();
    }
  }, [isHistoryOpen]);

  useEffect(() => {
    setIntentState(detectIntent(content));
  }, [content]);

  useEffect(() => {
    if (isDesktop) {
      setActivePanel("NONE");
    }
  }, [isDesktop]);

  const loadCustomPersonaRegistry = useCallback(async () => {
    try {
      const stored = await getCustomPersonas();
      setCustomPersonas(stored);
    } catch (error) {
      console.warn("Failed to load custom personas:", error);
    }
  }, []);

  useEffect(() => {
    void loadCustomPersonaRegistry();
  }, [loadCustomPersonaRegistry]);

  useEffect(() => {
    if (!isVoiceTrainingOpen) {
      void loadCustomPersonaRegistry();
    }
  }, [isVoiceTrainingOpen, loadCustomPersonaRegistry]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isTypingTarget =
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.isContentEditable;

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setIsCommandPaletteOpen(true);
        setCommandPaletteQuery("");
        return;
      }

      if (!isTypingTarget && event.key === "/") {
        event.preventDefault();
        setIsCommandPaletteOpen(true);
        setCommandPaletteQuery("/");
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const saveKeys = (keys: ApiKeys) => {
    void (async () => {
      const persisted = await persistKeysToServer(keys);
      if (persisted) {
        showToast("Configuration saved.", "success");
      } else {
        showToast("Failed to save configuration.", "error");
      }
    })();
  };

  const syncPrimaryBlock = (nextContent: string) => {
    setBlocks([{ id: Date.now().toString(), type: "TEXT", content: nextContent }]);
  };

  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const personaEntries = useMemo(() => {
    const merged = Object.entries(PERSONAS) as [string, Persona][];
    customPersonas.forEach((persona) => {
      const index = merged.findIndex(([id]) => id === persona.id);
      if (index >= 0) {
        merged[index] = [persona.id, persona];
      } else {
        merged.push([persona.id, persona]);
      }
    });
    return merged;
  }, [customPersonas]);
  const personaRegistry = useMemo(() => Object.fromEntries(personaEntries) as Record<string, Persona>, [personaEntries]);
  const activePersonaId = searchParams.get("persona") || "cso";
  const activePersona = personaRegistry[activePersonaId] || personaRegistry.cso || PERSONAS.cso;
  const activeServerPersonaId: PersonaId = staticPersonaIds.has(activePersonaId)
    ? (activePersonaId as PersonaId)
    : "custom";
  const activeCustomPersona = activeServerPersonaId === "custom" ? activePersona : undefined;
  const activePlatform = previewPlatform === "TWITTER" ? "twitter" : "linkedin";

  const liveQualityReport = useMemo(
    () =>
      evaluateContentQuality({
        content,
        persona: activePersona,
        platform: activePlatform,
        mode: "publish",
      }),
    [content, activePersona, activePlatform]
  );

  const revisionCandidateText = useMemo(
    () => (revisionParagraphs.length > 0 ? composeRevisionText(revisionParagraphs) : ""),
    [revisionParagraphs]
  );

  const revisionCandidateQualityReport = useMemo<QualityReport | null>(() => {
    if (!revisionCandidateText) return null;
    return evaluateContentQuality({
      content: revisionCandidateText,
      sourceText: revisionLockFacts ? revisionSourceText : undefined,
      persona: activePersona,
      platform: activePlatform,
      mode: "revise",
    });
  }, [
    revisionCandidateText,
    revisionLockFacts,
    revisionSourceText,
    activePersona,
    activePlatform,
  ]);

  const setActivePersona = (id: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("persona", id);
    router.push(`${pathname}?${params.toString()}`);
    play("TACTILE_CLICK");
  };

  const handleModeChange = (mode: "MANUAL" | "APERTURE" | "PROGRAM") => {
    setIsBlurring(true);
    setCurrentMode(mode);
    play("TACTILE_CLICK");
    setTimeout(() => setIsBlurring(false), 400);
  };

  const handleActuate = useCallback(() => {
    setIsActuating(true);
    setIsBlocked(true);
    setTimeout(() => {
      setIsActuating(false);
      setIsBlocked(false);
    }, 150);
  }, []);

  const validateLocalGeminiKey = (key: string) => {
    const normalized = key.trim();
    if (!normalized) return "Gemini key is required.";
    if (normalized.toLowerCase() === "demo") return null;
    if (normalized.length < 20) return "Key looks too short. Expected a full Gemini API key.";
    return null;
  };

  const testGeminiKey = async (key: string) => {
    const localError = validateLocalGeminiKey(key);
    if (localError) {
      setOnboardingMessage({ text: localError, type: "error" });
      return false;
    }

    setIsTestingKey(true);
    setOnboardingMessage(null);
    try {
      const res = await fetch("/api/validate-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setOnboardingMessage({
          text: data.error || "Key validation failed.",
          type: "error",
        });
        return false;
      }

      setOnboardingMessage({ text: "Gemini key is valid.", type: "success" });
      return true;
    } catch {
      setOnboardingMessage({ text: "Could not validate key. Check your connection.", type: "error" });
      return false;
    } finally {
      setIsTestingKey(false);
    }
  };

  const handleQuickSave = async () => {
    const key = quickKey.trim();
    const localError = validateLocalGeminiKey(key);
    if (localError) {
      setOnboardingMessage({ text: localError, type: "error" });
      return;
    }

    const valid = await testGeminiKey(key);
    if (!valid) return;

    const persisted = await persistKeysToServer({ ...apiKeys, gemini: key });
    if (!persisted) return;

    setQuickKey("");
    showToast("Gemini key saved.", "success");
  };

  const onDraft = async (topic: string) => {
    if (!hasConfiguredGeminiKey) {
      play("DISSONANT_THUD");
      setOnboardingMessage({ text: "Add and validate your Gemini key to generate content.", type: "error" });
      return;
    }

    setIsGenerating(true);
    play("SWIPE_WHIRR");
    const startedAt = Date.now();

    try {
      const result = await processInput(
        topic,
        { gemini: apiKeys.gemini, serper: apiKeys.serper },
        activeServerPersonaId,
        false,
        previewPlatform === "TWITTER" ? "twitter" : "linkedin",
        true,
        activeCustomPersona,
        false,
        undefined,
        undefined,
        undefined,
        activeCustomPersona?.styleDNA || "",
        activeCustomPersona?.subStyle || "professional",
        Boolean(activeCustomPersona?.styleDNA || activeCustomPersona?.geminiModelId)
      );

      if (result.textPost) {
        setContent(result.textPost);
        syncPrimaryBlock(result.textPost);
        setLastCitations(Array.isArray((result as any)?.citations) ? ((result as any).citations as Citation[]) : []);
        setShowDiff(false);
        setPolishedResult(null);
        await saveHistory(topic, result, activePersonaId);
        await logAudit({
          action: "generate_complete",
          input: topic,
          output: result.textPost,
          personaId: activePersonaId,
          platform: previewPlatform.toLowerCase(),
          durationMs: Date.now() - startedAt,
        });
        play("HARMONIC_MAJOR_CHORD");
        showToast("Draft generated.", "success");
      }
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Unknown error";
      console.error("Generation failed:", e);
      play("DISSONANT_THUD");
      await logAudit({
        action: "generate",
        input: topic,
        output: `Generation failed: ${message}`,
        personaId: activePersonaId,
        platform: previewPlatform.toLowerCase(),
        durationMs: Date.now() - startedAt,
      });
      showToast("Generation failed. Check API key and try again.", "error");
      setLastCitations([]);
    } finally {
      setIsGenerating(false);
    }
  };

  const onUrl = async (url: string) => {
    showToast("URL detected. Running newsjack draft.", "success");
    await onDraft(url);
  };

  const handlePolish = () => {
    const result = polishText(content);
    if (result.replacementCount > 0) {
      setPolishedResult(result);
      setShowDiff(true);
      return;
    }
    showToast("No polish changes needed.", "success");
  };

  const getToneDirective = (strength: number) => {
    if (strength <= 30) return "Apply only a subtle persona shift; keep structure close to the original.";
    if (strength <= 65) return "Apply a balanced persona shift with stronger cadence and sharper phrasing.";
    return "Apply a strong persona shift with bold cadence while preserving meaning.";
  };

  const buildRevisionInstruction = (instruction?: string) => {
    const custom = instruction?.trim();
    const base = custom || "Tighten clarity, authority, and flow while preserving core claims.";
    const factual = revisionLockFacts
      ? "Do not change any factual claims, entities, dates, metrics, or commitments."
      : "You may sharpen phrasing, but never invent unsupported facts.";

    return `${base} ${factual} ${getToneDirective(revisionToneStrength)}`.trim();
  };

  const handlePersonaRevision = async (instruction?: string, sourceText?: string) => {
    const source = (sourceText ?? content).trim();
    if (!source) {
      showToast("Write or generate a draft before revising.", "error");
      return;
    }

    if (!hasConfiguredGeminiKey) {
      setOnboardingMessage({ text: "Add and validate your Gemini key to revise text.", type: "error" });
      play("DISSONANT_THUD");
      return;
    }

    setIsRevising(true);
    const startedAt = Date.now();
    const effectiveInstruction = buildRevisionInstruction(instruction);

    try {
      const revised = await reviseWithPersonaAction(
        source,
        apiKeys.gemini.trim(),
        activeServerPersonaId,
        effectiveInstruction,
        {
          customPersona: activeCustomPersona,
          preserveFacts: revisionLockFacts,
          platform: previewPlatform === "TWITTER" ? "twitter" : "linkedin",
        }
      );

      setShowDiff(false);
      setPolishedResult(null);
      setRevisionSourceText(source);
      setLastRevisionInstruction(instruction?.trim() || "");
      setRevisionParagraphs(buildRevisionParagraphs(source, revised));
      setIsRevisionStudioOpen(true);

      await logAudit({
        action: "refine",
        input: source.slice(0, 300),
        output: revised,
        personaId: activePersonaId,
        platform: previewPlatform.toLowerCase(),
        durationMs: Date.now() - startedAt,
        metadata: {
          revisionInstruction: effectiveInstruction,
          lockFacts: revisionLockFacts,
          toneStrength: revisionToneStrength,
        },
      });

      showToast(`Revision ready in ${activePersona.name} voice. Review in Revision Studio.`, "success");
      play("HARMONIC_MAJOR_CHORD");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Revision failed.";
      console.error("Persona revision failed:", error);
      showToast(message, "error");
      play("DISSONANT_THUD");
    } finally {
      setIsRevising(false);
    }
  };

  const applyRevisionStudio = () => {
    if (revisionParagraphs.length === 0) {
      setIsRevisionStudioOpen(false);
      return;
    }

    const finalText = composeRevisionText(revisionParagraphs);
    const qualityReport =
      revisionCandidateQualityReport ||
      evaluateContentQuality({
        content: finalText,
        sourceText: revisionLockFacts ? revisionSourceText : undefined,
        persona: activePersona,
        platform: activePlatform,
        mode: "revise",
      });

    if (!qualityReport.pass) {
      showToast(`Revision blocked: ${summarizeQualityFailures(qualityReport)}`, "error");
      return;
    }

    setContent(finalText);
    syncPrimaryBlock(finalText);
    setIsRevisionStudioOpen(false);
    showToast(`Revision applied with ${activePersona.name} voice.`, "success");
  };

  const setRevisionParagraphDecision = (id: number, accepted: boolean) => {
    setRevisionParagraphs((prev) =>
      prev.map((paragraph) => (paragraph.id === id ? { ...paragraph, accepted } : paragraph))
    );
  };

  const setAllRevisionDecisions = (accepted: boolean) => {
    setRevisionParagraphs((prev) => prev.map((paragraph) => ({ ...paragraph, accepted })));
  };

  const applyPolish = () => {
    if (!polishedResult) return;
    setContent(polishedResult.polishedText);
    syncPrimaryBlock(polishedResult.polishedText);
    setShowDiff(false);
    setPolishedResult(null);
    showToast("Draft polished.", "success");
  };

  const publishCurrentDraft = useCallback(async (platformOverride?: "linkedin" | "twitter") => {
    const platform = platformOverride || (previewPlatform === "TWITTER" ? "twitter" : "linkedin");

    if (!content.trim()) {
      showToast("Write or generate a draft before publishing.", "error");
      return;
    }

    const qualityReport =
      platform === activePlatform
        ? liveQualityReport
        : evaluateContentQuality({
            content,
            persona: activePersona,
            platform,
            mode: "publish",
          });
    if (!qualityReport.pass) {
      showToast(`Publish blocked: ${summarizeQualityFailures(qualityReport)}`, "error");
      play("DISSONANT_THUD");
      return;
    }

    // Feature gate publishing: require an OAuth connection for the target platform.
    try {
      const connRes = await fetch("/api/user/connections", { cache: "no-store" });
      const connections = (await connRes.json().catch(() => null)) as
        | { linkedin?: boolean; twitter?: boolean }
        | null;
      if (!connRes.ok || !connections) {
        throw new Error("Could not verify platform connections.");
      }
      if (platform === "linkedin" && !connections.linkedin) {
        showToast("Connect LinkedIn before publishing.", "error");
        return;
      }
      if (platform === "twitter" && !connections.twitter) {
        showToast("Connect Twitter/X before publishing.", "error");
        return;
      }
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Could not verify platform connections.", "error");
      return;
    }

    setIsPublishing(true);
    const startedAt = Date.now();

    try {
      const response = await fetch("/api/distribute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform,
          content,
          persona: activePersonaId,
          title: content.split("\n")[0]?.slice(0, 80) || "Untitled Strategy",
        }),
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || `Publish failed for ${platform}`);
      }

      await logAudit({
        action: "post",
        input: content.slice(0, 200),
        output: data.url || data.message || "Published",
        personaId: activePersonaId,
        platform,
        durationMs: Date.now() - startedAt,
      });

      const hash = `0x${Math.random().toString(16).substring(2, 10).toUpperCase()}`;
      setActiveHash(hash);
      handleActuate();
      setTimeout(() => setShowCertificate(true), 300);
      play("HARMONIC_MAJOR_CHORD");
      showToast(data.message || `Published to ${platform}.`, "success");
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Publishing failed.";
      console.error("Publish failed:", e);
      play("DISSONANT_THUD");
      showToast(message, "error");
    } finally {
      setIsPublishing(false);
    }
  }, [activePersona, activePersonaId, activePlatform, content, handleActuate, liveQualityReport, play, previewPlatform]);

  const handlePublish = useCallback(async () => {
    await publishCurrentDraft();
  }, [publishCurrentDraft]);

  useEffect(() => {
    publishDraftRef.current = () => {
      void handlePublish();
    };
  }, [handlePublish]);

  const onCommand = async (cmd: string, args: string) => {
    const command = cmd.toLowerCase();
    const value = args.trim();

    if (command === "help") {
      showToast(
        "Commands: /polish /revise /publish /preview /persona /settings /history /voice /ghost /analytics /clear",
        "success"
      );
      return;
    }

    if (command === "settings") {
      setIsSettingsOpen(true);
      return;
    }

    if (command === "history") {
      setIsHistoryOpen(true);
      return;
    }

    if (command === "voice") {
      setIsVoiceTrainingOpen(true);
      return;
    }

    if (command === "ghost") {
      setIsGhostOpen(true);
      return;
    }

    if (command === "analytics") {
      setIsAnalyticsOpen(true);
      return;
    }

    if (command === "polish") {
      handlePolish();
      return;
    }

    if (command === "rewrite" || command === "revise") {
      await handlePersonaRevision(value);
      return;
    }

    if (command === "publish") {
      await handlePublish();
      return;
    }

    if (command === "preview") {
      const normalized = value.toLowerCase();
      if (normalized.includes("twitter") || normalized === "x") {
        setPreviewPlatform("TWITTER");
      } else {
        setPreviewPlatform("LINKEDIN");
      }
      setViewMode("PREVIEW");
      showToast("Preview mode enabled.", "success");
      return;
    }

    if (command === "editor") {
      setViewMode("EDITOR");
      return;
    }

    if (command === "waterfall") {
      syncPrimaryBlock(content);
      setViewMode("WATERFALL");
      return;
    }

    if (command === "persona") {
      const personaId = value.toLowerCase();
      if (personaId && personaRegistry[personaId]) {
        setActivePersona(personaId);
        showToast(`Persona switched to ${personaRegistry[personaId].name}.`, "success");
      } else {
        showToast(`Unknown persona "${personaId}".`, "error");
      }
      return;
    }

    if (command === "clear") {
      setContent("");
      syncPrimaryBlock("");
      return;
    }

    if (command === "news" || command === "draft") {
      if (!value) {
        showToast("Provide input after the command.", "error");
        return;
      }
      await onDraft(value);
      return;
    }

    showToast(`Unknown command "/${command}". Use /help.`, "error");
  };

  useEffect(() => {
    const openSettings = () => setIsSettingsOpen(true);
    const publishDraft = () => publishDraftRef.current();
    const openPreview = () => setViewMode("PREVIEW");

    window.addEventListener("strategyos:open-settings", openSettings as EventListener);
    window.addEventListener("strategyos:publish", publishDraft as EventListener);
    window.addEventListener("strategyos:open-preview", openPreview as EventListener);

    return () => {
      window.removeEventListener("strategyos:open-settings", openSettings as EventListener);
      window.removeEventListener("strategyos:publish", publishDraft as EventListener);
      window.removeEventListener("strategyos:open-preview", openPreview as EventListener);
    };
  }, []);

  const needsSetup = hasLoadedKeyState && !hasConfiguredGeminiKey;

  const toolActions: ShellAction[] = useMemo(
    () => [
      { id: "briefing", label: "Daily Briefing", group: "tools", description: "Morning signal summary" },
      { id: "settings", label: "Settings", group: "tools", description: "API keys and integrations" },
      { id: "history", label: "History", group: "tools", description: "Previous drafts and outcomes" },
      { id: "voice", label: "Voice Training", group: "tools", description: "Train and tune brand voice" },
      { id: "ghost", label: "Ghost Agent", group: "tools", description: "Autonomous drafting assistant" },
      { id: "analytics", label: "Analytics", group: "tools", description: "Performance insights dashboard" },
      { id: "tokens", label: "Design DNA", group: "layout", description: "Inspect active Stitch tokens" },
      { id: "manifesto", label: "Manifesto", group: "content", description: "Read long-form draft as manifesto" },
    ],
    []
  );

  const runShellAction = (id: ShellAction["id"]) => {
    play("TACTILE_CLICK");

    switch (id) {
      case "briefing":
        setShowBriefing(true);
        break;
      case "settings":
        setIsSettingsOpen(true);
        break;
      case "history":
        setIsHistoryOpen(true);
        break;
      case "voice":
        setIsVoiceTrainingOpen(true);
        break;
      case "ghost":
        setIsGhostOpen(true);
        break;
      case "analytics":
        setIsAnalyticsOpen(true);
        break;
      case "tokens":
        setShowTokens((prev) => !prev);
        break;
      case "manifesto":
        setShowManifesto(true);
        break;
      case "editor":
        setViewMode("EDITOR");
        break;
      case "preview":
        setViewMode("PREVIEW");
        break;
      case "left_rail":
        setActivePanel((prev) => (prev === "LEFT_RAIL" ? "NONE" : "LEFT_RAIL"));
        break;
      case "right_rail":
        setActivePanel((prev) => (prev === "RIGHT_RAIL" ? "NONE" : "RIGHT_RAIL"));
        break;
      default:
        break;
    }

    const shouldAutoClosePanel =
      id !== "left_rail" && id !== "right_rail";

    if (shouldAutoClosePanel) {
      setActivePanel("NONE");
      setIsToolsDrawerOpen(false);
    }
  };

  const commandPaletteActions = useMemo(() => {
    const base = [
      { id: "draft", label: "Draft from topic", description: "Run /draft with a topic", command: "/draft " },
      { id: "polish", label: "Polish draft", description: "Run /polish", command: "/polish" },
      { id: "revise_sharper", label: "Revise: Sharper", description: "Run /revise make it sharper", command: "/revise make it sharper" },
      { id: "revise_shorter", label: "Revise: Shorter", description: "Run /revise condense by 25%", command: "/revise condense by 25%" },
      { id: "publish", label: "Publish now", description: "Run /publish", command: "/publish" },
      { id: "preview_linkedin", label: "Preview LinkedIn", description: "Run /preview linkedin", command: "/preview linkedin" },
      { id: "preview_twitter", label: "Preview X", description: "Run /preview twitter", command: "/preview twitter" },
      { id: "settings", label: "Open settings", description: "Run /settings", command: "/settings" },
      { id: "history", label: "Open history", description: "Run /history", command: "/history" },
      { id: "voice", label: "Open voice training", description: "Run /voice", command: "/voice" },
      { id: "analytics", label: "Open analytics", description: "Run /analytics", command: "/analytics" },
      { id: "clear", label: "Clear draft", description: "Run /clear", command: "/clear" },
    ];

    const personaCommands = personaEntries.map(([id, persona]) => ({
      id: `persona_${id}`,
      label: `Switch persona: ${persona.name}`,
      description: `Run /persona ${id}`,
      command: `/persona ${id}`,
    }));

    return [...base, ...personaCommands];
  }, [personaEntries]);

  const normalizedPaletteQuery = commandPaletteQuery.trim().toLowerCase();
  const filteredPaletteActions = commandPaletteActions.filter((item) => {
    if (!normalizedPaletteQuery) return true;
    return (
      item.label.toLowerCase().includes(normalizedPaletteQuery) ||
      item.description.toLowerCase().includes(normalizedPaletteQuery) ||
      item.command.toLowerCase().includes(normalizedPaletteQuery)
    );
  });

  const executeCommandPaletteItem = (commandText: string) => {
    const raw = commandText.trim();
    if (!raw) return;

    if (raw.startsWith("/")) {
      const [command, ...args] = raw.slice(1).split(" ");
      void onCommand(command, args.join(" "));
    } else {
      void onDraft(raw);
    }

    setIsCommandPaletteOpen(false);
    setCommandPaletteQuery("");
  };

  return (
    <div className={`relative h-screen w-full overflow-hidden text-[var(--stitch-text-primary,#E1E1E1)] ${isTensioned ? "brightness-95" : ""}`}>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(58%_34%_at_50%_-8%,rgba(124,59,237,0.2),transparent_72%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(26%_22%_at_10%_12%,rgba(56,189,248,0.12),transparent_76%)]" />

      <AnimatePresence>
        {isActuating && (
          <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[1000] bg-black pointer-events-none"
          />
        )}
      </AnimatePresence>

      {isBlocked && <div className="fixed inset-0 z-[999] cursor-wait pointer-events-auto" />}

      <header className="fixed inset-x-0 top-0 z-[90] border-b border-white/10 bg-[rgba(7,10,16,0.8)] backdrop-blur-2xl">
        <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-2 px-3 py-2 md:px-4 md:py-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2">
              <Link
                href="/"
                className="inline-flex shrink-0 items-center rounded-xl border border-white/15 bg-[rgba(18,22,30,0.88)] px-3 py-2 text-[11px] font-semibold tracking-[0.14em] text-white/95 transition hover:border-white/25"
              >
                STRATEGYOS
              </Link>
              <div className="hidden min-[1280px]:inline-flex items-center rounded-xl border border-white/10 bg-black/25 px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-white/70">
                {intentState.intent.replace("_", " ")}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isTablet && (
                <>
                  <button
                    onClick={() => runShellAction("left_rail")}
                    aria-label="Toggle personas panel"
                    className={`inline-flex items-center gap-1 rounded-xl border px-3 py-2 text-xs font-semibold transition ${
                      activePanel === "LEFT_RAIL"
                        ? "border-[var(--stitch-accent,#7c3bed)]/55 bg-[var(--stitch-accent,#7c3bed)]/20 text-white"
                        : "border-[color:var(--stitch-border,#24282D)] bg-[color:var(--card)] text-[color:var(--foreground)] hover:border-[var(--stitch-accent,#7c3bed)]/45"
                    }`}
                  >
                    <PanelLeft size={14} />
                    Personas
                  </button>
                  <button
                    onClick={() => runShellAction("right_rail")}
                    aria-label="Toggle telemetry panel"
                    className={`inline-flex items-center gap-1 rounded-xl border px-3 py-2 text-xs font-semibold transition ${
                      activePanel === "RIGHT_RAIL"
                        ? "border-[var(--stitch-accent,#7c3bed)]/55 bg-[var(--stitch-accent,#7c3bed)]/20 text-white"
                        : "border-[color:var(--stitch-border,#24282D)] bg-[color:var(--card)] text-[color:var(--foreground)] hover:border-[var(--stitch-accent,#7c3bed)]/45"
                    }`}
                  >
                    <PanelRight size={14} />
                    Telemetry
                  </button>
                </>
              )}

              <HeaderActionButton
                label="Command"
                ariaLabel="Open command palette"
                icon={<Command size={14} />}
                onClick={() => {
                  setIsCommandPaletteOpen(true);
                  setCommandPaletteQuery("");
                }}
                active={isCommandPaletteOpen}
              />

              <HeaderActionButton
                label="Tools"
                ariaLabel="Open tools panel"
                icon={<SlidersHorizontal size={14} />}
                onClick={() => setIsToolsDrawerOpen((prev) => !prev)}
                active={isToolsDrawerOpen}
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2">
              {!isDesktop && (
                <select
                  aria-label="Select persona"
                  value={activePersonaId}
                  onChange={(e) => setActivePersona(e.target.value)}
                  className="h-9 min-w-[10rem] max-w-[12.5rem] rounded-lg border border-white/10 bg-[rgba(16,20,28,0.92)] px-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-white/20"
                >
                  {personaEntries.map(([id, persona]) => (
                    <option key={id} value={id}>
                      {persona.name}
                    </option>
                  ))}
                </select>
              )}

              {viewMode === "PREVIEW" && (
                <div className="flex items-center gap-1 rounded-xl border border-white/10 bg-black/25 p-1">
                  <button
                    onClick={() => setPreviewPlatform("LINKEDIN")}
                    className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${previewPlatform === "LINKEDIN" ? "bg-white text-black" : "text-white/75 hover:text-white"}`}
                  >
                    LinkedIn
                  </button>
                  <button
                    onClick={() => setPreviewPlatform("TWITTER")}
                    className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${previewPlatform === "TWITTER" ? "bg-white text-black" : "text-white/75 hover:text-white"}`}
                  >
                    X
                  </button>
                </div>
              )}
            </div>

            <div className="flex shrink-0 items-center gap-1 rounded-xl border border-white/10 bg-black/25 p-1">
              <button
                onClick={() => runShellAction("editor")}
                className={`inline-flex h-8 w-8 items-center justify-center rounded-lg transition ${viewMode === "EDITOR" ? "bg-white text-black" : "text-white/75 hover:text-white"}`}
                aria-label="Editor view"
                title="Editor view"
              >
                <Monitor size={14} />
              </button>
              <button
                onClick={() => runShellAction("preview")}
                className={`inline-flex h-8 w-8 items-center justify-center rounded-lg transition ${viewMode === "PREVIEW" ? "bg-white text-black" : "text-white/75 hover:text-white"}`}
                aria-label="Preview view"
                title="Preview view"
              >
                <Smartphone size={14} />
              </button>
              <button
                onClick={() => runShellAction("manifesto")}
                className="hidden h-8 w-8 items-center justify-center rounded-lg text-white/75 transition hover:text-white min-[430px]:inline-flex"
                aria-label="Open manifesto view"
                title="Open manifesto view"
              >
                <BookOpen size={14} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <HighStatusErrorBoundary>
        <motion.div
          animate={{
            scale: isActuating ? 0.995 : 1,
            filter: isBlurring ? "blur(8px)" : "blur(0px)",
          }}
          transition={{ type: "spring", stiffness: 500, damping: 15 }}
          className="relative z-10 h-full px-3 pb-[calc(6.4rem+env(safe-area-inset-bottom))] pt-[6.3rem] md:px-4 md:pb-[calc(7.2rem+env(safe-area-inset-bottom))] md:pt-[6.9rem]"
        >
          <div className={`mx-auto grid h-full max-w-[1600px] gap-3 lg:gap-4 ${isDesktop ? "grid-cols-[280px_minmax(0,1fr)_350px]" : "grid-cols-1"}`}>
            {isDesktop && (
              <div className="min-h-0">
                <LeftRail
                  intentState={intentState}
                  isTensioned={isTensioned}
                  activePersonaId={activePersonaId}
                  onPersonaChange={setActivePersona}
                  personas={personaRegistry}
                />
              </div>
            )}

            <div className={`flex min-w-0 flex-col overflow-hidden rounded-3xl border border-white/12 bg-[rgba(12,15,22,0.82)] shadow-[0_30px_80px_rgba(0,0,0,0.45)] transition-all duration-700 ${isGenerating ? "ring-1 ring-[var(--stitch-accent,#7c3bed)]/30" : ""}`}>
              <CanvasEditor
                content={content}
                setContent={setContent}
                intentState={intentState}
                isDiffing={showDiff}
                viewMode={viewMode === "EDITOR" || viewMode === "WATERFALL" ? viewMode : "EDITOR"}
                setViewMode={(mode: "EDITOR" | "WATERFALL") => {
                  if (mode === "WATERFALL") {
                    syncPrimaryBlock(content);
                  }
                  setViewMode(mode);
                }}
                onPolish={handlePolish}
                onRevise={(instruction) => {
                  void handlePersonaRevision(instruction);
                }}
                isRevising={isRevising}
                activePersonaName={activePersona.name}
                activePersonaDescription={activePersona.description}
                activePersonaFeatures={activePersona.features || []}
                revisionLockFacts={revisionLockFacts}
                revisionToneStrength={revisionToneStrength}
                onRevisionLockFactsChange={setRevisionLockFacts}
                onRevisionToneStrengthChange={setRevisionToneStrength}
                onPublish={() => {
                  void handlePublish();
                }}
                isPublishing={isPublishing}
                qualityReport={liveQualityReport}
                qualityPlatform={activePlatform}
              />
            </div>

            {isDesktop && (
              <div className="min-h-0">
                <RightRail content={content} intentState={intentState} citations={lastCitations} />
              </div>
            )}
          </div>

          {viewMode === "WATERFALL" && (
            <TactileNewsroom
              initialBlocks={blocks}
              onOrderChange={(nextBlocks) => {
                setBlocks(nextBlocks);
                setContent(blocksToText(nextBlocks));
              }}
            />
          )}

          {viewMode === "PREVIEW" && <DevicePreview content={content} platform={previewPlatform} />}
        </motion.div>
      </HighStatusErrorBoundary>

      {!isDesktop && (
        <AnimatePresence>
          {activePanel !== "NONE" && (
            <>
              <motion.button
                type="button"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setActivePanel("NONE")}
                className="fixed inset-0 z-[92] bg-black/65 backdrop-blur-sm"
                aria-label="Close panel"
              />

              {activePanel === "LEFT_RAIL" && isTablet && (
                <motion.div
                  initial={{ x: -24, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -24, opacity: 0 }}
                  className="fixed bottom-[calc(6.8rem+env(safe-area-inset-bottom))] left-3 top-[6.7rem] z-[93] w-[min(22rem,88vw)]"
                >
                  <LeftRail
                    intentState={intentState}
                    isTensioned={isTensioned}
                    activePersonaId={activePersonaId}
                    personas={personaRegistry}
                    onPersonaChange={(id) => {
                      setActivePersona(id);
                      setActivePanel("NONE");
                    }}
                  />
                </motion.div>
              )}

              {activePanel === "RIGHT_RAIL" && isTablet && (
                <motion.div
                  initial={{ x: 24, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 24, opacity: 0 }}
                  className="fixed bottom-[calc(6.8rem+env(safe-area-inset-bottom))] right-3 top-[6.7rem] z-[93] w-[min(22rem,88vw)]"
                >
                  <RightRail content={content} intentState={intentState} citations={lastCitations} />
                </motion.div>
              )}
            </>
          )}
        </AnimatePresence>
      )}

      <AnimatePresence>
        {isToolsDrawerOpen && (
          <>
            <motion.button
              type="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsToolsDrawerOpen(false)}
              className="fixed inset-0 z-[104] bg-black/70 backdrop-blur-sm"
              aria-label="Close tools panel"
            />
            <motion.aside
              role="dialog"
              aria-label="Tools"
              initial={layoutMode === "mobile" ? { y: 24, opacity: 0 } : { x: 24, opacity: 0 }}
              animate={layoutMode === "mobile" ? { y: 0, opacity: 1 } : { x: 0, opacity: 1 }}
              exit={layoutMode === "mobile" ? { y: 24, opacity: 0 } : { x: 24, opacity: 0 }}
              className={`fixed z-[105] border border-[color:var(--stitch-border,#24282D)] bg-[color:var(--card)] shadow-[0_30px_90px_rgba(0,0,0,0.55)] ${
                layoutMode === "mobile"
                  ? "inset-x-3 bottom-[calc(6.8rem+env(safe-area-inset-bottom))] rounded-2xl p-3"
                  : "right-3 top-[6.8rem] w-[23rem] rounded-2xl p-4"
              }`}
            >
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]">
                    Tools
                  </p>
                  <p className="text-xs text-[color:var(--foreground)]">Command center surfaces</p>
                </div>
                <button
                  onClick={() => setIsToolsDrawerOpen(false)}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[color:var(--stitch-border,#24282D)] bg-[color:var(--stitch-surface,#16181D)] text-[color:var(--muted-foreground)] hover:text-[color:var(--foreground)]"
                  aria-label="Close tools panel"
                >
                  <X size={14} />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {toolActions.map((action) => (
                  <button
                    key={action.id}
                    onClick={() => runShellAction(action.id)}
                    className="rounded-xl border border-[color:var(--stitch-border,#24282D)] bg-[color:var(--stitch-surface,#16181D)] px-3 py-2.5 text-left hover:border-[color:var(--stitch-accent,#7c3bed)]/45"
                    aria-label={action.label}
                  >
                    <p className="text-sm font-semibold text-[color:var(--foreground)]">{action.label}</p>
                    <p className="mt-1 text-[10px] text-[color:var(--muted-foreground)]">{action.description}</p>
                  </button>
                ))}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isCommandPaletteOpen && (
          <>
            <motion.button
              type="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCommandPaletteOpen(false)}
              className="fixed inset-0 z-[106] bg-black/70 backdrop-blur-md"
              aria-label="Close command palette"
            />
            <motion.section
              role="dialog"
              aria-modal="true"
              aria-label="Command Palette"
              initial={{ opacity: 0, y: -14, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -14, scale: 0.98 }}
              className="fixed left-1/2 top-[7.2rem] z-[107] w-[min(52rem,95vw)] -translate-x-1/2 overflow-hidden rounded-2xl border border-[color:var(--stitch-border,#24282D)] bg-[color:var(--card)] shadow-[0_30px_90px_rgba(0,0,0,0.6)]"
            >
              <div className="border-b border-[color:var(--stitch-border,#24282D)] p-3">
                <label htmlFor="command-palette-input" className="sr-only">
                  Search commands
                </label>
                <div className="flex items-center gap-2 rounded-xl border border-[color:var(--stitch-border,#24282D)] bg-[color:var(--stitch-surface,#16181D)] px-3">
                  <Command size={15} className="text-[color:var(--muted-foreground)]" />
                  <input
                    id="command-palette-input"
                    autoFocus
                    value={commandPaletteQuery}
                    onChange={(event) => setCommandPaletteQuery(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Escape") {
                        setIsCommandPaletteOpen(false);
                      }
                      if (event.key === "Enter" && filteredPaletteActions.length > 0) {
                        executeCommandPaletteItem(filteredPaletteActions[0].command);
                      }
                    }}
                    placeholder="Search commands, tools, personas…"
                    className="h-11 w-full bg-transparent text-sm text-[color:var(--foreground)] placeholder:text-[color:var(--muted-foreground)] focus:outline-none"
                  />
                </div>
              </div>
              <div className="max-h-[26rem] overflow-y-auto p-2 custom-scrollbar">
                {filteredPaletteActions.length === 0 ? (
                  <p className="px-3 py-6 text-sm text-[color:var(--muted-foreground)]">No matching commands.</p>
                ) : (
                  filteredPaletteActions.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => executeCommandPaletteItem(item.command)}
                      className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left hover:bg-[color:var(--stitch-surface,#16181D)]"
                    >
                      <div>
                        <p className="text-sm font-semibold text-[color:var(--foreground)]">{item.label}</p>
                        <p className="text-xs text-[color:var(--muted-foreground)]">{item.description}</p>
                      </div>
                      <div className="inline-flex items-center gap-1 rounded-lg border border-[color:var(--stitch-border,#24282D)] bg-[color:var(--stitch-surface,#16181D)] px-2 py-1 text-[10px] font-semibold text-[color:var(--muted-foreground)]">
                        {item.command}
                        <CornerDownLeft size={10} />
                      </div>
                    </button>
                  ))
                )}
              </div>
            </motion.section>
          </>
        )}
      </AnimatePresence>

      {needsSetup && (
        <div className="fixed left-1/2 top-[6.8rem] z-[95] w-[95%] max-w-xl -translate-x-1/2 rounded-2xl border border-amber-400/25 bg-[rgba(14,18,26,0.95)] p-4 shadow-2xl backdrop-blur-2xl md:top-[7.4rem]">
          <p className="text-sm font-semibold text-white">Setup required to generate drafts</p>
          <p className="mt-1 text-xs text-[#A7ACB2]">Add your Gemini API key, validate it, then continue writing.</p>

          <form
            className="mt-3 flex flex-col gap-2 md:flex-row"
            onSubmit={(e) => {
              e.preventDefault();
              void handleQuickSave();
            }}
          >
            <input type="text" name="username" autoComplete="username" className="hidden" tabIndex={-1} />
            <input
              type="password"
              placeholder="AIza..."
              autoComplete="new-password"
              value={quickKey}
              onChange={(e) => {
                setQuickKey(e.target.value);
                if (onboardingMessage) setOnboardingMessage(null);
              }}
              className="flex-1 rounded-lg border border-[#2B3038] bg-[#0D1117] px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-white/20"
              aria-label="Gemini API key"
            />
            <button
              type="button"
              onClick={() => void testGeminiKey(quickKey)}
              disabled={isTestingKey}
              className="rounded-lg border border-[#2B3038] px-3 py-2.5 text-sm font-semibold text-[#D5D8DC] hover:bg-white/5 disabled:opacity-60"
            >
              {isTestingKey ? "Testing..." : "Test key"}
            </button>
            <button
              type="submit"
              disabled={isTestingKey}
              className="rounded-lg bg-white px-3 py-2.5 text-sm font-semibold text-black hover:bg-gray-200 disabled:opacity-60"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => setIsSettingsOpen(true)}
              className="rounded-lg border border-[#2B3038] px-3 py-2.5 text-sm font-semibold text-[#D5D8DC] hover:bg-white/5"
            >
              More options
            </button>
          </form>

          {onboardingMessage && (
            <p className={`mt-2 text-xs ${onboardingMessage.type === "success" ? "text-emerald-400" : "text-rose-400"}`}>
              {onboardingMessage.text}
            </p>
          )}
        </div>
      )}

      <div className="fixed inset-x-0 bottom-0 z-[94] pointer-events-none">
        <div className="mx-auto max-w-6xl px-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] md:px-4 md:pb-[calc(1rem+env(safe-area-inset-bottom))]">
          <div className="pointer-events-auto rounded-3xl border border-white/12 bg-[rgba(9,13,20,0.9)] p-2 shadow-[0_28px_80px_rgba(0,0,0,0.58)] backdrop-blur-3xl md:p-3">
            <OmniBar
              layoutMode={layoutMode}
              onPublish={() => {
                void handlePublish();
              }}
              onActuate={handleActuate}
              onTensionChange={setIsTensioned}
              onCommand={(cmd, args) => {
                void onCommand(cmd, args);
              }}
              onDraft={(topic) => {
                void onDraft(topic);
              }}
              onUrl={(url) => {
                void onUrl(url);
              }}
              onModeChange={handleModeChange}
              currentMode={currentMode}
              viralScore={85}
              commandHints={["/help", "/polish", "/revise make it sharper", "/publish", "/preview twitter"]}
            />
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showTokens && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            className={`${isDesktop ? "fixed right-4 top-[7.4rem] z-[91] w-[22rem]" : "fixed inset-x-3 bottom-[calc(6.8rem+env(safe-area-inset-bottom))] z-[96]"}`}
          >
            <DesignTokensView />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showBriefing && (
          <DailyBriefing
            onInitialize={() => {
              play("HARMONIC_MAJOR_CHORD");
              setShowBriefing(false);
            }}
            onClose={() => setShowBriefing(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showManifesto && <ManifestoView content={content} onClose={() => setShowManifesto(false)} />}
      </AnimatePresence>

      <TestCertificate
        isOpen={showCertificate}
        onClose={() => setShowCertificate(false)}
        hashId={activeHash}
        timestamp={Date.now()}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSave={saveKeys}
        initialKeys={apiKeys}
      />

      <HistorySidebar
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={historyItems}
        onSelect={(item) => {
          const text = item.assets?.textPost || "";
          setContent(text);
          syncPrimaryBlock(text);
          setLastCitations(Array.isArray((item.assets as any)?.citations) ? ((item.assets as any).citations as Citation[]) : []);
        }}
        onClear={() => {
          clearHistory();
          setHistoryItems([]);
          setLastCitations([]);
        }}
        onRatingChange={() => {
          void loadHistoryItems();
        }}
      />

      <VoiceTrainerModal isOpen={isVoiceTrainingOpen} onClose={() => setIsVoiceTrainingOpen(false)} apiKey={apiKeys.gemini} />

      <AnimatePresence>
        {isGhostOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-center justify-center p-4"
          >
            <button
              onClick={() => setIsGhostOpen(false)}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              aria-label="Close Ghost Agent"
            />
            <motion.div
              initial={{ scale: 0.96, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.96, opacity: 0, y: 10 }}
              className="relative z-10 w-full max-w-xl rounded-2xl border border-white/10 bg-[#0A0A0A] p-6 shadow-2xl"
            >
              <h2 className="text-xl font-bold text-white">Ghost Agent</h2>
              <p className="mt-2 text-sm text-[#A7ACB2]">
                Autonomous ghost drafting is available in the legacy command center. Use command mode or generate directly from the editor.
              </p>
              <div className="mt-5 flex justify-end">
                <button
                  onClick={() => setIsGhostOpen(false)}
                  className="rounded-lg border border-white/15 px-4 py-2 text-sm font-semibold text-white hover:bg-white/5"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnalyticsDashboard isOpen={isAnalyticsOpen} onClose={() => setIsAnalyticsOpen(false)} apiKey={apiKeys.gemini} />

      <AnimatePresence>
        {showDiff && polishedResult && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="fixed bottom-[calc(6.4rem+env(safe-area-inset-bottom))] left-3 right-3 z-[100] flex flex-col gap-4 rounded-2xl border border-[#24282D] bg-[rgba(18,24,34,0.95)] p-4 shadow-2xl md:left-auto md:right-4 md:w-[32rem]"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10">
                <Activity size={18} className="text-emerald-500" />
              </div>
              <div>
                <h4 className="text-sm font-bold uppercase tracking-widest text-white">Polish Ready</h4>
                <p className="font-mono text-[11px] text-[#8A8D91]">{polishedResult.replacementCount} replacements found.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDiff(false)}
                className="rounded border border-[#24282D] px-5 py-2 text-xs font-bold uppercase tracking-widest text-[#8A8D91] hover:bg-white/5"
              >
                Discard
              </button>
              <button
                onClick={applyPolish}
                className="rounded bg-emerald-500 px-5 py-2 text-xs font-bold uppercase tracking-widest text-black hover:bg-emerald-400"
              >
                Apply
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <RevisionStudio
        isOpen={isRevisionStudioOpen}
        personaName={activePersona.name}
        lockFacts={revisionLockFacts}
        toneStrength={revisionToneStrength}
        isRevising={isRevising}
        paragraphs={revisionParagraphs}
        qualityReport={revisionCandidateQualityReport}
        onClose={() => setIsRevisionStudioOpen(false)}
        onApply={applyRevisionStudio}
        onAcceptAll={() => setAllRevisionDecisions(true)}
        onRejectAll={() => setAllRevisionDecisions(false)}
        onParagraphDecision={setRevisionParagraphDecision}
        onLockFactsChange={setRevisionLockFacts}
        onToneStrengthChange={setRevisionToneStrength}
        onRegenerate={() => {
          void handlePersonaRevision(lastRevisionInstruction, revisionSourceText || content);
        }}
      />

      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={() => setToast((prev) => ({ ...prev, isVisible: false }))}
      />

      <div id="canvas-overlay-portal" className="pointer-events-none fixed inset-0 z-50" />
    </div>
  );
}
