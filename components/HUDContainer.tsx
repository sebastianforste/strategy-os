"use client";

import React, { useState, useEffect } from "react";
import GlobalHUD from "./GlobalHUD";

export default function HUDContainer() {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "k") {
                e.preventDefault();
                setIsOpen(prev => !prev);
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    return (
        <GlobalHUD 
            isOpen={isOpen} 
            onClose={() => setIsOpen(false)} 
            actions={[]} // Could pass global actions here
        />
    );
}
