"use client";

import { useState, useEffect } from "react";
import StreamingConsole from "../components/StreamingConsole"; // Fixed import
import AssetDisplay from "../components/AssetDisplay";
import SettingsModal, { ApiKeys } from "../components/SettingsModal";
import HistorySidebar from "../components/HistorySidebar";
import AnalyticsDashboard from "../components/AnalyticsDashboard";
import GlitchLogo from "../components/GlitchLogo";
import Toast, { ToastType } from "../components/Toast";
import VoiceTrainingModal from "../components/VoiceTrainingModal";
import WorkspaceSwitcher from "../components/WorkspaceSwitcher";
import TeamSettingsModal from "../components/TeamSettingsModal";
import ScheduleCalendar from "../components/ScheduleCalendar";
import { Settings as SettingsIcon, Clock, Mic, BarChart3, Users, Calendar } from "lucide-react";
import { GeneratedAssets } from "../utils/ai-service";
import { saveHistory, getHistory, clearHistory, HistoryItem, updateHistoryPerformance, PerformanceRating } from "../utils/history-service";
import { PersonaId } from "../utils/personas";

export default function Home() {
  const [input, setInput] = useState("");
  const [assets, setAssets] = useState<GeneratedAssets | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [voiceTrainingOpen, setVoiceTrainingOpen] = useState(false);
  const [analyticsOpen, setAnalyticsOpen] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [apiKeys, setApiKeys] = useState<ApiKeys>({ gemini: "", serper: "", openai: "" });
  const [personaId, setPersonaId] = useState<PersonaId>("cso");
  const [teamSettingsOpen, setTeamSettingsOpen] = useState(false);
  const [useNewsjack, setUseNewsjack] = useState(false);
  const [useRAG, setUseRAG] = useState(true);
  const [useFewShot, setUseFewShot] = useState(true);
  const [platform, setPlatform] = useState<"linkedin" | "twitter">("linkedin");
  const [currentHistoryId, setCurrentHistoryId] = useState<string | null>(null);
  
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

  // Load keys and history on mount (Hydration-safe)
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
    // ...
  }, [input]);

  const handleSaveKeys = (keys: ApiKeys) => {
    // ...
    setApiKeys(keys);
    localStorage.setItem("strategyos_gemini_key", keys.gemini);
    localStorage.setItem("strategyos_serper_key", keys.serper);
    localStorage.setItem("strategyos_openai_key", keys.openai);
    if (keys.linkedinClientId) localStorage.setItem("strategyos_linkedin_client_id", keys.linkedinClientId);
    if (keys.linkedinClientSecret) localStorage.setItem("strategyos_linkedin_client_secret", keys.linkedinClientSecret);
    
    showToast("Configuration saved.", "success");
  };

  // handleGenerate removed as it was unused (replaced by streaming)

  const handleStreamingComplete = (text: string) => {
      const generatedAssets = { textPost: text, imagePrompt: "", videoScript: "" };
      setAssets(generatedAssets); // Update UI
      
      const newId = saveHistory(input, generatedAssets, personaId);
      setCurrentHistoryId(newId);
      setHistory(getHistory());
      
      showToast("Generation complete.", "success");
  };

  const handleRate = (rating: PerformanceRating) => {
      if (!currentHistoryId) return;
      updateHistoryPerformance(currentHistoryId, { rating, markedAt: Date.now() });
      setHistory(getHistory()); // Refresh to show rating in sidebar
      showToast(`Rated as ${rating}`, "success");
  };

  const handleHistorySelect = (item: HistoryItem) => {
      setInput(item.input);
      setAssets(item.assets);
      setCurrentHistoryId(item.id);
      setHistoryOpen(false);
      showToast("History item restored.", "success");
  };
  
  const handleClearHistory = () => {
      if(confirm("Are you sure you want to clear all history?")) {
          clearHistory();
          setHistory([]);
          setCurrentHistoryId(null);
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
            onClick={() => setScheduleOpen(true)}
            className="text-neutral-500 hover:text-white transition-colors flex items-center gap-2 text-sm font-medium"
            >
            <Calendar className="w-5 h-5" />
            <span className="hidden md:inline">Schedule</span>
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
        {/* REPLACED InputConsole with StreamingConsole */}
        <StreamingConsole
          initialValue={input}
          onGenerationComplete={handleStreamingComplete}
          apiKeys={apiKeys}
          personaId={personaId}
          setPersonaId={setPersonaId}
          useNewsjack={useNewsjack}
          setUseNewsjack={setUseNewsjack}
          useRAG={useRAG}
          setUseRAG={setUseRAG}
          useFewShot={useFewShot}
          setUseFewShot={setUseFewShot}
          platform={platform}
          setPlatform={setPlatform}
          onError={(msg) => showToast(msg, "error")}
        />

        {assets && (
          <div className="w-full max-w-4xl animate-in fade-in slide-in-from-bottom-10 duration-700">
            <AssetDisplay 
                assets={assets} 
                linkedinClientId={apiKeys.linkedinClientId}
                onRate={handleRate}
                geminiKey={apiKeys.gemini}
                onUpdateAssets={(newAssets) => setAssets(newAssets)}
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
        onTrainingComplete={() => {
          showToast(`Voice training complete! Model ready.`, "success");
          setVoiceTrainingOpen(false);
        }}
      />
      
      <TeamSettingsModal
        isOpen={teamSettingsOpen}
        onClose={() => setTeamSettingsOpen(false)}
      />

      <ScheduleCalendar
        isOpen={scheduleOpen}
        onClose={() => setScheduleOpen(false)}
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
