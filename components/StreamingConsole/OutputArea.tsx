/**
 * OutputArea Component
 * -------------------
 * Displays the generated output, previews, widgets, and loading states.
 * Extracted from StreamingConsole for maintainability.
 */

"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Bot, FileText } from "lucide-react";
import SkeletonLoader from "../SkeletonLoader";
import LinkedInPreview from "../previews/LinkedInPreview";
import TwitterPreview from "../previews/TwitterPreview";
import SwotWidget, { SwotData } from "../widgets/SwotWidget";
import TrendWidget, { TrendData } from "../widgets/TrendWidget";
import { extractWidgets } from "../../utils/widget-parser";

export interface OutputAreaProps {
  isLoading: boolean;
  completion: string;
  localError: string | null;
  platform: "linkedin" | "twitter";
  onReset: () => void;
  onPublish: () => void;
  onNewGeneration: () => void;
}

export default function OutputArea({
  isLoading,
  completion,
  localError,
  platform,
  onReset,
  onPublish,
  onNewGeneration,
}: OutputAreaProps) {
  return (
    <div className="w-full h-auto min-h-[12rem] bg-transparent text-white p-6 prose prose-invert prose-sm max-w-none relative">
      {isLoading && !completion && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
          <div className="w-full h-full p-6 flex flex-col justify-center">
            <SkeletonLoader />
            <div className="mt-4 text-center">
              <span className="text-xs font-mono text-purple-300/80 animate-pulse tracking-[0.2em] uppercase bg-black/50 px-2 py-1 rounded backdrop-blur-sm border border-purple-500/20">
                Synthesizing Strategy...
              </span>
            </div>
          </div>
        </div>
      )}

      {localError && (
        <div className="flex flex-col items-center justify-center h-48 text-center space-y-4">
          <div className="p-4 bg-red-950/30 border border-red-900/50 rounded-xl backdrop-blur-md max-w-sm shadow-xl">
            <p className="text-sm text-red-400 font-mono">{localError}</p>
          </div>
          <button
            onClick={onReset}
            className="text-xs text-neutral-500 hover:text-white underline underline-offset-4"
          >
            RESET
          </button>
        </div>
      )}

      {!localError && completion && (
        <div className="space-y-6">
          {/* Widget Parsing */}
          {(() => {
            const { cleanContent, widgets } = extractWidgets(completion);

            return (
              <>
                {/* Native-style Preview Card */}
                <div className="flex justify-center py-2">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={platform}
                      initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
                      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                      exit={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
                      transition={{ duration: 0.5, ease: "circOut" }}
                      className="w-full flex justify-center"
                    >
                      {platform === "linkedin" ? (
                        <LinkedInPreview content={cleanContent} />
                      ) : (
                        <TwitterPreview content={cleanContent} />
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Widgets Area */}
                <AnimatePresence>
                  {widgets.map((widget, idx) => (
                    <motion.div
                      key={`widget-${idx}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 * idx }}
                    >
                      {widget.type === "swot" && <SwotWidget data={widget.data as SwotData} />}
                      {widget.type === "trend" && <TrendWidget data={widget.data as TrendData} />}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </>
            );
          })()}

          {isLoading && completion && (
            <div className="flex justify-center">
              <motion.span
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-mono animate-pulse"
              >
                <Sparkles className="w-3 h-3" />
                Generating...
              </motion.span>
            </div>
          )}

          {!isLoading && completion && (
            <div className="flex flex-col gap-4">
              <div className="mt-8 p-5 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-white/5 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4 backdrop-blur-sm">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-500/20 rounded-2xl shadow-lg shadow-blue-500/10">
                    <Bot className="w-6 h-6 text-blue-400" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold text-white">Autonomous Agent Ready</p>
                    <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-mono">
                      Platform: {platform}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onPublish}
                  className="w-full sm:w-auto px-8 py-3 bg-white text-black font-black rounded-2xl text-[10px] tracking-tighter hover:scale-105 transition-all shadow-xl shadow-white/5"
                >
                  PUBLISH NOW
                </button>
              </div>

              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                onClick={onNewGeneration}
                className="mx-auto text-xs text-neutral-500 hover:text-white underline underline-offset-4 block transition-colors my-4"
              >
                NEW GENERATION
              </motion.button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
