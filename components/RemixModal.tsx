"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowLeft, ArrowRight, Check } from "lucide-react";
import { useState } from "react";
import { RemixResult } from "../utils/remix-service";

interface RemixModalProps {
  isOpen: boolean;
  onClose: () => void;
  remixes: RemixResult[];
  onSelect: (content: string) => void;
  isLoading: boolean;
}

export default function RemixModal({ isOpen, onClose, remixes, onSelect, isLoading }: RemixModalProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (!isOpen) return null;

  const handleSelect = () => {
    if (remixes[activeIndex]) {
      onSelect(remixes[activeIndex].content);
      onClose();
    }
  };

  const goNext = () => setActiveIndex((i) => (i + 1) % remixes.length);
  const goPrev = () => setActiveIndex((i) => (i - 1 + remixes.length) % remixes.length);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-[#0A0A0A] border border-neutral-800 rounded-xl w-full max-w-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-neutral-800">
            <div>
              <h2 className="text-lg font-bold text-white">Remix Variations</h2>
              <p className="text-sm text-neutral-500">Choose a version that resonates</p>
            </div>
            <button onClick={onClose} className="text-neutral-500 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 min-h-[300px]">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-64">
                <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-neutral-500 text-sm">Generating variations...</p>
              </div>
            ) : remixes.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-neutral-500">
                <p>No remixes available</p>
              </div>
            ) : (
              <>
                {/* Navigation Dots */}
                <div className="flex justify-center gap-2 mb-6">
                  {remixes.map((r, i) => (
                    <button
                      key={r.id}
                      onClick={() => setActiveIndex(i)}
                      className={`px-3 py-1 text-xs font-bold rounded-full border transition-all ${
                        activeIndex === i
                          ? "bg-white text-black border-white"
                          : "bg-transparent text-neutral-500 border-neutral-700 hover:border-neutral-500"
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>

                {/* Remix Content */}
                <motion.div
                  key={activeIndex}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-neutral-900 border border-neutral-800 rounded-lg p-6 min-h-[200px]"
                >
                  <pre className="font-mono text-sm text-neutral-300 whitespace-pre-wrap leading-relaxed">
                    {remixes[activeIndex]?.content}
                  </pre>
                </motion.div>

                {/* Arrows */}
                <div className="flex justify-between mt-4">
                  <button
                    onClick={goPrev}
                    className="p-2 text-neutral-500 hover:text-white transition-colors"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={goNext}
                    className="p-2 text-neutral-500 hover:text-white transition-colors"
                  >
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-neutral-800">
            <button
              onClick={handleSelect}
              disabled={isLoading || remixes.length === 0}
              className="w-full py-3 bg-white text-black font-bold rounded-lg hover:bg-neutral-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              Use This Version
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
