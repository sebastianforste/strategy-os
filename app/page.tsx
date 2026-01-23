"use client";

import { useState, useEffect } from "react";
import InputConsole from "../components/InputConsole";
import AssetDisplay from "../components/AssetDisplay";
import SettingsModal, { ApiKeys } from "../components/SettingsModal";
import HistorySidebar from "../components/HistorySidebar";
import AnalyticsDashboard from "../components/AnalyticsDashboard";
import GlitchLogo from "../components/GlitchLogo";
import Toast, { ToastType } from "../components/Toast";
import VoiceTrainingModal from "../components/VoiceTrainingModal";
import { processInput } from "../actions/generate";
import WorkspaceSwitcher from "../components/WorkspaceSwitcher";
import TeamSettingsModal from "../components/TeamSettingsModal";
import { Settings as SettingsIcon, Clock, Mic, BarChart3, Users } from "lucide-react";
import { GeneratedAssets } from "../utils/ai-service";
import { saveHistory, getHistory, clearHistory, HistoryItem } from "../utils/history-service";
import { PersonaId } from "../utils/personas";
import { predictVirality } from "../utils/analytics-service";

export default function Home() {
  const [input, setInput] = useState("");
  const [assets, setAssets] = useState<GeneratedAssets | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [voiceTrainingOpen, setVoiceTrainingOpen] = useState(false);
  const [analyticsOpen, setAnalyticsOpen] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [apiKeys, setApiKeys] = useState<ApiKeys>({ gemini: "", serper: "", openai: "" });
  const [personaId, setPersonaId] = useState<PersonaId>("cso");
  const [viralityScore, setViralityScore] = useState(0);
  const [teamSettingsOpen, setTeamSettingsOpen] = useState(false);
  const [useNewsjack, setUseNewsjack] = useState(false);
  
  // Toast State
  const [toast, setToast] = useState<{ message: string; type: ToastType; isVisible: boolean }>({
    message: "",
    type: "success",
    isVisible: false,
  });

  const showToast = (message: string, type: ToastType) => {
    setToast({ message, type, isVisible: true });
  };

  const closeToast = () => {
    setToast((prev) => ({ ...prev, isVisible: false }));
  };

  // Load keys and history on mount
  useEffect(() => {
    const savedGemini = localStorage.getItem("strategyos_gemini_key");
    const savedSerper = localStorage.getItem("strategyos_serper_key");
    const savedOpenAI = localStorage.getItem("strategyos_openai_key");
    const savedLinkedInId = localStorage.getItem("strategyos_linkedin_client_id");
    const savedLinkedInSecret = localStorage.getItem("strategyos_linkedin_client_secret");
    
    if (savedGemini || savedSerper || savedOpenAI) {
      setApiKeys({
        gemini: savedGemini || "",
        serper: savedSerper || "",
        openai: savedOpenAI || "",
        linkedinClientId: savedLinkedInId || "",
        linkedinClientSecret: savedLinkedInSecret || "",
      });
    } else {
      setSettingsOpen(true);
    }
    
    setHistory(getHistory());
  }, []);

  // Update virality score when input changes
  useEffect(() => {
    if (input.trim().length > 10) {
      const prediction = predictVirality(input);
      setViralityScore(prediction.score);
    } else {
      setViralityScore(0);
    }
  }, [input]);

  const handleSaveKeys = (keys: ApiKeys) => {
    setApiKeys(keys);
    localStorage.setItem("strategyos_gemini_key", keys.gemini);
    localStorage.setItem("strategyos_serper_key", keys.serper);
    localStorage.setItem("strategyos_openai_key", keys.openai);
    if (keys.linkedinClientId) localStorage.setItem("strategyos_linkedin_client_id", keys.linkedinClientId);
    if (keys.linkedinClientSecret) localStorage.setItem("strategyos_linkedin_client_secret", keys.linkedinClientSecret);
    
    showToast("Configuration saved.", "success");
  };

  const handleGenerate = async () => {
    if (!apiKeys.gemini) {
      setSettingsOpen(true);
      return;
    }

    setIsGenerating(true);
    setAssets(null);

    try {
      const result = await processInput(input, apiKeys, personaId, useNewsjack);
      setAssets(result);
      
      // Save to history
      saveHistory(input, result);
      setHistory(getHistory()); // Refresh local state
      
      showToast("Assets generated successfully.", "success");
      
    } catch (error: any) {
      console.error("Generation failed:", error);
      showToast(error.message || "Generation failed.", "error");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleHistorySelect = (item: HistoryItem) => {
      setInput(item.input);
      setAssets(item.assets);
      setHistoryOpen(false);
      showToast("History item restored.", "success");
  };
  
  const handleClearHistory = () => {
      if(confirm("Are you sure you want to clear all history?")) {
          clearHistory();
          setHistory([]);
          showToast("History cleared.", "success");
      }
  };

  return (
    <main className="min-h-screen p-8 md:p-24 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-neutral-900 via-[#050505] to-[#050505] -z-10 pointer-events-none" />

      {/* Header */}
      <header className="flex justify-between items-center max-w-5xl mx-auto mb-16">
        <div className="flex items-center gap-4">
            <GlitchLogo />
            <WorkspaceSwitcher />
        </div>
        <div className="flex items-center gap-4">
            <button
            onClick={() => setAnalyticsOpen(true)}
            className="text-neutral-500 hover:text-white transition-colors flex items-center gap-2 text-sm font-medium"
            >
            <BarChart3 className="w-5 h-5" />
            <span className="hidden md:inline">Analytics</span>
            </button>
            <button
            onClick={() => setVoiceTrainingOpen(true)}
            className="text-neutral-500 hover:text-white transition-colors flex items-center gap-2 text-sm font-medium"
            title="Train Your Voice"
            >
            <Mic className="w-5 h-5" />
            <span className="hidden md:inline">Voice</span>
            </button>
            <button
            onClick={() => setHistoryOpen(true)}
            className="text-neutral-500 hover:text-white transition-colors flex items-center gap-2 text-sm font-medium"
            >
            <Clock className="w-5 h-5" />
            <span className="hidden md:inline">History</span>
            </button>
            <button
            onClick={() => setTeamSettingsOpen(true)}
            className="text-neutral-500 hover:text-white transition-colors flex items-center gap-2 text-sm font-medium"
            >
            <Users className="w-5 h-5" />
            <span className="hidden md:inline">Team</span>
            </button>
            <button
            onClick={() => setSettingsOpen(true)}
            className="text-neutral-500 hover:text-white transition-colors"
            >
            <SettingsIcon className="w-5 h-5" />
            </button>
        </div>
      </header>

      {/* Main Interface */}
      <div className="max-w-5xl mx-auto">
        <InputConsole
          value={input}
          onChange={setInput}
          onGenerate={handleGenerate}
          isGenerating={isGenerating}
          personaId={personaId}
          setPersonaId={setPersonaId}
          viralityScore={viralityScore}
          useNewsjack={useNewsjack}
          setUseNewsjack={setUseNewsjack}
        />

        {assets && (
          <div className="w-full max-w-4xl animate-in fade-in slide-in-from-bottom-10 duration-700">
            <AssetDisplay 
                assets={assets} 
                linkedinClientId={apiKeys.linkedinClientId}
            />
          </div>
        )}
      </div>

      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onSave={handleSaveKeys}
        initialKeys={apiKeys}
      />
      
      <AnalyticsDashboard
        isOpen={analyticsOpen}
        onClose={() => setAnalyticsOpen(false)}
      />

      <HistorySidebar 
        isOpen={historyOpen}
        onClose={() => setHistoryOpen(false)}
        history={history}
        onSelect={handleHistorySelect}
        onClear={handleClearHistory}
        onRatingChange={() => {
             setHistory(getHistory());
        }}
      />
      
      <VoiceTrainingModal
        isOpen={voiceTrainingOpen}
        onClose={() => setVoiceTrainingOpen(false)}
        openaiKey={apiKeys.openai || ""}
        onTrainingComplete={(modelId) => {
          showToast(`Voice training complete! Model ready.`, "success");
          setVoiceTrainingOpen(false);
        }}
      />
      
      <TeamSettingsModal
        isOpen={teamSettingsOpen}
        onClose={() => setTeamSettingsOpen(false)}
      />

      <Toast 
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={closeToast}
      />
    </main>
  );
}
