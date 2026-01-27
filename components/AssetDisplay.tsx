"use client";

import { motion } from "framer-motion";
import { Copy, Check, Image as ImageIcon, Video, FileText, Layers, Bookmark, TrendingUp, ThumbsUp, Minus, ThumbsDown, RefreshCw, Sparkles, Eye, MessageSquare, Calendar, Mic } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { GeneratedAssets } from "../utils/ai-service";
import PostButton from "./PostButton";
import { transformTextToSlides } from "../utils/carousel-generator";
import ExportMenu from "./ExportMenu";
import { PerformanceRating } from "../utils/history-service";
import RemixModal from "./RemixModal";
import { generateRemixes, RemixResult } from "../utils/remix-service";
import LinkedInPreview from "./LinkedInPreview";
import CommentsPanel from "./CommentsPanel";
import { schedulePost } from "../utils/schedule-service";
import { saveTemplate } from "../utils/template-service";

// Consolidated PDF Download Button (lazy loaded)
const CarouselDownloadButton = dynamic(() => import("./CarouselDownloadButton"), { 
  ssr: false,
  loading: () => <div className="w-32 h-10 bg-neutral-800 rounded animate-pulse" />
});

interface AssetDisplayProps {
  assets: GeneratedAssets;
  linkedinClientId?: string;
  onRate?: (rating: PerformanceRating) => void;
  onUpdateAssets?: (assets: GeneratedAssets) => void;
  geminiKey?: string;
}

import { explainPost, Explanation } from "../utils/explainer-service";

