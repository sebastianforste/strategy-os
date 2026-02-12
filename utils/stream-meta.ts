import type { Citation } from "./citations";

export type StrategyOSMeta = {
  citations?: Citation[];
};

const META_START = "<!-- STRATEGYOS_META ";
const META_END = " -->";

export function appendStrategyOSMeta(text: string, meta: StrategyOSMeta): string {
  // Keep this as an HTML comment so previews render cleanly if callers forget to strip it.
  const payload = JSON.stringify(meta);
  return `${text}\n\n${META_START}${payload}${META_END}`;
}

export function extractStrategyOSMeta(input: string): { text: string; meta: StrategyOSMeta | null } {
  const endIdx = input.lastIndexOf(META_END);
  if (endIdx < 0) return { text: input, meta: null };

  const startIdx = input.lastIndexOf(META_START, endIdx);
  if (startIdx < 0) return { text: input, meta: null };

  const payloadStart = startIdx + META_START.length;
  const payload = input.slice(payloadStart, endIdx);

  try {
    const parsed = JSON.parse(payload) as StrategyOSMeta;
    const cleaned = (input.slice(0, startIdx) + input.slice(endIdx + META_END.length)).trimEnd();
    return { text: cleaned, meta: parsed };
  } catch {
    return { text: input, meta: null };
  }
}

