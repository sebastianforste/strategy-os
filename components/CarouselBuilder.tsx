"use client";

import React, { useState, useEffect } from "react";
import { CarouselSlide, generateCarouselStruct, CarouselData } from "../utils/carousel-service";
import CarouselPreview, { CarouselTheme } from "./CarouselPreview";
import CarouselPDF from "./CarouselPDF";
import { pdf } from "@react-pdf/renderer";
import { Loader2, Layout, Download, ChevronLeft, ChevronRight, Wand2, Type } from "lucide-react";

interface CarouselBuilderProps {
  initialPost?: string;
  apiKey: string;
}

export default function CarouselBuilder({ initialPost, apiKey }: CarouselBuilderProps) {
  const [slides, setSlides] = useState<CarouselSlide[]>([]);
  const [theme, setTheme] = useState<CarouselTheme>('viral');
  const [loading, setLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showEditor, setShowEditor] = useState(true);

  // Load initial content if provided
  useEffect(() => {
    if (initialPost) {
        handleGenerate(initialPost);
    }
  }, [initialPost]);

  const handleGenerate = async (content: string) => {
    setLoading(true);
    try {
        const result = await generateCarouselStruct(content, apiKey);
        if (result && result.slides) {
            setSlides(result.slides);
            setCurrentIndex(0);
        }
    } catch (e) {
        console.error("Failed to generate slides", e);
    } finally {
        setLoading(false);
    }
  };

  const updateSlide = (index: number, field: keyof CarouselSlide, value: string) => {
    const newSlides = [...slides];
    newSlides[index] = { ...newSlides[index], [field]: value };
    setSlides(newSlides);
  };

  const handleDownload = async () => {
    if (slides.length === 0) return;
    
    // Generate PDF Blob
    const blob = await pdf(
        <CarouselPDF slides={slides} theme={theme} handle="@StrategyOS" />
    ).toBlob();
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `carousel-${theme}-${Date.now()}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
      return (
          <div className="flex flex-col items-center justify-center p-12 text-neutral-400">
              <Loader2 className="w-8 h-8 animate-spin mb-4 text-orange-500" />
              <p>Analyzing content & designing slides...</p>
          </div>
      );
  }

  if (slides.length === 0) {
      return (
          <div className="text-center p-8 border border-dashed border-white/20 rounded-xl">
              <p className="text-neutral-500 mb-4">No content to convert.</p>
          </div>
      );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8 min-h-[600px] p-6 bg-neutral-900/50 rounded-2xl border border-white/10">
      
      {/* LEFT: PREVIEW AREA */}
      <div className="flex-1 flex flex-col items-center justify-center bg-black/40 rounded-xl p-8 border border-white/5 relative">
        <div className="w-[400px] max-w-full shadow-2xl rounded-lg overflow-hidden ring-1 ring-white/10">
             <CarouselPreview 
                slide={slides[currentIndex]} 
                index={currentIndex} 
                total={slides.length} 
                theme={theme}
             />
        </div>

        {/* Navigation */}
        <div className="flex items-center gap-4 mt-8">
            <button 
                onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
                disabled={currentIndex === 0}
                className="p-2 hover:bg-white/10 rounded-full disabled:opacity-20 transition-all"
            >
                <ChevronLeft className="w-6 h-6" />
            </button>
            <span className="font-mono text-sm text-neutral-400">
                SLIDE {currentIndex + 1} / {slides.length}
            </span>
            <button 
                onClick={() => setCurrentIndex(Math.min(slides.length - 1, currentIndex + 1))}
                disabled={currentIndex === slides.length - 1}
                className="p-2 hover:bg-white/10 rounded-full disabled:opacity-20 transition-all"
            >
                <ChevronRight className="w-6 h-6" />
            </button>
        </div>
      </div>

      {/* RIGHT: CONTROLS & EDITOR */}
      <div className="w-full lg:w-[320px] flex flex-col gap-6">
        
        {/* Theme Selector */}
        <div className="space-y-3">
            <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Visual Theme</label>
            <div className="grid grid-cols-3 gap-2">
                {(['viral', 'professional', 'minimal'] as CarouselTheme[]).map((t) => (
                    <button
                        key={t}
                        onClick={() => setTheme(t)}
                        className={classNames(
                            "px-3 py-2 rounded-lg text-xs font-bold capitalize border transition-all",
                            theme === t 
                                ? "bg-orange-600 border-orange-500 text-white" 
                                : "bg-neutral-800 border-transparent text-neutral-400 hover:border-white/20"
                        )}
                    >
                        {t}
                    </button>
                ))}
            </div>
        </div>

        {/* Slide Editor */}
        <div className="flex-1 bg-neutral-800/50 rounded-xl p-4 border border-white/5 space-y-4">
            <div className="flex items-center gap-2 mb-2">
                <Type className="w-4 h-4 text-orange-400" />
                <span className="text-xs font-bold text-white">Slide Content</span>
            </div>
            
            <div className="space-y-2">
                <label className="text-xs text-neutral-500">Headline</label>
                <input 
                    value={slides[currentIndex].title}
                    onChange={(e) => updateSlide(currentIndex, 'title', e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-sm font-bold text-white focus:outline-none focus:border-orange-500/50"
                />
            </div>
            
            <div className="space-y-2">
                <label className="text-xs text-neutral-500">Body Text</label>
                <textarea 
                    value={slides[currentIndex].body}
                    onChange={(e) => updateSlide(currentIndex, 'body', e.target.value)}
                    className="w-full h-32 bg-black/50 border border-white/10 rounded-lg p-3 text-sm text-neutral-300 focus:outline-none focus:border-orange-500/50 resize-none"
                />
            </div>
        </div>

        {/* Actions */}
        <button 
            onClick={handleDownload}
            className="w-full py-4 bg-white text-black font-black rounded-xl hover:bg-neutral-200 transition-colors flex items-center justify-center gap-2"
        >
            <Download className="w-5 h-5" />
            EXPORT PDF CAROUSEL
        </button>

      </div>
    </div>
  );
}

// Utility for classNames
function classNames(...classes: (string | undefined | null | boolean)[]) {
  return classes.filter(Boolean).join(' ');
}
