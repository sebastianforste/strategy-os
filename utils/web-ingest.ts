import "server-only";

import crypto from "crypto";
import { JSDOM } from "jsdom";

export type WebIngestResult = {
  title: string;
  canonicalUrl?: string;
  excerpt: string;
  text: string;
  length: number;
  contentSha256: string;
};

function normalizeWhitespace(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

function pickTitle(doc: Document): string {
  const og = doc.querySelector('meta[property="og:title"]')?.getAttribute("content")?.trim();
  if (og) return og;
  const twitter = doc.querySelector('meta[name="twitter:title"]')?.getAttribute("content")?.trim();
  if (twitter) return twitter;
  const title = doc.querySelector("title")?.textContent?.trim();
  if (title) return title;
  return "Untitled";
}

function pickCanonical(doc: Document): string | undefined {
  const canonical = doc.querySelector('link[rel="canonical"]')?.getAttribute("href")?.trim();
  return canonical || undefined;
}

function extractMainText(doc: Document): string {
  const noise = doc.querySelectorAll("script, style, nav, footer, iframe, noscript, svg");
  noise.forEach((n) => n.remove());

  const main =
    doc.querySelector("article") ||
    doc.querySelector("main") ||
    doc.querySelector("#content") ||
    doc.querySelector(".content") ||
    doc.querySelector("#main") ||
    doc.querySelector(".main") ||
    doc.body;

  return normalizeWhitespace(main?.textContent || "");
}

export function ingestWebHtml(html: string): Omit<WebIngestResult, "canonicalUrl"> & { canonicalUrl?: string } {
  const dom = new JSDOM(html);
  const doc = dom.window.document;

  const title = pickTitle(doc);
  const canonicalUrl = pickCanonical(doc);
  const text = extractMainText(doc);
  const excerpt = text.slice(0, 600);

  const contentSha256 = crypto.createHash("sha256").update(text, "utf8").digest("hex");

  return {
    title,
    canonicalUrl,
    excerpt,
    text,
    length: text.length,
    contentSha256,
  };
}

