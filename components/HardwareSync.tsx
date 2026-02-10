"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Smartphone, Watch, Thermometer, MapPin, Activity, Heart, Zap, RefreshCcw, CheckCircle, Bluetooth, Cpu, Cloud, Battery, ChevronRight, Wind, Sun } from "lucide-react";

interface DeviceStatus {
    id: string;
    name: string;
    type: 'Mobile' | 'Wearable' | 'Environment';
    status: 'Connected' | 'Syncing' | 'Disconnected';
    battery?: number;
}

const DEVICES: DeviceStatus[] = [
    { id: 'd1', name: 'Sebastian’s iPhone 15', type: 'Mobile', status: 'Connected', battery: 84 },
    { id: 'd2', name: 'Apple Watch Ultra', type: 'Wearable', status: 'Syncing', battery: 92 },
    { id: 'd3', name: 'Studio Air Monitor', type: 'Environment', status: 'Connected' },
];

export default function HardwareSync() {
    const [devices] = useState<DeviceStatus[]>(DEVICES);
    const [biometrics, setBiometrics] = useState({ hr: 72, hrv: 64, stress: 'Low' });

    // Simulate biometric jitter
    useEffect(() => {
        const interval = setInterval(() => {
            setBiometrics(prev => ({
                ...prev,
                hr: Math.floor(prev.hr + (Math.random() - 0.5) * 4)
            }));
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-8 min-h-[700px]">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12">
                <div className="flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-brand-400/10 text-brand-400 border border-brand-400/20">
                        <Smartphone className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white uppercase tracking-tight">Hardware Bridge</h2>
                        <p className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-mono mt-1">Biometric Sync & Environment-Aware Content</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-brand-500/10 rounded-lg border border-brand-500/20">
                        <div className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
                        <span className="text-[10px] font-black text-brand-400 uppercase tracking-widest">Real-Time Telemetry</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* BIOMETRIC OPS */}
                <div className="lg:col-span-2 space-y-12">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <VitalsCard icon={<Heart className="w-5 h-5 text-rose-400" />} label="Heart Rate" value={`${biometrics.hr}`} unit="BPM" />
                        <VitalsCard icon={<Activity className="w-5 h-5 text-indigo-400" />} label="HRV Status" value={`${biometrics.hrv}`} unit="MS" />
                        <VitalsCard icon={<Zap className="w-5 h-5 text-amber-400" />} label="Focus Energy" value="High" unit="ALPHA" />
                    </div>

                    <div className="space-y-6">
                        <h3 className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Environmental Context</h3>
                        <div className="p-10 bg-white/[0.02] border border-white/5 rounded-[40px] grid grid-cols-2 md:grid-cols-4 gap-8">
                            <EnvItem icon={<MapPin />} label="Location" value="New York, NY" />
                            <EnvItem icon={<Sun />} label="Solar" value="Peak Output" />
                            <EnvItem icon={<Wind />} label="Air Quality" value="Excellent" />
                            <EnvItem icon={<Thermometer />} label="Studio Temp" value="71°F" />
                        </div>
                    </div>

                    <div className="p-10 bg-brand-500/5 border border-brand-500/10 rounded-[40px] relative overflow-hidden group">
                        <div className="flex items-center gap-4 mb-8">
                            <Cpu className="w-6 h-6 text-brand-400" />
                            <h4 className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Context-Aware Synthesis</h4>
                        </div>
                        <p className="text-sm text-white/60 leading-relaxed italic mb-8">
                            "Current biometric telemetry indicates high focus and calm pulse. Recommending technical 'Deep Dives' for current content cycle. Adjusting persona Marcus Vane to `Analytical/Stoic` mode."
                        </p>
                        <button className="px-8 py-3 bg-white text-black rounded-xl text-[9px] font-black uppercase tracking-widest hover:scale-105 transition-all">
                            Calibrate Strategy
                        </button>
                    </div>
                </div>

                {/* DEVICE ECOSYSTEM */}
                <div className="space-y-6">
                    <h3 className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-4">Authorized Hardware</h3>
                    
                    <div className="space-y-3">
                        {devices.map((device) => (
                            <div key={device.id} className="p-5 bg-white/[0.02] border border-white/5 rounded-3xl flex items-center gap-4 group hover:bg-white/[0.05] transition-all">
                                <div className="p-3 bg-white/5 rounded-2xl text-white/40">
                                    {device.type === 'Mobile' ? <Smartphone className="w-5 h-5" /> : 
                                     device.type === 'Wearable' ? <Watch className="w-5 h-5" /> : <Cloud className="w-5 h-5" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-xs font-bold text-white uppercase tracking-tight truncate">{device.name}</h4>
                                    <div className="flex items-center gap-2 mt-1">
                                        <div className={`w-1.5 h-1.5 rounded-full ${device.status === 'Connected' ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
                                        <span className="text-[9px] font-mono text-white/20 uppercase tracking-tighter">{device.status}</span>
                                    </div>
                                </div>
                                {device.battery && (
                                    <div className="flex items-center gap-1.5 text-[10px] font-mono text-white/40">
                                        <Battery className="w-3.5 h-3.5" />
                                        {device.battery}%
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="p-8 bg-blue-500/5 border border-blue-500/10 rounded-3xl relative overflow-hidden group mt-12">
                        <div className="absolute top-0 right-0 p-8 opacity-5">
                            <Bluetooth className="w-32 h-32 text-blue-400" />
                        </div>
                        <h4 className="text-[10px] font-black text-white uppercase tracking-widest mb-4">Peripheral Bridge</h4>
                        <p className="text-[9px] text-white/40 leading-relaxed italic mb-8">
                            Enable high-frequency Bluetooth sync for sub-millisecond biometric response.
                        </p>
                        <button className="w-full py-3 border border-blue-500/20 rounded-xl text-[9px] font-black text-blue-400 uppercase tracking-widest hover:bg-blue-500/10 transition-all">
                            Enter Pairing Mode
                        </button>
                    </div>

                    <div className="p-6 border border-white/5 rounded-2xl flex items-center justify-between cursor-pointer hover:bg-white/5 transition-all group">
                        <div className="flex items-center gap-3">
                            <Settings2 className="w-4 h-4 text-white/20 group-hover:text-white" />
                            <span className="text-[10px] font-bold text-white uppercase tracking-tight">API Telemetry Settings</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-white/20" />
                    </div>
                </div>
            </div>
        </div>
    );
}

function VitalsCard({ icon, label, value, unit }: { icon: React.ReactNode, label: string, value: string, unit: string }) {
    return (
        <div className="p-8 rounded-[32px] border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-all group overflow-hidden relative">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">{icon}</div>
            <p className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-2">{label}</p>
            <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-white tracking-tighter">{value}</span>
                <span className="text-[10px] font-black text-white/20 uppercase">{unit}</span>
            </div>
        </div>
    );
}

function EnvItem({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
    return (
        <div className="text-center">
            <div className="flex justify-center mb-4 text-white/20">{icon}</div>
            <p className="text-[8px] font-black uppercase tracking-[0.2em] text-white/20 mb-1">{label}</p>
            <p className="text-[10px] font-bold text-white uppercase tracking-tight">{value}</p>
        </div>
    );
}

function Settings2(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M20 7h-9" />
            <path d="M14 17H5" />
            <circle cx="17" cy="17" r="3" />
            <circle cx="7" cy="7" r="3" />
        </svg>
    );
}
