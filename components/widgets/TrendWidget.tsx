import { motion } from "framer-motion";
import { TrendingUp, ArrowUpRight, ArrowDownRight } from "lucide-react";

export interface TrendDataPoint {
  label: string;
  value: number; // 0-100 normalized usually
  growth?: string; // e.g. "+5%"
}

export interface TrendData {
  title: string;
  subtitle?: string;
  data: TrendDataPoint[];
  insight?: string;
}

interface TrendWidgetProps {
  data: TrendData;
}

export default function TrendWidget({ data }: TrendWidgetProps) {
  const maxVal = Math.max(...data.data.map(d => d.value));

  return (
    <div className="rounded-xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur-sm not-prose my-8 p-6">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-lg font-bold text-white m-0 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-400" />
            {data.title}
          </h3>
          {data.subtitle && <p className="text-sm text-neutral-400 mt-1">{data.subtitle}</p>}
        </div>
      </div>

      {/* Chart Area */}
      <div className="h-48 flex items-end gap-2 sm:gap-4 relative mb-6">
        {/* Y-Axis Lines */}
        <div className="absolute inset-0 flex flex-col justify-between text-xs text-neutral-600 pointer-events-none">
             <div className="border-t border-white/5 w-full h-0" />
             <div className="border-t border-white/5 w-full h-0" />
             <div className="border-t border-white/5 w-full h-0" />
             <div className="border-t border-white/5 w-full h-0" />
        </div>

        {data.data.map((point, i) => (
          <div key={i} className="flex-1 flex flex-col justify-end group relative h-full">
            
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black border border-white/20 px-2 py-1 rounded text-xs whitespace-nowrap z-10 pointer-events-none">
                <span className="font-bold text-white">{point.value}</span>
                {point.growth && <span className={point.growth.startsWith('-') ? 'text-red-400' : 'text-green-400'}> ({point.growth})</span>}
            </div>

            {/* Bar */}
            <motion.div
              initial={{ height: 0 }}
              whileInView={{ height: `${(point.value / maxVal) * 100}%` }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: i * 0.1, ease: "easeOut" }}
              className="w-full bg-gradient-to-t from-blue-600/50 to-purple-500/50 rounded-t-sm border-t border-x border-white/20 relative overflow-hidden max-h-full"
            >
                <div className="absolute inset-x-0 top-0 h-[1px] bg-white/50" />
                <div className="absolute inset-0 bg-white/5 group-hover:bg-white/10 transition-colors" />
            </motion.div>

            {/* Label */}
            <div className="mt-2 text-center">
              <span className="text-[10px] sm:text-xs text-neutral-500 block truncate">{point.label}</span>
            </div>
          </div>
        ))}
      </div>

      {data.insight && (
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 text-sm text-blue-200 flex gap-2">
            <ArrowUpRight className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <p className="m-0 leading-snug">{data.insight}</p>
        </div>
      )}
    </div>
  );
}
