"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getSelection, $isRangeSelection } from 'lexical';
import { motion, AnimatePresence } from 'framer-motion';
import { Wand2, MessageSquare } from 'lucide-react';

export function SelectionToolbar() {
  const [editor] = useLexicalComposerContext();
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [show, setShow] = useState(false);

  const updateToolbar = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || selection.rangeCount === 0) {
      setShow(false);
      return;
    }

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    setPosition({
      top: rect.top + window.scrollY - 50,
      left: rect.left + window.scrollX + rect.width / 2
    });
    setShow(true);
  }, []);

  useEffect(() => {
    document.addEventListener('selectionchange', updateToolbar);
    return () => document.removeEventListener('selectionchange', updateToolbar);
  }, [updateToolbar]);

  if (!show) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className="fixed z-[100] flex items-center bg-[#16181D] border border-white/10 rounded-lg shadow-2xl p-1 gap-1 -translate-x-1/2"
      style={{ top: position.top, left: position.left }}
    >
      <button className="flex items-center gap-2 px-3 py-1.5 hover:bg-white/5 rounded text-[10px] font-bold text-emerald-400 uppercase tracking-widest transition-colors">
        <Wand2 size={14} />
        Improve
      </button>
      <div className="w-[1px] h-4 bg-white/10" />
      <button className="flex items-center gap-2 px-3 py-1.5 hover:bg-white/5 rounded text-[10px] font-bold text-[#8A8D91] uppercase tracking-widest transition-colors">
        <MessageSquare size={14} />
        Critique
      </button>
    </motion.div>
  );
}
