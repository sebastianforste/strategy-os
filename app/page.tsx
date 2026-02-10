"use client";

import { useState, useEffect } from "react";
import StreamingConsole from "../components/StreamingConsole"; // Fixed import
import AssetDisplay from "../components/AssetDisplay";
import SettingsModal, { ApiKeys } from "../components/SettingsModal";
import HistorySidebar from "../components/HistorySidebar";
import AnalyticsDashboard from "../components/AnalyticsDashboard";
import GlitchLogo from "../components/GlitchLogo";
import Toast, { ToastType } from "../components/Toast";
import VoiceTrainerModal from "../components/VoiceTrainerModal";
import WorkspaceSwitcher from "../components/WorkspaceSwitcher";
import TeamSettingsModal from "../components/TeamSettingsModal";
import GhostAgentDashboard from "../components/GhostAgentDashboard";
import CommentGeneratorModal from "../components/CommentGeneratorModal";
import ScheduleQueueDashboard from "../components/ScheduleQueueDashboard";
import { Settings as SettingsIcon, Clock, Mic, BarChart3, Users, Calendar, Ghost, Activity, MessageSquare, LayoutGrid, Dna, X } from "lucide-react";
import { GeneratedAssets } from "../utils/ai-service";
import { saveHistory, getHistory, clearHistory, HistoryItem, updateHistoryPerformance, PerformanceRating } from "../utils/history-service";
import { PersonaId } from "../utils/personas";
import { SectorId } from "../utils/sectors";
import { GhostDraft } from "../utils/ghost-agent";
import BoardroomModal from "../components/BoardroomModal";
import CouncilModal from "../components/CouncilModal";
import SimulatorModal from "../components/SimulatorModal";
import VisualAlchemistModal from "../components/VisualAlchemistModal";
import CompetitorMonitor from "../components/CompetitorMonitor";
import MastermindMarketplace from "../components/MastermindMarketplace";
// Redundant VoiceLab/Training imports removed
import NetworkHub from "../components/NetworkHub";
import InterceptionPanel from "../components/InterceptionPanel";
import { SystemVitals, checkVitals } from "../utils/vitals-service";
import { getDNA, buildDNAPrompt } from "../utils/dna-service";
import { PERSONAS } from "../utils/personas";
import NarrativeModal from "../components/NarrativeModal";
import IdeaFactoryModal from "../components/IdeaFactoryModal";

