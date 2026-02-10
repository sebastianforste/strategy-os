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
    Atom,
    Mic,
    ShoppingBag,
    Folder,
    Brain,
    Calendar,
    Shield,
    CreditCard,
    Trophy,
    Terminal,
    RefreshCcw,
    BarChart3,
    Layers,
    Split,
    HardDrive,
    PenTool,
    FileBarChart,
    Share2,
    Globe,
    BarChart,
    MessageSquare,
    Video,
    Briefcase,
    ShieldCheck,
    Cpu,
    Mail,
    SearchCode,
    Users2,
    Store,
    LayoutTemplate,
    IterationCcw,
    Activity,
    Smartphone,
    GitBranch,
    Server,
    Mic2,
    Wand2,
    Radio,
    ShieldAlert,
    Coins,
    Watch,
    Infinity
} from "lucide-react";
import { useState } from "react";
import GlitchLogo from "./GlitchLogo";
import WorkspaceSwitcher from "./WorkspaceSwitcher";

interface SidebarRailProps {
    activeView: 'feed' | 'canvas' | 'network' | 'mastermind' | 'boardroom' | 'apps' | 'lead_crm' | 'marketplace' | 'library' | 'trainer' | 'scheduler' | 'security' | 'refresh' | 'billing' | 'arena' | 'analytics' | 'api' | 'whiteboard' | 'labs' | 'ingest' | 'narrative' | 'reports' | 'web3' | 'market' | 'predict' | 'crm' | 'video' | 'agency' | 'reputation' | 'compliance' | 'hardware' | 'newsletter' | 'seo' | 'audit' | 'store' | 'funnel' | 'recursive' | 'style_v2' | 'swarm_v2' | 'revenue_v2' | 'voice_v2' | 'graph_v2' | 'sim_v2' | 'visual_v3' | 'stream_v2' | 'compliance_v2' | 'agency_v2' | 'seo_v3' | 'market_v2' | 'hardware_v3' | 'news_v3' | 'exit_v2';
    onViewChange: (view: any) => void;
    isGhostActive: boolean;
    onToggleGhost: () => void;
    onOpenSearch: () => void;
    onOpenRedPhone: () => void;
    onOpenDeepResearch: () => void;
    onOpenVoiceStudio: () => void;
}

