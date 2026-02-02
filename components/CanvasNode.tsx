"use client";

import { motion } from "framer-motion";
import { FileText, Image, Sparkles, X, Move, ShieldAlert, ShieldCheck, Loader2, Sword } from "lucide-react";
import { CanvasNodeState } from "../utils/archive-service";

interface CanvasNodeProps {
  node: CanvasNodeState;
  onUpdatePosition: (id: string, x: number, y: number) => void;
  onRemove: (id: string) => void;
  onStressTest?: (id: string) => void;
  isAnalyzing?: boolean;
}

export default function CanvasNode({ node, onUpdatePosition, onRemove, onStressTest, isAnalyzing }: CanvasNodeProps) {
    const getIcon = () => {
        switch (node.type) {
            case 'post': return <FileText className="w-4 h-4 text-blue-400" />;
            case 'pdf': return <Image className="w-4 h-4 text-orange-400" />;
            case 'svg': return <Sparkles className="w-4 h-4 text-purple-400" />;
        }
    };

    const getRiskColor = (score: number) => {
        if (score > 80) return "text-green-400 bg-green-400/10 border-green-400/50";
        if (score > 50) return "text-amber-400 bg-amber-400/10 border-amber-400/50";
        return "text-red-400 bg-red-400/10 border-red-400/50";
    };

    return (
        <motion.div
            drag
            dragMomentum={false}
            initial={{ x: node.x, y: node.y, opacity: 0, scale: 0.8 }}
            animate={{ x: node.x, y: node.y, opacity: 1, scale: 1 }}
            onDragEnd={(e, info) => {
                const newX = node.x + info.offset.x;
                const newY = node.y + info.offset.y;
                onUpdatePosition(node.id, newX, newY);
            }}
            whileHover={{ scale: 1.02, zIndex: 10 }}
            whileDrag={{ scale: 1.1, zIndex: 50, cursor: "grabbing" }}
            className={`absolute w-64 bg-black/60 backdrop-blur-xl border rounded-xl shadow-2xl flex flex-col overflow-hidden transition-colors ${
                node.warRoomReport ? (node.warRoomReport.score > 50 ? 'border-white/10' : 'border-red-500/30') : 'border-white/10'
            }`}
            style={{ 
                x: node.x, 
                y: node.y,
                cursor: "grab"
            }}
        >
            {/* Header / Handle */}
            <div className="h-8 bg-white/5 border-b border-white/5 flex items-center justify-between px-3 cursor-grab active:cursor-grabbing">
                <div className="flex items-center gap-2">
                    {getIcon()}
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">{node.type}</span>
                </div>
                <div className="flex items-center gap-2">
                    {onStressTest && (
                         <button 
                            onClick={(e) => { e.stopPropagation(); onStressTest(node.id); }}
                            className="text-neutral-500 hover:text-indigo-400 transition-colors"
                            title="War Room: Stress Test Strategy"
                         >
                            {isAnalyzing ? <Loader2 className="w-3 h-3 animate-spin text-indigo-400" /> : <Sword className="w-3 h-3" />}
                         </button>
                    )}
                    <button 
                        onClick={(e) => { e.stopPropagation(); onRemove(node.id); }}
                        className="text-neutral-600 hover:text-red-400 transition-colors"
                    >
                        <X className="w-3 h-3" />
                    </button>
                </div>
            </div>

            {/* Defensibility Badge (if tested) */}
            {node.warRoomReport && (
                <div className={`px-3 py-1 text-[9px] font-bold border-b flex items-center justify-between ${getRiskColor(node.warRoomReport.score)}`}>
                    <div className="flex items-center gap-1 uppercase tracking-tighter">
                        {node.warRoomReport.score > 50 ? <ShieldCheck className="w-2.5 h-2.5" /> : <ShieldAlert className="w-2.5 h-2.5" />}
                        Defensibility: {node.warRoomReport.score}%
                    </div>
                    <span className="uppercase">{node.warRoomReport.riskLevel} Risk</span>
                </div>
            )}

            {/* Content Preview */}
            <div className="p-4">
                <p className="text-xs text-neutral-300 line-clamp-4 font-mono leading-relaxed">
                    {node.content || "No content"}
                </p>
                {node.warRoomReport && (
                    <p className="mt-2 text-[10px] italic text-neutral-500 border-t border-white/5 pt-2">
                        "{node.warRoomReport.summary}"
                    </p>
                )}
            </div>
            
            {/* Footer */}
            <div className="p-2 bg-black/20 border-t border-white/5 flex justify-center flex-col items-center gap-1">
                 <Move className="w-3 h-3 text-neutral-700" />
            </div>
        </motion.div>
    );
}
