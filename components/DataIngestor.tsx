"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileText, Database, Globe, Search, Plus, Filter, RefreshCcw, CheckCircle, AlertCircle, FileDigit, Brain, ChevronRight, HardDrive } from "lucide-react";

interface Document {
    id: string;
    name: string;
    type: 'PDF' | 'DOCX' | 'URL' | 'JSON';
    status: 'Ingested' | 'Processing' | 'Failed';
    size: string;
    entities: number;
}

const INITIAL_DOCS: Document[] = [
    { id: 'd1', name: 'StrategyOS_Enterprise_Specs.pdf', type: 'PDF', status: 'Ingested', size: '2.4 MB', entities: 42 },
    { id: 'd2', name: 'Market_Trends_2026.docx', type: 'DOCX', status: 'Processing', size: '1.1 MB', entities: 0 },
    { id: 'd3', name: 'Competitor_Analysis.json', type: 'JSON', status: 'Ingested', size: '840 KB', entities: 128 },
];

export default function DataIngestor() {
    const [docs, setDocs] = useState<Document[]>(INITIAL_DOCS);
    const [isUploading, setIsUploading] = useState(false);

    const handleUpload = () => {
        setIsUploading(true);
        setTimeout(() => {
            setIsUploading(false);
            const newDoc: Document = {
                id: `d${docs.length + 1}`,
                name: 'Financial_Quarterly_Report.pdf',
                type: 'PDF',
                status: 'Processing',
                size: '4.8 MB',
                entities: 0
            };
            setDocs([newDoc, ...docs]);
        }, 2000);
    };

    return (
        <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-8 min-h-[700px]">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12">
                <div className="flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-brand-500/10 text-brand-400 border border-brand-500/20">
                        <HardDrive className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white uppercase tracking-tight">Intelligence Ingestion</h2>
                        <p className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-mono mt-1">Multi-Source Knowledge Harvesting</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
                        <button className="p-2 text-white/40 hover:text-white transition-colors"><Search className="w-4 h-4" /></button>
                        <button className="p-2 text-white/40 hover:text-white transition-colors"><Filter className="w-4 h-4" /></button>
                    </div>
                    <button 
                        onClick={handleUpload}
                        disabled={isUploading}
                        className="px-6 py-2.5 bg-brand-500 text-white rounded-xl text-[10px] font-black tracking-widest hover:scale-105 transition-all shadow-lg shadow-brand-500/20 uppercase flex items-center gap-2"
                    >
                        {isUploading ? <RefreshCcw className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                        <span>Ingest Data</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* INGESTION QUEUE */}
                <div className="lg:col-span-2 space-y-4">
                    <h3 className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-4">Document Knowledge Base</h3>
                    <AnimatePresence>
                        {docs.map((doc) => (
                            <motion.div
                                key={doc.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="p-5 bg-white/5 border border-white/5 rounded-2xl hover:border-white/10 transition-all group flex items-center justify-between"
                            >
                                <div className="flex items-center gap-5 flex-1 min-w-0">
                                    <div className={`p-3 rounded-xl ${
                                        doc.type === 'PDF' ? 'bg-rose-500/10 text-rose-400' : 
                                        doc.type === 'JSON' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-blue-500/10 text-blue-400'
                                    } border border-white/5`}>
                                        <FileText className="w-4 h-4" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-sm font-bold text-white uppercase tracking-tight truncate">{doc.name}</h4>
                                        <div className="flex items-center gap-3 mt-1">
                                            <span className="text-[9px] font-mono text-white/20 uppercase tracking-tighter">{doc.size}</span>
                                            <span className="w-1 h-1 rounded-full bg-white/10" />
                                            <span className="text-[9px] font-bold text-brand-400 uppercase tracking-widest">{doc.type} SOURCE</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-6">
                                    <div className="text-right">
                                        <p className="text-[8px] font-black text-white/20 uppercase mb-1">Status</p>
                                        <div className="flex items-center gap-1.5 justify-end">
                                            {doc.status === 'Processing' ? (
                                                <RefreshCcw className="w-3 h-3 text-amber-500 animate-spin" />
                                            ) : (
                                                <CheckCircle className="w-3 h-3 text-emerald-500" />
                                            )}
                                            <span className={`text-[10px] font-bold uppercase tracking-tight ${
                                                doc.status === 'Processing' ? 'text-amber-500' : 'text-emerald-500'
                                            }`}>
                                                {doc.status}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="w-px h-8 bg-white/5" />
                                    <div className="text-right min-w-[60px]">
                                        <p className="text-[8px] font-black text-white/20 uppercase mb-1">Entities</p>
                                        <p className="text-sm font-black text-white">{doc.entities || '-'}</p>
                                    </div>
                                    <button className="p-2 text-white/10 hover:text-white transition-colors group-hover:bg-white/5 rounded-lg">
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {/* ANALYTICS OPS */}
                <div className="space-y-6">
                    <h3 className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-4">Semantic Engine</h3>
                    
                    <div className="p-8 bg-brand-500/5 border border-brand-500/10 rounded-3xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:rotate-12 transition-transform duration-700">
                            <Brain className="w-32 h-32 text-brand-400" />
                        </div>
                        
                        <div className="flex items-center gap-3 mb-6">
                            <FileDigit className="w-5 h-5 text-brand-400" />
                            <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Global Vector Store</h4>
                        </div>
                        
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <div className="flex justify-between text-[10px] font-bold text-white/40 uppercase">
                                    <span>Knowledge Recall</span>
                                    <span>98.8%</span>
                                </div>
                                <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full bg-brand-500" style={{ width: '98.8%' }} />
                                </div>
                            </div>
                            
                            <div className="pt-4 space-y-3">
                                <div className="flex items-start gap-3">
                                    <Globe className="w-4 h-4 text-white/20 mt-0.5" />
                                    <div>
                                        <p className="text-[10px] font-bold text-white uppercase tracking-tight">External Sync</p>
                                        <p className="text-[9px] text-white/40 leading-relaxed italic">Connected to 14 private data lakes.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Database className="w-4 h-4 text-white/20 mt-0.5" />
                                    <div>
                                        <p className="text-[10px] font-bold text-white uppercase tracking-tight">Storage Pool</p>
                                        <p className="text-[9px] text-white/40 leading-relaxed italic">84GB Primary • 1.2TB Deep Archive</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5" />
                            <div>
                                <h4 className="text-[10px] font-bold text-white uppercase tracking-widest mb-1">Compliance Guard</h4>
                                <p className="text-[9px] text-white/40 leading-relaxed italic">
                                    Data PII masking is currently active. 4 potential sensitive entities were automatically redacted during last ingestion.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
