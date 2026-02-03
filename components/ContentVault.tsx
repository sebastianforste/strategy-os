import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Star, Trash2, Copy, FileText, Zap, TrendingUp, Grid, List as ListIcon, Sparkles, Check, Mail } from 'lucide-react';
import { VaultService, VaultAsset, AssetType } from '../utils/vault-service';
import { aggregateAssetsForNewsletter } from '../utils/newsletter-service';
import ReactMarkdown from 'react-markdown';

interface ContentVaultProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function ContentVault({ isOpen, onClose }: ContentVaultProps) {
    const [assets, setAssets] = useState<VaultAsset[]>([]);
    const [filterType, setFilterType] = useState<AssetType | 'all'>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [selectedAsset, setSelectedAsset] = useState<VaultAsset | null>(null);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isSynthesizing, setIsSynthesizing] = useState(false);
    const [newsletterContent, setNewsletterContent] = useState<string | null>(null);

    const service = new VaultService();

    useEffect(() => {
        if (isOpen) {
            loadAssets();
        }
    }, [isOpen]);

    const loadAssets = () => {
        setAssets(service.getAllAssets());
    };

    const handleDelete = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm('Are you sure you want to delete this asset?')) {
            service.deleteAsset(id);
            loadAssets();
            if (selectedAsset?.id === id) setSelectedAsset(null);
        }
    };

    const handleFavorite = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        service.toggleFavorite(id);
        loadAssets();
    };

    const copyToClipboard = (text: any) => {
        const textToCopy = typeof text === 'string' ? text : JSON.stringify(text, null, 2);
        navigator.clipboard.writeText(textToCopy);
    };

    const toggleSelection = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedIds(prev => 
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleGenerateNewsletter = async () => {
        if (selectedIds.length === 0) return;
        
        setIsSynthesizing(true);
        setNewsletterContent("");
        
        const selectedAssets = assets.filter(a => selectedIds.includes(a.id));
        const aggregatedPrompt = aggregateAssetsForNewsletter(selectedAssets);
        
        try {
            const apiKeys = JSON.parse(localStorage.getItem('strategy_os_api_keys') || '{}');
            const response = await fetch('/api/newsletter', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: aggregatedPrompt, apiKeys })
            });

            if (!response.ok) throw new Error("Newsletter generation failed");

            const reader = response.body?.getReader();
            const decoder = new TextDecoder();
            
            if (reader) {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    const chunk = decoder.decode(value);
                    setNewsletterContent(prev => (prev || "") + chunk);
                }
            }
        } catch (e) {
            console.error(e);
            alert("Synthesis failed. Check console.");
        } finally {
            setIsSynthesizing(false);
        }
    };

    const filteredAssets = assets.filter(asset => {
        const matchesType = filterType === 'all' || asset.type === filterType;
        const matchesSearch = asset.title.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesType && matchesSearch;
    });

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-[#0A0A0A] border border-white/10 rounded-3xl w-full max-w-6xl h-[85vh] flex overflow-hidden shadow-2xl relative"
            >
                {/* TOOLBAR (Top) */}
                <div className="absolute top-0 left-0 right-0 h-16 border-b border-white/10 flex items-center justify-between px-6 bg-neutral-900/50 z-10">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-white font-bold">
                            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                                <Grid className="w-4 h-4 text-indigo-400" />
                            </div>
                            Content Vault
                        </div>
                        <div className="h-6 w-px bg-white/10 mx-2" />
                        <div className="flex bg-black/50 p-1 rounded-lg border border-white/10">
                            {['all', 'viral_hook', 'lead_magnet', 'growth_scenario', 'meeting_summary'].map((type) => (
                                <button
                                    key={type}
                                    onClick={() => setFilterType(type as any)}
                                    className={`px-3 py-1 rounded-md text-xs font-bold capitalize transition-all ${filterType === type ? 'bg-white/10 text-white' : 'text-neutral-500 hover:text-white'}`}
                                >
                                    {type.replace('_', ' ')}
                                </button>
                            ))}
                        </div>
                        {selectedIds.length > 0 && (
                            <motion.button
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                onClick={handleGenerateNewsletter}
                                className="flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg text-xs font-black text-white hover:scale-105 transition-all shadow-lg shadow-indigo-500/20"
                            >
                                <Sparkles className="w-3.5 h-3.5" />
                                GENERATE NEWSLETTER ({selectedIds.length})
                            </motion.button>
                        )}
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                            <input 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search library..."
                                className="bg-black/50 border border-white/10 rounded-full pl-10 pr-4 py-1.5 text-sm text-white focus:outline-none focus:border-indigo-500/50 w-64"
                            />
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-neutral-400 hover:text-white transition-colors">
                            ✕
                        </button>
                    </div>
                </div>

                {/* MAIN CONTENT AREA */}
                <div className="flex flex-1 mt-16 w-full">
                    {/* ASSET LIST (Left) */}
                    <div className={`${(selectedAsset || newsletterContent) ? 'w-1/3' : 'w-full'} border-r border-white/10 overflow-y-auto bg-neutral-900/20 p-6 transition-all duration-300`}>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                            {filteredAssets.map(asset => (
                                <motion.div
                                    layoutId={asset.id}
                                    key={asset.id}
                                    onClick={() => setSelectedAsset(asset)}
                                    className={`relative group aspect-[4/3] rounded-xl border p-4 cursor-pointer transition-all flex flex-col justify-between hover:scale-[1.02] ${selectedAsset?.id === asset.id ? 'bg-indigo-500/10 border-indigo-500' : 'bg-black/40 border-white/5 hover:border-white/20'}`}
                                >
                                    <div className="flex items-center gap-2">
                                        <button 
                                            onClick={(e) => toggleSelection(asset.id, e)}
                                            className={`p-1.5 rounded-lg border transition-all ${selectedIds.includes(asset.id) ? 'bg-indigo-500 border-indigo-400 text-white' : 'bg-black/40 border-white/10 text-neutral-500 hover:border-white/30'}`}
                                        >
                                            {selectedIds.includes(asset.id) ? <Check className="w-3.5 h-3.5" /> : <div className="w-3.5 h-3.5" />}
                                        </button>
                                        <div className={`p-2 rounded-lg ${
                                            asset.type === 'viral_hook' ? 'bg-green-500/10 text-green-400' :
                                            asset.type === 'lead_magnet' ? 'bg-amber-500/10 text-amber-400' :
                                            asset.type === 'meeting_summary' ? 'bg-indigo-500/10 text-indigo-400' :
                                            'bg-purple-500/10 text-purple-400'
                                        }`}>
                                            {asset.type === 'viral_hook' && <Zap className="w-3 h-3" />}
                                            {asset.type === 'lead_magnet' && <FileText className="w-3 h-3" />}
                                            {asset.type === 'growth_scenario' && <TrendingUp className="w-3 h-3" />}
                                            {asset.type === 'meeting_summary' && <Mail className="w-3 h-3" />}
                                        </div>
                                    </div>
                                    
                                    <button 
                                        onClick={(e) => handleFavorite(asset.id, e)}
                                        className={`p-1.5 rounded-full transition-colors absolute top-4 right-4 ${asset.isFavorite ? 'text-yellow-400' : 'text-neutral-600 hover:text-yellow-400'}`}
                                    >
                                        <Star className={`w-4 h-4 ${asset.isFavorite ? 'fill-yellow-400' : ''}`} />
                                    </button>

                                    <div>
                                        <h3 className="text-sm font-bold text-white line-clamp-2 mb-1">{asset.title}</h3>
                                        <p className="text-[10px] text-neutral-500">
                                            {new Date(asset.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* PREVIEW PANEL (Right) */}
                    {(selectedAsset || newsletterContent !== null) && (
                        <div className="flex-1 bg-black p-8 overflow-y-auto w-2/3 animate-in slide-in-from-right-10 relative">
                            {newsletterContent !== null ? (
                                <div className="max-w-3xl mx-auto">
                                    <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-6">
                                        <div className="flex items-center gap-3">
                                            <Sparkles className="w-6 h-6 text-indigo-400" />
                                            <h2 className="text-2xl font-bold text-white tracking-tight">Autonomous Strategic Synthesis</h2>
                                        </div>
                                        <div className="flex gap-2">
                                            <button 
                                                onClick={() => copyToClipboard(newsletterContent)}
                                                className="px-4 py-2 bg-white text-black rounded-lg text-xs font-black uppercase tracking-widest hover:bg-neutral-200 transition-all shadow-lg"
                                            >
                                                Copy Newsletter
                                            </button>
                                            <button 
                                                onClick={() => setNewsletterContent(null)}
                                                className="p-2 text-neutral-500 hover:text-white"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    </div>

                                    {isSynthesizing && !newsletterContent && (
                                        <div className="flex flex-col items-center justify-center py-20 opacity-50">
                                            <Zap className="w-12 h-12 text-indigo-500 animate-pulse mb-4" />
                                            <p className="text-sm font-mono text-indigo-400">Synthesizing multiple intelligence streams...</p>
                                        </div>
                                    )}

                                    <div className="prose prose-invert prose-indigo max-w-none prose-sm leading-relaxed">
                                        <ReactMarkdown>{newsletterContent}</ReactMarkdown>
                                    </div>
                                </div>
                            ) : selectedAsset && (
                                <div className="max-w-3xl mx-auto">
                                    <div className="flex justify-between items-start mb-8 border-b border-white/10 pb-6">
                                        <div>
                                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border mb-2 inline-block ${
                                                selectedAsset.type === 'viral_hook' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                                selectedAsset.type === 'lead_magnet' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                                                selectedAsset.type === 'meeting_summary' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' :
                                                'bg-purple-500/10 text-purple-400 border-purple-500/20'
                                            }`}>
                                                {selectedAsset.type.replace('_', ' ')}
                                            </span>
                                            <h2 className="text-2xl font-bold text-white">{selectedAsset.title}</h2>
                                        </div>
                                        <div className="flex gap-2">
                                            <button 
                                                onClick={() => copyToClipboard(selectedAsset.content)}
                                                className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-medium text-white flex items-center gap-2 transition-colors border border-white/10"
                                            >
                                                <Copy className="w-3 h-3" /> Copy Raw
                                            </button>
                                            <button 
                                                onClick={(e) => handleDelete(selectedAsset.id, e)}
                                                className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 rounded-lg text-xs font-medium text-red-400 flex items-center gap-2 transition-colors border border-red-500/20"
                                            >
                                                <Trash2 className="w-3 h-3" /> Delete
                                            </button>
                                        </div>
                                    </div>

                                    <div className="bg-neutral-900/50 rounded-xl p-6 border border-white/5 font-mono text-sm text-neutral-300 overflow-x-auto">
                                        <pre className="whitespace-pre-wrap">
                                            {JSON.stringify(selectedAsset.content, null, 2)}
                                        </pre>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
