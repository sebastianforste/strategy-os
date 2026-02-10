"use client";

import { motion } from "framer-motion";

export default function BrandedLoader({ text = "Loading..." }: { text?: string }) {
    return (
        <div className="flex flex-col items-center justify-center gap-4 py-12">
            <div className="relative w-12 h-12">
                <motion.div 
                    className="absolute inset-0 border-2 border-indigo-500/30 rounded-full"
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div 
                    className="absolute inset-2 border-2 border-indigo-500 rounded-full border-t-transparent"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse" />
                </div>
            </div>
            <p className="text-xs font-mono text-indigo-400/80 animate-pulse uppercase tracking-widest">{text}</p>
        </div>
    );
}
