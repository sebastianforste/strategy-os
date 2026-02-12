import "server-only";

import crypto from "crypto";
import { cookies } from "next/headers";
import { logger } from "./logger";

export interface StoredApiKeys {
  gemini: string;
  serper?: string;
}

interface ApiKeyEnvelope {
  v: 1;
  savedAt: number;
  keys: StoredApiKeys;
}

const API_KEYS_COOKIE = "strategyos_api_keys";
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

function getEncryptionKey(): Buffer {
  const source =
    process.env.STRATEGYOS_KEYS_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    "strategyos-local-dev-secret";

  return crypto.createHash("sha256").update(source).digest();
}

function normalizeInput(input: Partial<StoredApiKeys> | null | undefined): StoredApiKeys | null {
  const gemini = (input?.gemini || "").trim();
  if (!gemini) {
    return null;
  }

  const serper = (input?.serper || "").trim();
  return {
    gemini,
    serper,
  };
}

function encryptEnvelope(envelope: ApiKeyEnvelope): string {
  const iv = crypto.randomBytes(12);
  const key = getEncryptionKey();
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const plaintext = Buffer.from(JSON.stringify(envelope), "utf8");
  const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString("base64url")}.${tag.toString("base64url")}.${ciphertext.toString("base64url")}`;
}

function decryptEnvelope(raw: string): ApiKeyEnvelope | null {
  try {
    const [ivRaw, tagRaw, ciphertextRaw] = raw.split(".");
    if (!ivRaw || !tagRaw || !ciphertextRaw) return null;

    const key = getEncryptionKey();
    const iv = Buffer.from(ivRaw, "base64url");
    const tag = Buffer.from(tagRaw, "base64url");
    const ciphertext = Buffer.from(ciphertextRaw, "base64url");
    const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
    decipher.setAuthTag(tag);
    const plaintext = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
    const parsed = JSON.parse(plaintext.toString("utf8")) as ApiKeyEnvelope;

    if (!parsed?.keys?.gemini) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function maskApiKey(key: string): string {
  const normalized = key.trim();
  if (!normalized) return "";
  if (normalized.toLowerCase() === "demo") return "demo";
  if (normalized.length <= 8) return "••••••••";
  return `${normalized.slice(0, 4)}••••${normalized.slice(-4)}`;
}

export async function getStoredApiKeys(): Promise<StoredApiKeys | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(API_KEYS_COOKIE)?.value;
  if (!raw) return null;

  const envelope = decryptEnvelope(raw);
  if (!envelope) return null;

  return normalizeInput(envelope.keys);
}

export async function setStoredApiKeys(input: Partial<StoredApiKeys>): Promise<boolean> {
  const cookieStore = await cookies();
  const keys = normalizeInput(input);

  if (!keys) {
    cookieStore.delete(API_KEYS_COOKIE);
    return false;
  }

  const value = encryptEnvelope({
    v: 1,
    savedAt: Date.now(),
    keys,
  });

  cookieStore.set(API_KEYS_COOKIE, value, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: COOKIE_MAX_AGE_SECONDS,
  });

  return true;
}

export async function clearStoredApiKeys(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(API_KEYS_COOKIE);
}

export async function resolveGeminiKey(preferred?: string): Promise<string> {
  const direct = (preferred || "").trim();
  if (direct) return direct;

  const stored = await getStoredApiKeys();
  return (stored?.gemini || "").trim();
}

export async function resolveApiKeys(preferred?: Partial<StoredApiKeys>): Promise<StoredApiKeys | null> {
  const preferredGemini = (preferred?.gemini || "").trim();
  const preferredSerper = (preferred?.serper || "").trim();

  // Best-effort: cookies() can throw outside a request scope (tests, scripts).
  let stored: StoredApiKeys | null = null;
  try {
    stored = await getStoredApiKeys();
  } catch {
    stored = null;
  }

  // Security hardening: if keys are stored, ignore request-body keys (deprecated).
  if (stored?.gemini) {
    if (preferredGemini || preferredSerper) {
      logger
        .scope("ApiKeys")
        .warn("Deprecated request-body apiKeys were provided and ignored in favor of stored keys.");
    }
    return stored;
  }

  // Back-compat: allow request-body keys only when nothing is stored.
  if (preferredGemini) {
    logger
      .scope("ApiKeys")
      .warn("Deprecated request-body apiKeys were used because no stored keys were found.");
    return { gemini: preferredGemini, serper: preferredSerper };
  }

  return stored;
}
