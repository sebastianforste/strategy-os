"use server";

import { ingestStyleSamples } from "../utils/vector-store";

/**
 * INGEST STYLE SAMPLES ACTION
 * --------------------------
 * Takes user-provided writing samples and stores them in style memory.
 * Supports both a single string (to be split) or an array of strings.
 */
export async function ingestStyleSamplesAction(samples: string | string[]) {
  try {
    let splitSamples: string[] = [];

    if (Array.isArray(samples)) {
      splitSamples = samples.filter(s => s.trim().length > 50);
    } else {
      if (!samples.trim()) {
        return { success: false, message: "No samples provided." };
      }

      // Split samples by common delimiters if present, or treat as one large sample
      splitSamples = samples
        .split(/\n---\n|\n\n\n/)
        .map(s => s.trim())
        .filter(s => s.length > 50);

      if (splitSamples.length === 0 && samples.trim().length > 100) {
        splitSamples.push(samples.trim());
      }
    }

    if (splitSamples.length === 0) {
      return { success: false, message: "Samples are too short to train on. Need more content." };
    }

    console.log(`[VoiceLab] Ingesting ${splitSamples.length} style samples...`);
    await ingestStyleSamples(splitSamples);

    return { 
      success: true, 
      message: `Voice Lab successfully trained on ${splitSamples.length} samples. Your personal style is now active in "Top Voice" mode.` 
    };
  } catch (error: any) {
    console.error("[VoiceLab] Training failed:", error);
    return { success: false, message: `Training failed: ${error.message}` };
  }
}

// Alias for my new UI
export const trainVoiceAction = ingestStyleSamplesAction;
