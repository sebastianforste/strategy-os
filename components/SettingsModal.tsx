"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Settings as SettingsIcon, Users } from "lucide-react";
import { useState, useEffect } from "react";
import { modalBackdropVariants, modalContentVariants, buttonVariants } from "../utils/animations";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (keys: ApiKeys) => void;
  initialKeys: ApiKeys;
  onOpenTeamSettings?: () => void;
}

export interface ApiKeys {
  gemini: string;
  serper: string;
  linkedinClientId?: string;
  linkedinClientSecret?: string;
}

export default function SettingsModal({
  isOpen,
  onClose,
  onSave,
  initialKeys,
  onOpenTeamSettings,
}: SettingsModalProps) {
  const [keys, setKeys] = useState(initialKeys);
  const [isTestingGemini, setIsTestingGemini] = useState(false);
  const [geminiValidation, setGeminiValidation] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const [installPrompt, setInstallPrompt] = useState<unknown>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setKeys(initialKeys);
    }, 0);
    return () => clearTimeout(timer);
  }, [initialKeys]);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  useEffect(() => {
    setGeminiValidation(null);
  }, [keys.gemini]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  const handleInstallClick = () => {
    if (!installPrompt) return;
    const prompt = installPrompt as { prompt: () => void, userChoice: Promise<{ outcome: string }> };
    prompt.prompt();
    prompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === "accepted") {
        setInstallPrompt(null);
      }
    });
  };

  const validateLocalGeminiKey = (key: string) => {
    const normalized = key.trim();
    if (!normalized) return "Gemini key is required.";
    if (normalized.toLowerCase() === "demo") return null;
    if (normalized.length < 20) return "Key looks too short. Expected a full Gemini API key.";
    return null;
  };

  const handleTestGeminiKey = async () => {
    const localError = validateLocalGeminiKey(keys.gemini);
    if (localError) {
      setGeminiValidation({ type: "error", message: localError });
      return;
    }

    setGeminiValidation(null);
    setIsTestingGemini(true);
    try {
      const response = await fetch("/api/validate-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: keys.gemini.trim() }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        setGeminiValidation({
          type: "error",
          message: data.error || "Gemini key validation failed.",
        });
        return;
      }
      setGeminiValidation({ type: "success", message: "Gemini key is valid." });
    } catch {
      setGeminiValidation({
        type: "error",
        message: "Unable to validate key right now. Check your connection.",
      });
    } finally {
      setIsTestingGemini(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            variants={modalBackdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[59]"
          />
          <motion.div
            variants={modalContentVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            role="dialog"
            aria-modal="true"
            aria-labelledby="settings-dialog-title"
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md max-h-[calc(100vh-2rem)] overflow-y-auto bg-[#0A0A0A] border border-neutral-800 p-8 rounded-2xl z-[60] shadow-2xl"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 id="settings-dialog-title" className="text-xl font-bold text-white flex items-center gap-2">
                <SettingsIcon className="w-5 h-5" />
                Configuration
              </h2>
              <button
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  onClose();
                }}
                className="text-neutral-500 hover:text-white"
                aria-label="Close Settings"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {!!installPrompt && (
              <div className="mb-6 p-4 bg-neutral-900 border border-neutral-800 rounded-lg flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">Install App</h3>
                  <p className="text-xs text-neutral-400">Add to Home Screen</p>
                </div>
                <button
                  onClick={handleInstallClick}
                  className="bg-white text-black px-4 py-2 rounded text-xs font-bold hover:bg-neutral-200 transition-colors"
                >
                  INSTALL
                </button>
              </div>
            )}

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-mono text-neutral-400 uppercase">
                  Gemini API Key (Text & Imagen 4)
                </label>
                <input
                  type="password"
                  value={keys.gemini}
                  onChange={(e) =>
                    setKeys({ ...keys, gemini: e.target.value })
                  }
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-3 text-sm text-white focus:border-white outline-none transition-colors"
                  placeholder="AIza..."
                />
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={handleTestGeminiKey}
                    disabled={isTestingGemini}
                    className="px-3 py-1.5 rounded border border-neutral-700 text-[11px] font-bold text-neutral-200 hover:bg-white/5 transition-colors disabled:opacity-50"
                  >
                    {isTestingGemini ? "TESTING..." : "TEST KEY"}
                  </button>
                  {geminiValidation && (
                    <span
                      className={`text-[11px] ${
                        geminiValidation.type === "success"
                          ? "text-emerald-400"
                          : "text-rose-400"
                      }`}
                    >
                      {geminiValidation.message}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-neutral-500">
                  Keys are saved in an encrypted server-managed store, not browser localStorage.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-mono text-neutral-400 uppercase">
                  Serper/Search API Key (Optional)
                </label>
                <input
                  type="password"
                  value={keys.serper}
                  onChange={(e) =>
                    setKeys({ ...keys, serper: e.target.value })
                  }
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-3 text-sm text-white focus:border-white outline-none transition-colors"
                  placeholder="API Key..."
                />
              </div>



              <div className="pt-4 border-t border-neutral-800 space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  LinkedIn Integration
                </h3>
                <div className="space-y-2">
                  <label className="text-xs font-mono text-neutral-400 uppercase">
                    Client ID
                  </label>
                  <input
                    type="password"
                    value={keys.linkedinClientId || ""}
                    onChange={(e) =>
                      setKeys({ ...keys, linkedinClientId: e.target.value })
                    }
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-3 text-sm text-white focus:border-white outline-none transition-colors"
                    placeholder="e.g. 77na8..."
                  />
                  {keys.linkedinClientId?.includes("@") && (
                    <p className="text-xs text-yellow-500 mt-1">
                      Warning: Client ID is usually a random string (e.g. 78a...), not an email address.
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-mono text-neutral-400 uppercase">
                    Client Secret
                  </label>
                  <input
                    type="password"
                    value={keys.linkedinClientSecret || ""}
                    onChange={(e) =>
                      setKeys({ ...keys, linkedinClientSecret: e.target.value })
                    }
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-3 text-sm text-white focus:border-white outline-none transition-colors"
                    placeholder="Client Secret..."
                  />
                </div>
              </div>

              {/* Agency Mode (Team Settings) */}
              <div className="pt-4 border-t border-neutral-800 space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-indigo-400" /> Agency Team
                </h3>
                  <div className="flex items-center justify-between p-4 bg-neutral-900 border border-neutral-800 rounded-lg">
                    <div>
                        <p className="text-sm font-bold text-white">Manage Team</p>
                        <p className="text-xs text-neutral-500">Collaborate with your squad</p>
                    </div>
                    <button
                        onClick={() => {
                            if (onOpenTeamSettings) {
                                onClose();
                                onOpenTeamSettings();
                            }
                        }}
                        className="bg-indigo-600 text-white px-4 py-2 rounded text-xs font-bold hover:bg-indigo-500 transition-colors"
                    >
                        OPEN DASHBOARD
                    </button>
                  </div>
              </div>

              {/* Voice Lab (Phase 24) */}
              <div className="pt-4 border-t border-neutral-800 space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  🎙️ Voice Lab (Beta)
                </h3>
                <p className="text-xs text-neutral-500">
                  Paste 5-10 of your best posts to train the AI on your personal writing style. 
                  Use `---` to separate examples.
                </p>
                
                <textarea
                  id="voice-lab-samples"
                  className="w-full h-32 bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-3 text-xs text-white focus:border-indigo-500 outline-none transition-colors resize-none font-mono"
                  placeholder="Paste your 'Hall of Fame' content here...
---
Second example post..."
                />
                
                <button
                  id="train-voice-btn"
                  onClick={async () => {
                    const btn = document.getElementById('train-voice-btn') as HTMLButtonElement;
                    const area = document.getElementById('voice-lab-samples') as HTMLTextAreaElement;
                    const samples = area.value;
                    
                    if (!samples) return alert("Please provide some samples first.");
                    
                    btn.disabled = true;
                    btn.innerText = "TRAINING...";
                    
                    try {
                      const { trainVoiceAction } = await import("../actions/style");
                      const result = await trainVoiceAction(samples);
                      alert(result.message);
                      if (result.success) area.value = "";
                    } catch (e: unknown) {
                      alert("Training failed: " + (e instanceof Error ? e.message : "Unknown error"));
                    } finally {
                      btn.disabled = false;
                      btn.innerText = "TRAIN MY VOICE";
                    }
                  }}
                  className="w-full bg-neutral-100 text-black px-4 py-2 rounded text-xs font-bold hover:bg-white transition-colors disabled:opacity-50"
                >
                  TRAIN MY VOICE
                </button>
              </div>

              {/* Data & Storage Section */}
              <div className="pt-4 border-t border-neutral-800 space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  📊 Data & Storage
                </h3>
                <p className="text-xs text-neutral-500">Migrate your local history to the cloud database.</p>
                
                <button
                  onClick={async () => {
                    const { migrateHistoryToCloud } = await import("../utils/history-service");
                    const result = await migrateHistoryToCloud();
                    alert(result.message);
                  }}
                  className="w-full bg-indigo-600 text-white px-4 py-2 rounded text-xs font-bold hover:bg-indigo-500 transition-colors"
                >
                  MIGRATE HISTORY TO DATABASE
                </button>
              </div>

              {/* Agent Integrations Section */}
              <div className="pt-4 border-t border-neutral-800 space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  🤖 Agent Integrations
                </h3>
                <p className="text-xs text-neutral-500">Connect Ghost Agent to external services.</p>
                
                <div className="space-y-2">
                  <label className="text-xs font-mono text-neutral-400 uppercase">
                    Scheduler Webhook (Buffer/Zapier/n8n)
                  </label>
                  <input
                    type="url"
                    defaultValue={typeof window !== "undefined" ? localStorage.getItem("strategyos_scheduler_webhook") || "" : ""}
                    onChange={(e) => {
                      localStorage.setItem("strategyos_scheduler_webhook", e.target.value);
                    }}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-3 text-sm text-white focus:border-white outline-none transition-colors"
                    placeholder="https://hooks.zapier.com/..."
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-mono text-neutral-400 uppercase">
                    Slack Webhook URL
                  </label>
                  <input
                    type="url"
                    defaultValue={typeof window !== "undefined" ? localStorage.getItem("strategyos_slack_webhook") || "" : ""}
                    onChange={(e) => {
                      localStorage.setItem("strategyos_slack_webhook", e.target.value);
                    }}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-3 text-sm text-white focus:border-white outline-none transition-colors"
                    placeholder="https://hooks.slack.com/..."
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-mono text-neutral-400 uppercase">
                    MS Teams Webhook URL
                  </label>
                  <input
                    type="url"
                    defaultValue={typeof window !== "undefined" ? localStorage.getItem("strategyos_teams_webhook") || "" : ""}
                    onChange={(e) => {
                      localStorage.setItem("strategyos_teams_webhook", e.target.value);
                    }}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-3 text-sm text-white focus:border-white outline-none transition-colors"
                    placeholder="https://outlook.office.com/webhook/..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <label className="text-xs font-mono text-neutral-400 uppercase">
                      Telegram Bot Token
                    </label>
                    <input
                      type="password"
                      defaultValue={typeof window !== "undefined" ? localStorage.getItem("strategyos_telegram_bot") || "" : ""}
                      onChange={(e) => {
                        localStorage.setItem("strategyos_telegram_bot", e.target.value);
                      }}
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-2 text-xs text-white focus:border-white outline-none transition-colors"
                      placeholder="123456:ABC..."
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-mono text-neutral-400 uppercase">
                      Telegram Chat ID
                    </label>
                    <input
                      type="text"
                      defaultValue={typeof window !== "undefined" ? localStorage.getItem("strategyos_telegram_chat") || "" : ""}
                      onChange={(e) => {
                        localStorage.setItem("strategyos_telegram_chat", e.target.value);
                      }}
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-2 text-xs text-white focus:border-white outline-none transition-colors"
                      placeholder="-100123..."
                    />
                  </div>
                </div>
              </div>

              <motion.button
                onClick={() => {
                  onSave(keys);
                  onClose();
                }}
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                className="w-full bg-white text-black font-bold py-3 rounded-lg hover:bg-neutral-200 transition-colors"
              >
                Save Configuration
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
