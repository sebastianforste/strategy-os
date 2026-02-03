"use client";

import { useState } from "react";
import { Copy, RefreshCw, ThumbsUp, ThumbsDown, Minus, ArrowRight, Eye, FileText, Check, MessageSquare, LayoutGrid, ImageIcon, Sparkles, Video, Layers, Mic, Mail, Zap, Loader2, Database, Sword, Layout } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import dynamic from "next/dynamic";
import { GeneratedAssets } from "../utils/ai-service";
import LinkedInPreview from "./LinkedInPreview";

// Lazy loaded feature components
const CarouselBuilder = dynamic(() => import("./CarouselBuilder"), { ssr: false, loading: () => <div className="w-full h-96 bg-neutral-900 animate-pulse rounded-xl" /> });
const VisualGenerator = dynamic(() => import("./VisualGenerator"), { ssr: false, loading: () => <div className="w-full aspect-square bg-neutral-900 animate-pulse rounded-xl" /> });
const VideoDirector = dynamic(() => import("./VideoDirector"), { ssr: false, loading: () => <div className="w-full h-[600px] bg-neutral-900 animate-pulse rounded-xl" /> });
const AudioStudio = dynamic(() => import("./AudioStudio"), { ssr: false, loading: () => <div className="w-full h-64 bg-neutral-900 animate-pulse rounded-xl" /> });
const ThumbnailFactory = dynamic(() => import("./ThumbnailFactory"), { ssr: false, loading: () => <div className="w-full aspect-video bg-neutral-900 animate-pulse rounded-xl" /> });
const PublishingControl = dynamic(() => import("./PublishingControl"), { ssr: false });
import { getReachForecast, ReachForecast } from "../utils/reach-service";
import { transmuteAction } from "../actions/transmute";
import SVGDiagramGenerator from "./SVGDiagramGenerator";
import { generateDiagramData, DiagramData } from "../utils/diagram-service";
import PostingGraph from "./PostingGraph";
import { archiveStrategy } from "../utils/archive-service";
import { VISUAL_THEMES, VisualThemeId } from "../utils/theme-service";
import { publishToPlatform } from "../utils/platform-api";
import { Globe, ShieldAlert } from "lucide-react";
const AdversarialConsole = dynamic(() => import("./AdversarialConsole"), { ssr: false });
const CitationEngine = dynamic(() => import("./CitationEngine"), { ssr: false });
const VisualStudio = dynamic(() => import("./VisualStudio"), { ssr: false });
import TruthShield from "./TruthShield";
import { performDeepResearch } from "../utils/research-agent";
import { extractProprietarySparks, ProprietarySpark } from "../utils/insight-extractor";
import { generateVisualAssets, DesignAsset } from "../utils/visual-engine";

interface AssetDisplayProps {
  assets: GeneratedAssets;
  linkedinClientId: string;
  onRate: (rating: "viral" | "good" | "meh" | "flopped") => void;
  onUpdateAssets: (newAssets: GeneratedAssets) => void;
  geminiKey?: string;
  personaId?: string;
}

type PerformanceRating = "viral" | "good" | "meh" | "flopped" | null;

import { explainPost, Explanation } from "../utils/explainer-service";

