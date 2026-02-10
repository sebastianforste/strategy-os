"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import NarrativeArchitect from "./NarrativeArchitect";

interface NarrativeModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTheme?: string;
}

export default function NarrativeModal({ isOpen, onClose, initialTheme }: NarrativeModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
      <div className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto">
        <NarrativeArchitect initialTheme={initialTheme} />
        <button 
          onClick={onClose}
          className="absolute top-8 right-8 p-2 bg-white/5 rounded-full hover:bg-white/10 transition-all z-10"
        >
          <X className="w-6 h-6 text-white" />
        </button>
      </div>
    </div>
  );
}
