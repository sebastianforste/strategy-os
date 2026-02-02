"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Users, UserPlus, Shield, User, MoreVertical, Search, CheckCircle2 } from "lucide-react";

interface Member {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "EDITOR" | "MEMBER" | "VIEWER";
  avatar?: string;
}

interface TeamSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  teamName?: string;
}

export default function TeamSettingsModal({ isOpen, onClose, teamName = "Strategy Global" }: TeamSettingsModalProps) {
  const [members, setMembers] = useState<Member[]>([
    { id: "1", name: "Sebastian Beck", email: "sebastian@beck.com", role: "ADMIN" },
    { id: "2", name: "Sarah Chen", email: "sarah@strategy.com", role: "EDITOR" },
    { id: "3", name: "Michael Ross", email: "michael@strategy.com", role: "MEMBER" },
    { id: "4", name: "Elena Petrova", email: "elena@strategy.com", role: "VIEWER" },
  ]);

  const [searchQuery, setSearchQuery] = useState("");

  const filteredMembers = members.filter(m => 
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    m.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="w-full max-w-2xl bg-neutral-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-500/20 rounded-xl">
                  <Users className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <h3 className="font-bold text-white uppercase tracking-wider text-sm">{teamName} Collaboration</h3>
                  <p className="text-[10px] text-neutral-500 font-mono tracking-tighter uppercase">Team Management v2.1</p>
                </div>
              </div>
              <button onClick={onClose} className="text-neutral-500 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Actions Bar */}
            <div className="px-6 py-4 bg-white/2 border-b border-white/5 flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                <input
                  type="text"
                  placeholder="Search members..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-black/40 border border-white/5 rounded-xl py-2 pl-10 pr-4 text-xs text-white outline-none focus:border-indigo-500/50 transition-colors"
                />
              </div>
              <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-indigo-500/20">
                <UserPlus className="w-3 h-3" /> Invite
              </button>
            </div>

            {/* Member List */}
            <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
              <div className="space-y-1">
                {filteredMembers.map((member) => (
                  <div 
                    key={member.id}
                    className="flex items-center justify-between p-3 rounded-2xl hover:bg-white/5 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neutral-700 to-neutral-800 border border-white/10 flex items-center justify-center overflow-hidden">
                        {member.avatar ? (
                          <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-5 h-5 text-neutral-500" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-white">{member.name}</span>
                          {member.role === "ADMIN" && (
                            <Shield className="w-3 h-3 text-indigo-400" />
                          )}
                        </div>
                        <span className="text-xs text-neutral-500">{member.email}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <select 
                        value={member.role}
                        onChange={() => {}} // Mock change
                        className="bg-transparent text-[10px] font-bold text-neutral-400 outline-none cursor-pointer hover:text-white uppercase tracking-widest"
                      >
                        <option value="ADMIN">Admin</option>
                        <option value="EDITOR">Editor</option>
                        <option value="MEMBER">Member</option>
                        <option value="VIEWER">Viewer</option>
                      </select>
                      <button className="p-1 text-neutral-600 hover:text-white transition-colors opacity-0 group-hover:opacity-100">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-white/5 bg-white/2 flex items-center justify-between">
              <div className="flex items-center gap-2 text-[10px] text-neutral-500 font-mono">
                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                <span>ALL SESSIONS ACTIVE (EU-CENTRAL-1)</span>
              </div>
              <p className="text-[10px] text-neutral-600">4 / 10 SEATS FILLED</p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
