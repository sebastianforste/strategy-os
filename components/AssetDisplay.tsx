"use client";

import { motion } from "framer-motion";
import { Copy, Check, Image as ImageIcon, Video, FileText, Layers, Download, Bookmark } from "lucide-react";
import { useState, useEffect } from "react";
import { GeneratedAssets } from "../utils/ai-service";
import PostButton from "./PostButton";
import { transformTextToSlides } from "../utils/carousel-generator";
import dynamic from "next/dynamic";

// Dynamic import for PDF components to avoid SSR issues
const PDFDownloadLink = dynamic(
  () => import("@react-pdf/renderer").then((mod) => mod.PDFDownloadLink),
  {
    ssr: false,
    loading: () => <span className="text-xs">Loading PDF Engine...</span>,
  }
);

const CarouselPDF = dynamic(() => import("./CarouselPDF"), { ssr: false });
import ExportMenu from "./ExportMenu";

interface AssetDisplayProps {
  assets: GeneratedAssets;
  linkedinClientId?: string;
}

export default function AssetDisplay({ assets, linkedinClientId }: AssetDisplayProps) {
  const [activeTab, setActiveTab] = useState<"text" | "image" | "video" | "carousel">("text");
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

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
      <div className="flex border-b border-neutral-800 mb-6 overflow-x-auto">
        {tabs.map((tab) => {
            // @ts-ignore
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
                         <div className="bg-white text-black px-4 py-2 rounded-lg font-bold text-xs hover:bg-neutral-200 transition-colors flex items-center gap-2">
                             <Download className="w-4 h-4" />
                             <PDFDownloadLink
                                document={<CarouselPDF slides={slides} />}
                                fileName="strategy_os_carousel.pdf"
                             >
                                {({ loading }) => (loading ? "GENERATING..." : "DOWNLOAD PDF")}
                             </PDFDownloadLink>
                         </div>
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
                    {/* @ts-ignore */}
                     {/* Replaced simple CopyButton with full ExportMenu for Text Tab */}
                     {activeTab === "text" ? (
                        <ExportMenu content={content.text} />
                     ) : (
                        <CopyButton text={content[activeTab]} />
                     )}
                </div>
                <pre className="font-mono text-sm text-neutral-300 whitespace-pre-wrap leading-relaxed mt-2 p-2">
                {/* @ts-ignore */}
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
