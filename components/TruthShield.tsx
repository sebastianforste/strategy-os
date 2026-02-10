
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, ShieldAlert, AlertTriangle, CheckCircle, Info } from "lucide-react";
import * as Popover from "@radix-ui/react-popover";

interface VerificationResult {
    segment: string;
    verdict: "True" | "False" | "Unverified";
    confidence: number;
    citation?: {
        url: string;
        title?: string;
        snippet?: string;
    };
    correction?: string;
}

interface TruthShieldProps {
    content: string;
    verifications: VerificationResult[];
    isVisible: boolean;
}

export default function TruthShield({ content, verifications, isVisible }: TruthShieldProps) {
    if (!isVisible) return <div className="whitespace-pre-wrap">{content}</div>;

    // Helper to highlight segments
    // Simple replace for MVP. Ideally requires precise offset tracking from backend.
    
    let renderedContent: (string | React.ReactNode)[] = [content];

    verifications.forEach((v, index) => {
        const newContent: (string | React.ReactNode)[] = [];
        renderedContent.forEach((part) => {
            if (typeof part === "string") {
                const parts = part.split(v.segment);
                if (parts.length > 1) {
                    for (let i = 0; i < parts.length; i++) {
                        newContent.push(parts[i]);
                        if (i < parts.length - 1) {
                            newContent.push(
                                <Popover.Root key={`${index}-${i}`}>
                                    <Popover.Trigger asChild>
                                        <span 
                                            className={`cursor-help border-b-2 ${
                                                v.verdict === "True" ? "border-green-500 bg-green-500/10" : 
                                                v.verdict === "False" ? "border-red-500 bg-red-500/10" : 
                                                "border-yellow-500 bg-yellow-500/10"
                                            }`}
                                        >
                                            {v.segment}
                                        </span>
                                    </Popover.Trigger>
                                    <Popover.Portal>
                                        <Popover.Content className="z-50 w-64 bg-neutral-900 border border-white/10 rounded-lg p-3 shadow-xl animate-in fade-in zoom-in-95 data-[side=bottom]:slide-in-from-top-2">
                                            <div className="flex items-center gap-2 mb-2">
                                                {v.verdict === "True" ? <CheckCircle className="w-4 h-4 text-green-400" /> : 
                                                 v.verdict === "False" ? <ShieldAlert className="w-4 h-4 text-red-400" /> : 
                                                 <AlertTriangle className="w-4 h-4 text-yellow-400" />}
                                                <span className="font-bold text-xs text-white uppercase">{v.verdict}</span>
                                                <span className="text-[10px] text-neutral-500 ml-auto">{v.confidence}% Confidence</span>
                                            </div>
                                            
                                            {v.correction && (
                                                <p className="text-xs text-neutral-300 mb-2 italic">"{v.correction}"</p>
                                            )}
                                            
                                            {v.citation && (
                                                <div className="bg-black/20 p-2 rounded text-[10px] border border-white/5">
                                                    <div className="flex items-center gap-1 mb-1 text-neutral-400">
                                                        <Info className="w-3 h-3" /> Source
                                                    </div>
                                                    <a 
                                                        href={v.citation.url} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        className="text-blue-400 hover:underline line-clamp-1 block mb-1"
                                                    >
                                                        {v.citation.title || v.citation.url}
                                                    </a>
                                                    <p className="text-neutral-500 line-clamp-2">{v.citation.snippet}</p>
                                                </div>
                                            )}
                                            <Popover.Arrow className="fill-neutral-900" />
                                        </Popover.Content>
                                    </Popover.Portal>
                                </Popover.Root>
                            );
                        }
                    }
                } else {
                    newContent.push(part);
                }
            } else {
                newContent.push(part);
            }
        });
        renderedContent = newContent;
    });

    return (
        <div className="whitespace-pre-wrap font-mono text-sm">
            {renderedContent}
        </div>
    );
}
