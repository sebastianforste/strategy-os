"use client";

import { useState, useEffect } from "react";
import { ChevronsUpDown, Plus, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { 
    Workspace, 
    getWorkspaces, 
    getActiveWorkspaceId, 
    setActiveWorkspaceId,
    createWorkspace 
} from "../utils/workspace-service";

export default function WorkspaceSwitcher() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeId, setActiveId] = useState("default");
  const [isOpen, setIsOpen] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState("");

  useEffect(() => {
    // Initial load - deferred to avoid synchronous setState inside effect warning 
    // and possible hydration mismatches in Next.js
    const timer = setTimeout(() => {
        setWorkspaces(getWorkspaces());
        setActiveId(getActiveWorkspaceId());
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const handleSwitch = (id: string) => {
    setActiveWorkspaceId(id);
    setActiveId(id); // Optimistic update, but page reload happens in service
    setIsOpen(false);
  };

  const handleCreate = () => {
    if (!newWorkspaceName.trim()) return;
    createWorkspace(newWorkspaceName);
    // Page reload happens inside createWorkspace -> setActiveWorkspaceId
  };

  const activeWorkspace = workspaces.find(w => w.id === activeId) || workspaces[0];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 hover:bg-neutral-800 rounded-lg transition-colors border border-transparent hover:border-neutral-700"
      >
        <div className="w-6 h-6 rounded bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-[10px] font-bold text-white">
          {activeWorkspace?.name.substring(0, 1).toUpperCase()}
        </div>
        <span className="text-sm font-medium text-neutral-300 hidden md:block">
          {activeWorkspace?.name || "Workspace"}
        </span>
        <ChevronsUpDown className="w-4 h-4 text-neutral-500" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div 
                className="fixed inset-0 z-40" 
                onClick={() => {
                    setIsOpen(false);
                    setShowCreate(false);
                }} 
            />
            <motion.div
              initial={{ opacity: 0, y: 5, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 5, scale: 0.95 }}
              className="absolute top-full left-0 mt-2 w-64 bg-[#111111] border border-neutral-800 rounded-xl shadow-2xl z-50 overflow-hidden"
            >
                {showCreate ? (
                    <div className="p-3 space-y-3">
                        <p className="text-xs font-bold text-neutral-400 uppercase">New Workspace</p>
                        <input 
                            autoFocus
                            value={newWorkspaceName}
                            onChange={(e) => setNewWorkspaceName(e.target.value)}
                            placeholder="e.g. Client X"
                            className="w-full bg-neutral-900 border border-neutral-800 rounded px-3 py-2 text-sm text-white focus:border-indigo-500 outline-none"
                            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                        />
                        <div className="flex gap-2">
                            <button 
                                onClick={handleCreate}
                                className="flex-1 bg-white text-black text-xs font-bold py-2 rounded hover:bg-neutral-200"
                            >
                                CREATE
                            </button>
                            <button 
                                onClick={() => setShowCreate(false)}
                                className="flex-1 bg-neutral-800 text-neutral-400 text-xs font-bold py-2 rounded hover:text-white"
                            >
                                CANCEL
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="p-2 space-y-1 max-h-64 overflow-y-auto">
                            <p className="px-2 py-1.5 text-[10px] font-bold text-neutral-500 uppercase">Switch Workspace</p>
                            {workspaces.map(w => (
                                <button
                                    key={w.id}
                                    onClick={() => handleSwitch(w.id)}
                                    className="w-full flex items-center justify-between px-2 py-2 hover:bg-neutral-800 rounded-lg group transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-5 h-5 rounded bg-neutral-800 flex items-center justify-center text-[8px] font-bold text-neutral-400 group-hover:bg-neutral-700 group-hover:text-neutral-200 border border-neutral-700">
                                            {w.name.substring(0, 1).toUpperCase()}
                                        </div>
                                        <span className={`text-sm ${activeId === w.id ? 'text-white font-medium' : 'text-neutral-400 group-hover:text-neutral-200'}`}>
                                            {w.name}
                                        </span>
                                    </div>
                                    {activeId === w.id && <Check className="w-3 h-3 text-white" />}
                                </button>
                            ))}
                        </div>
                        <div className="p-2 border-t border-neutral-800">
                            <button
                                onClick={() => setShowCreate(true)}
                                className="w-full flex items-center gap-2 px-2 py-2 text-xs font-medium text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                                Create Workspace
                            </button>
                        </div>
                    </>
                )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
