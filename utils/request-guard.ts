import "server-only";

import dns from "dns/promises";
import net from "net";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import type { NextAuthOptions, Session } from "next-auth";
import type { ZodSchema } from "zod";

export class HttpError extends Error {
  status: number;
  code?: string;
  constructor(status: number, message: string, code?: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export function jsonError(status: number, message: string, code?: string) {
  return NextResponse.json({ error: message, ...(code ? { code } : {}) }, { status });
}

export async function requireSession(authOptions?: NextAuthOptions): Promise<Session> {
  const session = authOptions ? await getServerSession(authOptions) : await getServerSession();
  if (!session?.user) {
    throw new HttpError(401, "Unauthorized");
  }
  return session;
}

export async function requireSessionOrHeaderToken({
  req,
  headerName,
  envVarName,
  authOptions,
}: {
  req: Request;
  headerName: string;
  envVarName: string;
  authOptions?: NextAuthOptions;
}): Promise<{ session?: Session; token?: string }> {
  const session = authOptions ? await getServerSession(authOptions) : await getServerSession();
  if (session?.user) {
    return { session };
  }

  const expected = (process.env[envVarName] || "").trim();
  if (!expected) {
    throw new HttpError(401, "Unauthorized");
  }

  const raw = (req.headers.get(headerName) || "").trim();
  if (!raw || raw !== expected) {
    throw new HttpError(401, "Unauthorized");
  }

  return { token: raw };
}

export async function parseJson<T>(req: Request, schema: ZodSchema<T>): Promise<T> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    throw new HttpError(400, "Invalid JSON body.");
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    throw new HttpError(400, "Invalid request body.");
  }
  return parsed.data;
}

type RateLimitState = { resetAt: number; count: number };
const rateLimitState = new Map<string, RateLimitState>();

export function rateLimit({
  key,
  limit,
  windowMs,
}: {
  key: string;
  limit: number;
  windowMs: number;
}) {
  const now = Date.now();
  const existing = rateLimitState.get(key);
  if (!existing || existing.resetAt <= now) {
    rateLimitState.set(key, { resetAt: now + windowMs, count: 1 });
    return;
  }
  if (existing.count >= limit) {
    throw new HttpError(429, "Too many requests.");
  }
  existing.count += 1;
}

function isPrivateIpv4(ip: string): boolean {
  const parts = ip.split(".").map((n) => Number.parseInt(n, 10));
  if (parts.length !== 4 || parts.some((n) => Number.isNaN(n))) return true;

  const [a, b] = parts;
  if (a === 10) return true;
  if (a === 127) return true;
  if (a === 0) return true;
  if (a === 169 && b === 254) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  if (a === 100 && b >= 64 && b <= 127) return true; // CGNAT
  return false;
}

function isPrivateIpv6(ip: string): boolean {
  const normalized = ip.toLowerCase();
  if (normalized === "::" || normalized === "::1") return true;
  if (normalized.startsWith("fe8") || normalized.startsWith("fe9") || normalized.startsWith("fea") || normalized.startsWith("feb")) {
    return true; // link-local fe80::/10 (coarse)
  }
  if (normalized.startsWith("fc") || normalized.startsWith("fd")) return true; // ULA fc00::/7 (coarse)
  if (normalized.startsWith("2001:db8:")) return true; // docs
  return false;
}

async function resolveAndValidateHost(hostname: string) {
  const results = await dns.lookup(hostname, { all: true });
  if (!results || results.length === 0) {
    throw new HttpError(400, "URL host could not be resolved.");
  }
  for (const result of results) {
    const addr = result.address;
    const family = net.isIP(addr);
    if (family === 4) {
      if (isPrivateIpv4(addr)) throw new HttpError(400, "Blocked URL host.");
      continue;
    }
    if (family === 6) {
      if (isPrivateIpv6(addr)) throw new HttpError(400, "Blocked URL host.");
      continue;
    }
    throw new HttpError(400, "Blocked URL host.");
  }
}

export async function assertSafeUrl(raw: string): Promise<URL> {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new HttpError(400, "Invalid URL.");
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new HttpError(400, "Only http(s) URLs are allowed.");
  }

  const hostname = (url.hostname || "").toLowerCase();
  if (!hostname) throw new HttpError(400, "Invalid URL host.");

  if (hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1") {
    throw new HttpError(400, "Blocked URL host.");
  }
  if (hostname.endsWith(".local")) {
    throw new HttpError(400, "Blocked URL host.");
  }

  // Reject direct IP literals if they are private/reserved.
  const ipFamily = net.isIP(hostname);
  if (ipFamily === 4 && isPrivateIpv4(hostname)) throw new HttpError(400, "Blocked URL host.");
  if (ipFamily === 6 && isPrivateIpv6(hostname)) throw new HttpError(400, "Blocked URL host.");

  // Resolve DNS and block private/reserved addresses.
  if (ipFamily === 0) {
    await resolveAndValidateHost(hostname);
  }

  return url;
}

export async function fetchTextWithLimits({
  url,
  timeoutMs,
  maxBytes,
  headers,
}: {
  url: URL;
  timeoutMs: number;
  maxBytes: number;
  headers?: Record<string, string>;
}): Promise<{ status: number; text: string }> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url.toString(), {
      headers,
      redirect: "manual",
      signal: controller.signal,
    });

    if ([301, 302, 303, 307, 308].includes(res.status)) {
      throw new HttpError(400, "Redirects are not allowed.");
    }

    // Stream read with maxBytes cap.
    const body = res.body;
    if (!body) {
      return { status: res.status, text: "" };
    }

    const reader = body.getReader();
    const chunks: Uint8Array[] = [];
    let total = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (!value) continue;
      total += value.byteLength;
      if (total > maxBytes) {
        throw new HttpError(400, "Response too large.");
      }
      chunks.push(value);
    }

    const combined = new Uint8Array(total);
    let offset = 0;
    for (const chunk of chunks) {
      combined.set(chunk, offset);
      offset += chunk.byteLength;
    }
    const text = new TextDecoder("utf-8", { fatal: false }).decode(combined);
    return { status: res.status, text };
  } catch (err) {
    if (err instanceof HttpError) throw err;
    if ((err as Error)?.name === "AbortError") {
      throw new HttpError(504, "Upstream request timed out.");
    }
    throw new HttpError(502, "Upstream request failed.");
  } finally {
    clearTimeout(timeout);
  }
}
