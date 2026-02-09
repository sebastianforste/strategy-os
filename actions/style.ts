"use server";

import { ingestStyleSamples } from "../utils/vector-store";

/**
 * INGEST STYLE SAMPLES ACTION
 * Uploads a user's best posts to the vector store for style matching.
 */
export async function ingestStyleSamplesAction(texts: string[]) {
  if (!texts || texts.length === 0) {
    throw new Error("No text samples provided.");
  }
  
  try {
    await ingestStyleSamples(texts);
    return { success: true, count: texts.length };
  } catch (error) {
    console.error("Failed to ingest style samples:", error);
    throw new Error("Failed to process style samples.");
  }
}
