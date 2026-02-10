"use client";

import React, { useState, useEffect } from "react";
import { motion, Reorder, AnimatePresence } from "framer-motion";
import { FileText, Download, Layout, Palette, ArrowRight, ArrowLeft, Trash2, Plus, Sparkles, Wand2 } from "lucide-react";
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet, Font } from "@react-pdf/renderer";

const THEMES = {
    viral: {
        bg: "#FFD600",
        text: "#000000",
        accent: "#000000",
        font: "Helvetica-Bold"
    },
    professional: {
        bg: "#0A192F",
        text: "#FFFFFF",
        accent: "#64FFDA",
        font: "Times-Roman"
    },
    minimal: {
        bg: "#FFFFFF",
        text: "#171717",
        accent: "#171717",
        font: "Helvetica"
    },
    dark: {
        bg: "#0a0a0a",
        text: "#ffffff",
        accent: "#6366f1",
        font: "Helvetica-Bold"
    }
};

const pdfStyles = StyleSheet.create({
    page: {
        padding: 40,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
    },
    title: {
        fontSize: 32,
        fontWeight: "bold",
        marginBottom: 20,
        textTransform: "uppercase",
        letterSpacing: 2,
    },
    content: {
        fontSize: 18,
        lineHeight: 1.6,
        maxWidth: "80%",
    },
    slideNumber: {
        position: "absolute",
        bottom: 20,
        right: 20,
        fontSize: 12,
        color: "#999",
    },
    brand: {
        position: "absolute",
        bottom: 20,
        left: 20,
        fontSize: 10,
        textTransform: "uppercase",
        fontWeight: "bold",
    }
});

interface Slide {
    id: string;
    title: string;
    content: string;
}

const CarouselDocument = ({ slides, brandName, theme }: { slides: Slide[], brandName: string, theme: keyof typeof THEMES }) => {
    const t = THEMES[theme];
    return (
        <Document>
            {slides.map((slide, i) => (
                <Page key={slide.id} size={[500, 500]} style={[pdfStyles.page, { backgroundColor: t.bg, color: t.text }]}>
                    <Text style={[pdfStyles.title, { fontFamily: t.font }]}>{slide.title}</Text>
                    <Text style={[pdfStyles.content, { fontFamily: t.font === 'Times-Roman' ? 'Times-Roman' : 'Helvetica' }]}>{slide.content}</Text>
                    <View style={[pdfStyles.brand, { color: t.accent }]}><Text>{brandName}</Text></View>
                    <View style={pdfStyles.slideNumber}><Text>{i + 1} / {slides.length}</Text></View>
                </Page>
            ))}
        </Document>
    );
};

interface CarouselFactoryProps {
    initialContent?: string;
    apiKey: string;
    onClose?: () => void;
}

