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
import GhostInboxModal from "../components/GhostInboxModal";
import CommentGeneratorModal from "../components/CommentGeneratorModal";
import { Settings as SettingsIcon, Clock, Mic, BarChart3, Users, Calendar, Ghost, Activity, MessageSquare } from "lucide-react";
import { GeneratedAssets } from "../utils/ai-service";
import { saveHistory, getHistory, clearHistory, HistoryItem, updateHistoryPerformance, PerformanceRating } from "../utils/history-service";
import { PersonaId } from "../utils/personas";
import { GhostDraft } from "../utils/ghost-agent";
import BoardroomModal from "../components/BoardroomModal";
import CouncilModal from "../components/CouncilModal";
import SimulatorModal from "../components/SimulatorModal";
import VoiceConversationModal from "../components/VoiceConversationModal";

export default function Home() {
  const [input, setInput] = useState("");
  const [assets, setAssets] = useState<GeneratedAssets | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [voiceTrainingOpen, setVoiceTrainingOpen] = useState(false);
  const [analyticsOpen, setAnalyticsOpen] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [ghostOpen, setGhostOpen] = useState(false);
  const [commentGenOpen, setCommentGenOpen] = useState(false);
  const [boardroomOpen, setBoardroomOpen] = useState(false);
  const [councilOpen, setCouncilOpen] = useState(false);
  const [simulatorOpen, setSimulatorOpen] = useState(false);
  const [voiceModeOpen, setVoiceModeOpen] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [apiKeys, setApiKeys] = useState<ApiKeys>({ gemini: "", serper: "" });
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

  const handleLoadDraft = (draft: GhostDraft) => {
    setInput(draft.assets.textPost);
    setAssets(draft.assets);
    setPersonaId("cso");
    showToast(`Loaded draft: ${draft.trend}`, "success");
  };

  // Load keys and history on mount (Hydration-safe)
  useEffect(() => {
    const savedGemini = localStorage.getItem("strategyos_gemini_key");
    const savedSerper = localStorage.getItem("strategyos_serper_key");
    const savedLinkedInId = localStorage.getItem("strategyos_linkedin_client_id");
    const savedLinkedInSecret = localStorage.getItem("strategyos_linkedin_client_secret");
    
    if (savedGemini || savedSerper) {
      setApiKeys({
        gemini: savedGemini || "",
        serper: savedSerper || "",
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

  // Handle LinkedIn Callback
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const state = params.get("state");
    const error = params.get("error");

    if (error) {
        showToast(`LinkedIn Login Failed: ${error}`, "error");
        // Clean URL
        window.history.replaceState({}, "", window.location.pathname);
        return;
    }

    if (code) {
        // Verify state if possible (optional but recommended)
        const storedState = localStorage.getItem("linkedin_auth_state");
        if (state && storedState && state !== storedState) {
             showToast("Security Warning: State mismatch during login.", "error");
             return;
        }

        const handleExchange = async () => {
            const clientId = localStorage.getItem("strategyos_linkedin_client_id");
            const clientSecret = localStorage.getItem("strategyos_linkedin_client_secret");
            
            if (!clientId || !clientSecret) {
                showToast("Missing LinkedIn credentials in Settings. Please configure first.", "error");
                setSettingsOpen(true);
                return;
            }

            try {
                // Determine the same redirect URI used in PostButton
                // In PostButton we used window.location.origin
                const redirectUri = window.location.origin;

                // Dynamically import server action to avoid bundling issues? 
                // No, direct import is fine in Next.js client components if it's 'use server'
                const { exchangeCodeForToken } = await import("../actions/linkedin");
                
                showToast("Connecting to LinkedIn...", "success");
                
                const result = await exchangeCodeForToken(code, redirectUri, clientId, clientSecret);
                
                if ('error' in result) {
                    showToast(`Connection failed: ${result.error}`, "error");
                } else {
                    localStorage.setItem("strategyos_linkedin_token", result.access_token);
                    // Also clear the mock token if it exists
                    // Update any other state needed?
                    showToast("LinkedIn Connected Successfully!", "success");
                    // Force re-render of components that check connection (use custom event or just reload?)
                    // Easy way: just force a state update or reload.
                    // Let's reload to be clean and clear URL
                    setTimeout(() => {
                        window.location.href = window.location.pathname; 
                    }, 1000);
                }

            } catch (e: unknown) {
                 const msg = e instanceof Error ? e.message : "Unknown error";
                 showToast(`Error: ${msg}`, "error");
            } finally {
                // Clean URL
                window.history.replaceState({}, "", window.location.pathname);
            }
        };

        handleExchange(); // Trigger async
        params.delete("code"); // ensure we don't loop
    }
  }, []); // Run once on mount

  const handleSaveKeys = (keys: ApiKeys) => {
    // ...
    setApiKeys(keys);
    localStorage.setItem("strategyos_gemini_key", keys.gemini);
    localStorage.setItem("strategyos_serper_key", keys.serper);
    if (keys.linkedinClientId) localStorage.setItem("strategyos_linkedin_client_id", keys.linkedinClientId);
    if (keys.linkedinClientSecret) localStorage.setItem("strategyos_linkedin_client_secret", keys.linkedinClientSecret);
    
    showToast("Configuration saved.", "success");
  };

  // handleGenerate removed as it was unused (replaced by streaming)

  const handleStreamingComplete = (result: string | GeneratedAssets) => {
      let finalAssets: GeneratedAssets;
      
      if (typeof result === "string") {
          // Partial update (just text)
          finalAssets = { 
            textPost: result, 
            imagePrompt: assets?.imagePrompt || "", 
            videoScript: assets?.videoScript || "" 
          };
      } else {
          // Full update
          finalAssets = result;
      }
      
      setAssets(finalAssets); // Update UI
      
      // Only save history if we have the full assets (image prompt is a good proxy)
      if (finalAssets.imagePrompt) {
        const newId = saveHistory(input, finalAssets, personaId);
        setCurrentHistoryId(newId);
        setHistory(getHistory());
        showToast("Generation complete.", "success");
      }
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
      {/* Glassmorphism 2.0 & Aurora Background */}
      <div className="fixed inset-0 bg-[#050505] z-[-10]" />
      
      {/* Animated Aurora Layers */}
      <div className="fixed inset-0 z-[-5] opacity-30 animate-aurora bg-[length:350%_350%] bg-gradient-to-br from-indigo-900/40 via-purple-900/40 to-pink-900/40 blur-[80px] pointer-events-none mix-blend-screen" />
      <div className="fixed top-0 left-0 w-full h-full z-[-4] opacity-20 bg-[radial-gradient(circle_at_50%_50%,_rgba(120,50,255,0.1),_transparent_70%)] pointer-events-none" />

      {/* Noise Texture */}
      <div className="fixed inset-0 bg-noise opacity-[0.04] z-[1] pointer-events-none mix-blend-overlay" />
      
      {/* Vignette */}
      <div className="fixed top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[radial-gradient(circle_at_center,_transparent_10%,_#000000_65%)] z-0 pointer-events-none" />

      {/* Header */}
      <header className="flex justify-between items-center max-w-5xl mx-auto mb-16">
        <div className="flex items-center gap-4">
            <GlitchLogo />
            <WorkspaceSwitcher />
        </div>
        <div className="flex items-center gap-4">
            <button
            onClick={() => setGhostOpen(true)}
            className="text-purple-400 hover:text-white transition-colors flex items-center gap-2 text-sm font-bold bg-purple-500/10 px-3 py-1.5 rounded-full border border-purple-500/20 shadow-[0_0_10px_rgba(168,85,247,0.2)]"
            aria-label="Ghost Agent"
            >
            <Ghost className="w-4 h-4" />
            <span className="hidden md:inline">Ghost Agent</span>
            </button>
            <button
            onClick={() => setCommentGenOpen(true)}
            className="text-blue-400 hover:text-white transition-colors flex items-center gap-2 text-sm font-bold bg-blue-500/10 px-3 py-1.5 rounded-full border border-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.2)]"
            aria-label="Comment Gen"
            >
            <MessageSquare className="w-4 h-4" />
            <span className="hidden md:inline">Reply</span>
            </button>
            <button
            onClick={() => setBoardroomOpen(true)}
            className="text-indigo-400 hover:text-white transition-colors flex items-center gap-2 text-sm font-bold bg-indigo-500/10 px-3 py-1.5 rounded-full border border-indigo-500/20 shadow-[0_0_10px_rgba(99,102,241,0.2)] mr-2"
            aria-label="Boardroom"
            >
            <Mic className="w-4 h-4" />
            <span className="hidden md:inline">Boardroom</span>
            </button>
            <button
            onClick={() => setAnalyticsOpen(true)}
            className="text-neutral-500 hover:text-white transition-colors flex items-center gap-2 text-sm font-medium"
            aria-label="Analytics"
            >
            <BarChart3 className="w-5 h-5" />
            <span className="hidden md:inline">Analytics</span>
            </button>
            <button
            onClick={() => setCouncilOpen(true)}
            className="text-neutral-500 hover:text-white transition-colors flex items-center gap-2 text-sm font-medium"
            title="The Digital Council (Swarm)"
            aria-label="Council"
            >
            <Users className="w-5 h-5" />
            <span className="hidden md:inline">Council</span>
            </button>
            <button
            onClick={() => setSimulatorOpen(true)}
            className="text-neutral-500 hover:text-white transition-colors flex items-center gap-2 text-sm font-medium"
            title="Audience Simulator"
            aria-label="Audience Simulator"
            >
            <Activity className="w-5 h-5" />
            <span className="hidden md:inline">Sim</span>
            </button>
            <button
            onClick={() => setVoiceTrainingOpen(true)}
            className="text-neutral-500 hover:text-white transition-colors flex items-center gap-2 text-sm font-medium"
            title="Train Your Voice"
            aria-label="Voice Training"
            >
            <Mic className="w-5 h-5" />
            <span className="hidden md:inline">Voice</span>
            </button>
            <button
            onClick={() => setHistoryOpen(true)}
            className="text-neutral-500 hover:text-white transition-colors flex items-center gap-2 text-sm font-medium"
            aria-label="History"
            >
            <Clock className="w-5 h-5" />
            <span className="hidden md:inline">History</span>
            </button>
            <button
            onClick={() => setScheduleOpen(true)}
            className="text-neutral-500 hover:text-white transition-colors flex items-center gap-2 text-sm font-medium"
            aria-label="Schedule"
            >
            <Calendar className="w-5 h-5" />
            <span className="hidden md:inline">Schedule</span>
            </button>
            <button
            onClick={() => setVoiceModeOpen(true)}
            className="text-white hover:text-white transition-all flex items-center gap-2 text-sm font-bold bg-gradient-to-r from-blue-500/20 to-purple-500/20 px-4 py-1.5 rounded-full border border-blue-400/30 shadow-[0_0_15px_rgba(59,130,246,0.3)] animate-pulse hover:animate-none"
            title="Chat with StrategyOS"
            aria-label="Voice Mode"
            >
            <Mic className="w-4 h-4" />
            <span className="hidden md:inline">Conversation</span>
            </button>
            <button
            onClick={() => setTeamSettingsOpen(true)}
            className="text-neutral-500 hover:text-white transition-colors flex items-center gap-2 text-sm font-medium"
            aria-label="Team"
            >
            <Users className="w-5 h-5" />
            <span className="hidden md:inline">Team</span>
            </button>
            <button
            onClick={() => setSettingsOpen(true)}
            className="text-neutral-500 hover:text-white transition-colors"
            aria-label="Settings"
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
        geminiKey={apiKeys.gemini || ""}
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

      <GhostInboxModal
        isOpen={ghostOpen}
        onClose={() => setGhostOpen(false)}
        apiKey={apiKeys.gemini}
        onLoadDraft={handleLoadDraft}
      />

      <CommentGeneratorModal
        isOpen={commentGenOpen}
        onClose={() => setCommentGenOpen(false)}
        apiKey={apiKeys.gemini}
        personaId={personaId}
      />

      <BoardroomModal
        isOpen={boardroomOpen}
        onClose={() => setBoardroomOpen(false)}
      />

      <Toast 
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={closeToast}
      />
      <CouncilModal
        isOpen={councilOpen}
        onClose={() => setCouncilOpen(false)}
        apiKey={apiKeys.gemini}
      />
      <SimulatorModal
        isOpen={simulatorOpen}
        onClose={() => setSimulatorOpen(false)}
        apiKey={apiKeys.gemini}
      />
      <VoiceConversationModal
        isOpen={voiceModeOpen}
        onClose={() => setVoiceModeOpen(false)}
        apiKey={apiKeys.gemini}
      />
    </main>
  );
}
