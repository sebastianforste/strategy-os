
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { GrowthSimulatorService, GrowthScenario, GrowthProjection, ProjectionPoint } from '../utils/growth-simulator';
import { Twitter, Linkedin, Users, TrendingUp, DollarSign, Activity, Settings, Info } from 'lucide-react';

interface GrowthSimulatorProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function GrowthSimulator({ isOpen, onClose }: GrowthSimulatorProps) {
    const [postsPerDay, setPostsPerDay] = useState(1);
    const [qualityMix, setQualityMix] = useState<'viral' | 'balanced' | 'sales'>('balanced');
    const [platforms, setPlatforms] = useState<'linkedin' | 'x' | 'all'>('linkedin');
    const [projection, setProjection] = useState<GrowthProjection | null>(null);

    const service = new GrowthSimulatorService();

    useEffect(() => {
        const scenario: GrowthScenario = {
            postsPerDay,
            qualityMix,
            platforms,
            currentFollowers: 1000, // Mock starting point
            leadConversionRate: 0.01 // 1%
        };
        const result = service.simulate(scenario, 30);
        setProjection(result);
    }, [postsPerDay, qualityMix, platforms]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-[#0A0A0A] border border-white/10 rounded-3xl w-full max-w-5xl h-[85vh] flex overflow-hidden shadow-2xl relative"
            >
                {/* Close Button */}
                <button onClick={onClose} className="absolute top-6 right-6 p-2 bg-white/5 hover:bg-white/10 rounded-full text-white z-50 transition-colors">
                    <Settings className="w-5 h-5" />
                </button>

                {/* LEFT CONTROL PANEL */}
                <div className="w-1/3 border-r border-white/10 p-8 flex flex-col bg-neutral-900/50">
                    <div className="mb-8">
                        <div className="flex items-center gap-3 mb-2">
                             <div className="p-2 bg-indigo-500/20 rounded-lg">
                                <TrendingUp className="w-6 h-6 text-indigo-400" />
                            </div>
                            <h2 className="text-2xl font-bold text-white">Growth Sim</h2>
                        </div>
                        <p className="text-sm text-neutral-400">Model the impact of your strategy on followers & revenue.</p>
                    </div>

                    <div className="space-y-8 flex-1">
                        {/* Frequency Slider */}
                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <label className="text-xs font-bold uppercase text-neutral-500 tracking-wider">Frequency</label>
                                <span className="text-sm font-bold text-white bg-white/10 px-2 py-0.5 rounded">{postsPerDay}x / Day</span>
                            </div>
                            <input 
                                type="range" 
                                min="1" 
                                max="10" 
                                value={postsPerDay} 
                                onChange={(e) => setPostsPerDay(parseInt(e.target.value))}
                                className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                            />
                            <p className="text-[10px] text-neutral-500 mt-2">More volume = more compounded reach.</p>
                        </div>

                        {/* Mix Selector */}
                         <div>
                            <label className="text-xs font-bold uppercase text-neutral-500 tracking-wider block mb-4">Content Mix</label>
                            <div className="grid grid-cols-3 gap-2">
                                {['viral', 'balanced', 'sales'].map((mix) => (
                                    <button
                                        key={mix}
                                        onClick={() => setQualityMix(mix as any)}
                                        className={`py-2 rounded-lg text-xs font-bold border transition-all ${qualityMix === mix ? 'bg-indigo-500 text-white border-indigo-500' : 'bg-white/5 text-neutral-400 border-white/10 hover:border-white/20'}`}
                                    >
                                        {mix.charAt(0).toUpperCase() + mix.slice(1)}
                                    </button>
                                ))}
                            </div>
                             <p className="text-[10px] text-neutral-500 mt-2">
                                {qualityMix === 'viral' && "High Impressions, Low Conversion."}
                                {qualityMix === 'balanced' && "Sustainable Growth & Leads."}
                                {qualityMix === 'sales' && "High Leads, Low Reach (Burnout Risk)."}
                            </p>
                        </div>

                        {/* Platform Selector */}
                        <div>
                            <label className="text-xs font-bold uppercase text-neutral-500 tracking-wider block mb-4">Distribution</label>
                             <div className="flex gap-2">
                                <button
                                    onClick={() => setPlatforms('linkedin')}
                                    className={`flex-1 py-2 rounded-lg flex justify-center items-center border transition-all ${platforms === 'linkedin' ? 'bg-blue-600/20 border-blue-500 text-blue-400' : 'bg-white/5 border-white/10 text-neutral-400'}`}
                                >
                                    <Linkedin className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setPlatforms('x')}
                                    className={`flex-1 py-2 rounded-lg flex justify-center items-center border transition-all ${platforms === 'x' ? 'bg-white/20 border-white text-white' : 'bg-white/5 border-white/10 text-neutral-400'}`}
                                >
                                    <Twitter className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setPlatforms('all')}
                                    className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-all ${platforms === 'all' ? 'bg-purple-500/20 border-purple-500 text-purple-400' : 'bg-white/5 border-white/10 text-neutral-400'}`}
                                >
                                    Omni
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT VISUALIZATION PANEL */}
                <div className="flex-1 p-8 flex flex-col bg-black">
                    {/* KEY METRICS */}
                    <div className="grid grid-cols-3 gap-4 mb-8">
                        <div className="bg-neutral-900 border border-white/10 rounded-2xl p-5">
                            <div className="flex items-center gap-2 mb-1">
                                <Users className="w-4 h-4 text-emerald-400" />
                                <span className="text-xs font-bold text-neutral-400 uppercase">New Followers</span>
                            </div>
                            <p className="text-3xl font-bold text-white">+{projection?.totalFollowerGain.toLocaleString()}</p>
                            <p className="text-[10px] text-neutral-500 mt-1">Next 30 Days</p>
                        </div>
                         <div className="bg-neutral-900 border border-white/10 rounded-2xl p-5">
                             <div className="flex items-center gap-2 mb-1">
                                <Activity className="w-4 h-4 text-blue-400" />
                                <span className="text-xs font-bold text-neutral-400 uppercase">Est. Leads</span>
                            </div>
                            <p className="text-3xl font-bold text-white">{projection?.totalLeads.toLocaleString()}</p>
                             <p className="text-[10px] text-neutral-500 mt-1">Based on 1% Conv.</p>
                        </div>
                         <div className="bg-neutral-900 border border-white/10 rounded-2xl p-5 relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                             <div className="flex items-center gap-2 mb-1 relative z-10">
                                <DollarSign className="w-4 h-4 text-amber-400" />
                                <span className="text-xs font-bold text-neutral-400 uppercase">Pipeline Value</span>
                            </div>
                            <p className="text-3xl font-bold text-white relative z-10">${projection?.totalRevenue.toLocaleString()}</p>
                             <p className="text-[10px] text-neutral-500 mt-1 relative z-10">Assumed LTV $100</p>
                        </div>
                    </div>

                    {/* CHART */}
                    <div className="flex-1 bg-neutral-900/30 border border-white/5 rounded-2xl p-6 relative">
                         <h3 className="text-sm font-bold text-white mb-6 uppercase tracking-wider flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-neutral-500" />
                            Growth Trajectory
                        </h3>
                         <div className="absolute inset-0 pt-16 pb-4 px-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={projection?.points || []}>
                                    <defs>
                                        <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                                            <stop offset="0%" stopColor="#6366f1" />
                                            <stop offset="100%" stopColor="#ec4899" />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                                    <XAxis 
                                        dataKey="day" 
                                        stroke="#525252" 
                                        tick={{fill: '#525252', fontSize: 10}} 
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <YAxis 
                                        stroke="#525252" 
                                        tick={{fill: '#525252', fontSize: 10}} 
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(val: number) => `${val/1000}k`}
                                    />
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: '#171717', border: '1px solid #333', borderRadius: '8px' }}
                                        itemStyle={{ color: '#fff', fontSize: '12px' }}
                                    />
                                    <Line 
                                        type="monotone" 
                                        dataKey="followers" 
                                        stroke="url(#lineGradient)" 
                                        strokeWidth={3} 
                                        dot={false}
                                        activeDot={{ r: 6, fill: '#fff' }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="mt-6 flex items-start gap-3 p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
                        <Info className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm text-indigo-200 font-medium">Strategic Insight</p>
                            <p className="text-xs text-indigo-300 mt-1 leading-relaxed">
                                {qualityMix === 'viral' && "This strategy maximizes reach but sacrifices deep trust. Great for top-of-funnel awareness, but ensure you have a capture mechanism (Lead Magnet) ready."}
                                {qualityMix === 'sales' && "This harvest strategy depletes audience goodwill over time. Consider pulsing this for short campaigns rather than a monthly baseline."}
                                {qualityMix === 'balanced' && "The Goldilocks zone. Builds authority and audience simultaneously. Recommended for long-term thought leadership."}
                            </p>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
