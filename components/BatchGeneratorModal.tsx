"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, X, Plus, Trash2, Calendar, Clock, Loader2, Linkedin, Twitter, FileText, Sparkles, Layers } from "lucide-react";
import { generateBatch, generateVolumeBatch, BatchRequest, VolumeRequest, BatchResult } from "../utils/batch-service";
import { PersonaId, PERSONAS } from "../utils/personas";
import { StrategyAngle } from "../utils/variant-generator";

interface BatchGeneratorModalProps {
    isOpen: boolean;
    onClose: () => void;
    apiKey: string;
    onComplete: (result: BatchResult) => void;
}

export default function BatchGeneratorModal({ isOpen, onClose, apiKey, onComplete }: BatchGeneratorModalProps) {
    const [topics, setTopics] = useState<string[]>([""]);
    const [personaId, setPersonaId] = useState<PersonaId>("cso");
    const [platform, setPlatform] = useState<'linkedin' | 'twitter' | 'substack'>('linkedin');
    const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 16));
    const [intervalHours, setIntervalHours] = useState(24);
    const [isGenerating, setIsGenerating] = useState(false);
    const [progress, setProgress] = useState(0);
    const [isVolumeMode, setIsVolumeMode] = useState(false);
    const [selectedAngles, setSelectedAngles] = useState<StrategyAngle[]>(['educational', 'contrarian', 'checklist']);

    const addTopic = () => setTopics([...topics, ""]);
    const removeTopic = (index: number) => setTopics(topics.filter((_, i) => i !== index));
    const updateTopic = (index: number, value: string) => {
        const updated = [...topics];
        updated[index] = value;
        setTopics(updated);
    };

    const handleGenerate = async () => {
        const validTopics = topics.filter(t => t.trim().length > 0);
        if (validTopics.length === 0 || !apiKey) return;

        setIsGenerating(true);
        setProgress(0);

        if (isVolumeMode) {
            const request: VolumeRequest = {
                topics: validTopics,
                personaId,
                platform,
                startDate: new Date(startDate),
                intervalHours,
                angles: selectedAngles
            };
            const result = await generateVolumeBatch(request, apiKey);
            setIsGenerating(false);
            onComplete(result);
            onClose();
        } else {
            const request: BatchRequest = {
                topics: validTopics,
                personaId,
                platform,
                startDate: new Date(startDate),
                intervalHours
            };
            const result = await generateBatch(request, apiKey);
            setIsGenerating(false);
            onComplete(result);
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[85] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-neutral-900 border border-white/10 rounded-2xl w-full max-w-xl max-h-[85vh] overflow-hidden shadow-2xl flex flex-col"
            >
                {/* Header */}
                <div className="p-6 border-b border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl">
                            <Zap className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="font-bold text-white">Batch Generation</h3>
                            <p className="text-xs text-neutral-500">Generate a week of content in one click</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-neutral-500 hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar">
                    {/* Topics */}
                    <div className="space-y-2">
                        <label className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold">Topics to Generate</label>
                        {topics.map((topic, i) => (
                            <div key={i} className="flex gap-2">
                                <input 
                                    type="text"
                                    value={topic}
                                    onChange={(e) => updateTopic(i, e.target.value)}
                                    placeholder={`Topic ${i + 1}...`}
                                    className="flex-1 bg-black/40 border border-white/10 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-amber-500/50"
                                />
                                {topics.length > 1 && (
                                    <button onClick={() => removeTopic(i)} className="p-2 text-neutral-500 hover:text-red-400">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        ))}
                        <button 
                            onClick={addTopic}
                            className="w-full py-2 border border-dashed border-white/10 rounded-lg text-xs text-neutral-500 hover:text-white hover:border-white/30 transition-all flex items-center justify-center gap-2"
                        >
                            <Plus className="w-3 h-3" /> Add Topic
                        </button>
                    </div>

                    {/* Persona */}
                    <div className="space-y-2">
                        <label className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold">Voice Persona</label>
                        <select 
                            value={personaId}
                            onChange={(e) => setPersonaId(e.target.value as PersonaId)}
                            className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-amber-500/50"
                        >
                            {Object.entries(PERSONAS).map(([key, p]) => (
                                <option key={key} value={key}>{p.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Platform */}
                    <div className="space-y-2">
                        <label className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold">Target Platform</label>
                        <div className="flex gap-2">
                            {[
                                { id: 'linkedin', icon: Linkedin, label: 'LinkedIn' },
                                { id: 'twitter', icon: Twitter, label: 'X/Twitter' },
                                { id: 'substack', icon: FileText, label: 'Substack' }
                            ].map(p => (
                                <button 
                                    key={p.id}
                                    onClick={() => setPlatform(p.id as any)}
                                    className={`flex-1 py-2 px-3 rounded-lg border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                                        platform === p.id 
                                            ? 'bg-amber-500/20 border-amber-500/50 text-amber-400'
                                            : 'bg-white/5 border-white/10 text-neutral-500 hover:text-white'
                                    }`}
                                >
                                    <p.icon className="w-3.5 h-3.5" /> {p.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Volume Multiplier Toggle */}
                    <div className="p-4 bg-indigo-500/5 border border-indigo-500/20 rounded-2xl space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Layers className="w-4 h-4 text-indigo-400" />
                                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">100x Volume Multiplier</span>
                            </div>
                            <button 
                                onClick={() => setIsVolumeMode(!isVolumeMode)}
                                className={`w-10 h-5 rounded-full transition-all relative ${isVolumeMode ? 'bg-indigo-500' : 'bg-white/10'}`}
                            >
                                <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${isVolumeMode ? 'left-6' : 'left-1'}`} />
                            </button>
                        </div>

                        {isVolumeMode && (
                            <div className="space-y-3">
                                <p className="text-[9px] text-indigo-500/70 font-mono uppercase tracking-widest">Select Pivot Angles:</p>
                                <div className="flex flex-wrap gap-2">
                                    {['educational', 'contrarian', 'checklist', 'story', 'aggressive', 'philosophical'].map((angle) => (
                                        <button 
                                            key={angle}
                                            onClick={() => {
                                                const current = [...selectedAngles];
                                                if (current.includes(angle as StrategyAngle)) {
                                                    setSelectedAngles(current.filter(a => a !== angle));
                                                } else {
                                                    setSelectedAngles([...current, angle as StrategyAngle]);
                                                }
                                            }}
                                            className={`px-3 py-1.5 rounded-lg border text-[9px] font-black uppercase tracking-tighter transition-all ${
                                                selectedAngles.includes(angle as StrategyAngle)
                                                    ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300'
                                                    : 'bg-black/20 border-white/5 text-neutral-600'
                                            }`}
                                        >
                                            {angle}
                                        </button>
                                    ))}
                                </div>
                                <div className="flex items-center gap-2 pt-2 text-[9px] font-bold text-indigo-400 italic">
                                    <Sparkles className="w-3 h-3" />
                                    Each topic will be expanded into {selectedAngles.length} variants.
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Scheduling */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold flex items-center gap-1">
                                <Calendar className="w-3 h-3" /> Start Date
                            </label>
                            <input 
                                type="datetime-local"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-amber-500/50"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold flex items-center gap-1">
                                <Clock className="w-3 h-3" /> Hours Between Posts
                            </label>
                            <select 
                                value={intervalHours}
                                onChange={(e) => setIntervalHours(parseInt(e.target.value))}
                                className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-amber-500/50"
                            >
                                <option value={12}>Every 12 hours</option>
                                <option value={24}>Every 24 hours (Daily)</option>
                                <option value={48}>Every 48 hours</option>
                                <option value={72}>Every 72 hours</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-white/5 bg-black/20">
                    <button 
                        onClick={handleGenerate}
                        disabled={isGenerating || topics.filter(t => t.trim()).length === 0}
                        className={`w-full py-3 text-white text-sm font-bold uppercase rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50 ${isVolumeMode ? 'bg-indigo-600' : 'bg-gradient-to-r from-amber-500 to-orange-600'}`}
                    >
                        {isGenerating ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Generating {topics.filter(t => t.trim()).length} Posts...
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-4 h-4" />
                                {isVolumeMode 
                                    ? `Generate ${topics.filter(t => t.trim()).length * selectedAngles.length} Volume Variants`
                                    : `Generate & Schedule ${topics.filter(t => t.trim()).length} Posts`
                                }
                            </>
                        )}
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
