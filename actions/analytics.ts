"use server";

/**
 * ANALYTICS ACTIONS - Server-Side Analytics Operations
 * -----------------------------------------------------
 * These actions run exclusively on the server to avoid bundling
 * node-native modules like better-sqlite3 in client bundles.
 */

import type { AnalyticsInsight } from "../utils/analytics-service";
import type { EvolutionReport } from "../utils/evolution-service";

export async function getAnalyticsReport(apiKey: string): Promise<AnalyticsInsight | null> {
    const { generateAnalyticsReport } = await import("../utils/analytics-service");
    return generateAnalyticsReport(apiKey);
}

export async function runDarwinEvolution(personaId: string, apiKey: string): Promise<EvolutionReport> {
    const { evolvePersonaAction } = await import("./generate");
    return evolvePersonaAction(personaId, apiKey);
}

export async function applyEvolutionMutation(report: EvolutionReport): Promise<void> {
    const { savePersonaEvolution } = await import("../utils/evolution-service");
    await savePersonaEvolution(report);
}
