"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Compass, Settings, Send, Edit3 } from "lucide-react";
import GlobalHUD, { HUDAction } from "./GlobalHUD";

export default function HUDContainer() {
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter();

    const actions: HUDAction[] = [
        {
            id: "open-studio",
            title: "Open Studio",
            description: "Go to the writing canvas",
            icon: Edit3,
            shortcut: "1",
            handler: () => router.push("/"),
        },
        {
            id: "open-mission-control",
            title: "Open Mission Control",
            description: "View telemetry and performance",
            icon: Compass,
            shortcut: "2",
            handler: () => router.push("/mission-control"),
        },
        {
            id: "open-settings",
            title: "Open Settings",
            description: "Configure API keys and integrations",
            icon: Settings,
            shortcut: "S",
            handler: () => window.dispatchEvent(new Event("strategyos:open-settings")),
        },
        {
            id: "publish-draft",
            title: "Publish Draft",
            description: "Publish current content to the selected platform",
            icon: Send,
            shortcut: "P",
            handler: () => window.dispatchEvent(new Event("strategyos:publish")),
        },
    ];

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (actions.length === 0) return;
            if ((e.metaKey || e.ctrlKey) && e.key === "k") {
                e.preventDefault();
                setIsOpen(prev => !prev);
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [actions.length]);

    return (
        <GlobalHUD 
            isOpen={isOpen} 
            onClose={() => setIsOpen(false)} 
            actions={actions}
        />
    );
}
