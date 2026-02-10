"use client";

import React from "react";
import { cn } from "../../utils/cn";

export type StatusType = "idle" | "running" | "error" | "complete";

interface StatusPulseProps {
  status: StatusType;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export const StatusPulse: React.FC<StatusPulseProps> = ({ 
  status, 
  className,
  size = "md" 
}) => {
  const sizeClasses = {
    sm: "size-6",
    md: "size-10",
    lg: "size-24"
  };

  const statusConfigs = {
    idle: {
      pulse: "animate-pulse-soft bg-slate-400/20",
      core: "bg-slate-500 border-slate-400/50",
      label: "Idle",
      glow: ""
    },
    running: {
      pulse: "animate-pulse-vibrant bg-emerald-500/30",
      core: "bg-emerald-500 border-emerald-400/50 shadow-[0_0_20px_rgba(16,185,129,0.5)]",
      label: "Running",
      glow: "status-glow-green"
    },
    error: {
      pulse: "animate-pulse-error bg-rose-500/40",
      core: "bg-rose-600 border-rose-400/50 shadow-[0_0_30px_rgba(225,29,72,0.6)]",
      label: "System Alert",
      glow: "status-glow-red",
      icon: "priority_high"
    },
    complete: {
        pulse: "bg-emerald-500/10",
        core: "bg-emerald-500 border-emerald-400/50",
        label: "Complete",
        glow: "status-glow-green"
    }
  };

  const config = statusConfigs[status];

  return (
    <div className={cn("relative flex items-center justify-center", sizeClasses[size], className)}>
      <div className={cn("absolute inset-0 rounded-full", config.pulse)} />
      <div 
        className={cn(
          "rounded-full border-4 z-10 flex items-center justify-center transition-all duration-300",
          size === "sm" ? "size-3" : size === "md" ? "size-5" : "size-10",
          config.core,
          config.glow
        )}
      >
        {status === "error" && size !== "sm" && (
           <span className="material-symbols-outlined text-white text-[10px] md:text-base">
             priority_high
           </span>
        )}
      </div>
    </div>
  );
};
