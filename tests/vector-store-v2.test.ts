import { describe, it, expect, vi, beforeEach } from 'vitest';
import { upsertResource, searchVectorStore, searchGraphContext } from '../utils/vector-store';

// Mock the dependencies
vi.mock('../utils/gemini-embedding', () => ({
  getEmbedding: vi.fn().mockResolvedValue(new Array(1536).fill(0.1)),
  cosineSimilarity: vi.fn().mockReturnValue(0.9)
}));

// Mock LanceDB client to avoid actual DB connections during unit tests
vi.mock('../utils/lancedb-client', () => ({
  getLanceDB: vi.fn().mockResolvedValue({
    tableNames: vi.fn().mockResolvedValue(['resources']),
    openTable: vi.fn().mockResolvedValue({
      add: vi.fn().mockResolvedValue(true),
      vectorSearch: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      toArray: vi.fn().mockResolvedValue([
        { 
          id: 'test-doc-1', 
          text: 'Strategy content', 
          metadata: JSON.stringify({ title: 'Test' }),
          vector: new Array(1536).fill(0.1)
        }
      ]),
      query: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis()
    }),
    createTable: vi.fn().mockResolvedValue({})
  }),
  openOrCreateTable: vi.fn().mockImplementation(async (db, name, data) => {
      return {
          add: vi.fn().mockResolvedValue(true),
          vectorSearch: vi.fn().mockReturnThis(),
          limit: vi.fn().mockReturnThis(),
          toArray: vi.fn().mockResolvedValue([])
      };
  })
}));

describe('Vector Store Logic (V2)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('upserts a resource without errors', async () => {
    await upsertResource('id-1', 'Strategy text', { sector: 'AI' });
    // If it doesn't throw, it's a pass for the orchestration logic
    expect(true).toBe(true);
  });

  it('searches the vector store and returns parsed results', async () => {
    const results = await searchVectorStore('query');
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe('test-doc-1');
    expect(results[0].metadata.title).toBe('Test');
  });

  it('performs graph RAG search', async () => {
    const results = await searchGraphContext('query');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].searchType).toBe('semantic');
  });
});
