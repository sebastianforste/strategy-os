"use client";

import { useEffect, useState } from "react";
import mermaid from "mermaid";
import { motion } from "framer-motion";
import { Download, Layout, Palette, Image as ImageIcon, Share2 } from "lucide-react";
import { DesignAsset } from "../utils/visual-engine";

mermaid.initialize({
    startOnLoad: true,
    theme: 'dark',
    securityLevel: 'loose',
    fontFamily: 'monospace'
});

export default function VisualStudio({ assets }: { assets: DesignAsset[] }) {
    const [activeAsset, setActiveAsset] = useState<number>(0);

    useEffect(() => {
        mermaid.contentLoaded();
    }, [activeAsset, assets]);

    if (!assets || assets.length === 0) return (
        <div className="h-64 flex flex-col items-center justify-center text-neutral-500 border border-dashed border-white/10 rounded-2xl bg-black/20">
            <Layout className="w-8 h-8 mb-4 opacity-50" />
            <p className="text-xs uppercase tracking-widest font-bold">No Visuals Generated</p>
        </div>
    );

    return (
        <div className="flex bg-black border border-white/10 rounded-2xl overflow-hidden h-[500px]">
            {/* Sidebar List */}
            <div className="w-64 border-r border-white/10 p-4 bg-neutral-900/50 space-y-2">
                <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-4 block">Generated Assets</label>
                {assets.map((asset, i) => (
                    <button
                        key={i}
                        onClick={() => setActiveAsset(i)}
                        className={`w-full text-left p-3 rounded-xl border text-xs font-mono transition-all ${
                            activeAsset === i 
                                ? 'bg-indigo-500/10 border-indigo-500/40 text-indigo-400' 
                                : 'bg-transparent border-transparent text-neutral-400 hover:bg-white/5'
                        }`}
                    >
                        <div className="flex items-center gap-3">
                            {asset.type === 'mermaid' ? <Share2 className="w-3 h-3" /> : <Layout className="w-3 h-3" />}
                            <span className="truncate">{asset.description}</span>
                        </div>
                    </button>
                ))}
            </div>

            {/* Canvas Area */}
            <div className="flex-1 flex flex-col">
                <div className="flex-1 bg-[url('/grid.svg')] bg-center p-8 flex items-center justify-center overflow-auto relative">
                    {assets[activeAsset].type === 'mermaid' ? (
                        <div className="mermaid scale-90">
                            {assets[activeAsset].code}
                        </div>
                    ) : (
                        <StatCard data={JSON.parse(assets[activeAsset].code)} />
                    )}
                </div>

                {/* Toolbar */}
                <div className="h-16 border-t border-white/10 bg-neutral-900 flex items-center justify-between px-8">
                    <div className="flex items-center gap-4">
                        <button className="flex items-center gap-2 text-xs font-bold text-neutral-400 hover:text-white transition-colors">
                            <Palette className="w-4 h-4" />
                            Theme: Noir
                        </button>
                    </div>
                    <button className="flex items-center gap-2 px-6 py-2 bg-white text-black rounded-lg text-xs font-black uppercase tracking-widest hover:bg-neutral-200 transition-colors">
                        <Download className="w-4 h-4" />
                        Export PNG
                    </button>
                </div>
            </div>
        </div>
    );
}

function StatCard({ data }: { data: { label: string, value: string, detail: string } }) {
    return (
        <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-96 aspect-[4/3] bg-black border border-white/20 rounded-3xl p-8 flex flex-col justify-between shadow-2xl relative overflow-hidden"
        >
            <div className="absolute top-0 right-0 p-32 bg-indigo-500/20 blur-[100px] rounded-full" />
            
            <div className="space-y-2 z-10">
                <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full" />
                </div>
                <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-widest">{data.label}</h3>
            </div>

            <div className="z-10">
                <h2 className="text-7xl font-black text-white tracking-tighter">{data.value}</h2>
                <div className="h-1 w-24 bg-indigo-500 mt-4" />
            </div>

            <p className="text-xs text-neutral-500 font-mono z-10">{data.detail}</p>
        </motion.div>
    );
}