export default function AssetDisplay({ assets, linkedinClientId, onRate, onUpdateAssets, geminiKey, personaId }: AssetDisplayProps) {
  const [activeTab, setActiveTab] = useState<"text" | "preview" | "image" | "video" | "carousel" | "visual" | "x" | "substack" | "audio" | "thumbnail" | "visual-studio" | "visuals">("text");
  const [isClient, setIsClient] = useState(false);
  const [userRating, setUserRating] = useState<PerformanceRating>(null);
  const [remixModalOpen, setRemixModalOpen] = useState(false);
  const [isRemixing, setIsRemixing] = useState(false);
  const [remixType, setRemixType] = useState<"punchier" | "story" | "contrarian">("punchier");
  
  // Explanation State
  const [explanation, setExplanation] = useState<Explanation[] | null>(null);
  const [isExplaining, setIsExplaining] = useState(false);

  // Reach Forecast State
  const [reachForecast, setReachForecast] = useState<ReachForecast | null>(null);

  // Transmutation & Asset Data State
  const [isTransmuting, setIsTransmuting] = useState(false);
  const [diagramData, setDiagramData] = useState<DiagramData | null>(null);
  const [isDiagramLoading, setIsDiagramLoading] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<VisualThemeId>("noir");
  const [adversarialOpen, setAdversarialOpen] = useState(false);
  const [isResearching, setIsResearching] = useState(false);
  // Visual Engine State
  const [visuals, setVisuals] = useState<DesignAsset[]>([]);
  const [isVisualsLoading, setIsVisualsLoading] = useState(false);
  const [sparks, setSparks] = useState<ProprietarySpark[]>([]);

  const content = {
    text: assets.textPost,
    preview: assets.textPost,
    image: "", 
    carousel: "",
    video: assets.videoScript || assets.textPost,
    x: assets.xThread?.join("\n\n---\n\n") || "No thread generated.",
    substack: assets.substackEssay || "No essay generated.",
    visual: assets.visualConcept || "",
    thumbnail: assets.thumbnailPrompt || "No concept generated.",
    audio: assets.textPost || "",
    "visual-studio": "",
    "visuals": ""
  };

  useState(() => {
    setIsClient(true);
    // Auto-fetch forecast
    if (assets.textPost && geminiKey) {
        getReachForecast(assets.textPost, geminiKey).then(setReachForecast);
    }
  });

  const handleCopy = () => {
    const textToCopy = content[activeTab as keyof typeof content] || assets.textPost;
    navigator.clipboard.writeText(textToCopy);
  };

  const handleRate = (rating: PerformanceRating) => {
    setUserRating(rating);
    if (rating) onRate(rating);
  };
    
  const handleExplain = async () => {
      if (!geminiKey) return;
      setIsExplaining(true);
      const expl = await explainPost(assets.textPost, geminiKey);
      setExplanation(expl);
      setIsExplaining(false);
  };

  const handleRemix = async () => {
    setIsRemixing(true);
    // Mock remix delay for now, or hook up remix-service later
    setTimeout(() => setIsRemixing(false), 2000);
  };

  const handleTransmute = async (target: "x" | "substack") => {
    if (!geminiKey || isTransmuting) return;
    setIsTransmuting(true);
    
    try {
      const res = await transmuteAction(assets.textPost, "linkedin", target === "x" ? "twitter" : "substack", geminiKey);
      if (res.success && res.content) {
        onUpdateAssets({
          ...assets,
          [target === "x" ? "xThread" : "substackEssay"]: target === "x" ? res.content.split("\n\n---\n\n") : res.content
        });
      }
    } catch (e) {
      console.error("Transmutation failed", e);
    } finally {
      setIsTransmuting(false);
    }
  };

  const handleGenerateVisuals = async () => {
      if (!geminiKey || isVisualsLoading) return;
      setIsVisualsLoading(true);
      try {
          const generatedAssets = await generateVisualAssets(assets.textPost, geminiKey);
          setVisuals(generatedAssets);
          setActiveTab('visual-studio');
      } catch (e) {
          console.error("Visual generation failed", e);
      } finally {
          setIsVisualsLoading(false);
      }
  };

  const handleDeepResearch = async () => {
    if (!geminiKey || isResearching) return;
    setIsResearching(true);
    try {
        // Serper key is expected from environment or passed via props if available
        // For now using geminiKey as placeholder to findTrends if search-service supports it
        const insights = await performDeepResearch(assets.textPost.substring(0, 100), geminiKey, process.env.NEXT_PUBLIC_SERPER_API_KEY || "");
        const extractedSparks = await extractProprietarySparks(insights, geminiKey);
        setSparks(extractedSparks);
    } catch (e) {
        console.error("Deep Research failed", e);
    } finally {
        setIsResearching(false);
    }
  };

  const handleGenerateDiagram = async () => {
    if (!geminiKey || isDiagramLoading) return;
    setIsDiagramLoading(true);
    try {
      const data = await generateDiagramData(assets.textPost, geminiKey);
      setDiagramData(data);
      await archiveStrategy(data.title, JSON.stringify(data), 'svg');
    } catch (e) {
      console.error("Diagram generation failed", e);
    } finally {
      setIsDiagramLoading(false);
    }
  };

  const handleShareEmail = () => {
      const subject = encodeURIComponent("Draft Post for Review");
      const body = encodeURIComponent(`Here is a draft post generated for you:\n\n${assets.textPost}\n\nThinking of posting this? Let me know!`);
      window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const handleCopySlack = () => {
      // Format as a quote block
      const slackText = `> ${assets.textPost.replace(/\n/g, "\n> ")}`;
      navigator.clipboard.writeText(slackText);
      showToast("Copied content (Slack format)", "success");
  };

  function showToast(message: string, type: "success" | "error") {
      // Simple mock since we don't have access to the context here easily without refactor
      // Ideally pass toast function down
      alert(message); 
  }


  const tabs = [
    { id: "text", label: "LINKEDIN", icon: FileText },
    { id: "x", label: "X THREAD", icon: MessageSquare },
    { id: "substack", label: "SUBSTACK", icon: LayoutGrid },
    { id: "preview", label: "PREVIEW", icon: Eye },
    { id: "video", label: "VIDEO DIRECTOR", icon: Video },
    { id: "audio", label: "AUDIO STUDIO", icon: Mic },
    { id: "thumbnail", label: "THUMBNAIL", icon: ImageIcon },
    { id: "visual", label: "DIAGRAM", icon: Sparkles },
    { id: "carousel", label: "CAROUSEL", icon: Layers },
  ] as const;

  // Placeholder removed as it was moved up
  
  // Generate slides for preview/PDF
  const slides = assets.textPost.split("\n\n").map((text) => ({
    title: text.length > 50 ? text.substring(0, 50) + "..." : text,
    content: text
  }));

  if (!isClient) return null;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 animate-in fade-in duration-700">
      
      {/* 2028 Reach Forecast Header */}
      {reachForecast && (
        <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel p-6 rounded-xl border border-white/5 bg-gradient-to-r from-indigo-900/20 to-purple-900/20 flex items-center justify-between"
        >
            <div className="flex items-center gap-4">
                 <div className="p-3 bg-indigo-500/20 rounded-full border border-indigo-500/30">
                    <Sparkles className="w-5 h-5 text-indigo-400" />
                 </div>
                 <div>
                    <h4 className="text-sm font-bold text-white tracking-wide">REACH FORECAST</h4>
                    <p className="text-xs text-indigo-300 font-mono mt-1">
                        EST. IMPRESSIONS: <span className="text-white font-bold">{reachForecast.estimatedImpressions}</span> • confidence: {reachForecast.confidenceScore}/100
                    </p>
                 </div>
            </div>
            <div className="text-right">
                <div className="text-xs text-neutral-400 font-mono uppercase tracking-widest mb-1">Virality Probability</div>
                <div className="text-xl font-bold text-white">{reachForecast.viralProbability}</div>
            </div>
        </motion.div>
      )}

      {/* 2028 Posting Graph */}
      {reachForecast && reachForecast.optimalPostingTimes && (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
        >
            <PostingGraph times={reachForecast.optimalPostingTimes} />
        </motion.div>
      )}

      {/* Feedback / Rating Section */}
      {!userRating && (
            <div className="flex justify-center gap-4 py-4" aria-label="Rate this generation">
                <span className="text-xs font-mono text-neutral-500 self-center uppercase tracking-widest mr-2">Rate Output:</span>
                <button onClick={() => handleRate("viral")} className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all ${userRating === "viral" ? "bg-purple-500/20 border-purple-500 text-purple-400" : "bg-neutral-900 border-neutral-800 text-neutral-500 hover:border-purple-900 hover:text-purple-400"}`}>
                    <Sparkles className="w-4 h-4" /> <span className="text-xs font-bold">VIRAL</span>
                </button>
                <button onClick={() => handleRate("good")} className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all ${userRating === "good" ? "bg-blue-500/20 border-blue-500 text-blue-400" : "bg-neutral-900 border-neutral-800 text-neutral-500 hover:border-blue-900 hover:text-blue-400"}`}>
                    <ThumbsUp className="w-4 h-4" /> <span className="text-xs font-bold">GOOD</span>
                </button>
                <button onClick={() => handleRate("meh")} className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all ${userRating === "meh" ? "bg-yellow-500/20 border-yellow-500 text-yellow-400" : "bg-neutral-900 border-neutral-800 text-neutral-500 hover:border-yellow-900 hover:text-yellow-400"}`}>
                    <Minus className="w-4 h-4" /> <span className="text-xs font-bold">MEH</span>
                </button>
                <button onClick={() => handleRate("flopped")} className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all ${userRating === "flopped" ? "bg-red-500/20 border-red-500 text-red-400" : "bg-neutral-900 border-neutral-800 text-neutral-500 hover:border-red-900 hover:text-red-400"}`}>
                    <ThumbsDown className="w-4 h-4" /> <span className="text-xs font-bold">FLOPPED</span>
                </button>
            </div>
        )}

      <div className="flex p-1 bg-black/40 backdrop-blur-sm border border-white/10 rounded-full mb-8 overflow-x-auto w-fit mx-auto custom-scrollbar">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 px-5 py-2.5 text-xs font-bold rounded-full transition-all whitespace-nowrap ${
                isActive
                  ? "bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                  : "text-neutral-500 hover:text-white hover:bg-white/5"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <motion.div
        key={activeTab}
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
        className="glass-panel rounded-2xl p-8 relative min-h-[400px] border border-white/5 bg-black/40 shadow-2xl overflow-hidden"
      >
        {/* Specular Highlight */}
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-80" />
        <div className="absolute top-0 left-0 w-full h-[200px] bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
        
        {activeTab === "image" && assets.imageUrl ? (
          <div className="space-y-4">
            <div className="relative group">
               {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={assets.imageUrl} 
                alt="Generated Asset" 
                className="w-full h-auto rounded-md border border-neutral-800"
              />
              <a 
                href={assets.imageUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="absolute top-2 right-2 bg-white text-black text-xs font-bold px-3 py-1.5 rounded shadow-lg hover:bg-neutral-200 transition-colors"
                download
              >
                DOWNLOAD
              </a>
            </div>
            <div className="pt-4 border-t border-neutral-900">
               <span className="text-xs font-mono text-neutral-500 block mb-2">PROMPT USED:</span>
               <p className="font-mono text-xs text-neutral-400">{assets.imagePrompt}</p>
            </div>
          </div>
        ) : activeTab === "preview" ? (
            <div className="py-4">
                <div className="text-center mb-4">
                    <span className="text-xs font-mono text-neutral-500">PREVIEW: How it will look on LinkedIn</span>
                </div>
                <LinkedInPreview content={assets.textPost} />
            </div>
        ) : activeTab === "carousel" ? (
             <div className="space-y-6 text-left">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-white font-bold text-lg">High-Fidelity Carousel Builder</h3>
                      <p className="text-neutral-500 text-xs">Convert strategy into viral-ready PDF slides.</p>
                    </div>
                  </div>
                  
                  <div className="h-px w-full bg-white/5" />

                  <CarouselBuilder initialPost={assets.textPost} apiKey={geminiKey || ""} />
             </div>
        ) : activeTab === "visual" ? (
            <div className="space-y-6 text-left">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-white font-bold text-lg">Visual Strategy Engine</h3>
                        <p className="text-neutral-500 text-xs">Generate minimalist "Visualize Value" style diagrams.</p>
                    </div>
                </div>
                
                {diagramData ? (
                    <SVGDiagramGenerator data={diagramData} />
                ) : (
                    <button 
                        onClick={handleGenerateDiagram}
                        disabled={isDiagramLoading}
                        className="w-full h-40 bg-white/5 border border-white/10 border-dashed rounded-3xl flex flex-col items-center justify-center gap-3 text-neutral-500 hover:text-white hover:bg-white/10 transition-all"
                    >
                        {isDiagramLoading ? <Loader2 className="w-8 h-8 animate-spin" /> : <Sparkles className="w-8 h-8" />}
                        <span className="text-xs font-bold uppercase tracking-widest">Generate Tactical Diagram</span>
                    </button>
                )}
                
                <div className="pt-6 border-t border-white/5">
                    <VisualGenerator concept={assets.visualConcept || assets.textPost.substring(0, 20)} apiKey={geminiKey || ""} />
                </div>
            </div>
        ) : activeTab === "visual-studio" ? (
             <VisualStudio assets={visuals} />
        ) : activeTab === "audio" ? (
             <AudioStudio script={assets.textPost} apiKey={geminiKey} />
        ) : activeTab === "video" ? (
             <VideoDirector script={assets.textPost} apiKey={geminiKey} />
        ) : activeTab === "thumbnail" ? (
             <ThumbnailFactory 
                title={assets.textPost ? assets.textPost.split('\n')[0].substring(0, 30) : "REVOLUTIONARY STRATEGY"} 
                prompt={assets.thumbnailPrompt || "High contrast"} 
             />
        ) : (
            <>
                <div className="absolute top-4 right-4 flex items-center gap-2">
                    {activeTab === "text" && (
                        <div className="flex items-center gap-2">
                             
                             <PublishingControl 
                                content={assets.textPost}
                                imageUrl={assets.imageUrl}
                                personaId={personaId}
                                title={assets.textPost.split('\n')[0].substring(0, 50)}
                             />

                             <button
                                onClick={() => {
                                    const { voiceService } = require("../utils/voice-service");
                                    voiceService.speak(assets.textPost);
                                }}
                                className="flex items-center gap-2 px-3 py-1.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/50 rounded-md text-[10px] font-bold uppercase tracking-wider hover:bg-indigo-500 hover:text-white transition-all ml-2"
                                title="Read Strategy Aloud"
                             >
                                <Mic className="w-3 h-3" />
                                LISTEN
                             </button>

                             <button
                                onClick={() => setAdversarialOpen(true)}
                                className="flex items-center gap-2 px-3 py-1.5 bg-red-950/30 text-red-500 border border-red-500/30 rounded-md text-[10px] font-black uppercase tracking-wider hover:bg-red-500 hover:text-white transition-all ml-2"
                                title="Stress Test Strategy"
                             >
                                <Sword className="w-3 h-3" />
                                STRESS TEST
                             </button>

                             <button 
                  onClick={handleGenerateVisuals}
                  disabled={isVisualsLoading}
                  className={`p-3 bg-pink-500/10 hover:bg-pink-500/20 text-pink-400 rounded-xl transition-all border border-pink-500/20 group relative ${isVisualsLoading ? 'animate-pulse' : ''}`}
                  title="Auto-Design: Generate Diagrams & Cards"
                >
                  <Layout className="w-5 h-5" />
                </button>

                <div className="w-px h-8 bg-white/5 mx-2" />
                            <button
                                onClick={handleRemix}
                                disabled={isRemixing}
                                className="p-2 text-neutral-500 hover:text-purple-400 transition-colors rounded-md bg-neutral-900 border border-neutral-800 hover:border-purple-900 disabled:opacity-50"
                            >
                                <RefreshCw className={`w-4 h-4 ${isRemixing ? 'animate-spin' : ''}`} />
                            </button>
                            
                            <div className="flex items-center bg-neutral-900 border border-neutral-800 rounded-md">
                                <button
                                    onClick={handleCopy}
                                    className="p-2 text-neutral-500 hover:text-white transition-colors border-r border-neutral-800"
                                    title="Copy Text"
                                >
                                    <Copy className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={handleShareEmail}
                                    className="p-2 text-neutral-500 hover:text-white transition-colors border-r border-neutral-800"
                                    title="Send via Email"
                                >
                                    <Mail className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={handleCopySlack}
                                    className="p-2 text-neutral-500 hover:text-white transition-colors"
                                    title="Copy for Slack (> Quote)"
                                >
                                    <MessageSquare className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="prose prose-invert max-w-none">
                    {(activeTab === "x" && !assets.xThread?.length) || (activeTab === "substack" && !assets.substackEssay) ? (
                        <div className="h-[300px] flex flex-col items-center justify-center gap-6 border-2 border-white/5 border-dashed rounded-3xl">
                            <div className="p-4 bg-white/5 rounded-full">
                                <Zap className="w-8 h-8 text-neutral-600" />
                            </div>
                            <div className="text-center">
                                <h4 className="text-white font-bold mb-1">Content Missing</h4>
                                <p className="text-xs text-neutral-500">Transmute this strategy for {activeTab === "x" ? "X (Twitter)" : "Substack"}</p>
                            </div>
                            <button 
                                onClick={() => handleTransmute(activeTab as any)}
                                disabled={isTransmuting}
                                className="px-8 py-3 bg-white text-black font-black rounded-2xl text-[10px] tracking-tighter hover:scale-105 transition-all shadow-xl shadow-white/5 flex items-center gap-2"
                            >
                                {isTransmuting ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                                TRANSMUTE NOW
                            </button>
                        </div>
                    ) : (
                        <ReactMarkdown
                            components={{
                                h1: ({node, ...props}) => <h1 className="text-xl font-bold text-white mb-4" {...props} />,
                                h2: ({node, ...props}) => <h2 className="text-lg font-bold text-white mt-6 mb-3" {...props} />,
                                p: ({node, ...props}) => <p className="text-neutral-300 leading-relaxed mb-4 text-sm" {...props} />,
                                ul: ({node, ...props}) => <ul className="list-disc pl-4 space-y-2 mb-4 text-neutral-300 text-sm" {...props} />,
                                li: ({node, ...props}) => <li className="" {...props} />,
                                strong: ({node, ...props}) => <strong className="font-bold text-white" {...props} />,
                            }}
                        >
                            {content[activeTab as keyof typeof content] || "No content generated."}
                        </ReactMarkdown>
                    )}
                </div>
                
                 {/* Explain Logic Section */}
                 {activeTab === "text" && (
                    <div className="mt-8 pt-6 border-t border-white/5">
                        <TruthShield content={assets.textPost} apiKey={geminiKey} />
                        
                        <button 
                            onClick={handleExplain}
                            className="text-xs font-mono text-neutral-500 hover:text-white flex items-center gap-2 transition-colors mb-4 mt-8"
                        >
                            <Sparkles className="w-3 h-3" />
                            {isExplaining ? "ANALYZING PSYCHOLOGY..." : "REVEAL BEHIND-THE-SCENES LOGIC"}
                        </button>
                        
                        <AnimatePresence>
                        {explanation && (
                            <motion.div 
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="space-y-4"
                            >
                                {explanation.map((item, idx) => (
                                    <div key={idx} className="bg-indigo-900/20 border border-indigo-500/20 rounded-lg p-4">
                                        <h4 className="text-indigo-400 text-xs font-bold uppercase tracking-wider mb-2">{item.pattern}</h4>
                                        <div className="flex items-start gap-2 text-xs text-neutral-400">
                                            <Check className="w-3 h-3 text-green-500 mt-0.5" />
                                            <span>{item.reason}</span>
                                        </div>
                                    </div>
                                ))}
                            </motion.div>
                        )}
                        </AnimatePresence>
                    </div>
                )}
            </>
        )}
      </motion.div>
      <AdversarialConsole 
        isOpen={adversarialOpen}
        onClose={() => setAdversarialOpen(false)}
        content={assets.textPost}
        apiKey={geminiKey || ""}
      />
    </div>
  );
}
