"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { collabService, PresenceUser } from "../utils/collaboration-service";

export default function PresenceBar() {
    const [users, setUsers] = useState<PresenceUser[]>([]);
    const [typingUser, setTypingUser] = useState<string | null>(null);

    useEffect(() => {
        const load = async () => {
            const active = await collabService.getActiveUsers();
            setUsers(active);
        };
        load();

        const stopTyping = collabService.onUserTyping((userId) => {
            setTypingUser(userId);
            setTimeout(() => setTypingUser(null), 2000);
        });

        return () => stopTyping();
    }, []);

    return (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-xl">
            <div className="flex -space-x-2 mr-2">
                {users.map((user) => (
                    <div 
                        key={user.id}
                        className={`w-7 h-7 rounded-full border-2 border-[#0a0a0a] flex items-center justify-center text-[10px] font-bold text-white relative group cursor-pointer transition-transform hover:scale-110 hover:z-10 ${
                            user.status === 'online' ? 'bg-indigo-600' : 'bg-neutral-800'
                        }`}
                        title={`${user.name} - ${user.currentView}`}
                    >
                        {user.avatar}
                        {user.status === 'online' && (
                            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-[#0a0a0a]" />
                        )}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-black text-[8px] font-black uppercase tracking-widest rounded border border-white/10 opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">
                            {user.name} ({user.currentView})
                        </div>
                    </div>
                ))}
            </div>

            <AnimatePresence>
                {typingUser && (
                    <motion.div 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="flex items-center gap-1.5"
                    >
                        <div className="flex gap-0.5">
                            <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1 h-1 bg-white/40 rounded-full" />
                            <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1 h-1 bg-white/40 rounded-full" />
                            <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1 h-1 bg-white/40 rounded-full" />
                        </div>
                        <span className="text-[8px] font-mono text-white/40 uppercase tracking-widest">
                            {users.find(u => u.id === typingUser)?.name} is synthesizing...
                        </span>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
