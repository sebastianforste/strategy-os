
"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Command, Zap, User, Database, MessageSquare, Anchor, TrendingUp, X, Sparkles, Ghost, LayoutGrid, FileText, Grid } from "lucide-react";
import { PersonaId, PERSONAS, Persona } from "../utils/personas";
import { listGeneratedPostsAction } from "../actions/generate";

interface CommandItem {
  id: string;
  type: "command" | "persona" | "post";
  title: string;
  category: string;
  icon: React.ReactNode;
  shortcut?: string;
  data?: any;
}

interface GlobalCommandProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPersona: (id: PersonaId) => void;
  onTriggerTool: (tool: string) => void;
  onTriggerAction: (action: string) => void;
}

const STATIC_COMMANDS: CommandItem[] = [
  { id: "/post", type: "command", title: "Switch to Post Mode", icon: <Sparkles className="w-4 h-4 text-amber-400" />, category: "Modes", shortcut: "/" },
  { id: "/reply", type: "command", title: "Switch to Reply Mode", icon: <Zap className="w-4 h-4 text-blue-400" />, category: "Modes", shortcut: "/" },
  { id: "/research", type: "command", title: "Run Deep Research", icon: <Ghost className="w-4 h-4 text-cyan-400" />, category: "Intelligence", shortcut: "/" },
  { id: "gen", type: "command", title: "Generate Post", icon: <Zap className="w-4 h-4" />, category: "Actions", shortcut: "G" },
  { id: "clear", type: "command", title: "Clear Editor", icon: <X className="w-4 h-4" />, category: "Actions", shortcut: "C" },
  { id: "vault", type: "command", title: "Open Content Vault", icon: <LayoutGrid className="w-4 h-4" />, category: "Tools", shortcut: "V" },
  { id: "hook", type: "command", title: "Open Hook Lab", icon: <Anchor className="w-4 h-4" />, category: "Tools", shortcut: "H" },
  { id: "viral", type: "command", title: "Open Viral Lab", icon: <Zap className="w-4 h-4" />, category: "Tools", shortcut: "L" },
  { id: "growth", type: "command", title: "Open Growth Simulator", icon: <TrendingUp className="w-4 h-4" />, category: "Tools", shortcut: "S" },
  { id: "batch", type: "command", title: "Batch Generator", icon: <Grid className="w-4 h-4" />, category: "Tools", shortcut: "B" },
];

export default function GlobalCommand({ isOpen, onClose, onSelectPersona, onTriggerTool, onTriggerAction }: GlobalCommandProps) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recentPosts, setRecentPosts] = useState<CommandItem[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function fetchPosts() {
      const posts = await listGeneratedPostsAction();
      const postItems: CommandItem[] = posts.map(p => ({
        id: p.id,
        type: "post",
        title: p.title,
        category: "Recent Posts",
        icon: <FileText className="w-4 h-4 text-blue-400" />,
        data: p
      }));
      setRecentPosts(postItems);
    }
    if (isOpen) {
      fetchPosts();
    }
  }, [isOpen]);

  const personaItems: CommandItem[] = Object.values(PERSONAS).map(p => ({
    id: p.id,
    type: "persona",
    title: p.name,
    category: p.role || "Persona",
    icon: <User className="w-4 h-4 text-neutral-400" />,
    data: p
  }));

  const filteredItems = [
    ...STATIC_COMMANDS,
    ...personaItems,
    ...recentPosts
  ].filter(item => 
    item.title.toLowerCase().includes(query.toLowerCase()) || 
    item.category.toLowerCase().includes(query.toLowerCase()) ||
    (query.startsWith('/') && item.id.startsWith(query))
  );

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 10);
    }
  }, [isOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % filteredItems.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % filteredItems.length);
    } else if (e.key === "Enter") {
      const item = filteredItems[selectedIndex];
      if (!item) return;

      if (item.type === "persona") {
        onSelectPersona(item.id as PersonaId);
      } else if (item.type === "post") {
        console.log("Post selected:", item.data.filename);
      } else if (item.category === "Tools") {
        onTriggerTool(item.id);
      } else if (item.category === "Modes") {
        onTriggerAction(item.id);
      } else if (item.id === "/research") {
        onTriggerAction("research");
      } else {
        onTriggerAction(item.id);
      }
      onClose();
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4 bg-black/40 backdrop-blur-md" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: -20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -20 }}
        className="w-full max-w-2xl bg-[#0D0D0D] border border-white/10 rounded-2xl shadow-2xl overflow-hidden glass-panel"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-6 py-4 border-b border-white/5 bg-white/[0.02]">
          <Search className="w-5 h-5 text-neutral-500" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search personas, tools, or recent posts..."
            className="flex-1 bg-transparent text-lg text-white placeholder-neutral-600 outline-none"
          />
          <div className="flex items-center gap-1 px-2 py-1 rounded bg-white/5 border border-white/10 text-[10px] text-neutral-500 font-mono">
            <Command className="w-3 h-3" />
            <span>K</span>
          </div>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-2 custom-scrollbar">
          {filteredItems.length === 0 ? (
            <div className="px-6 py-12 text-center text-neutral-500">
              <Sparkles className="w-8 h-8 mx-auto mb-4 opacity-10" />
              <p className="text-sm">No results found for "{query}"</p>
            </div>
          ) : (
            <div className="space-y-1">
              {filteredItems.map((item, idx) => (
                <button
                  key={`${item.type}-${item.id}`}
                  onClick={() => {
                    if (item.type === "persona") {
                      onSelectPersona(item.id as PersonaId);
                    } else if (item.type === "post") {
                        console.log("Post selected:", item.data.filename);
                    } else if (item.category === "Tools") {
                      onTriggerTool(item.id);
                    } else {
                      onTriggerAction(item.id);
                    }
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl transition-all ${
                    idx === selectedIndex ? "bg-white/10 ring-1 ring-white/10" : "hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${idx === selectedIndex ? "bg-white/10" : "bg-white/5"}`}>
                      {item.icon}
                    </div>
                    <div className="text-left">
                      <p className={`text-sm font-bold ${idx === selectedIndex ? "text-white" : "text-neutral-300"}`}>
                        {item.title}
                      </p>
                      <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-mono">
                        {item.category}
                      </p>
                    </div>
                  </div>
                  {item.shortcut && (
                    <div className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[9px] text-neutral-600 font-mono group-hover:text-neutral-400 transition-colors">
                      {item.shortcut}
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="px-6 py-3 border-t border-white/5 bg-white/[0.01] flex items-center justify-between text-[10px] text-neutral-600 font-mono uppercase tracking-widest">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <span className="px-1 py-0.5 rounded bg-white/5 border border-white/10">↑↓</span> Navigate
            </span>
            <span className="flex items-center gap-1">
              <span className="px-1 py-0.5 rounded bg-white/5 border border-white/10">Enter</span> Select
            </span>
          </div>
          <span>StrategyOS Command v1.1</span>
        </div>
      </motion.div>
    </div>
  );
}
