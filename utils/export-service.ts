/**
 * Formats text as Markdown for Notion/Obsidian
 */
export const formatForNotion = (text: string): string => {
  // Notion handles plain markdown well.
  // We ensure headers are properly spaced.
  return text
    .replace(/^# (.*)/gm, "# $1") // Ensure space after #
    .replace(/\*\*(.*)\*\*/g, "**$1**") // Bold
    .replace(/\n\n/g, "\n\n"); // Preserve paragraphs
};

/**
 * Formats text as HTML for Google Docs/Word
 * This allows "Rich Text" pasting which preserves formatting
 */
export const formatForGDocs = (text: string): string => {
  // Convert Markdown-ish to HTML
  const html = text
    .replace(/\n/g, "<br>") // Line breaks
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") // Bold
    .replace(/__(.*?)__/g, "<strong>$1</strong>") // Bold alt
    .replace(/\*(.*?)\*/g, "<em>$1</em>") // Italic
    .replace(/^# (.*?)<br>/gm, "<h1>$1</h1>") // H1
    .replace(/^## (.*?)<br>/gm, "<h2>$1</h2>"); // H2

  // Wrapper for clipboard metadata
  return `
    <html>
      <body>
        ${html}
      </body>
    </html>
  `;
};

export const copyToClipboard = async (text: string, format: "text/plain" | "text/html" = "text/plain") => {
  if (typeof window === "undefined") return;

  try {
    if (format === "text/html") {
      const blob = new Blob([text], { type: "text/html" });
      const plainText = new Blob([text.replace(/<br>/g, "\n").replace(/<[^>]*>/g, "")], { type: "text/plain" });
      
      const item = new ClipboardItem({
        "text/html": blob,
        "text/plain": plainText,
      });
      
      await navigator.clipboard.write([item]);
    } else {
      await navigator.clipboard.writeText(text);
    }
    return true;
  } catch {
    console.warn("Clipboard API failed, falling back to basic writeText");
    // Fallback
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch {
        console.error("Clipboard fallback failed");
        return false;
    }
  }
};
