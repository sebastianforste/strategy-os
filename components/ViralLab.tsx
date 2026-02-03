
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Zap, TrendingUp, AlertCircle, Check, Copy, RefreshCw, Loader2, ArrowRight } from 'lucide-react';
import { ViralService, ViralHook, ReplyStrategy } from '../utils/viral-service';

interface ViralLabProps {
    isOpen: boolean;
    onClose: () => void;
    apiKey: string;
}

export default function ViralLab({ isOpen, onClose, apiKey }: ViralLabProps) {
    const [mode, setMode] = useState<'hook' | 'reply'>('hook');
    
    // Hook Optimizer State
    const [currentHook, setCurrentHook] = useState('');
    const [hookContext, setHookContext] = useState('');
    const [hooks, setHooks] = useState<ViralHook[]>([]);
    const [isOptimizing, setIsOptimizing] = useState(false);

    // Reply Generator State
    const [targetPost, setTargetPost] = useState('');
    const [authorName, setAuthorName] = useState('');
    const [replies, setReplies] = useState<ReplyStrategy[]>([]);
    const [isGeneratingReplies, setIsGeneratingReplies] = useState(false);

    // Helpers
    const service = new ViralService(apiKey);
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

    const handleOptimizeHook = async () => {
        if (!currentHook) return;
        setIsOptimizing(true);
        const results = await service.optimizeHook(currentHook, hookContext);
        setHooks(results);
        setIsOptimizing(false);
    };

    const handleGenerateReplies = async () => {
        if (!targetPost) return;
        setIsGeneratingReplies(true);
        const results = await service.generateReplyStrategy(targetPost, authorName || "The Author");
        setReplies(results);
        setIsGeneratingReplies(false);
    };

    const copyToClipboard = (text: string, index: number) => {
        navigator.clipboard.writeText(text);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-[#0A0A0A] border border-white/10 rounded-3xl w-full max-w-4xl h-[85vh] flex flex-col overflow-hidden shadow-2xl"
            >
                {/* Header */}
                <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/5">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-500/20 rounded-lg">
                            <TrendingUp className="w-5 h-5 text-green-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Viral Lab</h2>
                            <p className="text-xs text-neutral-400">Engineered Virality & Engagement Farming</p>
                        </div>
                    </div>
                    
                    <div className="flex bg-black/50 rounded-lg p-1 border border-white/10">
                        <button 
                            onClick={() => setMode('hook')}
                            className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${mode === 'hook' ? 'bg-green-500 text-black shadow-lg' : 'text-neutral-400 hover:text-white'}`}
                        >
                            <Zap className="w-3 h-3 inline mr-2" />
                            Hook Surgery
                        </button>
                        <button 
                            onClick={() => setMode('reply')}
                            className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${mode === 'reply' ? 'bg-blue-500 text-white shadow-lg' : 'text-neutral-400 hover:text-white'}`}
                        >
                            <MessageCircle className="w-3 h-3 inline mr-2" />
                            Engagement Farm
                        </button>
                    </div>

                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-neutral-400 hover:text-white transition-colors">
                        ✕
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
                    
                    {/* HOOK OPTIMIZER MODE */}
                    {mode === 'hook' && (
                        <div className="max-w-3xl mx-auto space-y-8">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase text-neutral-500 mb-2">My Boring Hook</label>
                                    <textarea 
                                        value={currentHook}
                                        onChange={(e) => setCurrentHook(e.target.value)}
                                        placeholder="e.g. Consistency is key for growth on LinkedIn."
                                        className="w-full h-24 bg-black/50 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-green-500/50 transition-colors resize-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase text-neutral-500 mb-2">Topic / Context (Optional)</label>
                                    <input 
                                        value={hookContext}
                                        onChange={(e) => setHookContext(e.target.value)}
                                        placeholder="e.g. Audience of founders"
                                        className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-green-500/50 transition-colors"
                                    />
                                </div>
                                <button 
                                    onClick={handleOptimizeHook}
                                    disabled={!currentHook || isOptimizing}
                                    className="w-full py-3 bg-green-600 rounded-xl font-bold text-black hover:scale-[1.01] transition-transform disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {isOptimizing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                                    Optimize for Virality
                                </button>
                            </div>

                            {/* RESULTS */}
                            <div className="space-y-4">
                                {hooks.map((hook, i) => (
                                    <motion.div 
                                        key={i}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        className="bg-white/5 border border-white/10 rounded-xl p-5 relative group hover:border-green-500/30 transition-colors"
                                    >
                                        <div className="flex items-start justify-between mb-2">
                                            <span className="text-[10px] font-bold uppercase tracking-wider bg-green-500/10 text-green-400 px-2 py-0.5 rounded border border-green-500/20">
                                                {hook.framework}
                                            </span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-bold text-neutral-400">Score: {hook.score}</span>
                                                <button 
                                                    onClick={() => copyToClipboard(hook.optimized, i)}
                                                    className="p-1.5 hover:bg-white/10 rounded text-neutral-400 hover:text-white transition-colors"
                                                >
                                                    {copiedIndex === i ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                                                </button>
                                            </div>
                                        </div>
                                        <p className="text-lg font-medium text-white mb-2 pr-8">{hook.optimized}</p>
                                        <p className="text-xs text-neutral-500 flex items-center gap-1">
                                            <AlertCircle className="w-3 h-3" />
                                            {hook.explanation}
                                        </p>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* REPLY GENERATOR MODE */}
                    {mode === 'reply' && (
                        <div className="max-w-3xl mx-auto space-y-8">
                             <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold uppercase text-neutral-500 mb-2">Target Post Content</label>
                                        <textarea 
                                            value={targetPost}
                                            onChange={(e) => setTargetPost(e.target.value)}
                                            placeholder="Paste the post you want to reply to..."
                                            className="w-full h-32 bg-black/50 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-blue-500/50 transition-colors resize-none"
                                        />
                                    </div>
                                    <div>
                                         <label className="block text-xs font-bold uppercase text-neutral-500 mb-2">Author Name (Optional)</label>
                                        <input 
                                            value={authorName}
                                            onChange={(e) => setAuthorName(e.target.value)}
                                            placeholder="e.g. Alex Hormozi"
                                            className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-blue-500/50 transition-colors mb-4"
                                        />
                                        <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                                            <p className="text-xs text-blue-300">
                                                <strong className="block mb-1 text-blue-200">Why Farm Engagement?</strong>
                                                Replying to top creators is the fastest way to borrow their authority and traffic. We'll generate 3 strategic angles.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                               
                                <button 
                                    onClick={handleGenerateReplies}
                                    disabled={!targetPost || isGeneratingReplies}
                                    className="w-full py-3 bg-blue-600 rounded-xl font-bold text-white hover:scale-[1.01] transition-transform disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {isGeneratingReplies ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageCircle className="w-4 h-4" />}
                                    Generate Strategic Replies
                                </button>
                            </div>

                            {/* RESULTS */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {replies.map((reply, i) => (
                                    <motion.div 
                                        key={i}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        className={`bg-white/5 border rounded-xl p-5 relative group transition-colors flex flex-col ${
                                            reply.angle === 'contrarian' ? 'border-red-500/20 hover:border-red-500/40' :
                                            reply.angle === 'question' ? 'border-yellow-500/20 hover:border-yellow-500/40' :
                                            'border-blue-500/20 hover:border-blue-500/40'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between mb-3">
                                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                                                 reply.angle === 'contrarian' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                                 reply.angle === 'question' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                                                 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                            }`}>
                                                {reply.angle}
                                            </span>
                                            <button 
                                                onClick={() => copyToClipboard(reply.content, i + 10)}
                                                className="p-1.5 hover:bg-white/10 rounded text-neutral-400 hover:text-white transition-colors"
                                            >
                                                {copiedIndex === i + 10 ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                                            </button>
                                        </div>
                                        <p className="text-sm text-neutral-200 mb-4 flex-1 leading-relaxed">"{reply.content}"</p>
                                        <div className="pt-3 border-t border-white/5">
                                            <p className="text-[10px] text-neutral-500 italic">{reply.reasoning}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    )}

                </div>
            </motion.div>
        </div>
    );
}
