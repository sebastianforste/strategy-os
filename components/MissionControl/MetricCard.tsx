"use client";

import React from "react";
import { cn } from "../../utils/cn";

interface MetricCardProps {
  label: string;
  value: string | number;
  icon: string;
  trend?: {
    value: string;
    isUp: boolean;
  };
  sublabel?: string;
  color?: "primary" | "emerald" | "amber" | "rose";
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  icon,
  trend,
  sublabel,
  color = "primary",
  className
}) => {
  const colorClasses = {
    primary: "text-primary border-primary/40",
    emerald: "text-emerald-500 border-emerald-500/40",
    amber: "text-amber-500 border-amber-500/40",
    rose: "text-rose-500 border-rose-500/40"
  };

  return (
    <div className={cn(
      "glass-darker p-5 rounded-xl flex flex-col gap-3 group hover:transition-all hover:scale-[1.02]",
      colorClasses[color],
      className
    )}>
      <div className="flex justify-between items-start">
        <p className="text-white/60 text-xs font-bold uppercase tracking-widest">{label}</p>
        <span className={cn("material-symbols-outlined text-xl", colorClasses[color].split(' ')[0])}>
          {icon}
        </span>
      </div>
      <div>
        <p className="text-white text-3xl font-bold font-mono">
          {value}
        </p>
        {(trend || sublabel) && (
          <div className="flex items-center gap-1.5 mt-1">
            {trend && (
              <>
                <span className={cn(
                  "material-symbols-outlined text-sm",
                  trend.isUp ? "text-emerald-400" : "text-rose-400"
                )}>
                  {trend.isUp ? "trending_up" : "trending_down"}
                </span>
                <p className={cn(
                  "text-xs font-bold",
                  trend.isUp ? "text-emerald-400" : "text-rose-400"
                )}>
                  {trend.value}
                </p>
              </>
            )}
            {sublabel && (
              <p className="text-white/30 text-xs font-normal">
                {sublabel}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
