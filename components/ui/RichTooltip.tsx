"use client";

import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import React from "react";

interface RichTooltipProps {
    trigger: React.ReactNode;
    content: string;
    side?: "top" | "right" | "bottom" | "left";
}

export default function RichTooltip({ trigger, content, side = "top" }: RichTooltipProps) {
    return (
        <TooltipPrimitive.Provider delayDuration={200}>
            <TooltipPrimitive.Root>
                <TooltipPrimitive.Trigger asChild>
                    {trigger}
                </TooltipPrimitive.Trigger>
                <TooltipPrimitive.Content 
                    side={side} 
                    sideOffset={5}
                    className="z-[100] bg-black/80 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-lg text-[10px] font-bold text-white uppercase tracking-wider shadow-xl animate-in fade-in zoom-in-95 duration-200"
                >
                    {content}
                    <TooltipPrimitive.Arrow className="fill-white/10" />
                </TooltipPrimitive.Content>
            </TooltipPrimitive.Root>
        </TooltipPrimitive.Provider>
    );
}
