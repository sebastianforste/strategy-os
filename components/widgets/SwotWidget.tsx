import { motion } from "framer-motion";
import { CheckCircle2, AlertTriangle, TrendingUp, ShieldAlert } from "lucide-react";

export interface SwotData {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
}

interface SwotWidgetProps {
  data: SwotData;
}

export default function SwotWidget({ data }: SwotWidgetProps) {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="rounded-xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur-sm not-prose my-8">
      <div className="p-4 border-b border-white/10 bg-white/5 flex justify-between items-center">
        <h3 className="text-lg font-bold text-white m-0">Strategic Analysis (SWOT)</h3>
        <span className="text-xs text-neutral-500 uppercase tracking-wider">Generated Insight</span>
      </div>
      
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 gap-px bg-white/10"
      >
        {/* Strengths */}
        <motion.div variants={item} className="bg-neutral-900/80 p-6 space-y-3">
          <div className="flex items-center gap-2 text-green-400 mb-2">
            <CheckCircle2 className="w-5 h-5" />
            <h4 className="font-bold uppercase tracking-wider text-sm m-0">Strengths</h4>
          </div>
          <ul className="space-y-2 m-0 p-0 list-none">
            {data.strengths.map((s, i) => (
              <li key={i} className="text-sm text-neutral-300 flex items-start gap-2">
                <span className="text-green-500/50 mt-1">•</span>
                {s}
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Weaknesses */}
        <motion.div variants={item} className="bg-neutral-900/80 p-6 space-y-3">
          <div className="flex items-center gap-2 text-orange-400 mb-2">
            <AlertTriangle className="w-5 h-5" />
            <h4 className="font-bold uppercase tracking-wider text-sm m-0">Weaknesses</h4>
          </div>
          <ul className="space-y-2 m-0 p-0 list-none">
            {data.weaknesses.map((w, i) => (
              <li key={i} className="text-sm text-neutral-300 flex items-start gap-2">
                <span className="text-orange-500/50 mt-1">•</span>
                {w}
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Opportunities */}
        <motion.div variants={item} className="bg-neutral-900/80 p-6 space-y-3">
          <div className="flex items-center gap-2 text-blue-400 mb-2">
            <TrendingUp className="w-5 h-5" />
            <h4 className="font-bold uppercase tracking-wider text-sm m-0">Opportunities</h4>
          </div>
          <ul className="space-y-2 m-0 p-0 list-none">
            {data.opportunities.map((o, i) => (
              <li key={i} className="text-sm text-neutral-300 flex items-start gap-2">
                <span className="text-blue-500/50 mt-1">•</span>
                {o}
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Threats */}
        <motion.div variants={item} className="bg-neutral-900/80 p-6 space-y-3">
          <div className="flex items-center gap-2 text-red-400 mb-2">
            <ShieldAlert className="w-5 h-5" />
            <h4 className="font-bold uppercase tracking-wider text-sm m-0">Threats</h4>
          </div>
          <ul className="space-y-2 m-0 p-0 list-none">
            {data.threats.map((t, i) => (
              <li key={i} className="text-sm text-neutral-300 flex items-start gap-2">
                <span className="text-red-500/50 mt-1">•</span>
                {t}
              </li>
            ))}
          </ul>
        </motion.div>
      </motion.div>
    </div>
  );
}
