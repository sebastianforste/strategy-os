import { NextRequest, NextResponse } from "next/server";
// @ts-ignore
import { JSDOM } from "jsdom";

/**
 * ORACLE SCRAPER API
 * ------------------
 * Extracts strategic text content from any provided URL.
 */
export async function POST(req: NextRequest) {
    try {
        const { url } = await req.json();
        if (!url) return NextResponse.json({ error: "URL is required" }, { status: 400 });

        console.log(`[Oracle] Scraping: ${url}`);

        // 1. Fetch the raw HTML
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch URL: ${response.statusText}`);
        }

        const html = await response.text();

        // 2. Parse with JSDOM
        // @ts-ignore - JSDOM types in devDependencies might not be picked up by the build worker
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
        console.error("[Oracle] Scrape Error:", e);
        return NextResponse.json({ error: e.message || "Failed to scrape URL" }, { status: 500 });
    }
}