export default function Home() {
  const [input, setInput] = useState("");
  const [assets, setAssets] = useState<GeneratedAssets | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [voiceStudioOpen, setVoiceStudioOpen] = useState(false);
  const [analyticsOpen, setAnalyticsOpen] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [ghostOpen, setGhostOpen] = useState(false);
  const [commentGenOpen, setCommentGenOpen] = useState(false);
  const [boardroomOpen, setBoardroomOpen] = useState(false);
  const [councilOpen, setCouncilOpen] = useState(false);
  const [simulatorOpen, setSimulatorOpen] = useState(false);
  const [networkHubOpen, setNetworkHubOpen] = useState(false);
  const [visualAlchemistOpen, setVisualAlchemistOpen] = useState(false);
  const [competitorReconOpen, setCompetitorReconOpen] = useState(false);
  const [mastermindOpen, setMastermindOpen] = useState(false);
  const [narrativeOpen, setNarrativeOpen] = useState(false);
  const [ideaFactoryOpen, setIdeaFactoryOpen] = useState(false);
  const [appsMenuOpen, setAppsMenuOpen] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [apiKeys, setApiKeys] = useState<ApiKeys>({ gemini: "", serper: "" });
  const [personaId, setPersonaId] = useState<PersonaId>("cso");
  const [teamSettingsOpen, setTeamSettingsOpen] = useState(false);
  const [useNewsjack, setUseNewsjack] = useState(false);
  const [useRAG, setUseRAG] = useState(true);
  const [useFewShot, setUseFewShot] = useState(true);
  const [useSwarm, setUseSwarm] = useState(false);
  const [platform, setPlatform] = useState<"linkedin" | "twitter">("linkedin");

  const [isTeamMode, setIsTeamMode] = useState(false);
  const [currentHistoryId, setCurrentHistoryId] = useState<string | null>(null);
  const [sectorId, setSectorId] = useState<SectorId>("general");
  
  const [preloadedCommentSignals, setPreloadedCommentSignals] = useState<any[]>([]);
  const [vitals, setVitals] = useState<SystemVitals>({
    api: "online",
    database: "connected",
    network: "online",
    latencyMs: 0
  });

  // Pulse Guard: System Vitals Loop
  useEffect(() => {
    const pulseVitals = async () => {
        const status = await checkVitals(apiKeys.gemini || "");
        setVitals(status);
    };
    pulseVitals();
    const interval = setInterval(pulseVitals, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, [apiKeys.gemini]);
  
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

  const handleIntercept = (signal: import("../utils/ghost-service").Signal) => {
    setInput(`Write a contrarian take on: "${signal.topic}".\nContext: ${signal.summary}\nAngle: ${signal.suggestedAngle}\n\nMake it viral.`);
    showToast("Signal Intercepted. Auto-Drafting...", "success");
  };

  const handleInterceptComment = (signal: import("../utils/ghost-service").Signal) => {
    setPreloadedCommentSignals([{
        title: signal.topic,
        source: signal.source,
        snippet: signal.summary
    }]);
    setCommentGenOpen(true);
    showToast("Opening Comment Generator with Signal Context", "success");
  };

  // Load keys and history on mount (Hydration-safe)
  useEffect(() => {
    // PRIORITY: Environment variable > localStorage cache
    // This ensures .env.local updates take effect without clearing browser storage
    const envGemini = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
    const savedGemini = localStorage.getItem("strategyos_gemini_key") || "";
    const savedSerper = localStorage.getItem("strategyos_serper_key");
    const savedLinkedInId = localStorage.getItem("strategyos_linkedin_client_id");
    const savedLinkedInSecret = localStorage.getItem("strategyos_linkedin_client_secret");
    
    // Use env var if available, otherwise fall back to localStorage
    const geminiKey = envGemini || savedGemini;
    
    if (geminiKey || savedSerper) {
      setApiKeys({
        gemini: geminiKey,
        serper: savedSerper || "",
        linkedinClientId: savedLinkedInId || "",
        linkedinClientSecret: savedLinkedInSecret || "",
      });
      // Also update localStorage with the env var if it was used
      if (envGemini && envGemini !== savedGemini) {
        localStorage.setItem("strategyos_gemini_key", envGemini);
      }
    } else {
      setSettingsOpen(true);
    }
    
    setHistory(getHistory());

    // Initialize Voice DNA Integration
    const dna = getDNA();
    if (dna) {
        console.log("🧬 Loading Voice DNA...");
        // Inject the DNA into the Custom Persona
        PERSONAS.custom.basePrompt = buildDNAPrompt(dna);
        PERSONAS.custom.description = "Your Unique Voice Clone";
        // Optionally auto-select custom if available? No, stick to default CSo to avoid confusion.
    }
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
    <main className="min-h-screen relative overflow-hidden flex flex-col">
      {/* Glassmorphism 2.0 & Aurora Background */}
      <div className="fixed inset-0 bg-[#050505] z-[-10]" />
      
      {/* Animated Aurora Layers */}
      <div className="fixed inset-0 z-[-5] opacity-30 animate-aurora bg-[length:350%_350%] bg-gradient-to-br from-indigo-900/40 via-purple-900/40 to-pink-900/40 blur-[80px] pointer-events-none mix-blend-screen" />
      <div className="fixed top-0 left-0 w-full h-full z-[-4] opacity-20 bg-[radial-gradient(circle_at_50%_50%,_rgba(120,50,255,0.1),_transparent_70%)] pointer-events-none" />

      {/* Noise Texture */}
      <div className="fixed inset-0 bg-noise opacity-[0.04] z-[1] pointer-events-none mix-blend-overlay" />
      
      {/* Vignette */}
      <div className="fixed top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[radial-gradient(circle_at_center,_transparent_10%,_#000000_65%)] z-0 pointer-events-none" />


      <div className="flex-1 w-full">
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
          useSwarm={useSwarm}
          setUseSwarm={setUseSwarm}
          platform={platform}
          setPlatform={setPlatform}
          isTeamMode={isTeamMode}
          setIsTeamMode={setIsTeamMode}
          vitals={vitals}
          onError={(msg) => showToast(msg, "error")}
          sectorId={sectorId}
          setSectorId={setSectorId}
          onOpenVoiceStudio={() => setVoiceStudioOpen(true)}
          onOpenBoardroom={() => setBoardroomOpen(true)}
          onOpenNarrative={() => setNarrativeOpen(true)}
          onToggleRadar={(enabled) => {
              showToast(`Autonomous Radar ${enabled ? 'Engaged' : 'Disengaged'}`, 'success');
          }}
          onTriggerAutonomousDraft={async () => {
              showToast("Growth Agent Scanning trends...", "success");
          }}
          onOpenIdeaFactory={() => setIdeaFactoryOpen(true)}
        />
        {assets && (
          <div className="w-full max-w-4xl animate-in fade-in slide-in-from-bottom-10 duration-700">
            <AssetDisplay 
                assets={assets} 
                linkedinClientId={apiKeys.linkedinClientId || ""} 
                onRate={handleRate}
                geminiKey={apiKeys.gemini}
                onUpdateAssets={(newAssets) => setAssets(newAssets)}
                personaId={personaId}
            />
          </div>
        )}
      </div>

      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onSave={handleSaveKeys}
        initialKeys={apiKeys}
        onOpenTeamSettings={() => {
            setSettingsOpen(false);
            setTeamSettingsOpen(true);
        }}
      />

       <TeamSettingsModal 
        isOpen={teamSettingsOpen} 
        onClose={() => setTeamSettingsOpen(false)} 
      />

      <VisualAlchemistModal
        isOpen={visualAlchemistOpen}
        onClose={() => setVisualAlchemistOpen(false)}
      />

      {competitorReconOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setCompetitorReconOpen(false)} />
            <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <CompetitorMonitor />
                <button 
                  onClick={() => setCompetitorReconOpen(false)}
                  className="absolute top-4 right-4 p-2 bg-white/5 rounded-full hover:bg-white/10"
                >
                    <X className="w-5 h-5 text-white" />
                </button>
            </div>
        </div>
      )}

      {mastermindOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setMastermindOpen(false)} />
            <div className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto">
                <MastermindMarketplace />
                <button 
                  onClick={() => setMastermindOpen(false)}
                  className="absolute top-4 right-4 p-2 bg-white/5 rounded-full hover:bg-white/10"
                >
                    <X className="w-5 h-5 text-white" />
                </button>
            </div>
        </div>
      )}
      
      <AnalyticsDashboard
        isOpen={analyticsOpen}
        onClose={() => setAnalyticsOpen(false)}
        apiKey={apiKeys.gemini || ""}
      />

      <ScheduleQueueDashboard 
        isOpen={scheduleOpen}
        onClose={() => setScheduleOpen(false)}
        apiKey={apiKeys.gemini || ""}
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
      
      <VoiceTrainerModal
        isOpen={voiceStudioOpen}
        onClose={() => setVoiceStudioOpen(false)}
        apiKey={apiKeys.gemini || ""}
      />
      
      <GhostAgentDashboard
        isOpen={ghostOpen}
        onClose={() => setGhostOpen(false)}
        apiKey={apiKeys.gemini}
        onLoadDraft={handleLoadDraft}
      />
      
      <InterceptionPanel 
        onIntercept={handleIntercept} 
        onComment={handleInterceptComment}
        apiKey={apiKeys.gemini} 
        vitals={vitals}
      />


      <CommentGeneratorModal
        isOpen={commentGenOpen}
        onClose={() => {
            setCommentGenOpen(false);
            setPreloadedCommentSignals([]);
        }}
        apiKey={apiKeys.gemini}
        personaId={personaId}
        initialSignals={preloadedCommentSignals}
      />

      <BoardroomModal
        isOpen={boardroomOpen}
        onClose={() => setBoardroomOpen(false)}
        strategyContent={assets?.textPost || ""}
        apiKey={apiKeys.gemini}
      />

      <NarrativeModal
        isOpen={narrativeOpen}
        onClose={() => setNarrativeOpen(false)}
        initialTheme={input || "World Class AI Strategy"}
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
        onAdoptStrategy={(draft) => {
          setInput(draft);
          setAssets(prev => prev ? { ...prev, textPost: draft } : null);
          setCouncilOpen(false);
          showToast("Strategy adopted from the Council.", "success");
        }}
      />
      <SimulatorModal
        isOpen={simulatorOpen}
        onClose={() => setSimulatorOpen(false)}
        apiKey={apiKeys.gemini}
      />
      {/* Redundant Voice modals removed for Voice Studio V2 */}
      <NetworkHub
        isOpen={networkHubOpen}
        onClose={() => setNetworkHubOpen(false)}
        apiKey={apiKeys.gemini}
      />
      <IdeaFactoryModal 
        isOpen={ideaFactoryOpen}
        onClose={() => setIdeaFactoryOpen(false)}
      />
    </main>
  );
}
