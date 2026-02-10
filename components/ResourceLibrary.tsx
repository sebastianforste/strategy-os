"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Folder, FileText, Search, Filter, MoreVertical, Plus, Grid, List, FolderPlus, Download, ExternalLink, Trash2, Zap } from "lucide-react";

interface Resource {
    id: string;
    name: string;
    type: 'strategy' | 'post' | 'brief' | 'research';
    folder: string;
    date: string;
    size: string;
}

const INITIAL_RESOURCES: Resource[] = [
    { id: '1', name: 'Q1 Enterprise Strategy', type: 'strategy', folder: 'Strategies', date: '2026-02-10', size: '124 KB' },
    { id: '2', name: 'LinkedIn Ghostwriter V2', type: 'post', folder: 'Content', date: '2026-02-09', size: '12 KB' },
    { id: '3', name: 'Competitor Analysis - TechCorp', type: 'research', folder: 'Research', date: '2026-02-08', size: '2.4 MB' },
    { id: '4', name: 'Brand Voice Cloning Guide', type: 'brief', folder: 'Training', date: '2026-02-07', size: '45 KB' },
];

const FOLDERS = ['All', 'Strategies', 'Content', 'Research', 'Training'];

export default function ResourceLibrary() {
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [selectedFolder, setSelectedFolder] = useState('All');
    const [resources] = useState<Resource[]>(INITIAL_RESOURCES);

    const filtered = selectedFolder === 'All' 
        ? resources 
        : resources.filter(r => r.folder === selectedFolder);

    return (
        <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-8 min-h-[600px]">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-10">
                <div className="flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-brand-500/10 text-brand-400">
                        <Folder className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white uppercase tracking-tight">Resource Library</h2>
                        <p className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-mono mt-1">Enterprise Asset Manager</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
                        <input 
                            type="text" 
                            placeholder="SEARCH ASSETS..." 
                            className="bg-white/5 border border-white/10 rounded-xl py-2 pl-9 pr-4 text-[10px] text-white focus:outline-none focus:border-brand-500/50 w-48 transition-all"
                        />
                    </div>
                    <button className="p-2.5 bg-brand-500 text-white rounded-xl hover:scale-105 transition-all shadow-lg shadow-brand-500/20">
                        <Plus className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Folder Tabs & View Switch */}
            <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-4">
                <div className="flex gap-2 overflow-x-auto custom-scrollbar no-scrollbar">
                    {FOLDERS.map(folder => (
                        <button
                            key={folder}
                            onClick={() => setSelectedFolder(folder)}
                            className={`px-4 py-1.5 rounded-full text-[10px] font-bold transition-all uppercase tracking-widest ${
                                selectedFolder === folder 
                                    ? "bg-white/10 text-white shadow-xl" 
                                    : "text-white/30 hover:text-white"
                            }`}
                        >
                            {folder}
                        </button>
                    ))}
                </div>
                
                <div className="flex bg-white/5 p-1 rounded-xl">
                    <button 
                        onClick={() => setViewMode('grid')}
                        className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white/10 text-white' : 'text-white/20 hover:text-white'}`}
                    >
                        <Grid className="w-4 h-4" />
                    </button>
                    <button 
                        onClick={() => setViewMode('list')}
                        className={`p-1.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white/10 text-white' : 'text-white/20 hover:text-white'}`}
                    >
                        <List className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Content Area */}
            {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {filtered.map(resource => (
                        <motion.div
                            key={resource.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="group bg-white/5 border border-white/5 rounded-2xl p-5 hover:border-white/20 hover:bg-white/[0.08] transition-all relative overflow-hidden"
                        >
                            <div className="mb-4 flex items-center justify-between">
                                <div className={`p-2.5 rounded-xl ${
                                    resource.type === 'strategy' ? 'bg-purple-500/20 text-purple-400' :
                                    resource.type === 'research' ? 'bg-blue-500/20 text-blue-400' :
                                    'bg-amber-500/20 text-amber-400'
                                }`}>
                                    {resource.type === 'strategy' ? <Zap className="w-5 h-5" /> : 
                                     resource.type === 'research' ? <Search className="w-5 h-5" /> : 
                                     <FileText className="w-5 h-5" />}
                                </div>
                                <button className="text-white/20 hover:text-white transition-all opacity-0 group-hover:opacity-100">
                                    <MoreVertical className="w-4 h-4" />
                                </button>
                            </div>
                            <h3 className="text-xs font-bold text-white mb-1 uppercase tracking-tight line-clamp-1">{resource.name}</h3>
                            <div className="flex items-center justify-between mt-4">
                                <span className="text-[9px] font-mono text-white/20 uppercase">{resource.date}</span>
                                <span className="text-[9px] font-mono text-white/20">{resource.size}</span>
                            </div>
                        </motion.div>
                    ))}
                    
                    {/* Add Card */}
                    <button className="border-2 border-dashed border-white/5 rounded-2xl flex flex-col items-center justify-center p-8 text-white/20 hover:text-white/40 hover:border-white/10 transition-all gap-3 group">
                        <FolderPlus className="w-8 h-8 group-hover:scale-110 transition-transform" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">New Resource</span>
                    </button>
                </div>
            ) : (
                <div className="space-y-2">
                    {filtered.map(resource => (
                        <motion.div
                            key={resource.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="group flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/[0.08] transition-all"
                        >
                            <div className="flex items-center gap-4">
                                <FileText className="w-4 h-4 text-white/30" />
                                <span className="text-xs font-bold text-white uppercase tracking-tight">{resource.name}</span>
                            </div>
                            <div className="flex items-center gap-8">
                                <span className="text-[10px] font-mono text-white/30 truncate w-24 hidden md:block">{resource.folder}</span>
                                <span className="text-[10px] font-mono text-white/30 hidden md:block">{resource.size}</span>
                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                    <button className="p-1.5 hover:bg-white/10 rounded-lg text-white/50 hover:text-white" title="Download">
                                        <Download className="w-3.5 h-3.5" />
                                    </button>
                                    <button className="p-1.5 hover:bg-white/10 rounded-lg text-white/50 hover:text-white" title="Open">
                                        <ExternalLink className="w-3.5 h-3.5" />
                                    </button>
                                    <button className="p-1.5 hover:bg-red-500/20 rounded-lg text-white/50 hover:text-red-400" title="Delete">
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Bottom Stats */}
            <div className="mt-12 flex flex-col md:flex-row items-center justify-between p-6 bg-white/5 border border-white/10 rounded-2xl gap-6">
                <div className="flex items-center gap-6">
                    <div>
                        <p className="text-[9px] text-white/30 uppercase tracking-widest font-mono mb-1">Storage Used</p>
                        <div className="flex items-center gap-3">
                            <div className="w-32 h-1.5 bg-white/10 rounded-full overflow-hidden">
                                <div className="h-full bg-brand-500" style={{ width: '42%' }} />
                            </div>
                            <span className="text-[10px] font-bold text-white">4.2 / 10 GB</span>
                        </div>
                    </div>
                </div>
                <button className="w-full md:w-auto px-6 py-2.5 bg-white/5 border border-white/10 rounded-xl text-[10px] font-bold text-white hover:bg-white/10 transition-all uppercase tracking-widest">
                    Manage Cloud Access
                </button>
            </div>
        </div>
    );
}
