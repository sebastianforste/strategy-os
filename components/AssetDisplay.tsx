"use client";

import { useState } from "react";
import { Copy, RefreshCw, ThumbsUp, ThumbsDown, Minus, ArrowRight, Eye, FileText, Check, MessageSquare, LayoutGrid, ImageIcon, Sparkles, Video, Layers, Mic } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import dynamic from "next/dynamic";
import { GeneratedAssets } from "../utils/ai-service";
import LinkedInPreview from "./LinkedInPreview";

// Lazy loaded feature components
const CarouselGenerator = dynamic(() => import("./CarouselGenerator"), { ssr: false, loading: () => <div className="w-full h-20 bg-neutral-900 animate-pulse rounded-xl" /> });
const VisualGenerator = dynamic(() => import("./VisualGenerator"), { ssr: false, loading: () => <div className="w-full aspect-square bg-neutral-900 animate-pulse rounded-xl" /> });
const VideoDirector = dynamic(() => import("./VideoDirector"), { ssr: false, loading: () => <div className="w-full h-[600px] bg-neutral-900 animate-pulse rounded-xl" /> });
const AudioStudio = dynamic(() => import("./AudioStudio"), { ssr: false, loading: () => <div className="w-full h-64 bg-neutral-900 animate-pulse rounded-xl" /> });
const ThumbnailFactory = dynamic(() => import("./ThumbnailFactory"), { ssr: false, loading: () => <div className="w-full aspect-video bg-neutral-900 animate-pulse rounded-xl" /> });
const PublishingControl = dynamic(() => import("./PublishingControl"), { ssr: false });
import { getReachForecast, ReachForecast } from "../utils/reach-service";

interface AssetDisplayProps {
  assets: GeneratedAssets;
  linkedinClientId: string;
  onRate: (rating: "viral" | "good" | "meh" | "flopped") => void;
  onUpdateAssets: (newAssets: GeneratedAssets) => void;
  geminiKey?: string;
}

type PerformanceRating = "viral" | "good" | "meh" | "flopped" | null;

import { explainPost, Explanation } from "../utils/explainer-service";

export default function AssetDisplay({ assets, linkedinClientId, onRate, onUpdateAssets, geminiKey }: AssetDisplayProps) {
  const [activeTab, setActiveTab] = useState<"text" | "preview" | "image" | "video" | "carousel" | "visual" | "x" | "substack" | "audio" | "thumbnail">("text");
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

  useState(() => {
    setIsClient(true);
    // Auto-fetch forecast
    if (assets.textPost && geminiKey) {
        getReachForecast(assets.textPost, geminiKey).then(setReachForecast);
    }
  });

  const handleCopy = () => {
    navigator.clipboard.writeText(content[activeTab as keyof typeof content] || "");
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

  const content = {
    text: assets.textPost,
    preview: assets.textPost,
    image: "", // Placeholder logic
    carousel: "",
    video: assets.videoScript || "No video script generated.",
    x: assets.xThread?.join("\n\n---\n\n") || "No thread generated.",
    substack: assets.substackEssay || "No essay generated.",
    visual: "",
    thumbnail: assets.thumbnailPrompt || "No concept generated.",
    audio: assets.textPost || "",
  };
  
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
             <div className="space-y-4">
                  <h3 className="text-white font-bold text-lg mb-2">PDF Carousel Factory</h3>
                  <p className="text-neutral-500 text-xs mb-4">Auto-convert your post into a high-design carousel document.</p>
                  <CarouselGenerator post={assets.textPost} apiKey={geminiKey || ""} />
             </div>
        ) : activeTab === "video" ? (
             <VideoDirector script={content.video || assets.videoScript || "No script available."} />
        ) : activeTab === "audio" ? (
             <AudioStudio script={content.video || assets.videoScript || assets.textPost || "No script available."} />
        ) : activeTab === "thumbnail" ? (
             <ThumbnailFactory 
                title={assets.textPost ? assets.textPost.split('\n')[0].substring(0, 30) : "REVOLUTIONARY STRATEGY"} 
                prompt={assets.thumbnailPrompt || "High contrast"} 
             />
        ) : activeTab === "visual" ? (
            <div className="space-y-4">
                <h3 className="text-white font-bold text-lg mb-2">Visual Factory</h3>
                 <p className="text-neutral-500 text-xs mb-4">Generate minimalist "Visualize Value" style diagrams.</p>
                <VisualGenerator concept={assets.textPost.substring(0, 50)} apiKey={geminiKey || ""} />
            </div>
        ) : (
            <>
                <div className="absolute top-4 right-4 flex items-center gap-2">
                    {activeTab === "text" && (
                        <div className="flex items-center gap-2">
                             <PublishingControl />
                             <div className="w-px h-6 bg-white/10 mx-2" />
                            {/* Remix Button */}
                            <button
                                onClick={handleRemix}
                                disabled={isRemixing}
                                className="p-2 text-neutral-500 hover:text-purple-400 transition-colors rounded-md bg-neutral-900 border border-neutral-800 hover:border-purple-900 disabled:opacity-50"
                                title="Generate Variations"
                            >
                                <RefreshCw className={`w-4 h-4 ${isRemixing ? 'animate-spin' : ''}`} />
                            </button>
                            <button
                                onClick={handleCopy}
                                className="p-2 text-neutral-500 hover:text-white transition-colors rounded-md bg-neutral-900 border border-neutral-800 hover:border-neutral-700"
                                title="Copy to Clipboard"
                            >
                                <Copy className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>

                <div className="prose prose-invert max-w-none">
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
                </div>
                
                 {/* Explain Logic Section */}
                 {activeTab === "text" && (
                    <div className="mt-8 pt-6 border-t border-white/5">
                        <button 
                            onClick={handleExplain}
                            className="text-xs font-mono text-neutral-500 hover:text-white flex items-center gap-2 transition-colors mb-4"
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
    </div>
  );
}
