import { NextRequest, NextResponse } from "next/server";
import { JSDOM } from "jsdom";
import { z } from "zod";

import { authOptions } from "@/utils/auth";
import {
  assertSafeUrl,
  fetchTextWithLimits,
  HttpError,
  jsonError,
  parseJson,
  rateLimit,
  requireSession,
} from "@/utils/request-guard";

/**
 * ORACLE SCRAPER API
 * ------------------
 * Extracts strategic text content from any provided URL.
 */
export async function POST(req: NextRequest) {
    try {
        await requireSession(authOptions);
        rateLimit({ key: `scrape`, limit: 30, windowMs: 60_000 });

        const body = await parseJson(req, z.object({ url: z.string().url().max(2048) }));
        const url = await assertSafeUrl(body.url);

        console.log(`[Oracle] Scraping: ${url.toString()}`);

        // 1. Fetch the raw HTML
        const { status, text: html } = await fetchTextWithLimits({
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

        // 2. Parse with JSDOM
        const dom = new JSDOM(html);
        const doc = dom.window.document;

        // 3. Extract core content
        // Remove noise
        const noise = doc.querySelectorAll('script, style, nav, footer, iframe, ads');
        noise.forEach((n: any) => n.remove());

        // Focus on main content areas
        const mainContent = doc.querySelector('main, article, #content, .content, #main, .main') || doc.body;
        
        // Extract text
        let text = mainContent.textContent || "";
        
        // Clean up whitespace
        text = text.replace(/\s+/g, ' ').trim();

        // Limit length to avoid blowing up tokens
        const extracted = text.substring(0, 10000);

        return NextResponse.json({ 
            success: true, 
            text: extracted,
            length: extracted.length
        });

    } catch (e: any) {
        if (e instanceof HttpError) {
            return jsonError(e.status, e.message, e.code);
        }
        console.error("[Oracle] Scrape Error:", e);
        return NextResponse.json({ error: e?.message || "Failed to scrape URL" }, { status: 500 });
    }
}