export default function CarouselFactory({ initialContent, apiKey, onClose }: CarouselFactoryProps) {
    const [slides, setSlides] = useState<Slide[]>([]);
    const [brandName, setBrandName] = useState("StrategyOS");
    const [theme, setTheme] = useState<keyof typeof THEMES>("dark");
    const [isGenerating, setIsGenerating] = useState(false);

    useEffect(() => {
        if (initialContent && slides.length === 0) {
            autoGenerateSlides(initialContent);
        }
    }, [initialContent]);

    const autoGenerateSlides = (text: string) => {
        setIsGenerating(true);
        const paragraphs = text.split("\n\n").filter(p => p.trim().length > 10);
        const newSlides = paragraphs.map((p, i) => ({
            id: `slide-${Date.now()}-${i}`,
            title: i === 0 ? "The Big Idea" : i === paragraphs.length - 1 ? "The Conclusion" : `Step ${i}`,
            content: p.trim()
        }));
        setSlides(newSlides);
        setIsGenerating(false);
    };

    const addSlide = () => {
        const newSlide = {
            id: `slide-${Date.now()}`,
            title: "New Slide",
            content: "Add your strategic content here..."
        };
        setSlides([...slides, newSlide]);
    };

    const removeSlide = (id: string) => {
        setSlides(slides.filter(s => s.id !== id));
    };

    const updateSlide = (id: string, field: keyof Slide, value: string) => {
        setSlides(slides.map(s => s.id === id ? { ...s, [field]: value } : s));
    };

    return (
        <div className="flex flex-col h-full bg-[#080a0f] text-white rounded-3xl overflow-hidden border border-white/10 shadow-3xl">
            <div className="flex items-center justify-between p-6 border-b border-white/5 bg-black/40 backdrop-blur-xl">
                <div>
                    <h2 className="text-xl font-black flex items-center gap-3 tracking-tighter uppercase">
                        <Wand2 className="w-5 h-5 text-indigo-500" />
                        Carousel Factory v2
                    </h2>
                    <div className="flex items-center gap-4 mt-1">
                        <p className="text-[10px] text-neutral-500 uppercase font-mono tracking-widest">Post-to-PDF Pipeline</p>
                        <div className="h-2 w-px bg-white/10" />
                        <div className="flex gap-2">
                            {(Object.keys(THEMES) as Array<keyof typeof THEMES>).map((t) => (
                                <button 
                                    key={t}
                                    onClick={() => setTheme(t)}
                                    className={`text-[8px] font-black uppercase px-2 py-0.5 rounded border transition-all ${
                                        theme === t ? 'bg-indigo-500 border-indigo-500 text-white' : 'bg-white/5 border-white/10 text-neutral-500 hover:text-white'
                                    }`}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <input 
                        type="text" 
                        value={brandName}
                        onChange={(e) => setBrandName(e.target.value)}
                        placeholder="Brand Handle"
                        className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs font-mono focus:outline-none focus:border-indigo-500/50 w-32"
                    />
                    <PDFDownloadLink 
                        document={<CarouselDocument slides={slides} brandName={brandName} theme={theme} />} 
                        fileName="strategy_carousel.pdf"
                        className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-indigo-600/20 flex items-center gap-2 uppercase tracking-widest disabled:opacity-50"
                    >
                        {/* @ts-ignore */}
                        {({ loading }) => (
                            <>
                                <Download className="w-4 h-4" />
                                {loading ? "Generating..." : "Export"}
                            </>
                        )}
                    </PDFDownloadLink>
                </div>
            </div>

            <div className="flex-1 overflow-x-auto p-8 flex gap-6 items-start scroll-smooth custom-scrollbar bg-[radial-gradient(circle_at_center,_transparent_0%,_#000_100%)]">
                <Reorder.Group axis="x" values={slides} onReorder={setSlides} className="flex gap-6 pb-4">
                    <AnimatePresence mode="popLayout">
                        {slides.map((slide, index) => (
                            <Reorder.Item 
                                key={slide.id} 
                                value={slide}
                                initial={{ opacity: 0, x: 50 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                className="relative flex-shrink-0 w-64 aspect-square bg-[#0f111a] border border-white/10 rounded-3xl p-6 flex flex-col justify-center items-center text-center shadow-2xl group transition-all hover:border-indigo-500/30 cursor-grab active:cursor-grabbing"
                            >
                                <div className="absolute top-4 left-4 text-[9px] font-mono text-neutral-600">SLIDE {index + 1}</div>
                                
                                <button 
                                    onClick={() => removeSlide(slide.id)}
                                    className="absolute top-4 right-4 p-1.5 bg-red-500/10 text-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 hover:text-white"
                                >
                                    <Trash2 className="w-3 h-3" />
                                </button>

                                <div className="w-full space-y-2">
                                    <input 
                                        className="w-full bg-transparent text-sm font-black text-center text-white uppercase tracking-tight focus:outline-none focus:text-indigo-400 placeholder:text-neutral-700"
                                        value={slide.title}
                                        placeholder="Add Title"
                                        onChange={(e) => updateSlide(slide.id, "title", e.target.value)}
                                    />
                                    <textarea 
                                        className="w-full bg-transparent text-[11px] text-neutral-400 text-center leading-relaxed resize-none focus:outline-none focus:text-white min-h-[80px] placeholder:text-neutral-800"
                                        value={slide.content}
                                        placeholder="Add body text..."
                                        onChange={(e) => updateSlide(slide.id, "content", e.target.value)}
                                    />
                                </div>

                                <div className="absolute bottom-4 left-4 flex items-center gap-1.5 opacity-30 group-hover:opacity-100 transition-opacity">
                                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                                    <span className="text-[8px] font-bold text-indigo-400 uppercase tracking-widest">{brandName}</span>
                                </div>
                            </Reorder.Item>
                        ))}
                    </AnimatePresence>
                </Reorder.Group>

                <button 
                    onClick={addSlide}
                    className="flex-shrink-0 w-64 aspect-square bg-black/20 border-2 border-dashed border-white/5 rounded-3xl flex flex-col items-center justify-center gap-3 hover:bg-white/5 hover:border-indigo-500/30 transition-all group"
                >
                    <div className="p-3 bg-white/5 rounded-full group-hover:scale-110 transition-transform">
                        <Plus className="w-6 h-6 text-neutral-600 group-hover:text-indigo-400" />
                    </div>
                    <span className="text-[10px] font-mono text-neutral-600 group-hover:text-indigo-300">APPEND SLIDE</span>
                </button>
            </div>
        </div>
    );
}
