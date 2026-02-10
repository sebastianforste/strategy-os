
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, UserPlus, Shield, X, Check, Copy, Loader2, Mail, Crown } from "lucide-react";
import { getTeamDetailsAction, inviteMemberAction } from "../actions/team";
import { useSession } from "next-auth/react";

interface TeamSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function TeamSettingsModal({ isOpen, onClose }: TeamSettingsModalProps) {
    const { data: session } = useSession();
    const [team, setTeam] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [inviteEmail, setInviteEmail] = useState("");
    const [isInviting, setIsInviting] = useState(false);
    const [inviteLink, setInviteLink] = useState("");

    useEffect(() => {
        if (isOpen) {
            loadTeam();
        }
    }, [isOpen]);

    const loadTeam = async () => {
        setLoading(true);
        const res = await getTeamDetailsAction();
        if (res.success) {
            setTeam(res.team);
        }
        setLoading(false);
    };

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inviteEmail) return;

        setIsInviting(true);
        const res = await inviteMemberAction(inviteEmail);
        setIsInviting(false);

        if (res.success) {
            setInviteLink(res.inviteLink);
            setInviteEmail("");
            loadTeam(); // Reload to see pending invite if we were showing them
        } else {
            alert(res.error);
        }
    };

    const copyLink = () => {
        navigator.clipboard.writeText(inviteLink);
        alert("Invite link copied!");
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-neutral-900 border border-white/10 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl"
            >
                <div className="p-6 border-b border-white/10 flex items-center justify-between bg-black/40">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-indigo-500/20 rounded-xl text-indigo-400">
                            <Users className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Agency Team</h2>
                            <p className="text-sm text-neutral-400">Manage members and permissions</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-neutral-500 hover:text-white transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-6 max-h-[60vh] overflow-y-auto">
                    {loading ? (
                        <div className="flex justify-center p-12">
                            <Loader2 className="w-8 h-8 animate-spin text-neutral-500" />
                        </div>
                    ) : team ? (
                        <div className="space-y-8">
                            {/* Team Header */}
                            <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                                <div>
                                    <h3 className="text-lg font-bold text-white">{team.name}</h3>
                                    <p className="text-xs text-neutral-500 font-mono">/{team.slug}</p>
                                </div>
                                <div className="px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-full text-xs font-bold uppercase tracking-wider">
                                    {team.members.length} Members
                                </div>
                            </div>

                            {/* Invite Section */}
                            <div>
                                <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                                    <UserPlus className="w-4 h-4 text-indigo-400" />
                                    Invite New Member
                                </h4>
                                <form onSubmit={handleInvite} className="flex gap-2">
                                    <div className="relative flex-1">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                                        <input 
                                            type="email" 
                                            value={inviteEmail}
                                            onChange={(e) => setInviteEmail(e.target.value)}
                                            placeholder="colleague@agency.com"
                                            className="w-full bg-black/50 border border-white/10 rounded-lg py-2 pl-10 pr-4 text-white text-sm focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50"
                                        />
                                    </div>
                                    <button 
                                        type="submit"
                                        disabled={isInviting || !inviteEmail}
                                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-500 disabled:opacity-50 transition-colors"
                                    >
                                        {isInviting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send Invite"}
                                    </button>
                                </form>

                                {inviteLink && (
                                    <div className="mt-4 p-3 bg-green-900/20 border border-green-500/30 rounded-lg flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-green-400 text-sm">
                                            <Check className="w-4 h-4" />
                                            <span>Invitation created! Share this link:</span>
                                        </div>
                                        <button 
                                            onClick={copyLink}
                                            className="flex items-center gap-1 text-xs font-bold text-green-300 hover:text-white uppercase tracking-wider bg-green-500/20 px-2 py-1 rounded"
                                        >
                                            <Copy className="w-3 h-3" /> Copy
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Members List */}
                            <div>
                                <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                                    <Shield className="w-4 h-4 text-neutral-400" />
                                    Team Members
                                </h4>
                                <div className="space-y-2">
                                    {team.members.map((member: any) => (
                                        <div key={member.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-neutral-700 to-neutral-900 flex items-center justify-center text-xs font-bold text-white border border-white/10">
                                                    {member.name?.[0] || member.email?.[0] || "?"}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-bold text-white">{member.name || "Unknown"}</div>
                                                    <div className="text-xs text-neutral-500">{member.email}</div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {member.role === 'ADMIN' && <Crown className="w-3 h-3 text-amber-400" />}
                                                <span className="text-xs font-mono text-neutral-400 uppercase">{member.role}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            
               
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <p className="text-neutral-500">You are not part of a team yet.</p>
                            <button className="mt-4 px-4 py-2 bg-white text-black font-bold rounded-lg hover:bg-neutral-200">
                                Create a Team
                            </button>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
