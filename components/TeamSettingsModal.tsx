"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Users, Mail, UserPlus } from "lucide-react";
import { useState } from "react";
import { getWorkspaces, getActiveWorkspaceId, addMember } from "../utils/workspace-service";

interface TeamSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TeamSettingsModal({
  isOpen,
  onClose,
}: TeamSettingsModalProps) {
  const [email, setEmail] = useState("");
  const activeWorkspaceId = getActiveWorkspaceId();
  // In a real app with reactive state management, we'd subscribe to store updates.
  // For MVP localStorage, we re-fetch on render or use key/effects.
  // Let's just fetch once on open.
  const workspace = getWorkspaces().find(w => w.id === activeWorkspaceId);
  const [members, setMembers] = useState(workspace?.members || []);

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    addMember(activeWorkspaceId, email, "editor");
    
    // Refresh local list
    const updated = getWorkspaces().find(w => w.id === activeWorkspaceId);
    if (updated) setMembers(updated.members);
    
    setEmail("");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-[#0A0A0A] border border-neutral-800 p-8 rounded-2xl z-50 shadow-2xl"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5" />
                Team Members
              </h2>
              <button
                onClick={onClose}
                className="text-neutral-500 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
               <div className="bg-neutral-900/50 p-4 rounded-lg border border-neutral-800">
                    <h3 className="text-sm font-bold text-white mb-1">
                        Workspace: {workspace?.name}
                    </h3>
                    <p className="text-xs text-neutral-500">
                        Manage who has access to this workspace via mocked invites.
                    </p>
               </div>

               {/* Invite Form */}
               <form onSubmit={handleInvite} className="flex gap-2">
                    <div className="relative flex-1">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="colleague@example.com"
                            className="w-full bg-neutral-900 border border-neutral-800 rounded-lg pl-10 pr-4 py-3 text-sm text-white focus:border-white outline-none transition-colors"
                        />
                    </div>
                    <button 
                        type="submit"
                        className="bg-white text-black font-bold px-4 rounded-lg hover:bg-neutral-200 transition-colors flex items-center gap-2 text-sm"
                    >
                        <UserPlus className="w-4 h-4" />
                        INVITE
                    </button>
               </form>

               {/* Member List */}
               <div className="space-y-3">
                    <label className="text-xs font-mono text-neutral-500 uppercase">
                        Active Members ({members.length})
                    </label>
                    <div className="divide-y divide-neutral-800 border border-neutral-800 rounded-lg overflow-hidden">
                        {members.map(member => (
                            <div key={member.id} className="p-3 bg-black flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-neutral-800 to-neutral-700 flex items-center justify-center text-xs font-bold text-white uppercase">
                                        {member.name.substring(0, 2)}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-white">{member.name}</p>
                                        <p className="text-xs text-neutral-500">{member.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                                        member.role === 'admin' 
                                            ? 'border-purple-500/30 text-purple-400 bg-purple-500/10' 
                                            : 'border-blue-500/30 text-blue-400 bg-blue-500/10'
                                    }`}>
                                        {member.role.toUpperCase()}
                                    </span>
                                    {/* Mock permissions - usually can't remove self */}
                                    {member.role !== 'admin' && (
                                        <button className="text-neutral-600 hover:text-red-500 transition-colors px-2">
                                            Remove
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
               </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
