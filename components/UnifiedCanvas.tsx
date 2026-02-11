"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Wand2,
  RefreshCw,
  Smartphone,
  Monitor,
  Activity,
  BookOpen,
  Palette,
  History,
  Mic,
  Ghost,
  BarChart3,
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
import { TestCertificate } from "./Overlay/TestCertificate";
import { DesignTokensView } from "./Canvas/DesignTokensView";
import { processInput } from "@/actions/generate";
import { saveHistory, getHistory, clearHistory, HistoryItem } from "@/utils/history-service";
import { logAudit } from "@/utils/audit-service";
import { PERSONAS } from "@/utils/personas";
import type { PersonaId } from "@/utils/personas";
import Toast, { ToastType } from "./Toast";
import { ApiKeys } from "./SettingsModal";
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

export function UnifiedCanvas() {
  const [blocks, setBlocks] = useState<ContentBlock[]>(INITIAL_BLOCKS);
  const [content, setContent] = useState(blocksToText(INITIAL_BLOCKS));
  const [intentState, setIntentState] = useState(detectIntent(blocksToText(INITIAL_BLOCKS)));
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
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
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [apiKeys, setApiKeys] = useState<ApiKeys>({ gemini: "", serper: "" });
  const [quickKey, setQuickKey] = useState("");
  const [isTestingKey, setIsTestingKey] = useState(false);
  const [onboardingMessage, setOnboardingMessage] = useState<{ text: string; type: ToastType } | null>(
    null
  );
  const [toast, setToast] = useState<{ message: string; type: ToastType; isVisible: boolean }>({
    message: "",
    type: "success",
    isVisible: false,
  });
  const { play } = useSoundEngine();

  const showToast = (message: string, type: ToastType = "success") => {
    setToast({ message, type, isVisible: true });
  };

  useEffect(() => {
    try {
      const saved = localStorage.getItem("strategyos_keys");
      const legacyGemini = localStorage.getItem("strategyos_gemini_key") || "";
      const legacySerper = localStorage.getItem("strategyos_serper_key") || "";
      const parsed = saved
        ? (JSON.parse(saved) as ApiKeys)
        : legacyGemini || legacySerper
          ? ({ gemini: legacyGemini, serper: legacySerper } as ApiKeys)
          : null;

      if (!parsed) return;

      // Compatibility bridge for older clients/tests.
      localStorage.setItem("strategyos_keys", JSON.stringify(parsed));
      setApiKeys(parsed);
      setQuickKey(parsed.gemini || "");
    } catch (e) {
      console.error("Failed to parse API keys", e);
    }
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

  const saveKeys = (keys: ApiKeys) => {
    setApiKeys(keys);
    localStorage.setItem("strategyos_keys", JSON.stringify(keys));
    localStorage.setItem("strategyos_gemini_key", keys.gemini || "");
    localStorage.setItem("strategyos_serper_key", keys.serper || "");
    setQuickKey(keys.gemini || "");
  };

  const syncPrimaryBlock = (nextContent: string) => {
    setBlocks([{ id: Date.now().toString(), type: "TEXT", content: nextContent }]);
  };

  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const activePersonaId = searchParams.get("persona") || "cso";

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

  const handleActuate = () => {
    setIsActuating(true);
    setIsBlocked(true);
    setTimeout(() => {
      setIsActuating(false);
      setIsBlocked(false);
    }, 150);
  };

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

    saveKeys({ ...apiKeys, gemini: key });
    showToast("Gemini key saved.", "success");
  };

  const onDraft = async (topic: string) => {
    if (!apiKeys.gemini.trim()) {
      play("DISSONANT_THUD");
      setOnboardingMessage({ text: "Add and validate your Gemini key to generate content.", type: "error" });
      return;
    }

    setIsGenerating(true);
    play("SWIPE_WHIRR");
    const startedAt = Date.now();

    try {
      const result = await processInput(topic, apiKeys, activePersonaId as PersonaId);

      if (result.textPost) {
        setContent(result.textPost);
        syncPrimaryBlock(result.textPost);
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

  const applyPolish = () => {
    if (!polishedResult) return;
    setContent(polishedResult.polishedText);
    syncPrimaryBlock(polishedResult.polishedText);
    setShowDiff(false);
    setPolishedResult(null);
    showToast("Draft polished.", "success");
  };

  const publishCurrentDraft = async (platformOverride?: "linkedin" | "twitter") => {
    const platform =
      platformOverride || (previewPlatform === "TWITTER" ? "twitter" : "linkedin");

    if (!content.trim()) {
      showToast("Write or generate a draft before publishing.", "error");
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
  };

  const handlePublish = async () => {
    await publishCurrentDraft();
  };

  const onCommand = async (cmd: string, args: string) => {
    const command = cmd.toLowerCase();
    const value = args.trim();

    if (command === "help") {
      showToast(
        "Commands: /polish /publish /preview /persona /settings /history /voice /ghost /analytics /clear",
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

    if (command === "polish" || command === "rewrite") {
      handlePolish();
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
      if (personaId && PERSONAS[personaId]) {
        setActivePersona(personaId);
        showToast(`Persona switched to ${PERSONAS[personaId].name}.`, "success");
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
    const publishDraft = () => {
      void handlePublish();
    };
    const openPreview = () => setViewMode("PREVIEW");

    window.addEventListener("strategyos:open-settings", openSettings as EventListener);
    window.addEventListener("strategyos:publish", publishDraft as EventListener);
    window.addEventListener("strategyos:open-preview", openPreview as EventListener);

    return () => {
      window.removeEventListener("strategyos:open-settings", openSettings as EventListener);
      window.removeEventListener("strategyos:publish", publishDraft as EventListener);
      window.removeEventListener("strategyos:open-preview", openPreview as EventListener);
    };
  });

  const needsSetup = !apiKeys.gemini.trim();
  const actionButtonClass =
    "inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-[rgba(18,22,30,0.9)] text-white/75 transition hover:border-white/20 hover:text-white";
  const viewToggleClass =
    "inline-flex h-9 w-9 items-center justify-center rounded-lg text-white/75 transition hover:text-white";

  return (
    <div className={`relative h-screen w-full overflow-hidden text-[var(--stitch-text-primary,#E1E1E1)] ${isTensioned ? "brightness-95" : ""}`}>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_40%_at_50%_-5%,rgba(124,59,237,0.18),transparent_72%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(28%_25%_at_12%_14%,rgba(56,189,248,0.13),transparent_74%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(22%_20%_at_92%_8%,rgba(34,197,94,0.1),transparent_78%)]" />

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

      <HighStatusErrorBoundary>
        <motion.div
          animate={{
            scale: isActuating ? 0.995 : 1,
            filter: isBlurring ? "blur(8px)" : "blur(0px)",
          }}
          transition={{ type: "spring", stiffness: 500, damping: 15 }}
          className="relative z-10 grid h-full grid-cols-1 gap-3 px-3 pb-28 pt-20 md:px-4 md:pb-32 md:pt-24 lg:grid-cols-[280px_minmax(0,1fr)_350px] lg:gap-4"
        >
          <div className="hidden lg:block h-full min-h-0">
            <LeftRail
              intentState={intentState}
              isTensioned={isTensioned}
              activePersonaId={activePersonaId}
              onPersonaChange={setActivePersona}
            />
          </div>

          <div className={`flex min-w-0 flex-col overflow-hidden rounded-3xl border border-white/12 bg-[rgba(12,15,22,0.8)] shadow-[0_30px_80px_rgba(0,0,0,0.45)] transition-all duration-700 ${isGenerating ? "ring-1 ring-[var(--stitch-accent,#7c3bed)]/30" : ""}`}>
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
              onPublish={() => {
                void handlePublish();
              }}
              isPublishing={isPublishing}
            />
          </div>

          <div className="hidden lg:block h-full min-h-0">
            <RightRail content={content} intentState={intentState} />
          </div>
        </motion.div>

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
      </HighStatusErrorBoundary>

      <Link
        href="/"
        className="fixed left-3 top-3 z-[70] rounded-xl border border-white/10 bg-[rgba(18,22,30,0.88)] px-4 py-2 text-[12px] font-semibold tracking-[0.14em] text-white/90 backdrop-blur-xl transition hover:border-white/20 hover:text-white md:left-4 md:top-4"
      >
        STRATEGYOS
      </Link>

      <div className="fixed top-[3.25rem] left-3 z-[70] lg:hidden">
        <select
          aria-label="Select persona"
          value={activePersonaId}
          onChange={(e) => setActivePersona(e.target.value)}
          className="rounded-lg border border-white/10 bg-[rgba(18,22,30,0.9)] px-3 py-2 text-sm text-white backdrop-blur-xl focus:outline-none focus:ring-2 focus:ring-white/20"
        >
          {Object.entries(PERSONAS).map(([id, persona]) => (
            <option key={id} value={id}>
              {persona.name}
            </option>
          ))}
        </select>
      </div>

      <div className="fixed right-3 top-3 z-[70] md:right-4 md:top-4">
        <div className="max-w-[calc(100vw-1.2rem)] overflow-x-auto rounded-2xl border border-white/10 bg-[rgba(10,14,20,0.86)] px-2 py-2 shadow-[0_18px_45px_rgba(0,0,0,0.4)] backdrop-blur-2xl custom-scrollbar">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                play("SWIPE_WHIRR");
                setShowBriefing(true);
              }}
              className={`${actionButtonClass} ${isGenerating ? "text-[var(--stitch-accent,#7c3bed)] shadow-[0_0_20px_rgba(124,59,237,0.35)] animate-pulse" : ""}`}
              title="Daily Briefing"
              aria-label="Open daily briefing"
            >
              <Activity size={16} />
            </button>

            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              onClick={() => {
                play("TACTILE_CLICK");
                setShowTokens(!showTokens);
              }}
              className={`${actionButtonClass} ${showTokens ? "border-[var(--stitch-accent,#7c3bed)]/45 text-white" : ""}`}
              title="Design DNA"
              aria-label="Toggle design DNA panel"
            >
              <Palette size={16} />
            </motion.button>

            <button
              onClick={() => {
                play("TACTILE_CLICK");
                setIsSettingsOpen(true);
              }}
              className={`${actionButtonClass} ${isSettingsOpen ? "border-white/25 text-white" : ""}`}
              title="Settings"
              aria-label="Settings"
            >
              <Wand2 size={16} />
            </button>

            <button
              onClick={() => {
                play("TACTILE_CLICK");
                setIsHistoryOpen(true);
              }}
              className={`${actionButtonClass} ${isHistoryOpen ? "border-white/25 text-white" : ""}`}
              title="History"
              aria-label="History"
            >
              <History size={16} />
            </button>

            <button
              onClick={() => {
                play("TACTILE_CLICK");
                setIsVoiceTrainingOpen(true);
              }}
              className={`${actionButtonClass} ${isVoiceTrainingOpen ? "border-white/25 text-white" : ""}`}
              title="Voice Training"
              aria-label="Voice Training"
            >
              <Mic size={16} />
            </button>

            <button
              onClick={() => {
                play("TACTILE_CLICK");
                setIsGhostOpen(true);
              }}
              className={`${actionButtonClass} ${isGhostOpen ? "border-white/25 text-white" : ""}`}
              title="Ghost Agent"
              aria-label="Ghost Agent"
            >
              <Ghost size={16} />
            </button>

            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              onClick={() => {
                play("TACTILE_CLICK");
                setIsAnalyticsOpen(true);
              }}
              className={`${actionButtonClass} ${isAnalyticsOpen ? "border-white/25 text-white" : ""}`}
              title="Analytics"
              aria-label="Analytics"
            >
              <BarChart3 size={16} />
            </motion.button>

            <div className="ml-1 flex items-center gap-1 rounded-xl border border-white/10 bg-black/25 p-1">
              <button
                onClick={() => {
                  play("TACTILE_CLICK");
                  setViewMode("EDITOR");
                }}
                className={`${viewToggleClass} ${viewMode === "EDITOR" ? "bg-white text-black" : ""}`}
                aria-label="Editor view"
              >
                <Monitor size={15} />
              </button>
              <button
                onClick={() => {
                  play("TACTILE_CLICK");
                  setViewMode("PREVIEW");
                }}
                className={`${viewToggleClass} ${viewMode === "PREVIEW" ? "bg-white text-black" : ""}`}
                aria-label="Preview view"
              >
                <Smartphone size={15} />
              </button>
              <button
                onClick={() => {
                  play("TACTILE_CLICK");
                  setShowManifesto(true);
                }}
                className={viewToggleClass}
                aria-label="Open manifesto view"
              >
                <BookOpen size={15} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {viewMode === "PREVIEW" && (
        <div className="fixed right-3 top-[4.25rem] z-[70] flex items-center gap-1 rounded-xl border border-white/10 bg-[rgba(18,22,30,0.9)] p-1 backdrop-blur-xl md:right-4 md:top-[4.5rem]">
          <button
            onClick={() => setPreviewPlatform("LINKEDIN")}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold tracking-wide ${previewPlatform === "LINKEDIN" ? "bg-white text-black" : "text-white/75 hover:text-white"}`}
          >
            LinkedIn
          </button>
          <button
            onClick={() => setPreviewPlatform("TWITTER")}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold tracking-wide ${previewPlatform === "TWITTER" ? "bg-white text-black" : "text-white/75 hover:text-white"}`}
          >
            X
          </button>
        </div>
      )}

      {needsSetup && (
        <div className="fixed left-1/2 top-20 z-[80] w-[95%] max-w-xl -translate-x-1/2 rounded-2xl border border-amber-400/25 bg-[rgba(14,18,26,0.95)] p-4 shadow-2xl backdrop-blur-2xl md:top-24">
          <p className="text-sm font-semibold text-white">Setup required to generate drafts</p>
          <p className="mt-1 text-xs text-[#A7ACB2]">
            Add your Gemini API key, validate it, then continue writing.
          </p>
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
            <p
              className={`mt-2 text-xs ${onboardingMessage.type === "success" ? "text-emerald-400" : "text-rose-400"}`}
            >
              {onboardingMessage.text}
            </p>
          )}
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 z-[85]">
        <div className="mx-auto max-w-6xl px-3 pb-4 md:px-4 md:pb-6">
          <div className="rounded-3xl border border-white/12 bg-[rgba(9,13,20,0.88)] p-2 shadow-[0_28px_80px_rgba(0,0,0,0.58)] backdrop-blur-3xl md:p-3">
          <OmniBar
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
            commandHints={["/help", "/polish", "/publish", "/preview twitter", "/settings"]}
          />
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showTokens && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="fixed right-3 top-[7.1rem] z-[70] w-[22rem] max-w-[calc(100vw-1.5rem)] md:right-4 md:top-[7.4rem]"
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
        }}
        onClear={() => {
          clearHistory();
          setHistoryItems([]);
        }}
        onRatingChange={() => {
          void loadHistoryItems();
        }}
      />

      <VoiceTrainerModal
        isOpen={isVoiceTrainingOpen}
        onClose={() => setIsVoiceTrainingOpen(false)}
        apiKey={apiKeys.gemini}
      />

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

      <AnalyticsDashboard
        isOpen={isAnalyticsOpen}
        onClose={() => setIsAnalyticsOpen(false)}
        apiKey={apiKeys.gemini}
      />

      <AnimatePresence>
        {showDiff && polishedResult && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="fixed bottom-24 left-3 right-3 z-[100] flex flex-col gap-4 rounded-2xl border border-[#24282D] bg-[rgba(18,24,34,0.95)] p-4 shadow-2xl md:bottom-24 md:left-auto md:right-4 md:w-[32rem]"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10">
                <RefreshCw size={20} className="text-emerald-500" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white uppercase tracking-widest">Polish Ready</h4>
                <p className="text-[11px] text-[#8A8D91] font-mono">
                  {polishedResult.replacementCount} replacements found.
                </p>
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
