"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Zap,
  Settings,
  Terminal,
  ChevronDown,
  Bolt,
  CheckSquare,
  Square,
  Activity,
  Wifi,
  Cloud,
  Server,
  LayoutDashboard,
  Search,
  Grid,
  Ghost,
  TrendingUp,
  RefreshCw,
  Sparkles,
  History,
  Building2,
  Anchor,
  Palette,
  Target,
  ShoppingBag,
  Mic,
  Users,
  BookOpen,
  Cpu,
  LucideIcon, // Keep LucideIcon for type definition
  Play, // Keep Play if used
  Bot // Keep Bot if used
} from "lucide-react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const BaseCard = ({ children, className = "" }: CardProps) => (
  <div className={`strategy-card p-5 ${className}`}>
    {children}
  </div>
);

export const TacticalStatCard = ({ title, value, status, icon: Icon }: { title: string, value: string | number, status?: string, icon: LucideIcon }) => (
  <BaseCard className="flex flex-col gap-2">
    <div className="flex justify-between items-start">
      <div className="p-2 rounded-lg bg-white/5">
        <Icon size={18} className="text-white/60" />
      </div>
      {status && (
        <span className="text-[10px] font-bold tracking-tighter text-emerald-500 uppercase flex items-center gap-1">
          <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
          {status}
        </span>
      )}
    </div>
    <div>
      <p className="text-[11px] font-medium text-white/40 uppercase tracking-widest">{title}</p>
      <p className="text-2xl font-bold text-white tracking-tight">{value}</p>
    </div>
  </BaseCard>
);

export const StrategicAlignmentCard = ({ percentage }: { percentage: number }) => (
  <BaseCard className="flex flex-col items-center justify-center gap-4 py-8">
    <div className="relative w-32 h-32">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="45" fill="none" stroke="white/5" strokeWidth="6" />
        <circle 
          cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="6"
          strokeDasharray={2 * Math.PI * 45}
          strokeDashoffset={2 * Math.PI * 45 * (1 - percentage / 100)}
          strokeLinecap="round"
          className="text-emerald-500 transition-all duration-1000 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-white">{percentage}%</span>
      </div>
    </div>
    <div className="text-center">
      <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-4">Strategic Alignment</p>
      <button className="px-6 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-[10px] font-bold text-white uppercase tracking-widest transition-all">
        Mix Tracks
      </button>
    </div>
  </BaseCard>
);

export const AgentStatusCard = ({ name, description, status, badgeColor = "blue" }: { name: string, description: string, status: string, badgeColor?: "blue" | "red" | "emerald" }) => {
  const colorMap = {
    blue: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    red: "text-red-400 bg-red-500/10 border-red-500/20",
    emerald: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  };

  return (
    <BaseCard className="flex items-center justify-between group cursor-pointer hover:bg-white/[0.04] transition-colors border-white/[0.05] hover:border-white/10 group">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
          <Bot size={20} className="text-white/60 group-hover:text-white transition-colors" />
        </div>
        <div>
          <p className="font-bold text-sm text-white">{name}</p>
          <p className="text-[11px] text-white/40">{description}</p>
        </div>
      </div>
      <div className={`px-2 py-0.5 rounded border text-[9px] font-black uppercase tracking-tighter ${colorMap[badgeColor]}`}>
        {status}
      </div>
    </BaseCard>
  );
};

export const BriefingCard = ({ quote, actionLabel, onAction }: { quote: string, actionLabel: string, onAction?: () => void }) => (
  <BaseCard className="flex flex-col justify-between min-h-[220px]">
    <div className="flex justify-between items-start">
      <div className="flex items-center gap-2">
        <div className="p-1.5 rounded-lg bg-indigo-500/10">
          <Activity size={16} className="text-indigo-500" />
        </div>
        <span className="text-[10px] font-black italic uppercase tracking-widest text-white/40">Chief of Staff Briefing</span>
      </div>
      <div className="p-1.5 rounded-full border border-white/5">
        <TrendingUp size={12} className="text-white/20" />
      </div>
    </div>
    
    <div className="my-4">
      <h2 className="text-xl font-medium text-white/90 leading-tight tracking-tight italic">
        "{quote}"
      </h2>
    </div>

    <div className="flex gap-4">
      <button 
        onClick={onAction}
        className="flex items-center gap-2 px-4 py-2 bg-brand-600/20 hover:bg-brand-600/30 text-brand-400 border border-brand-500/30 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all shadow-[0_4px_12px_rgba(124,58,237,0.1)]"
      >
        {actionLabel}
      </button>
    </div>
  </BaseCard>
);

export const DailyStrategyCard = ({ onGenerate }: { onGenerate?: () => void }) => (
    <BaseCard className="bg-gradient-to-br from-[#7c3aed] to-[#4c1d95] border-none shadow-[0_20px_50px_rgba(124,58,237,0.3)]">
        <div className="flex flex-col gap-4">
            <div>
                <h3 className="text-lg font-bold text-white mb-2 uppercase tracking-tighter">Execute Daily Strategy</h3>
                <p className="text-xs text-white/80 leading-relaxed font-light">
                    Market signals suggest focusing on Authority setup. Buy a Volume Bar for maximum footprint.
                </p>
            </div>
            <button 
                onClick={onGenerate}
                className="w-full py-3 bg-white text-[#7c3aed] rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-white/90 transition-all flex items-center justify-center gap-2 shadow-xl"
            >
                Generate Today's Assets
            </button>
        </div>
    </BaseCard>
);
