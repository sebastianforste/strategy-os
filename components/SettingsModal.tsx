"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Settings as SettingsIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { modalBackdropVariants, modalContentVariants, buttonVariants } from "../utils/animations";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (keys: ApiKeys) => void;
  initialKeys: ApiKeys;
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
}: SettingsModalProps) {
  const [keys, setKeys] = useState(initialKeys);

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
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-[#0A0A0A] border border-neutral-800 p-8 rounded-2xl z-[60] shadow-2xl"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <SettingsIcon className="w-5 h-5" />
                Configuration
              </h2>
              <button
                onClick={onClose}
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
