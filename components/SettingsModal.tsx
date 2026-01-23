"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Settings as SettingsIcon } from "lucide-react";
import { useState, useEffect } from "react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (keys: ApiKeys) => void;
  initialKeys: ApiKeys;
}

export interface ApiKeys {
  gemini: string;
  serper: string;
  openai: string;
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

  const [installPrompt, setInstallPrompt] = useState<any>(null);

  useEffect(() => {
    setKeys(initialKeys);
  }, [initialKeys]);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstallClick = () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    installPrompt.userChoice.then((choiceResult: any) => {
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
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-[#0A0A0A] border border-neutral-800 p-8 rounded-2xl z-50 shadow-2xl"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <SettingsIcon className="w-5 h-5" />
                Configuration
              </h2>
              <button
                onClick={onClose}
                className="text-neutral-500 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {installPrompt && (
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
                  Gemini API Key
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

              <div className="space-y-2">
                <label className="text-xs font-mono text-neutral-400 uppercase">
                  OpenAI API Key (For DALL-E 3 Images)
                </label>
                <input
                  type="password"
                  value={keys.openai || ""}
                  onChange={(e) =>
                    setKeys({ ...keys, openai: e.target.value })
                  }
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-3 text-sm text-white focus:border-white outline-none transition-colors"
                  placeholder="sk-..."
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
                    placeholder="Client ID..."
                  />
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

              <button
                onClick={() => {
                  onSave(keys);
                  onClose();
                }}
                className="w-full bg-white text-black font-bold py-3 rounded-lg hover:bg-neutral-200 transition-colors"
              >
                Save Configuration
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
