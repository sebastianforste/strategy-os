export type CitationSource = "web" | "pdf" | "knowledge" | "memory" | "voice" | "style";

export interface Citation {
  id: string;
  source: CitationSource;
  title?: string;
  url?: string;
  createdAt?: string;
  chunkIndex?: number;
  start?: number;
  end?: number;
}

