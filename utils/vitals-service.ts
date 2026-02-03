"use client";

import { AI_CONFIG } from "./config";

export interface SystemVitals {
  api: "online" | "latency" | "offline" | "limited";
  database: "connected" | "disconnected";
  network: "online" | "offline";
  latencyMs: number;
}

/**
 * CHECK SYSTEM VITALS
 * Pings key infrastructure to ensure operational readiness.
 */
export async function checkVitals(apiKey: string): Promise<SystemVitals> {
    const start = Date.now();
    const vitals: SystemVitals = {
        api: "online",
        database: "connected",
        network: navigator.onLine ? "online" : "offline",
        latencyMs: 0
    };

    if (!navigator.onLine) {
        vitals.network = "offline";
        vitals.api = "offline";
        return vitals;
    }

    try {
        // 1. Check API Status (Minimal Ping)
        const apiCheck = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`, {
            method: "GET",
        });

        vitals.latencyMs = Date.now() - start;

        if (apiCheck.status === 429) {
            vitals.api = "limited";
        } else if (!apiCheck.ok) {
            vitals.api = "offline";
        } else if (vitals.latencyMs > 2000) {
            vitals.api = "latency";
        }

        // 2. Check Database Status
        // Since we use client-side calls for some things and server actions for others,
        // we'll ping a lightweight internal route to verify DB health.
        const dbCheck = await fetch("/api/health", { method: "GET" }).catch(() => ({ ok: false }));
        vitals.database = dbCheck.ok ? "connected" : "disconnected";

    } catch (e) {
        console.error("[Vitals] Check failed:", e);
        vitals.api = "offline";
        vitals.database = "disconnected";
    }

    return vitals;
}
