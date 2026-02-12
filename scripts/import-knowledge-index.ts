import fs from "fs";
import path from "path";

import { chunkText } from "../utils/text-chunker";
import { upsertResource } from "../utils/vector-store";

type KnowledgeIndexEntry = {
  id: string;
  source?: string;
  title?: string;
  content: string;
  // Some older indices may include embedding already; we ignore it and re-embed.
  embedding?: number[];
};

async function main() {
  const file = path.join(process.cwd(), "data", "knowledge_index.json");
  if (!fs.existsSync(file)) {
    console.error(`Missing knowledge index at ${file}`);
    process.exit(1);
  }

  const apiKey =
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
    "";
  if (!apiKey) {
    console.error("Missing GEMINI_API_KEY/GOOGLE_GENERATIVE_AI_API_KEY for embedding import.");
    process.exit(1);
  }

  const raw = fs.readFileSync(file, "utf8");
  const entries = JSON.parse(raw) as KnowledgeIndexEntry[];
  const limit = Number.parseInt(process.env.IMPORT_LIMIT || "", 10);
  const slice = Number.isFinite(limit) && limit > 0 ? entries.slice(0, limit) : entries;

  console.log(`Importing ${slice.length}/${entries.length} knowledge entries into LanceDB...`);

  let embedded = 0;
  for (let i = 0; i < slice.length; i += 1) {
    const entry = slice[i];
    const content = (entry?.content || "").trim();
    if (!entry?.id || !content) continue;

    const chunks = chunkText({
      text: content,
      chunkSize: 1200,
      overlap: 120,
      maxChunks: 48,
    });
    for (const chunk of chunks) {
      const id = `knowledge:${entry.id}:${chunk.index}`;
      const textToEmbed = `${entry.title || "Knowledge"}\n${entry.source || ""}\n\n[Chunk ${chunk.index + 1}/${chunks.length} ${chunk.start}-${chunk.end}]\n${chunk.text}`;
      await upsertResource(
        id,
        textToEmbed,
        {
          sourceType: "knowledge",
          visibility: "public",
          authorId: "global",
          teamId: null,
          title: entry.title || entry.source || "Knowledge",
          url: entry.source || "",
          chunkIndex: chunk.index,
          start: chunk.start,
          end: chunk.end,
        },
        apiKey,
      );
      embedded += 1;
    }

    if (i % 25 === 0) {
      console.log(`Progress: ${i}/${slice.length} entries, ${embedded} chunks embedded`);
    }
  }

  console.log(`Done. Embedded ${embedded} chunks.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