export default function AssetDisplay({ assets, linkedinClientId, onRate, onUpdateAssets, geminiKey }: AssetDisplayProps) {
  const [activeTab, setActiveTab] = useState<"text" | "preview" | "image" | "video" | "carousel">("text");
  const [isClient, setIsClient] = useState(false);
  const [userRating, setUserRating] = useState<PerformanceRating>(null);
  const [remixModalOpen, setRemixModalOpen] = useState(false);
  const [remixes, setRemixes] = useState<RemixResult[]>([]);
  const [isRemixing, setIsRemixing] = useState(false);
  const [explanations, setExplanations] = useState<Explanation[]>([]);
  const [isExplaining, setIsExplaining] = useState(false);
  const [showExplainer, setShowExplainer] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleExplain = useCallback(async () => {
    if (!geminiKey) return;
    setIsExplaining(true);
    try {
      const results = await explainPost(assets.textPost, geminiKey);
      setExplanations(results);
      setShowExplainer(results.length > 0);
    } catch (e) {
      console.error("Explain failed:", e);
    } finally {
      setIsExplaining(false);
    }
  }, [assets.textPost, geminiKey]);

  // Auto-explain on first load
  useEffect(() => {
    if (geminiKey && assets.textPost && !explanations.length && !isExplaining) {
      handleExplain();
    }
  }, [assets.textPost, geminiKey, explanations.length, handleExplain, isExplaining]);

  const handleRate = (rating: PerformanceRating) => {
      setUserRating(rating);
      if (onRate) onRate(rating);
  };


  const handleRemix = async () => {
    if (!geminiKey) {
      alert("Gemini API key required for remixing.");
      return;
    }
    setRemixModalOpen(true);
    setIsRemixing(true);
    try {
      const results = await generateRemixes(assets.textPost, geminiKey);
      setRemixes(results);
    } catch (e) {
      console.error("Remix failed:", e);
    } finally {
      setIsRemixing(false);
    }
  };

  const handleSelectRemix = (content: string) => {
    if (onUpdateAssets) {
      onUpdateAssets({ ...assets, textPost: content });
    }
  };

  const handleSchedule = () => {
    const dateTimeStr = prompt("When do you want to schedule this post? (YYYY-MM-DD HH:MM)", 
      new Date(Date.now() + 86400000).toISOString().slice(0, 16).replace('T', ' ')
    );
    
    if (dateTimeStr) {
      const timestamp = Date.parse(dateTimeStr.replace(' ', 'T'));
      if (isNaN(timestamp)) {
        alert("Invalid date format. Please use YYYY-MM-DD HH:MM");
        return;
      }
      
      schedulePost(assets, timestamp);
      alert("Post scheduled for " + new Date(timestamp).toLocaleString());
    }
  };

  const tabs = [
    { id: "text", label: "LINKEDIN POST", icon: FileText },
    { id: "preview", label: "PREVIEW", icon: Eye },
    { id: "image", label: "IMAGE PROMPT", icon: ImageIcon },
    { id: "video", label: "VIDEO SCRIPT", icon: Video },
    { id: "audio", label: "VOICE NOTE", icon: Mic },
    { id: "carousel", label: "CAROUSEL PDF", icon: Layers },
  ] as const;

  const content = {
    text: assets.textPost || "No text generated.",
    preview: assets.textPost || "",
    image: assets.imagePrompt || "No image prompt generated.",
    video: assets.videoScript || "No video script generated.",
    audio: assets.audioScript || "[Audio script not generated. Re-generate to include voice note script.]",
    carousel: "", // Placeholder, derived from text
  };
  
  // Generate slides for preview/PDF
  const slides = transformTextToSlides(assets.textPost);

  return (
    <div className="w-full max-w-3xl mx-auto mt-12">
        {/* Rating Bar */}
        {onRate && (
            <div className="flex justify-center mb-8 gap-3">
                <button onClick={() => handleRate("viral")} className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all ${userRating === "viral" ? "bg-green-500/20 border-green-500 text-green-400" : "bg-neutral-900 border-neutral-800 text-neutral-500 hover:border-green-900 hover:text-green-400"}`}>
                    <TrendingUp className="w-4 h-4" /> <span className="text-xs font-bold">VIRAL</span>
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

      <div className="flex p-1 bg-black/40 backdrop-blur-sm border border-white/10 rounded-full mb-8 overflow-x-auto w-fit mx-auto">
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
            <div className="space-y-8">
                <div className="flex items-center justify-between pb-4 border-b border-neutral-900">
                    <div>
                        <h3 className="text-white font-bold text-lg">PDF Carousel</h3>
                        <p className="text-neutral-500 text-xs mt-1">
                            {slides.length} slides generated from your post.
                        </p>
                    </div>
                    {isClient && (
                         <CarouselDownloadButton 
                            slides={slides}
                            fileName="strategy_os_carousel.pdf" 
                         />
                    )}
                </div>
                
                {/* Visual Preview Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {slides.map((slide, index) => {
                        const accentColors = ['#3b82f6', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b'];
                        const accentColor = accentColors[index % accentColors.length];
                        
                        return (
                            <div key={slide.id} className="aspect-[4/5] bg-black/40 border border-white/10 rounded-xl flex flex-col relative overflow-hidden group backdrop-blur-md">
                                {/* Accent bar */}
                                <div className="h-1 w-full" style={{ backgroundColor: accentColor }} />
                                
                                {/* Corner decorations */}
                                <div className="absolute top-4 left-4 w-6 h-6">
                                    <div className="absolute top-0 left-0 w-4 h-0.5" style={{ backgroundColor: accentColor }} />
                                    <div className="absolute top-0 left-0 w-0.5 h-4" style={{ backgroundColor: accentColor }} />
                                </div>
                                <div className="absolute bottom-4 right-4 w-6 h-6">
                                    <div className="absolute bottom-0 right-0 w-4 h-0.5" style={{ backgroundColor: accentColor }} />
                                    <div className="absolute bottom-0 right-0 w-0.5 h-4" style={{ backgroundColor: accentColor }} />
                                </div>
                                
                                {/* Content */}
                                <div className="flex-1 flex items-center justify-center p-4">
                                    <p className={`text-white text-center font-bold ${slide.type === 'cover' ? 'text-lg' : 'text-xs'}`}>
                                        {slide.content.length > 50 && slide.type !== 'cover' 
                                            ? slide.content.substring(0, 50) + "..." 
                                            : slide.content}
                                    </p>
                                </div>
                                
                                {/* Slide number */}
                                <div className="absolute bottom-2 left-4 text-[10px] font-mono" style={{ color: accentColor }}>
                                    {slide.id} / {slides.length}
                                </div>
                                
                                {/* Hover overlay */}
                                <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                            </div>
                        );
                    })}
                </div>
            </div>
        ) : (
            <>
                <div className="absolute top-4 right-4 flex items-center gap-2">
                    {activeTab === "text" && (
                        <div className="flex items-center gap-2">
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
                                onClick={() => {
                                    const name = prompt("Enter a name for this template:");
                                    if(name) {
                                        saveTemplate({ name, content: content.text, tags: [] });
                                        alert("Template saved!");
                                    }
                                }}
                                className="p-2 text-neutral-500 hover:text-white transition-colors rounded-md bg-neutral-900 border border-neutral-800"
                                title="Save as Template"
                            >
                                <Bookmark className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setCommentsOpen(!commentsOpen)}
                                className={`p-2 transition-colors rounded-md bg-neutral-900 border border-neutral-800 ${commentsOpen ? 'text-blue-400 border-blue-900' : 'text-neutral-500 hover:text-white'}`}
                                title="Comments"
                            >
                                <MessageSquare className="w-4 h-4" />
                            </button>
                            <button
                                onClick={handleSchedule}
                                className="p-2 text-neutral-500 hover:text-green-400 transition-colors rounded-md bg-neutral-900 border border-neutral-800 hover:border-green-900"
                                title="Schedule Post"
                            >
                                <Calendar className="w-4 h-4" />
                            </button>
                            <PostButton 
                                text={content.text} 
                                clientId={linkedinClientId}
                            />
                        </div>
                    )}
                     {/* Replaced simple CopyButton with full ExportMenu for Text Tab */}
                     {activeTab === "text" ? (
                        <ExportMenu content={content.text} />
                     ) : (
                        <CopyButton text={content[activeTab]} />
                     )}
                </div>
                <pre className="font-mono text-sm text-neutral-300 whitespace-pre-wrap leading-relaxed mt-2 p-2">
                    {content[activeTab]}
                </pre>
            </>
        )}
      </motion.div>

      {/* Why This Works Explainer */}
      {activeTab === "text" && (showExplainer || isExplaining) && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-purple-800/50 rounded-lg p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <h4 className="text-sm font-bold text-white">Why This Works</h4>
            {isExplaining && <span className="text-xs text-neutral-500 ml-2">Analyzing...</span>}
          </div>
          
          {explanations.length > 0 ? (
            <div className="space-y-3">
              {explanations.map((exp, i) => (
                <div key={i} className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-purple-400">{i + 1}</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{exp.pattern}</p>
                    <p className="text-xs text-neutral-400 mt-0.5">{exp.reason}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex justify-center py-4">
              <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </motion.div>
      )}

      {/* Remix Modal */}
      <RemixModal
        isOpen={remixModalOpen}
        onClose={() => setRemixModalOpen(false)}
        remixes={remixes}
        onSelect={handleSelectRemix}
        isLoading={isRemixing}
      />

      {/* Comments Panel */}
      <CommentsPanel 
        assetId={assets.textPost.substring(0, 50)} // Using a snippet of text as assetId proxy
        isOpen={commentsOpen}
        onClose={() => setCommentsOpen(false)}
      />
    </div>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="p-2 text-neutral-500 hover:text-white transition-colors rounded-md bg-neutral-900 border border-neutral-800"
    >
      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
    </button>
  );
}
