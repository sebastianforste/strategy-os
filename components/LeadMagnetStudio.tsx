
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, FileText, Layout, Mail, Copy, Check, ChevronRight, Loader2, Target, Users, Zap } from 'lucide-react';
import { MagnetType, LeadMagnet } from '@/utils/lead-magnet-service';

interface LeadMagnetStudioProps {
    isOpen: boolean;
    onClose: () => void;
    apiKey?: string;
}

export default function LeadMagnetStudio({ isOpen, onClose }: LeadMagnetStudioProps) {
    const [step, setStep] = useState<'input' | 'generating' | 'preview'>('input');
    const [topic, setTopic] = useState('');
    const [audience, setAudience] = useState('');
    const [type, setType] = useState<MagnetType>('audit');
    const [result, setResult] = useState<LeadMagnet | null>(null);
    const [activeTab, setActiveTab] = useState<'asset' | 'landing' | 'email'>('asset');
    const [copied, setCopied] = useState(false);

    const handleGenerate = async () => {
        if (!topic || !audience) return;
        
        setStep('generating');
        try {
            const res = await fetch('/api/lead-magnet', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ topic, audience, type })
            });
            
            const data = await res.json();
            if (data.error) throw new Error(data.error);
            
            setResult(data);
            setStep('preview');
        } catch (error) {
            console.error(error);
            setStep('input');
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const getMarkdownContent = () => {
        if (!result) return '';
        
        if (activeTab === 'asset') {
            return `# ${result.title}\n\n${result.headline}\n\n${result.hook}\n\n` + 
                result.sections.map(s => `## ${s.title}\n${s.content}\n\n**Action Item:** ${s.actionItem}`).join('\n\n');
        } else if (activeTab === 'landing') {
            return `# ${result.landingPage.headline}\n\n## ${result.landingPage.subheadline}\n\nBenefits:\n${result.landingPage.bullets.map(b => `- ${b}`).join('\n')}\n\nCTA: ${result.landingPage.cta}`;
        } else {
            return result.emailSequence.map((e, i) => `Email ${i+1} (${e.delay}): ${e.subject}\n\n${e.body}`).join('\n\n---\n\n');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-[#0A0A0A] border border-white/10 rounded-3xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden shadow-2xl"
            >
                {/* Header */}
                <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/5">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-pink-500/20 rounded-lg">
                            <Sparkles className="w-5 h-5 text-pink-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Lead Magnet Factory</h2>
                            <p className="text-xs text-neutral-400">Grand Slam Offers & Assets</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-neutral-400 hover:text-white transition-colors">
                        ✕
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
                    {step === 'input' && (
                        <div className="max-w-2xl mx-auto space-y-8">
                            <div className="text-center space-y-2 mb-10">
                                <h3 className="text-3xl font-bold text-white">What are we building today?</h3>
                                <p className="text-neutral-400">Create a high-value asset to capture leads in typical Hormozi fashion.</p>
                            </div>

                            {/* Type Selection */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {[
                                    { id: 'audit', label: 'The Audit', icon: Target, desc: 'Self-assessment checklist' },
                                    { id: 'swipe_file', label: 'Swipe File', icon: FileText, desc: 'Copy-paste templates' },
                                    { id: 'roadmap', label: 'The Roadmap', icon: Layout, desc: 'Step-by-step guide' }
                                ].map((t) => (
                                    <button
                                        key={t.id}
                                        onClick={() => setType(t.id as MagnetType)}
                                        className={`p-6 rounded-2xl border text-left transition-all ${type === t.id ? 'bg-pink-500/10 border-pink-500/50 ring-2 ring-pink-500/20' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}
                                    >
                                        <t.icon className={`w-8 h-8 mb-4 ${type === t.id ? 'text-pink-400' : 'text-neutral-500'}`} />
                                        <div className="font-bold text-white mb-1">{t.label}</div>
                                        <div className="text-xs text-neutral-400">{t.desc}</div>
                                    </button>
                                ))}
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase text-neutral-500 mb-2">My Niche / Topic</label>
                                    <input 
                                        value={topic}
                                        onChange={(e) => setTopic(e.target.value)}
                                        placeholder="e.g. SaaS Sales, LinkedIn Growth, Biohacking"
                                        className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-pink-500/50 transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase text-neutral-500 mb-2">Target Audience</label>
                                    <input 
                                        value={audience}
                                        onChange={(e) => setAudience(e.target.value)}
                                        placeholder="e.g. Founders with $1M+ ARR, Tired Moms, Junior Devs"
                                        className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-pink-500/50 transition-colors"
                                    />
                                </div>
                            </div>

                            <button 
                                onClick={handleGenerate}
                                disabled={!topic || !audience}
                                className="w-full py-4 bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl font-bold text-white shadow-lg shadow-pink-500/20 hover:scale-[1.02] transition-all disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
                            >
                                <Zap className="w-5 h-5" />
                                Generate Lead Magnet
                            </button>
                        </div>
                    )}

                    {step === 'generating' && (
                        <div className="flex flex-col items-center justify-center h-full space-y-6">
                            <div className="relative">
                                <div className="absolute inset-0 bg-pink-500/20 blur-xl rounded-full animate-pulse" />
                                <Loader2 className="w-12 h-12 text-pink-400 animate-spin relative z-10" />
                            </div>
                            <div className="text-center">
                                <h3 className="text-xl font-bold text-white mb-2">Constructing Offer...</h3>
                                <p className="text-neutral-500">Writing the headlines, structuring the value, and drafting the funnel.</p>
                            </div>
                        </div>
                    )}

                    {step === 'preview' && result && (
                        <div className="h-full flex flex-col">
                            {/* Tabs */}
                            <div className="flex items-center gap-2 p-1 bg-white/5 rounded-xl w-fit mb-6">
                                {[
                                    { id: 'asset', label: 'The Asset', icon: FileText },
                                    { id: 'landing', label: 'Landing Page', icon: Layout },
                                    { id: 'email', label: 'Email Sequence', icon: Mail }
                                ].map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id as any)}
                                        className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${activeTab === tab.id ? 'bg-pink-500 text-white shadow-lg' : 'text-neutral-400 hover:text-white'}`}
                                    >
                                        <tab.icon className="w-4 h-4" />
                                        {tab.label}
                                    </button>
                                ))}
                            </div>

                            {/* Content Preview */}
                            <div className="flex-1 bg-black/30 border border-white/10 rounded-2xl p-8 overflow-y-auto custom-scrollbar relative font-mono text-sm leading-relaxed text-neutral-300">
                                <button 
                                    onClick={() => copyToClipboard(getMarkdownContent())}
                                    className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors z-10"
                                >
                                    {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                                </button>
                                
                                {activeTab === 'asset' && (
                                    <div className="space-y-8 max-w-3xl mx-auto">
                                        <div className="text-center space-y-4 border-b border-white/10 pb-8">
                                            <h1 className="text-3xl font-bold text-white">{result.title}</h1>
                                            <p className="text-xl text-pink-400">{result.headline}</p>
                                            <p className="italic text-neutral-500">"{result.hook}"</p>
                                        </div>
                                        <div className="space-y-12">
                                            {result.sections.map((section, idx) => (
                                                <div key={idx} className="space-y-3">
                                                    <div className="flex items-center gap-3">
                                                        <span className="flex-none w-8 h-8 rounded-full bg-white/10 flex items-center justify-center font-bold text-white border border-white/10">{idx + 1}</span>
                                                        <h3 className="text-xl font-bold text-white">{section.title}</h3>
                                                    </div>
                                                    <div className="pl-11 space-y-4">
                                                        <p className="whitespace-pre-wrap">{section.content}</p>
                                                        {section.actionItem && (
                                                            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                                                                <span className="text-green-400 font-bold text-xs uppercase tracking-wider mb-1 block">Action Item</span>
                                                                <p className="text-white">{section.actionItem}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'landing' && (
                                    <div className="max-w-3xl mx-auto space-y-12 text-center">
                                        <div className="space-y-6">
                                            <h1 className="text-4xl font-black text-white">{result.landingPage.headline}</h1>
                                            <h2 className="text-xl text-neutral-300">{result.landingPage.subheadline}</h2>
                                        </div>
                                        <div className="text-left bg-white/5 p-8 rounded-2xl border border-white/10 space-y-4">
                                            <h3 className="font-bold text-white uppercase tracking-wider text-xs">What You'll Get:</h3>
                                            <ul className="space-y-3">
                                                {result.landingPage.bullets.map((bullet, i) => (
                                                    <li key={i} className="flex items-start gap-3">
                                                        <Check className="w-5 h-5 text-green-400 flex-none" />
                                                        <span>{bullet}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                        <button className="w-full py-4 bg-pink-600 rounded-xl font-black text-white uppercase tracking-wide text-lg hover:scale-[1.02] transition-transform shadow-xl shadow-pink-600/20">
                                            {result.landingPage.cta}
                                        </button>
                                    </div>
                                )}

                                {activeTab === 'email' && (
                                    <div className="max-w-3xl mx-auto space-y-8">
                                        {result.emailSequence.map((email, idx) => (
                                            <div key={idx} className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
                                                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                                                    <span className="font-bold text-white">Email #{idx + 1}</span>
                                                    <span className="text-xs text-neutral-500 bg-black/30 px-2 py-1 rounded">{email.delay}</span>
                                                </div>
                                                <div className="space-y-2">
                                                    <div className="text-sm text-neutral-400"><span className="text-neutral-500 uppercase text-xs mr-2">Subject:</span> {email.subject}</div>
                                                </div>
                                                <div className="p-4 bg-black/30 rounded-lg text-neutral-300 text-sm whitespace-pre-wrap leading-relaxed">
                                                    {email.body}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            
                            <div className="mt-6 flex justify-between items-center">
                                <button 
                                    onClick={() => setStep('input')}
                                    className="text-neutral-500 hover:text-white text-sm"
                                >
                                    ← Create Another
                                </button>
                                <button 
                                    onClick={onClose}
                                    className="px-6 py-2 bg-white text-black font-bold rounded-xl hover:scale-105 transition-transform"
                                >
                                    Done
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
