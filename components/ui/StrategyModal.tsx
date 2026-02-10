"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import React, { useEffect } from "react";

interface StrategyModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    maxWidth?: string;
}

export default function StrategyModal({ isOpen, onClose, title, children, maxWidth = "max-w-4xl" }: StrategyModalProps) {
    
    // Close on Escape key
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handleEsc);
        return () => window.removeEventListener("keydown", handleEsc);
    }, [onClose]);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop Blur */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-md z-[60]"
                    />
                    
                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className={`fixed inset-0 flex items-center justify-center z-[70] pointer-events-none p-4`}
                    >
                        <div className={`${maxWidth} w-full bg-[#0a0a0a] border border-white/10 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden pointer-events-auto flex flex-col max-h-[90vh]`}>
                            
                            {/* Header */}
                            <div className="flex items-center justify-between p-6 border-b border-white/5 bg-white/[0.02]">
                                <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-3">
                                    <div className="w-1 h-6 bg-indigo-500 rounded-full" />
                                    {title}
                                </h2>
                                <button 
                                    onClick={onClose}
                                    className="p-2 hover:bg-white/10 rounded-full transition-colors group"
                                >
                                    <X className="w-5 h-5 text-neutral-500 group-hover:text-white transition-colors" />
                                </button>
                            </div>

                            {/* Scrollable Body */}
                            <div className="p-6 overflow-y-auto custom-scrollbar">
                                {children}
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
