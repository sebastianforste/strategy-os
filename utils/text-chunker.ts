export type TextChunk = {
  index: number;
  start: number;
  end: number;
  text: string;
};

export function chunkText({
  text,
  chunkSize,
  overlap,
  maxChunks,
}: {
  text: string;
  chunkSize: number;
  overlap: number;
  maxChunks: number;
}): TextChunk[] {
  const normalized = (text || "").trim();
  if (!normalized) return [];
  if (chunkSize <= 0) return [];
  if (overlap < 0) overlap = 0;
  if (overlap >= chunkSize) overlap = Math.floor(chunkSize / 4);

  const chunks: TextChunk[] = [];
  let start = 0;
  let index = 0;

  while (start < normalized.length && chunks.length < maxChunks) {
    const hardEnd = Math.min(normalized.length, start + chunkSize);

    // Prefer ending on a boundary close to hardEnd.
    const windowStart = Math.max(start, hardEnd - 250);
    const window = normalized.slice(windowStart, hardEnd);
    const boundaryOffsets = [
      window.lastIndexOf("\n\n"),
      window.lastIndexOf(". "),
      window.lastIndexOf("? "),
      window.lastIndexOf("! "),
      window.lastIndexOf("; "),
      window.lastIndexOf(", "),
    ].filter((pos) => pos >= 0);

    const bestBoundary = boundaryOffsets.length > 0 ? Math.max(...boundaryOffsets) : -1;
    const end = bestBoundary >= 0 ? windowStart + bestBoundary + 1 : hardEnd;

    const chunkText = normalized.slice(start, end).trim();
    if (chunkText) {
      chunks.push({ index, start, end, text: chunkText });
      index += 1;
    }

    if (end >= normalized.length) break;
    start = Math.max(0, end - overlap);
  }

  return chunks;
}

