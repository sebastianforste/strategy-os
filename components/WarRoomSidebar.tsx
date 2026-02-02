"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Sword, ShieldAlert, AlertCircle, RefreshCw, CheckCircle2 } from "lucide-react";
import { DefensibilityReport } from "../utils/war-room-service";

interface WarRoomSidebarProps {
  report: DefensibilityReport | null;
  onClose: () => void;
  isLoading: boolean;
}

export default function WarRoomSidebar({ report, onClose, isLoading }: WarRoomSidebarProps) {
  return (
    <AnimatePresence>
      {(report || isLoading) && (
        <motion.div
          initial={{ x: 400 }}
          animate={{ x: 0 }}
          exit={{ x: 400 }}
          className="absolute right-0 top-0 bottom-0 w-80 bg-black/90 backdrop-blur-2xl border-l border-white/10 z-[110] shadow-2xl flex flex-col"
        >
          {/* Header */}
          <div className="p-4 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sword className="w-5 h-5 text-red-500" />
              <h3 className="font-bold text-white uppercase tracking-tighter">War Room Dispatch</h3>
            </div>
            <button onClick={onClose} className="text-neutral-500 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-6">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-full gap-4 text-neutral-500">
                <RefreshCw className="w-8 h-8 animate-spin" />
                <p className="text-xs font-mono uppercase">Simulating Adversarial Response...</p>
              </div>
            ) : report ? (
              <>
                {/* Score Section */}
                <div className="p-4 bg-white/5 rounded-xl border border-white/10 flex flex-col items-center gap-2">
                  <div className={`text-3xl font-black ${report.score > 80 ? 'text-green-500' : report.score > 50 ? 'text-amber-500' : 'text-red-500'}`}>
                    {report.score}%
                  </div>
                  <div className="text-[10px] font-mono text-neutral-500 uppercase">Defensibility Score</div>
                  <div className="mt-2 text-xs text-center text-neutral-300 italic">
                    &quot;{report.summary}&quot;
                  </div>
                </div>

                {/* Attack Feed */}
                <div className="space-y-4">
                  <h4 className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest border-b border-white/5 pb-2">Simulated Attacks</h4>
                  
                  {report.attacks.map((attack, i) => (
                    <div key={i} className="group relative">
                      <div className="absolute -left-2 top-0 bottom-0 w-0.5 bg-red-500/20 group-hover:bg-red-500 transition-colors" />
                      <div className="pl-3 space-y-2">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="w-3 h-3 text-red-400" />
                          <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider">{attack.persona} Attack</span>
                        </div>
                        <p className="text-xs text-neutral-300 leading-relaxed font-medium">
                          &quot;{attack.comment}&quot;
                        </p>
                        <div className="p-2 bg-red-500/5 rounded border border-red-500/10 space-y-1">
                          <p className="text-[9px] font-bold text-red-500/80 uppercase tracking-tighter flex items-center gap-1">
                             <ShieldAlert className="w-2.5 h-2.5" /> Vulnerability
                          </p>
                          <p className="text-[10px] text-neutral-500">{attack.vulnerability}</p>
                        </div>
                        <div className="p-2 bg-green-500/5 rounded border border-green-500/10 space-y-1">
                          <p className="text-[9px] font-bold text-green-500/80 uppercase tracking-tighter flex items-center gap-1">
                             <CheckCircle2 className="w-2.5 h-2.5" /> Counter-Measure
                          </p>
                          <p className="text-[10px] text-neutral-500">{attack.counterMeasure}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : null}
          </div>

          <div className="p-4 border-t border-white/5 bg-black/20">
             <p className="text-[9px] text-neutral-600 font-mono text-center uppercase">
                Adversarial AI Beta v1.0
             </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
