"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Clock, X, Trash2, Edit3, Send, RefreshCw, Plus, Linkedin, Twitter, FileText, Zap, CheckCircle2, AlertCircle, Ghost, Loader2 } from "lucide-react";
import { getScheduledPosts, deleteScheduledPost, updateScheduledPost, ScheduledPost } from "../utils/archive-service";
import { publishToPlatform, getPlatformConfig } from "../utils/distribution-service";

interface ScheduleQueueDashboardProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function ScheduleQueueDashboard({ isOpen, onClose }: ScheduleQueueDashboardProps) {
    const [posts, setPosts] = useState<ScheduledPost[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isDispatching, setIsDispatching] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) loadPosts();
    }, [isOpen]);

    const loadPosts = async () => {
        setIsLoading(true);
        const data = await getScheduledPosts();
        setPosts(data);
        setIsLoading(false);
    };

    const handleDelete = async (id: string) => {
        if (confirm("Remove this scheduled post?")) {
            await deleteScheduledPost(id);
            loadPosts();
        }
    };

    const handleMarkPublished = async (id: string) => {
        await updateScheduledPost(id, { status: 'published' });
        loadPosts();
    };

    const handleDispatch = async (post: ScheduledPost) => {
        const config = getPlatformConfig();
        // Validation handled in publishToPlatform but we can check here too
        if (!config.linkedInEnabled && !config.xEnabled) {
            alert("No platforms connected. Open Ghost Protocol Settings (Ghost Icon) to connect.");
            return;
        }

        if (!confirm(`Dispatch Now? StrategyOS will post this content directly to ${post.platform === 'linkedin' ? 'LinkedIn' : 'X'} using the Ghost Protocol.`)) return;

        setIsDispatching(post.id);
        const result = await publishToPlatform(post.platform === 'substack' ? 'linkedin' : post.platform as any, post.content, config);
        setIsDispatching(null);

        if (result.success) {
            await updateScheduledPost(post.id, { status: 'published' });
            loadPosts();
            alert("Post dispatched successfully!");
        } else {
            alert(`Dispatch failed: ${result.error}`);
        }
    };

    const getPlatformIcon = (platform: string) => {
        switch (platform) {
            case 'linkedin': return <Linkedin className="w-3 h-3 text-blue-400" />;
            case 'twitter': return <Twitter className="w-3 h-3 text-sky-400" />;
            case 'substack': return <FileText className="w-3 h-3 text-orange-400" />;
            default: return <Send className="w-3 h-3" />;
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending': return <span className="text-[9px] px-2 py-0.5 bg-amber-500/20 text-amber-400 rounded-full uppercase font-bold">Pending</span>;
            case 'published': return <span className="text-[9px] px-2 py-0.5 bg-green-500/20 text-green-400 rounded-full uppercase font-bold flex items-center gap-1"><CheckCircle2 className="w-2.5 h-2.5" /> Published</span>;
            case 'failed': return <span className="text-[9px] px-2 py-0.5 bg-red-500/20 text-red-400 rounded-full uppercase font-bold flex items-center gap-1"><AlertCircle className="w-2.5 h-2.5" /> Failed</span>;
            default: return null;
        }
    };

    const formatScheduleTime = (iso: string) => {
        const date = new Date(iso);
        return date.toLocaleString('en-US', { 
            weekday: 'short', 
            month: 'short', 
            day: 'numeric', 
            hour: 'numeric', 
            minute: '2-digit' 
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[80] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-neutral-900 border border-white/10 rounded-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden shadow-2xl flex flex-col"
            >
                {/* Header */}
                <div className="p-6 border-b border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl">
                            <Calendar className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="font-bold text-white">Scheduling Queue</h3>
                            <p className="text-xs text-neutral-500 font-mono">AUTOMATED PIPELINE v2.0</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={loadPosts} 
                            disabled={isLoading}
                            className="p-2 text-neutral-500 hover:text-white transition-colors"
                        >
                            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                        </button>
                        <button onClick={onClose} className="text-neutral-500 hover:text-white transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center h-64 gap-4">
                            <RefreshCw className="w-8 h-8 text-purple-500 animate-spin" />
                            <p className="text-sm text-neutral-500 font-mono text-center">ACCESSING VAULT...<br/><span className="text-[10px] opacity-50">SYNCING TEMPORAL FLOWS</span></p>
                        </div>
                    ) : posts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 gap-4 text-neutral-500">
                            <Calendar className="w-16 h-16 opacity-20" />
                            <p className="text-sm">No scheduled posts yet.</p>
                            <p className="text-xs text-neutral-600">Use Batch Generation to populate your queue.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {posts.map((post) => (
                                <motion.div 
                                    key={post.id}
                                    layout
                                    className={`p-4 rounded-xl border transition-all ${
                                        post.status === 'published' 
                                            ? 'bg-green-500/5 border-green-500/20' 
                                            : post.status === 'failed'
                                            ? 'bg-red-500/5 border-red-500/20'
                                            : 'bg-white/5 border-white/10 hover:border-white/20'
                                    }`}
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-2">
                                                {getPlatformIcon(post.platform)}
                                                <span className="text-xs font-bold text-white truncate">{post.topic}</span>
                                                {getStatusBadge(post.status)}
                                            </div>
                                            <p className="text-xs text-neutral-400 line-clamp-2 mb-2">{post.content}</p>
                                            <div className="flex items-center gap-1 text-[10px] text-neutral-600">
                                                <Clock className="w-3 h-3" />
                                                <span>{formatScheduleTime(post.scheduledFor)}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            {post.status === 'pending' && (
                                                <>
                                                    <button 
                                                        onClick={() => handleDispatch(post)}
                                                        disabled={isDispatching === post.id}
                                                        className={`p-1.5 transition-colors ${
                                                            isDispatching === post.id 
                                                                ? 'text-indigo-500 animate-pulse' 
                                                                : 'text-neutral-500 hover:text-indigo-400'
                                                        }`}
                                                        title="Dispatch Now (Ghost Protocol)"
                                                    >
                                                        {isDispatching === post.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Ghost className="w-4 h-4" />}
                                                    </button>
                                                    <button 
                                                        onClick={() => handleMarkPublished(post.id)}
                                                        className="p-1.5 text-neutral-500 hover:text-green-400 transition-colors"
                                                        title="Mark as Published"
                                                    >
                                                        <CheckCircle2 className="w-4 h-4" />
                                                    </button>
                                                    <button 
                                                        onClick={() => {
                                                            navigator.clipboard.writeText(post.content);
                                                            alert("Content copied to clipboard!");
                                                        }}
                                                        className="p-1.5 text-neutral-500 hover:text-blue-400 transition-colors"
                                                        title="Copy Content"
                                                    >
                                                        <Send className="w-4 h-4" />
                                                    </button>
                                                </>
                                            )}
                                            <button 
                                                onClick={() => handleDelete(post.id)}
                                                className="p-1.5 text-neutral-500 hover:text-red-400 transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer Stats */}
                <div className="p-4 border-t border-white/5 bg-black/20 flex items-center justify-between">
                    <div className="flex items-center gap-4 text-[10px] text-neutral-500">
                        <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Pending: {posts.filter(p => p.status === 'pending').length}
                        </span>
                        <span className="flex items-center gap-1 text-green-500">
                            <CheckCircle2 className="w-3 h-3" />
                            Published: {posts.filter(p => p.status === 'published').length}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Ghost className="w-3 h-3 text-indigo-500 opacity-50" />
                        <p className="text-[9px] text-neutral-600 font-mono uppercase tracking-[0.2em]">
                            Ghost Protocol Engine Active
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
