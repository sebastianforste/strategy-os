
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Flame, CheckCircle, AlertTriangle, Clock, X, BarChart2 } from 'lucide-react';
import { cn } from '../../utils/cn';

interface StrategyArchiveProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function StrategyArchive({ isOpen, onClose }: StrategyArchiveProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
          />

          {/* Sidebar Panel */}
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute right-0 top-0 bottom-0 w-full max-w-[380px] h-full bg-[#171121]/90 backdrop-blur-2xl border-l border-brand-600/20 shadow-2xl flex flex-col z-50 text-white"
          >
            {/* Header */}
            <div className="pt-8 px-6 pb-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold tracking-tight font-sans">Strategy Archive</h2>
                <button
                  onClick={onClose}
                  className="p-1 hover:bg-white/10 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-white/60 hover:text-white" />
                </button>
              </div>

              {/* Search/Filter Bar */}
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="w-4 h-4 text-white/40 group-focus-within:text-brand-400 transition-colors" />
                </div>
                <input
                  className="block w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500/50 transition-all font-sans text-white"
                  placeholder="Search strategies..."
                  type="text"
                />
              </div>
            </div>

            {/* Scrollable Timeline List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar px-6 space-y-4 pb-12">
              <div className="flex justify-between items-center mb-2 px-1">
                 <button className="text-xs font-medium text-brand-400 hover:text-brand-300 uppercase tracking-wider transition-colors">
                    Clear All
                 </button>
                 <span className="text-xs text-white/30 font-mono">32 ITEMS</span>
              </div>

              {/* Archive Item 1: Viral */}
              <div className="relative group cursor-pointer">
                <div className="absolute -left-6 top-1/2 -translate-y-1/2 w-1 h-12 bg-brand-600 rounded-r-full shadow-[0_0_15px_rgba(124,58,237,0.8)] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-4 transition-all duration-300 transform group-hover:-translate-x-1">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-lg leading-tight text-white">Q4 Growth Hack</h3>
                      <p className="font-mono text-[10px] text-white/40 mt-1 uppercase tracking-widest">12:45:08 • DEC 24</p>
                    </div>
                    <span className="bg-orange-500/20 text-orange-400 text-[10px] font-bold px-2 py-1 rounded-lg flex items-center gap-1 border border-orange-500/20">
                      <Flame className="w-3 h-3" /> VIRAL
                    </span>
                  </div>
                  <div className="flex items-end justify-between mt-4">
                    <div className="flex flex-col">
                      <span className="text-xs text-white/30 mb-1">Engagement</span>
                      <span className="text-sm font-medium text-brand-400">+24.8%</span>
                    </div>
                    {/* Simplified Sparkline */}
                    <div className="flex items-end gap-0.5 h-8 opacity-50">
                        <div className="w-1 bg-brand-500/40 h-[30%] rounded-t-sm" />
                        <div className="w-1 bg-brand-500/60 h-[50%] rounded-t-sm" />
                        <div className="w-1 bg-brand-500/80 h-[40%] rounded-t-sm" />
                        <div className="w-1 bg-brand-500 h-[80%] rounded-t-sm" />
                        <div className="w-1 bg-brand-500 h-[60%] rounded-t-sm" />
                        <div className="w-1 bg-brand-500 h-[90%] rounded-t-sm" />
                        <div className="w-1 bg-brand-500 h-[70%] rounded-t-sm" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Archive Item 2: Good */}
              <div className="relative group cursor-pointer">
                <div className="bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl p-4 transition-all duration-300 transform group-hover:-translate-x-1">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-lg leading-tight text-white">Twitter Thread v2</h3>
                      <p className="font-mono text-[10px] text-white/40 mt-1 uppercase tracking-widest">10:20:15 • DEC 24</p>
                    </div>
                    <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-1 rounded-lg flex items-center gap-1 border border-emerald-500/20">
                      <CheckCircle className="w-3 h-3" /> GOOD
                    </span>
                  </div>
                  <div className="flex items-end justify-between mt-4">
                    <div className="flex flex-col">
                      <span className="text-xs text-white/30 mb-1">Engagement</span>
                      <span className="text-sm font-medium text-emerald-400">+12.2%</span>
                    </div>
                     <div className="flex items-end gap-0.5 h-8 opacity-50">
                        <div className="w-1 bg-emerald-500/40 h-[20%] rounded-t-sm" />
                        <div className="w-1 bg-emerald-500/60 h-[40%] rounded-t-sm" />
                        <div className="w-1 bg-emerald-500/80 h-[30%] rounded-t-sm" />
                        <div className="w-1 bg-emerald-500 h-[60%] rounded-t-sm" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Archive Item 3: Flopped */}
              <div className="relative group cursor-pointer opacity-80 hover:opacity-100 transition-opacity">
                <div className="bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl p-4 transition-all duration-300">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-lg leading-tight text-white">SEO Longform</h3>
                      <p className="font-mono text-[10px] text-white/40 mt-1 uppercase tracking-widest">YESTERDAY</p>
                    </div>
                    <span className="bg-amber-500/20 text-amber-400 text-[10px] font-bold px-2 py-1 rounded-lg flex items-center gap-1 border border-amber-500/20">
                      <AlertTriangle className="w-3 h-3" /> FLOPPED
                    </span>
                  </div>
                  <div className="flex items-end justify-between mt-4">
                    <div className="flex flex-col">
                      <span className="text-xs text-white/30 mb-1">Engagement</span>
                      <span className="text-sm font-medium text-amber-400">-4.5%</span>
                    </div>
                    <div className="flex items-end gap-0.5 h-8 opacity-50">
                        <div className="w-1 bg-amber-500/40 h-[50%] rounded-t-sm" />
                        <div className="w-1 bg-amber-500/60 h-[30%] rounded-t-sm" />
                        <div className="w-1 bg-amber-500/80 h-[20%] rounded-t-sm" />
                    </div>
                  </div>
                </div>
              </div>

               {/* Archive Item 4: Pending */}
               <div className="relative group cursor-pointer opacity-80 hover:opacity-100 transition-opacity">
                <div className="bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl p-4 transition-all duration-300">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-lg leading-tight text-white">Newsletter Draft</h3>
                      <p className="font-mono text-[10px] text-white/40 mt-1 uppercase tracking-widest">04:12:00 • DEC 23</p>
                    </div>
                    <span className="bg-white/10 text-white/60 text-[10px] font-bold px-2 py-1 rounded-lg flex items-center gap-1 border border-white/10">
                      <Clock className="w-3 h-3" /> PENDING
                    </span>
                  </div>
                  <div className="flex items-end justify-between mt-4">
                    <div className="flex flex-col">
                      <span className="text-xs text-white/30 mb-1">Engagement</span>
                      <span className="text-sm font-medium text-white/40">Calculating...</span>
                    </div>
                    <div className="w-16 h-0.5 bg-white/20 rounded-full overflow-hidden">
                        <div className="h-full bg-white/50 w-1/2 animate-progress"></div>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Footer Meta Info */}
            <div className="p-6 border-t border-white/5 bg-[#171121]/50 backdrop-blur-md">
              <div className="flex items-center justify-between text-xs text-white/40 font-mono">
                <p>32 Total Strategies</p>
                <p>Updated just now</p>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
