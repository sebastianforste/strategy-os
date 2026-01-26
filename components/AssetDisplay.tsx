"use client";

import { motion } from "framer-motion";
import { Copy, Check, Image as ImageIcon, Video, FileText, Layers, Download, Bookmark, TrendingUp, ThumbsUp, Minus, ThumbsDown } from "lucide-react";
import { useState, useEffect } from "react";
import { GeneratedAssets } from "../utils/ai-service";
import PostButton from "./PostButton";
import { transformTextToSlides } from "../utils/carousel-generator";
import CarouselPDF from "./CarouselPDF";
import ExportMenu from "./ExportMenu";
import PDFDownloadButton from "./PDFDownloadButton";
import { PerformanceRating } from "../utils/history-service";

interface AssetDisplayProps {
  assets: GeneratedAssets;
  linkedinClientId?: string;
  onRate?: (rating: PerformanceRating) => void;
}

export default function AssetDisplay({ assets, linkedinClientId, onRate }: AssetDisplayProps) {
  const [activeTab, setActiveTab] = useState<"text" | "image" | "video" | "carousel">("text");
  const [isClient, setIsClient] = useState(false);
  const [userRating, setUserRating] = useState<PerformanceRating>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleRate = (rating: PerformanceRating) => {
      setUserRating(rating);
      if (onRate) onRate(rating);
  };

  const tabs = [
    { id: "text", label: "LINKEDIN POST", icon: FileText },
    { id: "image", label: "IMAGE PROMPT", icon: ImageIcon },
    { id: "video", label: "VIDEO SCRIPT", icon: Video },
    { id: "carousel", label: "CAROUSEL PDF", icon: Layers },
  ] as const;

  const content = {
    text: assets.textPost,
    image: assets.imagePrompt,
    video: assets.videoScript,
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

      <div className="flex border-b border-neutral-800 mb-6 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-4 text-xs font-bold tracking-widest transition-colors whitespace-nowrap ${
                isActive
                  ? "text-white border-b-2 border-white"
                  : "text-neutral-500 hover:text-neutral-300"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <motion.div
        key={activeTab}
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.2 }}
        className="bg-[#0A0A0A] border border-neutral-800 rounded-lg p-8 relative min-h-[300px]"
      >
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
                         <PDFDownloadButton 
                            document={<CarouselPDF slides={slides} />} 
                            fileName="strategy_os_carousel.pdf" 
                         />
                    )}
                </div>
                
                {/* Visual Preview Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {slides.map((slide) => (
                        <div key={slide.id} className="aspect-[4/5] bg-black border border-neutral-800 rounded flex flex-col p-4 relative overflow-hidden group">
                           <div className="flex-1 flex items-center justify-center">
                                <p className={`text-white text-center font-bold ${slide.type === 'cover' ? 'text-lg' : 'text-xs'}`}>
                                    {slide.content.length > 50 && slide.type !== 'cover' 
                                        ? slide.content.substring(0, 50) + "..." 
                                        : slide.content}
                                </p>
                           </div>
                           <div className="absolute top-2 left-2 text-[10px] text-neutral-600 font-mono">
                               {slide.id}
                           </div>
                           <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                        </div>
                    ))}
                </div>
            </div>
        ) : (
            <>
                <div className="absolute top-4 right-4 flex items-center gap-2">
                    {activeTab === "text" && (
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => {
                                    const name = prompt("Enter a name for this template:");
                                    if(name) {
                                        const { saveTemplate } = require("../utils/template-service");
                                        saveTemplate({ name, content: content.text, tags: [] });
                                        alert("Template saved!");
                                    }
                                }}
                                className="p-2 text-neutral-500 hover:text-white transition-colors rounded-md bg-neutral-900 border border-neutral-800"
                                title="Save as Template"
                            >
                                <Bookmark className="w-4 h-4" />
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
