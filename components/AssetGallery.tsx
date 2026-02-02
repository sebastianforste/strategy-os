"use client";

/**
 * ASSET GALLERY - 2028 Strategy Vault
 * 
 * Browses and manages previous high-status generations.
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Database, Calendar, Trash2, Download, FileText, Sparkles, X, Layers, BarChart3, ThumbsUp, MessageSquare, Share2, Eye, Save, Ghost, Send, Loader2 } from "lucide-react";
import { getArchivedStrategies, deleteArchivedStrategy, ArchivedStrategy, updateStrategyPerformance, PerformanceData } from "../utils/archive-service";
import { publishToPlatform, getPlatformConfig } from "../utils/distribution-service";

interface AssetGalleryProps {
  onClose: () => void;
}

export default function AssetGallery({ onClose }: AssetGalleryProps) {
  const [archives, setArchives] = useState<ArchivedStrategy[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPublishing, setIsPublishing] = useState<string | null>(null);
  const [metricsTarget, setMetricsTarget] = useState<ArchivedStrategy | null>(null);
  const [metricsForm, setMetricsForm] = useState({ impressions: 0, likes: 0, comments: 0, reposts: 0, saves: 0, shares: 0, reach: 0, dwellScore: 0 });

  useEffect(() => {
    loadArchives();
  }, []);

  const loadArchives = async () => {
    setLoading(true);
    const data = await getArchivedStrategies();
    setArchives(data);
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Permanently remove this strategy from the vault?")) {
      await deleteArchivedStrategy(id);
      loadArchives();
    }
  };

  const openMetricsModal = (item: ArchivedStrategy) => {
    setMetricsTarget(item);
    setMetricsForm({
      impressions: item.performance?.impressions || 0,
      likes: item.performance?.likes || 0,
      comments: item.performance?.comments || 0,
      reposts: item.performance?.reposts || 0,
      saves: (item.performance as any)?.saves || 0,
      shares: (item.performance as any)?.shares || 0,
      reach: (item.performance as any)?.reach || 0,
      dwellScore: (item.performance as any)?.dwellScore || 0
    });
  };

  const handleSaveMetrics = async () => {
    if (!metricsTarget) return;
    const performance: PerformanceData = {
      ...metricsForm,
      capturedAt: new Date().toISOString()
    };
    await updateStrategyPerformance(metricsTarget.id, performance);
    setMetricsTarget(null);
    loadArchives();
  };

  const handlePublish = async (item: ArchivedStrategy) => {
    const config = getPlatformConfig();
    if (!config.linkedInEnabled && !config.xEnabled) {
        alert("Ghost Protocol error: Connect a platform in 'Account Settings' first.");
        return;
    }

    if (!confirm(`Initialize Ghost Protocol? This will post "${item.topic}" directly to your linked accounts.`)) return;

    setIsPublishing(item.id);
    // Prefer LinkedIn if both enabled, or the primary platform for the content type
    const platform = config.linkedInEnabled ? 'linkedin' : 'x';
    
    const result = await publishToPlatform(platform, item.content, config);
    
    setIsPublishing(null);
    if (result.success) {
        alert(`Success: Posted to ${platform}. Post ID: ${result.postId}`);
    } else {
        alert(`Distribution failed: ${result.error}`);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-xl flex items-center justify-center p-8"
    >
      <div className="w-full max-w-5xl h-[80vh] bg-neutral-900 border border-white/10 rounded-3xl overflow-hidden flex flex-col shadow-[0_0_100px_rgba(0,0,0,1)]">
        {/* Header */}
        <div className="p-8 border-b border-white/5 flex items-center justify-between">
           <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-500/20 rounded-2xl border border-indigo-500/30">
                    <Database className="w-6 h-6 text-indigo-400" />
                </div>
                <div>
                   <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Strategic Vault</h2>
                   <p className="text-xs text-neutral-500 font-mono">ENCRYPTED // PERSISTENT // COMPLIANT</p>
                </div>
           </div>
           <button 
             onClick={onClose}
             className="p-2 hover:bg-white/5 rounded-full text-neutral-500 hover:text-white transition-colors"
           >
             <X className="w-6 h-6" />
           </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
           {loading ? (
             <div className="h-full flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
             </div>
           ) : archives.length === 0 ? (
             <div className="h-full flex flex-col items-center justify-center text-center opacity-30">
                <Database className="w-20 h-20 mb-4" />
                <p className="font-bold text-white uppercase tracking-widest">Vault Empty</p>
                <p className="text-xs text-neutral-500 mt-2">Generate strategies to begin archiving.</p>
             </div>
           ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                {archives.map((item) => (
                  <motion.div 
                    layout
                    key={item.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-black/40 border border-white/5 p-6 rounded-2xl group hover:border-white/20 transition-all flex flex-col"
                  >
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                             {item.type === 'pdf' ? <Layers className="w-3.5 h-3.5 text-orange-400" /> : 
                              item.type === 'svg' ? <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> : 
                              <FileText className="w-3.5 h-3.5 text-indigo-400" />}
                             <span className="text-[10px] font-black text-white/50 uppercase tracking-widest">{item.type === 'post' ? 'Tactical Post' : 'Visual Asset'}</span>
                        </div>
                        <span className="text-[10px] text-neutral-600 font-mono">{new Date(item.timestamp).toLocaleDateString()}</span>
                    </div>
                    
                    <h3 className="text-white font-bold text-sm mb-3 line-clamp-2">{item.topic || "Untitled Strategy"}</h3>
                    
                    <div className="flex-1">
                        <p className="text-xs text-neutral-500 line-clamp-3 mb-4 leading-relaxed italic">
                           {item.type === 'post' ? item.content : "Media asset preserved in vault."}
                        </p>
                    </div>
                    {/* Performance Display */}
                    {item.performance && (
                        <div className="flex items-center gap-3 text-[9px] text-neutral-500 mb-3 bg-green-500/5 p-1.5 rounded-lg border border-green-500/10">
                            <span className="flex items-center gap-1"><Eye className="w-2.5 h-2.5" /> {item.performance.impressions}</span>
                            <span className="flex items-center gap-1"><ThumbsUp className="w-2.5 h-2.5" /> {item.performance.likes}</span>
                            <span className="flex items-center gap-1"><MessageSquare className="w-2.5 h-2.5" /> {item.performance.comments}</span>
                            <span className="flex items-center gap-1"><Share2 className="w-2.5 h-2.5" /> {item.performance.reposts}</span>
                            <span className="flex items-center gap-1 text-indigo-400"><Save className="w-2.5 h-2.5" /> {(item.performance as any).saves || 0}</span>
                        </div>
                    )}

                    <div className="flex items-center gap-2 pt-4 border-t border-white/5">
                        <button 
                            className="flex-1 py-1.5 bg-white/5 hover:bg-white text-[10px] font-black uppercase rounded-lg text-neutral-400 hover:text-black transition-all flex items-center justify-center gap-2"
                            onClick={() => {
                                alert("Strategy data copied to clipboard.");
                                navigator.clipboard.writeText(item.content);
                            }}
                        >
                            <Download className="w-3 h-3" /> RESTORE
                        </button>
                        <button 
                            onClick={() => handlePublish(item)}
                            disabled={isPublishing === item.id || item.type !== 'post'}
                            className={`p-1.5 transition-colors ${
                                isPublishing === item.id 
                                    ? 'text-indigo-500 animate-pulse' 
                                    : 'text-neutral-600 hover:text-indigo-400'
                            }`}
                            title="Direct Publish (Ghost Protocol)"
                        >
                            {isPublishing === item.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Ghost className="w-3.5 h-3.5" />}
                        </button>
                        <button 
                            onClick={() => openMetricsModal(item)}
                            className="p-1.5 text-neutral-600 hover:text-emerald-400 transition-colors"
                            title="Add Performance Metrics"
                        >
                            <BarChart3 className="w-3.5 h-3.5" />
                        </button>
                        <button 
                            onClick={() => handleDelete(item.id)}
                            className="p-1.5 text-neutral-600 hover:text-red-500 transition-colors"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                        </button>
                    </div>
                  </motion.div>
                ))}
                </AnimatePresence>
             </div>
           )}
        </div>

        {/* Footer */}
        <div className="p-8 bg-neutral-950/50 border-t border-white/5 text-center">
            <p className="text-[10px] text-neutral-600 font-mono tracking-widest">
               STRATEGYOS // ARCHIVE SUBSYSTEM // v1.0.5
            </p>
        </div>
      </div>

      {/* Add Metrics Modal */}
      <AnimatePresence>
        {metricsTarget && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-black/80 flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-neutral-900 border border-white/10 rounded-2xl w-full max-w-sm p-6 space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-white font-bold flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-indigo-400" /> Add Performance
                </h3>
                <button onClick={() => setMetricsTarget(null)} className="text-neutral-500 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-neutral-500 truncate">{metricsTarget.topic}</p>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[9px] text-neutral-500 uppercase tracking-widest block mb-1">Impressions</label>
                  <input 
                    type="number" 
                    value={metricsForm.impressions}
                    onChange={(e) => setMetricsForm(f => ({ ...f, impressions: parseInt(e.target.value) || 0 }))}
                    className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-[9px] text-neutral-500 uppercase tracking-widest block mb-1">Likes</label>
                  <input 
                    type="number" 
                    value={metricsForm.likes}
                    onChange={(e) => setMetricsForm(f => ({ ...f, likes: parseInt(e.target.value) || 0 }))}
                    className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-[9px] text-neutral-500 uppercase tracking-widest block mb-1">Comments</label>
                  <input 
                    type="number" 
                    value={metricsForm.comments}
                    onChange={(e) => setMetricsForm(f => ({ ...f, comments: parseInt(e.target.value) || 0 }))}
                    className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-[9px] text-neutral-500 uppercase tracking-widest block mb-1">Reposts</label>
                  <input 
                    type="number" 
                    value={metricsForm.reposts}
                    onChange={(e) => setMetricsForm(f => ({ ...f, reposts: parseInt(e.target.value) || 0 }))}
                    className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-[9px] text-neutral-500 uppercase tracking-widest block mb-1 text-indigo-400">Saves</label>
                  <input 
                    type="number" 
                    value={metricsForm.saves}
                    onChange={(e) => setMetricsForm(f => ({ ...f, saves: parseInt(e.target.value) || 0 }))}
                    className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-[9px] text-neutral-500 uppercase tracking-widest block mb-1 text-indigo-400">Reach</label>
                  <input 
                    type="number" 
                    value={metricsForm.reach}
                    onChange={(e) => setMetricsForm(f => ({ ...f, reach: parseInt(e.target.value) || 0 }))}
                    className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <button 
                onClick={handleSaveMetrics}
                className="w-full py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs font-bold uppercase rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
              >
                <Save className="w-3.5 h-3.5" /> Save Metrics
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
