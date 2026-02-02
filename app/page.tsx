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
import GhostAgentDashboard from "../components/GhostAgentDashboard";
import CommentGeneratorModal from "../components/CommentGeneratorModal";
import { Settings as SettingsIcon, Clock, Mic, BarChart3, Users, Calendar, Ghost, Activity, MessageSquare, LayoutGrid, Dna } from "lucide-react";
import { GeneratedAssets } from "../utils/ai-service";
import { saveHistory, getHistory, clearHistory, HistoryItem, updateHistoryPerformance, PerformanceRating } from "../utils/history-service";
import { PersonaId } from "../utils/personas";
import { GhostDraft } from "../utils/ghost-agent";
import BoardroomModal from "../components/BoardroomModal";
import CouncilModal from "../components/CouncilModal";
import SimulatorModal from "../components/SimulatorModal";
import LiveVoiceConsole from "../components/LiveVoiceConsole";
import VoiceLabModal from "../components/VoiceLabModal";
import NetworkHub from "../components/NetworkHub";
import InterceptionPanel from "../components/InterceptionPanel";
import { getDNA, buildDNAPrompt } from "../utils/dna-service";
import { PERSONAS } from "../utils/personas";

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
  const [voiceLabOpen, setVoiceLabOpen] = useState(false);
  const [networkHubOpen, setNetworkHubOpen] = useState(false);
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
  const [currentHistoryId, setCurrentHistoryId] = useState<string | null>(null);
  
  const [preloadedCommentSignals, setPreloadedCommentSignals] = useState<any[]>([]);
  
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
        <div className="flex items-center gap-3">
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
            className="text-indigo-400 hover:text-white transition-colors flex items-center gap-2 text-sm font-bold bg-indigo-500/10 px-3 py-1.5 rounded-full border border-indigo-500/20 shadow-[0_0_10px_rgba(99,102,241,0.2)]"
            aria-label="Boardroom"
            >
            <Mic className="w-4 h-4" />
            <span className="hidden md:inline">Boardroom</span>
            </button>
            
            <button
            onClick={() => setVoiceModeOpen(true)}
            className="text-red-400 hover:text-white transition-all flex items-center gap-2 text-sm font-bold bg-red-500/10 px-5 py-2 rounded-full border border-red-500/30 shadow-[0_0_20px_rgba(220,38,38,0.2)] animate-pulse hover:animate-none hover:shadow-[0_0_30px_rgba(220,38,38,0.4)] mr-2 group"
            title="Secure Line to The Council"
            aria-label="Red Phone"
            >
            <Activity className="w-4 h-4 animate-pulse" />
            <span className="hidden md:inline">RED PHONE</span>
            </button>
            
            {/* Apps Menu Dropdown */}
            <div className="relative">
                <button
                onClick={() => setAppsMenuOpen(!appsMenuOpen)}
                className={`text-neutral-300 hover:text-white transition-colors flex items-center gap-2 text-sm font-medium px-3 py-1.5 rounded-full ${appsMenuOpen ? 'bg-white/10 text-white' : ''}`}
                aria-label="Apps"
                >
                <LayoutGrid className="w-5 h-5" />
                <span className="hidden md:inline">Apps</span>
                </button>
                
                {appsMenuOpen && (
                    <>
                    <div className="fixed inset-0 z-40" onClick={() => setAppsMenuOpen(false)}></div>
                    <div className="absolute right-0 top-full mt-2 w-56 bg-[#0A0A0A]/90 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl p-2 z-50 flex flex-col gap-1 animate-in fade-in zoom-in-95 duration-200">
                        <button
                        onClick={() => { setAnalyticsOpen(true); setAppsMenuOpen(false); }}
                        className="flex items-center gap-3 px-3 py-2 text-sm text-neutral-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors text-left"
                        >
                        <BarChart3 className="w-4 h-4 text-emerald-400" />
                        Analytics
                        </button>
                        <button
                        onClick={() => { setCouncilOpen(true); setAppsMenuOpen(false); }}
                        className="flex items-center gap-3 px-3 py-2 text-sm text-neutral-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors text-left"
                        >
                        <Users className="w-4 h-4 text-amber-400" />
                        The Council
                        </button>
                        <button
                        onClick={() => { setSimulatorOpen(true); setAppsMenuOpen(false); }}
                        className="flex items-center gap-3 px-3 py-2 text-sm text-neutral-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors text-left"
                        >
                        <Activity className="w-4 h-4 text-rose-400" />
                        Simulator
                        </button>
                         <button
                        onClick={() => { setNetworkHubOpen(true); setAppsMenuOpen(false); }}
                        className="flex items-center gap-3 px-3 py-2 text-sm text-neutral-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors text-left"
                        >
                        <Users className="w-4 h-4 text-indigo-400" />
                        Network Intel
                        </button>
                        <div className="h-px bg-white/10 my-1" />
                        <button
                        onClick={() => { setVoiceLabOpen(true); setAppsMenuOpen(false); }}
                        className="flex items-center gap-3 px-3 py-2 text-sm text-neutral-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors text-left"
                        >
                        <Dna className="w-4 h-4 text-pink-400" />
                        Voice Lab (DNA)
                        </button>
                        <button
                        onClick={() => { setHistoryOpen(true); setAppsMenuOpen(false); }}
                        className="flex items-center gap-3 px-3 py-2 text-sm text-neutral-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors text-left"
                        >
                        <Clock className="w-4 h-4 text-blue-400" />
                        History
                        </button>
                        <button
                        onClick={() => { setScheduleOpen(true); setAppsMenuOpen(false); }}
                        className="flex items-center gap-3 px-3 py-2 text-sm text-neutral-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors text-left"
                        >
                        <Calendar className="w-4 h-4 text-orange-400" />
                        Schedule
                        </button>
                         <button
                        onClick={() => { setTeamSettingsOpen(true); setAppsMenuOpen(false); }}
                        className="flex items-center gap-3 px-3 py-2 text-sm text-neutral-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors text-left"
                        >
                        <Users className="w-4 h-4 text-indigo-400" />
                        Team
                        </button>
                    </div>
                    </>
                )}
            </div>

            <div className="h-6 w-px bg-white/10 mx-1"></div>

            <button
            onClick={() => setSettingsOpen(true)}
            className="text-neutral-400 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-full"
            aria-label="Settings"
            >
            <SettingsIcon className="w-5 h-5" />
            </button>
        </div>
      </header>

      {/* Main Interface */}
      <div className="max-w-5xl mx-auto">
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
          onError={(msg) => showToast(msg, "error")}
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
      />
      
      <AnalyticsDashboard
        isOpen={analyticsOpen}
        onClose={() => setAnalyticsOpen(false)}
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
      <LiveVoiceConsole
        isOpen={voiceModeOpen}
        onClose={() => setVoiceModeOpen(false)}
        apiKey={apiKeys.gemini}
      />
      <VoiceLabModal
        isOpen={voiceLabOpen}
        onClose={() => setVoiceLabOpen(false)}
        apiKey={apiKeys.gemini}
      />
      <NetworkHub
        isOpen={networkHubOpen}
        onClose={() => setNetworkHubOpen(false)}
        apiKey={apiKeys.gemini}
      />
    </main>
  );
}
