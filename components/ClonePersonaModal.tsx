"use client";

import { useState } from "react";
import { X, Sparkles, Loader2, UserPlus, Link as LinkIcon, FileText } from "lucide-react";
import { analyzeProfile } from "../utils/profile-analyzer";
import { saveCustomPersona } from "../utils/persona-store";
import { Persona } from "../utils/personas";
import { motion } from "framer-motion";

interface ClonePersonaModalProps {
  onClose: () => void;
  onPersonaCreated: (persona: Persona) => void;
  apiKey: string;
}

export default function ClonePersonaModal({ onClose, onPersonaCreated, apiKey }: ClonePersonaModalProps) {
  const [mode, setMode] = useState<"text" | "url">("text");
  const [input, setInput] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState("");

  const handleAnalyze = async () => {
    if (!input.trim()) return;
    if (!apiKey) {
      setError("API Key required.");
      return;
    }

    setIsAnalyzing(true);
    setError("");

    try {
      let textToAnalyze = input;

      if (mode === "url") {
          // 1. Scrape the URL via our API
          const scrapeRes = await fetch("/api/scrape", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ url: input })
          });
          
          const scrapeData = await scrapeRes.json();
          if (!scrapeRes.ok || !scrapeData.text) {
              throw new Error(scrapeData.error || "Failed to scrape URL. Ensure it is public.");
          }
          textToAnalyze = scrapeData.text;
      }

      // 2. Analyze the text (either pasted or scraped)
      const persona = await analyzeProfile(textToAnalyze, apiKey);
      
      if (persona) {
        await saveCustomPersona(persona);
        onPersonaCreated(persona);
        onClose();
      } else {
        setError("Could not extract persona. Try more text.");
      }
    } catch (e: any) {
      setError(e.message || "Analysis failed.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-neutral-900 border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl"
      >
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-indigo-400" />
            <h3 className="font-bold text-white">Clone Persona</h3>
          </div>
          <button onClick={onClose} className="text-neutral-500 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex gap-2 p-1 bg-black/50 rounded-lg w-fit">
              <button 
                onClick={() => setMode("text")}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${mode === "text" ? "bg-neutral-700 text-white" : "text-neutral-500 hover:text-neutral-300"}`}
             >
                <FileText className="w-3 h-3 inline mr-1.5" /> Bio / Posts
             </button>
             <button 
                onClick={() => setMode("url")}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${mode === "url" ? "bg-neutral-700 text-white" : "text-neutral-500 hover:text-neutral-300"}`}
             >
                <LinkIcon className="w-3 h-3 inline mr-1.5" /> URL (LinkedIn/Bio)
             </button>
          </div>

          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={mode === 'text' ? "Paste bio, about section, or recent posts here to clone the voice..." : "Paste a LinkedIn profile URL or professional blog URL to clone the voice..."}
            className="w-full h-40 bg-black/30 border border-white/10 rounded-xl p-4 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-indigo-500/50 resize-none"
          />

          {error && (
            <div className="text-red-400 text-xs bg-red-500/10 p-2 rounded">
              {error}
            </div>
          )}

          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing || !input.trim()}
            className="w-full py-3 bg-white text-black font-bold rounded-xl hover:bg-neutral-200 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Analyzing Voice...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" /> CLONE PERSONA
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
