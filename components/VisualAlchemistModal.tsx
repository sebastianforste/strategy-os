
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Palette, Image as ImageIcon, Check, Upload } from "lucide-react";
import { useState, useEffect } from "react";

const STYLES = [
    { id: "visualize-value", name: "Visualize Value", description: "B&W, high-contrast geometric schemas.", preview: "⚫⚪" },
    { id: "cyberpunk", name: "Cyberpunk", description: "Neon gradients, synthwave aesthetics.", preview: "🟣🔵" },
    { id: "minimalist", name: "Minimalist", description: "Soft pastels, clean typography, whitespace.", preview: "⚪🎨" },
    { id: "corporate-glass", name: "Corporate Glass", description: "Glassmorphism, professional blues.", preview: "🧊💎" },
    { id: "vintage-tech", name: "Vintage Tech", description: "80s computer terminal vibes.", preview: "📟💻" }
];

interface VisualAlchemistModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function VisualAlchemistModal({ isOpen, onClose }: VisualAlchemistModalProps) {
    const [selectedStyle, setSelectedStyle] = useState("visualize-value");
    const [brandLogo, setBrandLogo] = useState<string | null>(null);

    useEffect(() => {
        const saved = localStorage.getItem("strategyos_visual_style");
        if (saved) setSelectedStyle(saved);
        const logo = localStorage.getItem("strategyos_brand_logo");
        if (logo) setBrandLogo(logo);
    }, []);

    const saveStyle = (id: string) => {
        setSelectedStyle(id);
        localStorage.setItem("strategyos_visual_style", id);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/80 backdrop-blur-md z-[110]"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-[#0A0A0A] border border-white/10 p-8 rounded-3xl z-[111] shadow-2xl"
                    >
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-2xl font-black text-white flex items-center gap-3 italic italic-uppercase">
                                <Palette className="w-6 h-6 text-indigo-400" />
                                VISUAL ALCHEMIST
                            </h2>
                            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full">
                                <X className="w-6 h-6 text-neutral-500" />
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-8">
                            {/* Style Library */}
                            <div className="space-y-4">
                                <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Style DNA</h3>
                                <div className="space-y-2 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                                    {STYLES.map((style) => (
                                        <button
                                            key={style.id}
                                            onClick={() => saveStyle(style.id)}
                                            className={`w-full p-4 rounded-2xl border flex items-center justify-between transition-all ${
                                                selectedStyle === style.id 
                                                ? 'bg-indigo-600/20 border-indigo-500/50' 
                                                : 'bg-white/5 border-white/5 hover:bg-white/10'
                                            }`}
                                        >
                                            <div className="text-left">
                                                <p className="font-bold text-white text-sm">{style.name}</p>
                                                <p className="text-[10px] text-neutral-400 uppercase">{style.preview} {style.description}</p>
                                            </div>
                                            {selectedStyle === style.id && <Check className="w-4 h-4 text-indigo-400" />}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Brand Assets */}
                            <div className="space-y-6">
                                <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Brand Assets</h3>
                                
                                <div className="p-6 bg-white/5 border border-white/5 rounded-2xl space-y-4">
                                    <p className="text-xs text-neutral-400">Primary Logo (PNG/SVG)</p>
                                    <div className="w-24 h-24 border-2 border-dashed border-white/10 rounded-xl flex items-center justify-center relative overflow-hidden group cursor-pointer">
                                        {brandLogo ? (
                                            <img src={brandLogo} alt="Logo" className="w-full h-full object-contain p-2" />
                                        ) : (
                                            <Upload className="w-6 h-6 text-neutral-600 group-hover:text-white transition-colors" />
                                        )}
                                        <input 
                                            type="file" 
                                            accept="image/*" 
                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    const reader = new FileReader();
                                                    reader.onload = (f) => {
                                                        const b64 = f.target?.result as string;
                                                        setBrandLogo(b64);
                                                        localStorage.setItem("strategyos_brand_logo", b64);
                                                    };
                                                    reader.readAsDataURL(file);
                                                }
                                            }}
                                        />
                                    </div>
                                    <p className="text-[10px] text-neutral-500 italic">This will be overlaid on generated images.</p>
                                </div>

                                <div className="p-6 bg-white/5 border border-white/5 rounded-2xl space-y-4">
                                    <p className="text-xs text-neutral-400">Layout Optimization</p>
                                    <div className="flex gap-2">
                                        <div className="flex-1 p-2 bg-neutral-900 rounded-lg text-[10px] text-center font-bold text-neutral-500 border border-white/5">SQUARE</div>
                                        <div className="flex-1 p-2 bg-indigo-600/20 rounded-lg text-[10px] text-center font-bold text-indigo-400 border border-indigo-500/50">VERTICAL</div>
                                        <div className="flex-1 p-2 bg-neutral-900 rounded-lg text-[10px] text-center font-bold text-neutral-500 border border-white/5">WIDE</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 flex justify-end">
                            <button
                                onClick={onClose}
                                className="px-8 py-3 bg-white text-black font-black uppercase text-xs rounded-xl hover:bg-neutral-200 transition-all shadow-xl shadow-white/10"
                            >
                                TRANSMUTE ASSETS
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
