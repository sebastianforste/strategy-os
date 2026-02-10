"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Shield, Lock, Eye, Edit3, Trash2, UserPlus, Fingerprint, History, CheckCircle, AlertTriangle } from "lucide-react";

interface Role {
    name: string;
    level: string;
    permissions: string[];
    users: number;
}

const ROLES: Role[] = [
    { name: 'Architect', level: 'Level 5', permissions: ['All Access', 'System Config', 'Team Mgmt'], users: 2 },
    { name: 'Strategist', level: 'Level 3', permissions: ['Create Content', 'Edit Canvas', 'View Network'], users: 8 },
    { name: 'Compliance', level: 'Level 4', permissions: ['Approve Posts', 'Audit Logs'], users: 3 },
];

export default function PermissionsDashboard() {
    const [auditLogs] = useState([
        { id: 1, action: 'Modified Strategy API Keys', user: 'Sebastian', time: '2h ago', status: 'Security High' },
        { id: 2, action: 'Authorized LinkedIn Token', user: 'Ghost AI', time: '5h ago', status: 'Success' },
        { id: 3, action: 'Revoked Access: Temp_Agent', user: 'System', time: '1d ago', status: 'Action' },
    ]);

    return (
        <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-8 min-h-[600px]">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12">
                <div className="flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        <Shield className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white uppercase tracking-tight">Security & Governance</h2>
                        <p className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-mono mt-1">RBAC & Permission Matrix</p>
                    </div>
                </div>

                <button className="flex items-center gap-2 px-6 py-2.5 bg-white/5 border border-white/10 rounded-xl text-[10px] font-bold text-white hover:bg-white/10 transition-all uppercase tracking-widest">
                    <UserPlus className="w-4 h-4" />
                    <span>Invite Team</span>
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* ROLE MATRIX */}
                <div className="space-y-6">
                    <h3 className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-4">Active Role Matrix</h3>
                    {ROLES.map((role, idx) => (
                        <div key={idx} className="p-6 bg-white/5 border border-white/10 rounded-2xl hover:border-white/20 transition-all group">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center text-[10px] font-bold text-white border border-white/5">
                                        {role.level.split(' ')[1]}
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-white uppercase tracking-tight">{role.name}</h4>
                                        <p className="text-[9px] text-white/20 uppercase font-mono">{role.users} Active Users</p>
                                    </div>
                                </div>
                                <div className="flex gap-1">
                                    <div className="p-1.5 bg-white/5 rounded-md text-white/20"><Eye className="w-3 h-3" /></div>
                                    <div className="p-1.5 bg-white/5 rounded-md text-white/30"><Edit3 className="w-3 h-3" /></div>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {role.permissions.map((p, i) => (
                                    <span key={i} className="px-2 py-0.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/10 rounded text-[8px] font-bold uppercase">
                                        {p}
                                    </span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* AUDIT LOG & SECURITY */}
                <div className="space-y-6">
                    <h3 className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-4">Security Audit Trail</h3>
                    <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden">
                        {auditLogs.map((log) => (
                            <div key={log.id} className="p-4 border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-all flex items-start gap-4">
                                <div className={`p-2 rounded-lg mt-0.5 ${
                                    log.status.includes('High') ? 'bg-rose-500/10 text-rose-400' : 'bg-emerald-500/10 text-emerald-400'
                                }`}>
                                   <Fingerprint className="w-4 h-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <p className="text-[11px] font-bold text-white/80 truncate uppercase tracking-tight">{log.action}</p>
                                        <span className="text-[9px] font-mono text-white/20">{log.time}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-mono text-white/40">USER: {log.user}</span>
                                        <span className="w-1 h-1 rounded-full bg-white/10" />
                                        <span className="text-[9px] font-bold uppercase text-white/20">{log.status}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="p-6 bg-amber-500/5 border border-amber-500/10 rounded-3xl">
                        <div className="flex items-start gap-4">
                            <AlertTriangle className="w-5 h-5 text-amber-500" />
                            <div>
                                <h4 className="text-[10px] font-bold text-white uppercase tracking-widest mb-1">Infrastructure Lock</h4>
                                <p className="text-[10px] text-white/40 leading-relaxed italic">
                                    Session isolation is currently active. All team activities are immutable and signed via enterprise key.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
