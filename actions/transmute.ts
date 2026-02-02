"use server";

/**
 * TRANSMUTE ACTION - 2028 Cross-Platform Pillar
 * 
 * Server action to transmute content between platforms.
 * Uses transmutation-service.ts
 */

import { transmuteContent, Platform } from "../utils/transmutation-service";

export async function transmuteAction(
  content: string,
  from: Platform,
  to: Platform,
  apiKey: string
) {
  if (!apiKey) throw new Error("API Key required");
  
  try {
    const result = await transmuteContent(content, from, to, apiKey);
    return { success: true, content: result };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}
