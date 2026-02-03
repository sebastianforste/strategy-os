"use client";

import { useState } from "react";
import { Users, Search, MessageCircle, Copy, Loader2, ExternalLink, Wifi, Linkedin, Twitter, FileText, Mic, Radio, Award } from "lucide-react";
import { scoutEngagementTargets, generateReplies, EngagementTarget, StrategicReply } from "../utils/engagement-agent";
import { findHighValueCreators, Creator, findEngagementOpportunities, EngagementOpportunity } from "../utils/network-graph";
import { findPodcastOpportunities, MediaOpportunity } from "../utils/media-scanner";
import { hiveMindService, HiveStatus, CrossPollinationOpportunity } from "../utils/hive-mind-service";
import { motion, AnimatePresence } from "framer-motion";

interface NetworkDashboardProps {
    apiKey?: string;
    onTargetsScouted?: (targets: EngagementTarget[]) => void;
}

type TabMode = 'ENGAGEMENT' | 'CREATORS' | 'MEDIA';

export default function NetworkDashboard({ apiKey, onTargetsScouted }: NetworkDashboardProps) {
    const [activeTab, setActiveTab] = useState<TabMode>('ENGAGEMENT');
    const [topic, setTopic] = useState("");
    
    // State for Engagement
    const [targets, setTargets] = useState<EngagementTarget[]>([]);
    const [selectedTarget, setSelectedTarget] = useState<EngagementTarget | null>(null);
    const [replies, setReplies] = useState<StrategicReply[]>([]);
    
    // State for Creators
    const [creators, setCreators] = useState<Creator[]>([]);
    
    // State for Media
    const [mediaOpps, setMediaOpps] = useState<MediaOpportunity[]>([]);

    const [isScouting, setIsScouting] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [hiveStatus, setHiveStatus] = useState<HiveStatus | null>(null);

    // Load Hive Status on mount
    useState(() => {
        setHiveStatus(hiveMindService.getHiveStatus());
    });

    const handleScout = async () => {
        if (!topic || !apiKey || isScouting) return;
        setIsScouting(true);
        
        try {
            if (activeTab === 'ENGAGEMENT') {
                const results = await scoutEngagementTargets(topic, apiKey);
                setTargets(results);
                if (onTargetsScouted) onTargetsScouted(results);
            } else if (activeTab === 'CREATORS') {
                const results = await findHighValueCreators(topic, apiKey);
                setCreators(results);
            } else if (activeTab === 'MEDIA') {
                const results = await findPodcastOpportunities(topic, apiKey);
                setMediaOpps(results);
            }
        } catch (e) {
            console.error("Scouting failed", e);
        } finally {
            setIsScouting(false);
        }
    };

    const handleSelectTarget = async (target: EngagementTarget) => {
        if (isGenerating || !apiKey) return;
        setSelectedTarget(target);
        setIsGenerating(true);
        try {
            const results = await generateReplies(target, apiKey);
            setReplies(results);
        } catch (e) {
            console.error("Reply generation failed", e);
        } finally {
            setIsGenerating(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    return (
        <div className="w-full bg-[#111] border border-white/10 rounded-2xl overflow-hidden flex flex-col h-[650px]">
            {/* Header / Tabs */}
            <div className="border-b border-white/5 bg-[#080808] p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <TabButton active={activeTab === 'ENGAGEMENT'} onClick={() => setActiveTab('ENGAGEMENT')} icon={<MessageCircle className="w-4 h-4" />} label="Engagement" />
                    <TabButton active={activeTab === 'CREATORS'} onClick={() => setActiveTab('CREATORS')} icon={<Users className="w-4 h-4" />} label="Creators" />
                    <TabButton active={activeTab === 'MEDIA'} onClick={() => setActiveTab('MEDIA')} icon={<Radio className="w-4 h-4" />} label="Media & PR" />
                </div>
                
                {/* Hive Status */}
                {hiveStatus && (
                    <div className="hidden md:flex items-center gap-3 px-3 py-1 bg-white/5 rounded-lg border border-white/5">
                        <Wifi className="w-3 h-3 text-cyan-400" />
                        <span className="text-[10px] font-mono text-neutral-500 uppercase">Hive Active</span>
                    </div>
                )}
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar: Controls & List */}
                <div className="w-full md:w-1/3 border-r border-white/10 p-6 flex flex-col bg-black/20">
                    <div className="flex gap-2 mb-6">
                        <input 
                            type="text" 
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            placeholder={`Enter Niche (e.g. AI Agents)...`} 
                            onKeyDown={(e) => e.key === 'Enter' && handleScout()}
                            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-indigo-500/50"
                        />
                        <button 
                            onClick={handleScout}
                            disabled={isScouting || !topic}
                            className="p-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white transition-colors disabled:opacity-50"
                        >
                            {isScouting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                        {/* LIST RENDERER BASED ON TAB */}
                        {activeTab === 'ENGAGEMENT' && (
                            targets.length === 0 && !isScouting ? <EmptyState label="Find conversations to hijack." /> :
                            targets.map((target, i) => (
                                <div 
                                    key={i}
                                    onClick={() => handleSelectTarget(target)}
                                    className={`p-4 rounded-xl border cursor-pointer transition-all hover:bg-white/5 ${selectedTarget === target ? "bg-white/10 border-indigo-500/50" : "bg-white/5 border-white/5"}`}
                                >
                                    <p className="text-xs font-bold text-neutral-200 line-clamp-2 mb-2">{target.title}</p>
                                    <div className="flex items-center justify-between text-[10px] text-neutral-500">
                                        <span>{target.source}</span>
                                        <span>{target.date}</span>
                                    </div>
                                </div>
                            ))
                        )}

                        {activeTab === 'CREATORS' && (
                             creators.length === 0 && !isScouting ? <EmptyState label="Scout high-value creators." /> :
                             creators.map((creator, i) => (
                                <div key={i} className="p-4 rounded-xl border border-white/5 bg-white/5 flex items-center gap-3 hover:bg-white/10 transition-colors">
                                    <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold">
                                        {creator.name[0]}
                                    </div>
                                    <div className="flex-1 overflow-hidden">
                                        <h4 className="text-sm font-bold text-white truncate">{creator.name}</h4>
                                        <p className="text-[10px] text-neutral-500 font-mono truncate">{creator.handle}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-bold text-white">{(creator.followers / 1000).toFixed(1)}K</p>
                                        <p className="text-[9px] text-neutral-600 uppercase">Followers</p>
                                    </div>
                                </div>
                             ))
                        )}

                         {activeTab === 'MEDIA' && (
                             mediaOpps.length === 0 && !isScouting ? <EmptyState label="Find Podcasts & Newsletters." /> :
                             mediaOpps.map((opp, i) => (
                                <div key={i} className="p-4 rounded-xl border border-white/5 bg-white/5 hover:border-indigo-500/20 transition-colors">
                                    <div className="flex items-start justify-between mb-2">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${opp.type === 'Podcast' ? 'bg-purple-500/20 text-purple-400' : 'bg-orange-500/20 text-orange-400'}`}>{opp.type}</span>
                                                <h4 className="text-sm font-bold text-white truncate max-w-[150px]">{opp.name}</h4>
                                            </div>
                                            <p className="text-[10px] text-neutral-500">Host: {opp.host}</p>
                                        </div>
                                        <div className="text-right">
                                             <div className="flex items-center gap-1 justify-end text-[10px] text-neutral-400 mb-1">
                                                <Wifi className="w-3 h-3" /> {(opp.reach / 1000).toFixed(0)}K
                                             </div>
                                             <div className="flex items-center gap-1 justify-end text-[10px] text-indigo-400">
                                                <Award className="w-3 h-3" /> {opp.relevanceScore}% match
                                             </div>
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-neutral-600 italic truncate">"{opp.recentTopic}"</p>
                                </div>
                             ))
                        )}
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 p-6 bg-[#0a0a0a] flex flex-col">
                     {activeTab === 'ENGAGEMENT' ? (
                        !selectedTarget ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-neutral-600 gap-4">
                                <MessageCircle className="w-12 h-12 opacity-20" />
                                <p className="text-xs font-mono">Select a target to generate replies.</p>
                            </div>
                        ) : (
                            <div className="h-full flex flex-col">
                                <div className="mb-8 p-4 bg-white/5 rounded-xl border border-white/10">
                                    <div className="flex items-start justify-between mb-2">
                                        <h2 className="text-sm font-bold text-white">{selectedTarget.title}</h2>
                                        <a href={selectedTarget.link} target="_blank" rel="noopener noreferrer" className="text-neutral-500 hover:text-white">
                                            <ExternalLink className="w-3 h-3" />
                                        </a>
                                    </div>
                                    <p className="text-xs text-neutral-400 leading-relaxed italic border-l-2 border-neutral-700 pl-3">"{selectedTarget.snippet}..."</p>
                                </div>
                                {isGenerating ? (
                                    <div className="flex-1 flex flex-col items-center justify-center gap-4">
                                        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 gap-4 overflow-y-auto pr-2 custom-scrollbar">
                                        {replies.map((reply, i) => (
                                            <ReplyCard key={i} reply={reply} onCopy={() => copyToClipboard(reply.content)} />
                                        ))}
                                    </div>
                                )}
                            </div>
                        )
                     ) : activeTab === 'CREATORS' ? (
                        <div className="h-full flex flex-col items-center justify-center opacity-30 text-center p-10">
                            <Users className="w-16 h-16 mb-4" />
                            <h3 className="text-lg font-bold">Creator Intelligence</h3>
                            <p className="text-sm max-w-md">Select a creator from the list to view detailed analysis, collaboration potential, and content breakdown.</p>
                        </div>
                     ) : (
                        <div className="h-full flex flex-col items-center justify-center opacity-30 text-center p-10">
                            <Radio className="w-16 h-16 mb-4" />
                            <h3 className="text-lg font-bold">Media & PR</h3>
                            <p className="text-sm max-w-md">Identify placement opportunities. Select a show to draft a pitch or analyze host style.</p>
                        </div>
                     )}
                </div>
            </div>
        </div>
    );
}

function TabButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
    return (
        <button 
            onClick={onClick}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${active ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-neutral-500 hover:text-white hover:bg-white/5'}`}
        >
            {icon}
            {label}
        </button>
    );
}

function EmptyState({ label }: { label: string }) {
    return (
        <div className="text-center mt-12 opacity-50">
            <Search className="w-8 h-8 text-neutral-600 mx-auto mb-2" />
            <p className="text-[10px] text-neutral-500">{label}</p>
        </div>
    );
}

function ReplyCard({ reply, onCopy }: { reply: StrategicReply, onCopy: () => void }) {
    return (
        <div className="group relative bg-[#111] border border-white/10 rounded-xl p-5 hover:border-indigo-500/30 transition-colors">
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={onCopy} className="p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg shadow-lg hover:scale-110 transition-all">
                    <Copy className="w-3 h-3" />
                </button>
            </div>
            <div className={`inline-block px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider mb-2 ${
                reply.type === 'Amplifier' ? 'bg-green-500/10 text-green-400' :
                reply.type === 'Challenger' ? 'bg-red-500/10 text-red-400' :
                'bg-blue-500/10 text-blue-400'
            }`}>
                {reply.type}
            </div>
            <p className="text-sm text-neutral-300 leading-relaxed font-medium">{reply.content}</p>
            <p className="text-[10px] text-neutral-600 mt-2 font-mono">{reply.rationale}</p>
        </div>
    );
}
