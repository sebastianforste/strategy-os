"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import BoardroomInterface from "./BoardroomInterface";

interface BoardroomModalProps {
  isOpen: boolean;
  onClose: () => void;
  strategyContent?: string;
  apiKey?: string;
}

export default function BoardroomModal({ isOpen, onClose, strategyContent = "", apiKey = "" }: BoardroomModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
      <div className="relative w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        <BoardroomInterface 
            strategyContent={strategyContent} 
            apiKey={apiKey} 
            onFinalize={() => onClose()}
        />
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