export default function SidebarRail({ 
    activeView, 
    onViewChange, 
    isGhostActive,
    onToggleGhost, 
    onOpenSearch,
    onOpenRedPhone,
    onOpenDeepResearch,
    onOpenVoiceStudio
}: SidebarRailProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <>
            {/* Mobile Burger Menu Button */}
            <div className="lg:hidden fixed top-6 left-6 z-[100]">
                <button 
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="p-3 glass-panel bg-black/80 border border-white/10 rounded-xl text-white shadow-2xl backdrop-blur-xl"
                >
                    {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div>

            <motion.div 
                initial={false}
                animate={{ 
                    x: isMenuOpen ? 0 : (typeof window !== 'undefined' && window.innerWidth < 1024 ? -100 : 0)
                }}
                className={`fixed left-0 top-0 bottom-0 w-20 bg-black/60 backdrop-blur-2xl border-r border-white/[0.08] flex flex-col items-center py-8 z-50 transition-all duration-300 lg:translate-x-0 ${isMenuOpen ? 'translate-x-0 shadow-[0_0_60px_rgba(0,0,0,0.8)]' : '-translate-x-full lg:translate-x-0'} ${isGhostActive ? 'grayscale' : ''}`}
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
                            icon={<Calendar className={`w-5 h-5 ${activeView === 'scheduler' ? 'text-emerald-400' : ''}`} />} 
                            label="Scheduler" 
                            active={activeView === 'scheduler'} 
                            onClick={() => { onViewChange('scheduler'); setIsMenuOpen(false); }} 
                        />
                        <RailItem 
                            icon={<RefreshCcw className={`w-5 h-5 ${activeView === 'refresh' ? 'text-amber-400' : ''}`} />} 
                            label="Content Refresh" 
                            active={activeView === 'refresh'} 
                            onClick={() => { onViewChange('refresh'); setIsMenuOpen(false); }} 
                        />
                        <RailItem 
                            icon={<Trophy className={`w-5 h-5 ${activeView === 'arena' ? 'text-amber-400' : ''}`} />} 
                            label="Arena" 
                            active={activeView === 'arena'} 
                            onClick={() => { onViewChange('arena'); setIsMenuOpen(false); }} 
                        />
                        <RailItem 
                            icon={<BarChart3 className={`w-5 h-5 ${activeView === 'analytics' ? 'text-blue-400' : ''}`} />} 
                            label="Analytics" 
                            active={activeView === 'analytics'} 
                            onClick={() => { onViewChange('analytics'); setIsMenuOpen(false); }} 
                        />
                        <RailItem 
                            icon={<Terminal className={`w-5 h-5 ${activeView === 'api' ? 'text-brand-400' : ''}`} />} 
                            label="API" 
                            active={activeView === 'api'} 
                            onClick={() => { onViewChange('api'); setIsMenuOpen(false); }} 
                        />
                        <RailItem 
                            icon={<Layers className={`w-5 h-5 ${activeView === 'whiteboard' ? 'text-blue-400' : ''}`} />} 
                            label="Whiteboard" 
                            active={activeView === 'whiteboard'} 
                            onClick={() => { onViewChange('whiteboard'); setIsMenuOpen(false); }} 
                        />
                        <RailItem 
                            icon={<Split className={`w-5 h-5 ${activeView === 'labs' ? 'text-indigo-400' : ''}`} />} 
                            label="Labs" 
                            active={activeView === 'labs'} 
                            onClick={() => { onViewChange('labs'); setIsMenuOpen(false); }} 
                        />
                        <RailItem 
                            icon={<HardDrive className={`w-5 h-5 ${activeView === 'ingest' ? 'text-brand-400' : ''}`} />} 
                            label="Ingest" 
                            active={activeView === 'ingest'} 
                            onClick={() => { onViewChange('ingest'); setIsMenuOpen(false); }} 
                        />
                        <RailItem 
                            icon={<PenTool className={`w-5 h-5 ${activeView === 'narrative' ? 'text-brand-400' : ''}`} />} 
                            label="Narrative" 
                            active={activeView === 'narrative'} 
                            onClick={() => { onViewChange('narrative'); setIsMenuOpen(false); }} 
                        />
                        <RailItem 
                            icon={<FileBarChart className={`w-5 h-5 ${activeView === 'reports' ? 'text-brand-400' : ''}`} />} 
                            label="Reports" 
                            active={activeView === 'reports'} 
                            onClick={() => { onViewChange('reports'); setIsMenuOpen(false); }} 
                        />
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
                            icon={<CreditCard className={`w-5 h-5 ${activeView === 'billing' ? 'text-indigo-400' : ''}`} />} 
                            label="Billing" 
                            active={activeView === 'billing'} 
                            onClick={() => { onViewChange('billing'); setIsMenuOpen(false); }} 
                        />
                        <RailItem 
                            icon={<Folder className="w-5 h-5 text-brand-400" />} 
                            label="Library" 
                            active={activeView === 'library'} 
                            onClick={() => { onViewChange('library'); setIsMenuOpen(false); }} 
                        />
                        <RailItem 
                            icon={<Users className="w-5 h-5" />} 
                            label="Network" 
                            active={activeView === 'network'} 
                            onClick={() => { onViewChange('network'); setIsMenuOpen(false); }} 
                        />
                        <RailItem 
                            icon={<Share2 className={`w-5 h-5 ${activeView === 'web3' ? 'text-brand-400' : ''}`} />} 
                            label="Web3 Social" 
                            active={activeView === 'web3'} 
                            onClick={() => { onViewChange('web3'); setIsMenuOpen(false); }} 
                        />
                        <RailItem 
                            icon={<Globe className={`w-5 h-5 ${activeView === 'market' ? 'text-brand-400' : ''}`} />} 
                            label="Market Intel" 
                            active={activeView === 'market'} 
                            onClick={() => { onViewChange('market'); setIsMenuOpen(false); }} 
                        />
                        <RailItem 
                            icon={<Activity className={`w-5 h-5 ${activeView === 'predict' ? 'text-brand-400' : ''}`} />} 
                            label="Predictive" 
                            active={activeView === 'predict'} 
                            onClick={() => { onViewChange('predict'); setIsMenuOpen(false); }} 
                        />
                         <RailItem 
                            icon={<MessageSquare className={`w-5 h-5 ${activeView === 'crm' ? 'text-brand-400' : ''}`} />} 
                            label="Relationships" 
                            active={activeView === 'crm'} 
                            onClick={() => { onViewChange('crm'); setIsMenuOpen(false); }} 
                        />
                        <RailItem 
                            icon={<Video className={`w-5 h-5 ${activeView === 'video' ? 'text-indigo-400' : ''}`} />} 
                            label="Video Studio" 
                            active={activeView === 'video'} 
                            onClick={() => { onViewChange('video'); setIsMenuOpen(false); }} 
                        />
                        <RailItem 
                            icon={<Briefcase className={`w-5 h-5 ${activeView === 'agency' ? 'text-indigo-400' : ''}`} />} 
                            label="Agency Hub" 
                            active={activeView === 'agency'} 
                            onClick={() => { onViewChange('agency'); setIsMenuOpen(false); }} 
                        />
                        <RailItem 
                            icon={<ShieldCheck className={`w-5 h-5 ${activeView === 'reputation' ? 'text-brand-400' : ''}`} />} 
                            label="Reputation" 
                            active={activeView === 'reputation'} 
                            onClick={() => { onViewChange('reputation'); setIsMenuOpen(false); }} 
                        />
                        <RailItem 
                            icon={<Smartphone className={`w-5 h-5 ${activeView === 'compliance' ? 'text-red-400' : ''}`} />} 
                            label="Compliance" 
                            active={activeView === 'compliance'} 
                            onClick={() => { onViewChange('compliance'); setIsMenuOpen(false); }} 
                        />
                        <RailItem 
                            icon={<Cpu className={`w-5 h-5 ${activeView === 'hardware' ? 'text-brand-400' : ''}`} />} 
                            label="Hardware Sync" 
                            active={activeView === 'hardware'} 
                            onClick={() => { onViewChange('hardware'); setIsMenuOpen(false); }} 
                        />
                        <RailItem 
                            icon={<Mail className={`w-5 h-5 ${activeView === 'newsletter' ? 'text-indigo-400' : ''}`} />} 
                            label="Newsletters" 
                            active={activeView === 'newsletter'} 
                            onClick={() => { onViewChange('newsletter'); setIsMenuOpen(false); }} 
                        />
                        <RailItem 
                            icon={<SearchCode className={`w-5 h-5 ${activeView === 'seo' ? 'text-brand-400' : ''}`} />} 
                            label="SEO Authority" 
                            active={activeView === 'seo'} 
                            onClick={() => { onViewChange('seo'); setIsMenuOpen(false); }} 
                        />
                        <RailItem 
                            icon={<Users2 className={`w-5 h-5 ${activeView === 'audit' ? 'text-brand-400' : ''}`} />} 
                            label="Peer Review" 
                            active={activeView === 'audit'} 
                            onClick={() => { onViewChange('audit'); setIsMenuOpen(false); }} 
                        />
                        <RailItem 
                            icon={<Store className={`w-5 h-5 ${activeView === 'store' ? 'text-brand-400' : ''}`} />} 
                            label="App Store" 
                            active={activeView === 'store'} 
                            onClick={() => { onViewChange('store'); setIsMenuOpen(false); }} 
                        />
                        <RailItem 
                            icon={<LayoutTemplate className={`w-5 h-5 ${activeView === 'funnel' ? 'text-indigo-400' : ''}`} />} 
                            label="Landing Pages" 
                            active={activeView === 'funnel'} 
                            onClick={() => { onViewChange('funnel'); setIsMenuOpen(false); }} 
                        />
                        <RailItem 
                            icon={<IterationCcw className={`w-5 h-5 ${activeView === 'recursive' ? 'text-brand-400' : ''}`} />} 
                            label="AI Logic" 
                            active={activeView === 'recursive'} 
                            onClick={() => { onViewChange('recursive'); setIsMenuOpen(false); }} 
                        />
                        <RailItem 
                            icon={<GitBranch className={`w-5 h-5 ${activeView === 'style_v2' ? 'text-indigo-400' : ''}`} />} 
                            label="Style Hub" 
                            active={activeView === 'style_v2'} 
                            onClick={() => { onViewChange('style_v2'); setIsMenuOpen(false); }} 
                        />
                        <RailItem 
                            icon={<Server className={`w-5 h-5 ${activeView === 'swarm_v2' ? 'text-brand-400' : ''}`} />} 
                            label="Swarm Node" 
                            active={activeView === 'swarm_v2'} 
                            onClick={() => { onViewChange('swarm_v2'); setIsMenuOpen(false); }} 
                        />
                        <RailItem 
                            icon={<TrendingUp className={`w-5 h-5 ${activeView === 'revenue_v2' ? 'text-emerald-400' : ''}`} />} 
                            label="Revenue Intel" 
                            active={activeView === 'revenue_v2'} 
                            onClick={() => { onViewChange('revenue_v2'); setIsMenuOpen(false); }} 
                        />
                        <RailItem 
                            icon={<Mic2 className={`w-5 h-5 ${activeView === 'voice_v2' ? 'text-rose-400' : ''}`} />} 
                            label="Voice Studio" 
                            active={activeView === 'voice_v2'} 
                            onClick={() => { onViewChange('voice_v2'); setIsMenuOpen(false); }} 
                        />
                        <RailItem 
                            icon={<Share2 className={`w-5 h-5 ${activeView === 'graph_v2' ? 'text-indigo-400' : ''}`} />} 
                            label="Brain Graph" 
                            active={activeView === 'graph_v2'} 
                            onClick={() => { onViewChange('graph_v2'); setIsMenuOpen(false); }} 
                        />
                        <RailItem 
                            icon={<Users className={`w-5 h-5 ${activeView === 'sim_v2' ? 'text-indigo-400' : ''}`} />} 
                            label="Behavior Sim" 
                            active={activeView === 'sim_v2'} 
                            onClick={() => { onViewChange('sim_v2'); setIsMenuOpen(false); }} 
                        />
                        <RailItem 
                            icon={<Wand2 className={`w-5 h-5 ${activeView === 'visual_v3' ? 'text-brand-400' : ''}`} />} 
                            label="Alchemist V3" 
                            active={activeView === 'visual_v3'} 
                            onClick={() => { onViewChange('visual_v3'); setIsMenuOpen(false); }} 
                        />
                        <RailItem 
                            icon={<Radio className={`w-5 h-5 ${activeView === 'stream_v2' ? 'text-rose-400' : ''}`} />} 
                            label="Stream Hub" 
                            active={activeView === 'stream_v2'} 
                            onClick={() => { onViewChange('stream_v2'); setIsMenuOpen(false); }} 
                        />
                        <RailItem 
                            icon={<ShieldAlert className={`w-5 h-5 ${activeView === 'compliance_v2' ? 'text-amber-500' : ''}`} />} 
                            label="Hardened Shield" 
                            active={activeView === 'compliance_v2'} 
                            onClick={() => { onViewChange('compliance_v2'); setIsMenuOpen(false); }} 
                        />
                        <RailItem 
                            icon={<BarChart className={`w-5 h-5 ${activeView === 'agency_v2' ? 'text-brand-400' : ''}`} />} 
                            label="Agency Matrix" 
                            active={activeView === 'agency_v2'} 
                            onClick={() => { onViewChange('agency_v2'); setIsMenuOpen(false); }} 
                        />
                        <RailItem 
                            icon={<Search className={`w-5 h-5 ${activeView === 'seo_v3' ? 'text-indigo-400' : ''}`} />} 
                            label="Neural SEO" 
                            active={activeView === 'seo_v3'} 
                            onClick={() => { onViewChange('seo_v3'); setIsMenuOpen(false); }} 
                        />
                        <RailItem 
                            icon={<Coins className={`w-5 h-5 ${activeView === 'market_v2' ? 'text-amber-500' : ''}`} />} 
                            label="Alpha Market" 
                            active={activeView === 'market_v2'} 
                            onClick={() => { onViewChange('market_v2'); setIsMenuOpen(false); }} 
                        />
                        <RailItem 
                            icon={<Watch className={`w-5 h-5 ${activeView === 'hardware_v3' ? 'text-indigo-400' : ''}`} />} 
                            label="Biometric Enclave" 
                            active={activeView === 'hardware_v3'} 
                            onClick={() => { onViewChange('hardware_v3'); setIsMenuOpen(false); }} 
                        />
                        <RailItem 
                            icon={<Mail className={`w-5 h-5 ${activeView === 'news_v3' ? 'text-rose-400' : ''}`} />} 
                            label="Personalized News" 
                            active={activeView === 'news_v3'} 
                            onClick={() => { onViewChange('news_v3'); setIsMenuOpen(false); }} 
                        />
                        <RailItem 
                            icon={<Infinity className={`w-5 h-5 ${activeView === 'exit_v2' ? 'text-emerald-500' : ''}`} />} 
                            label="Autonomous Exit" 
                            active={activeView === 'exit_v2'} 
                            onClick={() => { onViewChange('exit_v2'); setIsMenuOpen(false); }} 
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
                            icon={<Users className="w-5 h-5 text-emerald-400" />} 
                            label="CRM Pipeline" 
                            active={activeView === 'lead_crm'} 
                            onClick={() => { onViewChange('lead_crm'); setIsMenuOpen(false); }} 
                        />
                        <RailItem 
                            icon={<LayoutGrid className="w-5 h-5" />} 
                            label="App Directory" 
                            active={activeView === 'apps'} 
                            onClick={() => { onViewChange('apps'); setIsMenuOpen(false); }} 
                        />
                        <RailItem 
                            icon={<Brain className={`w-5 h-5 ${activeView === 'trainer' ? 'text-brand-400' : ''}`} />} 
                            label="Agent Lab" 
                            active={activeView === 'trainer'} 
                            onClick={() => { onViewChange('trainer'); setIsMenuOpen(false); }} 
                        />
                        <RailItem 
                            icon={<Shield className={`w-5 h-5 ${activeView === 'security' ? 'text-indigo-400' : ''}`} />} 
                            label="Security" 
                            active={activeView === 'security'} 
                            onClick={() => { onViewChange('security'); setIsMenuOpen(false); }} 
                        />
                        <RailItem 
                            icon={<ShoppingBag className={`w-5 h-5 ${activeView === 'marketplace' ? 'text-indigo-400' : ''}`} />} 
                            label="Marketplace" 
                            active={activeView === 'marketplace'} 
                            onClick={() => { onViewChange('marketplace'); setIsMenuOpen(false); }} 
                        />
                        <RailItem 
                            icon={<Mic className="w-5 h-5" />} 
                            label="Voice Studio" 
                            active={false} 
                            onClick={() => { onOpenVoiceStudio(); setIsMenuOpen(false); }} 
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
            <div className={`absolute inset-0 rounded-xl transition-all duration-300 ease-out ${active ? 'bg-gradient-to-br from-indigo-500/20 to-purple-500/10 scale-100 shadow-[0_0_20px_rgba(99,102,241,0.15)]' : 'bg-transparent scale-90 group-hover:bg-white/[0.06] group-hover:scale-100 opacity-0 group-hover:opacity-100'}`} />
            
            <div className={`relative transition-all duration-200 ease-in-out ${active ? 'text-white scale-110' : 'text-neutral-500 group-hover:text-neutral-300'}`}>
                {icon}
            </div>

            {/* Tooltip */}
            <div className="absolute left-full ml-4 px-3 py-1.5 bg-black/90 backdrop-blur-xl border border-white/[0.08] text-white text-[10px] font-black rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap uppercase tracking-[0.15em] shadow-[0_4px_20px_rgba(0,0,0,0.5)] z-[60]">
                {label}
            </div>

            {/* Active Indicator */}
            {active && (
                <motion.div 
                    layoutId="activeRail"
                    className="absolute -left-[34px] w-1 h-8 bg-gradient-to-b from-indigo-400 to-purple-500 rounded-r-full shadow-[0_0_20px_rgba(129,140,248,0.6)]"
                />
            )}
        </button>
    );
}
