"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
    LayoutDashboard, 
    Zap, 
    Database, 
    Users, 
    Grid, 
    Ghost, 
    Phone, 
    Settings,
    Search,
    LayoutGrid,
    Menu,
    X,
    TrendingUp,
    Atom
} from "lucide-react";
import { useState } from "react";
import GlitchLogo from "./GlitchLogo";
import WorkspaceSwitcher from "./WorkspaceSwitcher";

interface SidebarRailProps {
    activeView: 'feed' | 'canvas' | 'network' | 'mastermind' | 'boardroom' | 'apps';
    onViewChange: (view: any) => void;
    isGhostActive: boolean;
    onToggleGhost: () => void;
    onOpenSearch: () => void;
    onOpenRedPhone: () => void;
    onOpenDeepResearch: () => void;
}

export default function SidebarRail({ 
    activeView, 
    onViewChange, 
    isGhostActive, 
    onToggleGhost, 
    onOpenSearch,
    onOpenRedPhone,
    onOpenDeepResearch
}: SidebarRailProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <>
            {/* Mobile Burger Menu Button */}
            <div className="lg:hidden fixed top-6 left-6 z-[100]">
                <button 
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="p-3 bg-[#080808] border border-white/10 rounded-xl text-white shadow-2xl"
                >
                    {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div>

            <motion.div 
                initial={false}
                animate={{ 
                    x: isMenuOpen ? 0 : (typeof window !== 'undefined' && window.innerWidth < 1024 ? -100 : 0)
                }}
                className={`fixed left-0 top-0 bottom-0 w-20 bg-[#080808] border-r border-white/5 flex flex-col items-center py-8 z-50 transition-transform duration-300 lg:translate-x-0 ${isMenuOpen ? 'translate-x-0 shadow-2xl shadow-black' : '-translate-x-full lg:translate-x-0'} ${isGhostActive ? 'grayscale' : ''}`}
            >
                {/* Logo & Workspace Area */}
                <div className="mb-10 flex flex-col items-center gap-4 px-2">
                    <GlitchLogo />
                    <div className="w-full scale-[0.8] origin-center -ml-1">
                        <WorkspaceSwitcher />
                    </div>
                </div>

                {/* All-in-One Rail Navigation */}
                <div className="flex-1 flex flex-col items-center w-full overflow-y-auto custom-scrollbar gap-4 px-2">
                    
                    {/* SECTION: STRATEGIC TOOLS */}
                    <div className="flex flex-col gap-2 w-full items-center">
                        <span className="text-[8px] font-black text-neutral-600 uppercase tracking-widest mb-1 rotate-0 lg:-rotate-90 origin-center lg:h-12 lg:mb-4 lg:flex lg:items-center">Strategic</span>
                        <RailItem 
                            icon={<LayoutDashboard className="w-5 h-5" />} 
                            label="Mastermind" 
                            active={activeView === 'mastermind'} 
                            onClick={() => { onViewChange('mastermind'); setIsMenuOpen(false); }} 
                        />
                        <RailItem 
                            icon={<Grid className="w-5 h-5" />} 
                            label="Boardroom" 
                            active={activeView === 'boardroom'} 
                            onClick={() => { onViewChange('boardroom'); setIsMenuOpen(false); }} 
                        />
                         <RailItem 
                            icon={<Atom className="w-5 h-5 text-indigo-400" />} 
                            label="Deep Research" 
                            active={false} 
                            onClick={() => { onOpenDeepResearch(); setIsMenuOpen(false); }} 
                        />
                    </div>

                    <div className="w-8 h-px bg-white/5 my-2" />

                    {/* SECTION: FEEDS */}
                    <div className="flex flex-col gap-2 w-full items-center">
                        <span className="text-[8px] font-black text-neutral-600 uppercase tracking-widest mb-1 rotate-0 lg:-rotate-90 origin-center lg:h-12 lg:mb-4 lg:flex lg:items-center">Ops</span>
                        <RailItem 
                            icon={<TrendingUp className="w-5 h-5" />} 
                            label="Signals" 
                            active={activeView === 'feed'} 
                            onClick={() => { onViewChange('feed'); setIsMenuOpen(false); }} 
                        />
                        <RailItem 
                            icon={<Database className="w-5 h-5" />} 
                            label="Canvas" 
                            active={activeView === 'canvas'} 
                            onClick={() => { onViewChange('canvas'); setIsMenuOpen(false); }} 
                        />
                        <RailItem 
                            icon={<Users className="w-5 h-5" />} 
                            label="Network" 
                            active={activeView === 'network'} 
                            onClick={() => { onViewChange('network'); setIsMenuOpen(false); }} 
                        />
                    </div>

                    <div className="w-8 h-px bg-white/5 my-2" />

                    {/* SECTION: UTILITIES */}
                    <div className="flex flex-col gap-2 w-full items-center mb-6">
                        <RailItem 
                            icon={<Search className="w-5 h-5" />} 
                            label="Global Search" 
                            active={false} 
                            onClick={() => { onOpenSearch(); setIsMenuOpen(false); }} 
                        />
                        <RailItem 
                            icon={<LayoutGrid className="w-5 h-5" />} 
                            label="App Directory" 
                            active={activeView === 'apps'} 
                            onClick={() => { onViewChange('apps'); setIsMenuOpen(false); }} 
                        />
                    </div>
                </div>

                {/* Bottom Actions */}
                <div className="flex flex-col gap-4 pb-4 px-2 w-full items-center">
                    {/* Red Phone - Pulsating */}
                    <button 
                        onClick={() => { onOpenRedPhone(); setIsMenuOpen(false); }}
                        className="relative group flex items-center justify-center w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 transition-all hover:bg-red-500/20 active:scale-95 shadow-[0_0_20px_rgba(239,68,68,0.1)] mb-2 grayscale-0"
                    >
                        <div className="absolute inset-0 bg-red-500/20 rounded-xl animate-ping opacity-20" />
                        <Phone className="w-5 h-5" />
                        
                        <div className="absolute left-full ml-4 px-2 py-1 bg-red-600 text-white text-[10px] font-black rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap uppercase tracking-widest z-[70]">
                            Direct Council Access
                        </div>
                    </button>

                    <RailItem 
                        icon={<Ghost className={`w-5 h-5 ${isGhostActive ? 'text-cyan-400' : ''}`} />} 
                        label="Ghost Mode" 
                        active={isGhostActive} 
                        onClick={onToggleGhost} 
                    />
                    <RailItem 
                        icon={<Settings className="w-5 h-5" />} 
                        label="System Settings" 
                        active={false} 
                        onClick={() => {}} 
                    />
                </div>
            </motion.div>
        </>
    );
}

function RailItem({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) {
    return (
        <button 
            onClick={onClick}
            className="group relative flex items-center justify-center w-12 h-12 transition-all"
        >
            <div className={`absolute inset-0 rounded-xl transition-all duration-200 ease-in-out ${active ? 'bg-white/10 scale-100' : 'bg-transparent scale-90 group-hover:bg-white/5 opacity-0 group-hover:opacity-100'}`} />
            
            <div className={`relative transition-all duration-200 ease-in-out ${active ? 'text-white scale-110' : 'text-neutral-500 group-hover:text-neutral-300'}`}>
                {icon}
            </div>

            {/* Tooltip */}
            <div className="absolute left-full ml-4 px-2 py-1 bg-[#111] border border-white/10 text-white text-[10px] font-black rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap uppercase tracking-[0.2em] shadow-2xl z-[60]">
                {label}
            </div>

            {/* Active Indicator */}
            {active && (
                <motion.div 
                    layoutId="activeRail"
                    className="absolute -left-[34px] w-1 h-8 bg-white rounded-r-full shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                />
            )}
        </button>
    );
}
