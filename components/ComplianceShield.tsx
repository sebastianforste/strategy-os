"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldAlert, ShieldCheck, Lock, Eye, EyeOff, Search, FileText, Globe, AlertTriangle, CheckCircle, RefreshCw, Zap, Database, ChevronRight, Activity, Cpu, Shield, UserX, Fingerprint } from "lucide-react";

interface ComplianceIssue {
    id: string;
    type: 'PII' | 'PR Risk' | 'Legal' | 'Banned Word';
    severity: 'High' | 'Medium' | 'Low';
    description: string;
    status: 'Flagged' | 'Redacted' | 'Ignored';
}

const ISSUES: ComplianceIssue[] = [
    { id: 'i1', type: 'PII', severity: 'High', description: 'Internal database endpoint discovered in draft.', status: 'Flagged' },
    { id: 'i2', type: 'PR Risk', severity: 'Medium', description: 'Potentially inflammatory comparison to competitor.', status: 'Flagged' },
    { id: 'i3', type: 'Banned Word', severity: 'Low', description: 'Found "Exclusive Access" - flagged for over-hype.', status: 'Redacted' },
];

export default function ComplianceShield() {
    const [issues] = useState<ComplianceIssue[]>(ISSUES);
    const [isScanning, setIsScanning] = useState(false);

    const handleScan = () => {
        setIsScanning(true);
        setTimeout(() => setIsScanning(false), 2500);
    };

    return (
        <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-8 min-h-[700px]">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12">
                <div className="flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 shadow-[0_0_20px_rgba(245,158,11,0.1)]">
                        <ShieldAlert className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white uppercase tracking-tight">Compliance Shield</h2>
                        <p className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-mono mt-1">Autonomous PII Redaction & Multi-Region Legal Auditing</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button 
                        onClick={handleScan}
                        disabled={isScanning}
                        className="px-6 py-2.5 bg-amber-500 text-white rounded-xl text-[10px] font-black tracking-widest hover:shadow-[0_0_30px_rgba(245,158,11,0.3)] transition-all uppercase flex items-center gap-2"
                    >
                        {isScanning ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Shield className="w-3.5 h-3.5" />}
                        <span>{isScanning ? "Hardening..." : "Initiate Audit"}</span>
                    </button>
                    <div className="p-2.5 bg-white/5 border border-white/10 rounded-xl text-white/40">
                        <Lock className="w-4 h-4" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* AUDIT LOGS */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Live Integrity Stream</h3>
                        <div className="flex items-center gap-4 text-[10px] font-black text-white/40 uppercase tracking-widest">
                            <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Pipeline: Secure</span>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {issues.map((issue) => (
                            <motion.div
                                key={issue.id}
                                whileHover={{ x: 4 }}
                                className={`p-6 bg-white/[0.02] border rounded-[32px] transition-all group ${
                                    issue.severity === 'High' ? 'border-rose-500/20 shadow-[0_0_30px_rgba(244,63,94,0.05)]' : 'border-white/5 shadow-xl'
                                }`}
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-3 rounded-xl ${
                                            issue.severity === 'High' ? 'bg-rose-500/10 text-rose-500' : 
                                            issue.severity === 'Medium' ? 'bg-amber-500/10 text-amber-500' : 'bg-emerald-500/10 text-emerald-400'
                                        }`}>
                                            {issue.type === 'PII' ? <UserX className="w-4 h-4" /> : 
                                             issue.type === 'PR Risk' ? <AlertTriangle className="w-4 h-4" /> : <Fingerprint className="w-4 h-4" />}
                                        </div>
                                        <div>
                                            <h4 className="text-[10px] font-black text-white uppercase tracking-widest">{issue.type} Deteced</h4>
                                            <p className="text-[8px] font-mono text-white/20 uppercase mt-0.5">{issue.severity} Severity Threat</p>
                                        </div>
                                    </div>
                                    <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${
                                        issue.status === 'Flagged' ? 'bg-rose-500 text-black' : 
                                        issue.status === 'Redacted' ? 'bg-emerald-500 text-black' : 'bg-white/5 text-white/40'
                                    }`}>
                                        {issue.status}
                                    </span>
                                </div>
                                <p className="text-[11px] text-white/60 leading-relaxed italic">"{issue.description}"</p>
                            </motion.div>
                        ))}
                    </div>

                    <div className="p-8 bg-white/[0.01] border border-white/5 rounded-[40px] space-y-4">
                        <div className="flex items-center gap-3">
                            <FileText className="w-4 h-4 text-amber-400" />
                            <h3 className="text-[10px] font-black text-white uppercase tracking-widest">Redaction Sandbox</h3>
                        </div>
                        <div className="p-6 bg-black/40 rounded-3xl border border-white/5 font-mono text-[11px] leading-relaxed">
                            <span className="text-white">Connecting to server: </span>
                            <span className="bg-white text-black px-1 rounded mx-1">REDACTED_IPV4</span>
                            <span className="text-white"> with credential set </span>
                            <span className="bg-white text-black px-1 rounded mx-1">STRAT_ADMIN_KEY</span>
                            <span className="text-white">. Status: Unsecured. Recommendation: Immediate Hash Swap.</span>
                        </div>
                    </div>
                </div>

                {/* SHIELD VITALS */}
                <div className="space-y-6">
                    <h3 className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-4">Hardening Metrics</h3>
                    
                    <div className="p-8 bg-amber-500/5 border border-amber-500/10 rounded-3xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-700">
                            <Lock className="w-32 h-32 text-amber-400" />
                        </div>
                        
                        <div className="flex items-center gap-3 mb-8">
                            <Activity className="w-5 h-5 text-amber-400" />
                            <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Safety Score</h4>
                        </div>
                        
                        <div className="text-4xl font-black text-white tracking-tighter mb-2">92.4%</div>
                        <p className="text-[10px] text-white/40 uppercase font-black tracking-widest mb-8">Corporate Asset Hardening</p>

                        <div className="space-y-4">
                            <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                                <motion.div initial={{ width: 0 }} animate={{ width: '92%' }} className="h-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
                            </div>
                        </div>
                    </div>

                    <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl space-y-4">
                        <div className="flex items-center gap-3">
                            <Globe className="w-4 h-4 text-amber-400" />
                            <h4 className="text-[10px] font-bold text-white uppercase tracking-widest">Multi-Region compliance</h4>
                        </div>
                        <div className="space-y-3">
                            <RegionItem label="GDPR (EU)" status="Compliant" />
                            <RegionItem label="CCPA (CA)" status="Audit Pending" />
                            <RegionItem label="PDPA (SG)" status="Compliant" />
                        </div>
                    </div>

                    <div className="p-6 border border-white/5 rounded-2xl flex items-center justify-between cursor-pointer hover:bg-white/5 transition-all group">
                        <div className="flex items-center gap-3">
                            <Database className="w-4 h-4 text-white/20 group-hover:text-white" />
                            <span className="text-[10px] font-bold text-white uppercase tracking-tight">Access Audit Vault</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-white/20" />
                    </div>
                </div>
            </div>
        </div>
    );
}

function RegionItem({ label, status }: { label: string, status: string }) {
    return (
        <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
            <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">{label}</span>
            <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${
                status === 'Compliant' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-500'
            }`}>
                {status}
            </span>
        </div>
    );
}
