"use client";

import React from "react";
import { cn } from "../../utils/cn";
import moment from "moment";
import { MissionActivity } from "../../actions/mission-control";
import { StatusPulse } from "./StatusPulse";

interface ActivityItemProps {
  activity: MissionActivity;
  className?: string;
}

export const ActivityItem: React.FC<ActivityItemProps> = ({ 
  activity, 
  className 
}) => {
  const isError = activity.status === "error";
  
  const iconMap = {
    generation: "auto_awesome",
    publish: "send",
    system: isError ? "report_problem" : "settings_suggest"
  };

  const colorMap = {
    generation: "text-emerald-500 bg-emerald-500/10",
    publish: "text-primary bg-primary/10",
    system: isError ? "text-rose-500 bg-rose-500/10" : "text-slate-400 bg-slate-400/10"
  };

  return (
    <div className={cn(
      "group flex items-center gap-4 p-3 rounded-xl glass-darker border border-white/5 hover:border-primary/50 transition-all cursor-pointer",
      isError && "border-rose-500/20 bg-rose-500/5",
      className
    )}>
      <div className={cn(
        "size-10 rounded-lg flex items-center justify-center shrink-0",
        colorMap[activity.type]
      )}>
        <span className="material-symbols-outlined text-xl">
          {iconMap[activity.type]}
        </span>
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className={cn(
            "text-sm font-bold truncate",
            isError ? "text-rose-500" : "text-white"
          )}>
            {activity.action}
          </h3>
          <StatusPulse status={activity.status} size="sm" />
        </div>
        <p className="text-xs text-white/40 mt-0.5 truncate">
          {activity.metadata?.platform || "System Process"} • {activity.id.slice(0, 8)}
        </p>
      </div>
      
      <div className="text-right shrink-0">
        <div className={cn(
           "px-2 py-0.5 rounded text-[10px] font-bold inline-block uppercase tracking-wider",
           colorMap[activity.type]
        )}>
          {activity.type}
        </div>
        <p className="text-[10px] text-white/30 mt-1 font-mono">
          {moment(activity.timestamp).fromNow()}
        </p>
      </div>
    </div>
  );
};
