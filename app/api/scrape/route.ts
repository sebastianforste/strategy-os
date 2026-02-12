import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { authOptions } from "@/utils/auth";
import {
  assertSafeUrl,
  fetchTextWithLimits,
  HttpError,
  jsonError,
  parseJson,
  rateLimit,
  requireSessionForRequest,
} from "@/utils/request-guard";
import { ingestWebHtml } from "@/utils/web-ingest";

/**
 * ORACLE SCRAPER API
 * ------------------
 * Extracts strategic text content from any provided URL.
 */
export async function POST(req: NextRequest) {
    try {
        const session = await requireSessionForRequest(req, authOptions);
        await rateLimit({ key: `scrape:${session.user.id}`, limit: 30, windowMs: 60_000 });

        const body = await parseJson(req, z.object({ url: z.string().url().max(2048) }));
        const url = await assertSafeUrl(body.url);

        console.log(`[Oracle] Scraping: ${url.toString()}`);

        // 1. Fetch the raw HTML
        const { status, text: html, contentType } = await fetchTextWithLimits({
            url,
            timeoutMs: 5000,
            maxBytes: 2 * 1024 * 1024,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        if (status < 200 || status >= 300) {
            return NextResponse.json({ error: `Failed to fetch URL (${status}).` }, { status: 502 });
        }

        // 2. Content-type sanity check (avoid treating PDFs/images as text).
        const normalizedType = (contentType || "").toLowerCase();
        if (normalizedType && !normalizedType.includes("text/html") && !normalizedType.includes("application/xhtml+xml")) {
            return NextResponse.json(
                { error: `Unsupported content-type for scraping: ${contentType}` },
                { status: 415 }
            );
        }

        // 3. Extract + normalize.
        const extracted = ingestWebHtml(html);
        const limitedText = extracted.text.substring(0, 10_000);

        return NextResponse.json({ 
            success: true, 
            url: url.toString(),
            title: extracted.title,
            canonicalUrl: extracted.canonicalUrl,
            excerpt: extracted.excerpt,
            contentSha256: extracted.contentSha256,
            contentType,
            text: limitedText,
            length: limitedText.length,
            extractedAt: new Date().toISOString(),
        });

    } catch (e: any) {
        if (e instanceof HttpError) {
            return jsonError(e.status, e.message, e.code);
        }
        console.error("[Oracle] Scrape Error:", e);
        return NextResponse.json({ error: e?.message || "Failed to scrape URL" }, { status: 500 });
    }
}
