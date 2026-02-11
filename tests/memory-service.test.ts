import { describe, it, expect, vi, beforeEach } from 'vitest';
import { storeStrategem, retrieveMemories } from '../utils/memory-service';

// Mock dependencies
vi.mock('../utils/gemini-embedding', () => ({
  getEmbedding: vi.fn().mockResolvedValue(new Array(1536).fill(0.1))
}));

vi.mock('../utils/lancedb-client', () => ({
  getLanceDB: vi.fn().mockResolvedValue({
    tableNames: vi.fn().mockResolvedValue(['strategems']),
    openTable: vi.fn().mockResolvedValue({
      add: vi.fn().mockResolvedValue(true),
      search: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      toArray: vi.fn().mockResolvedValue([
        { 
          id: 'mem-1', 
          content: 'Past success', 
          topic: 'viral',
          timestamp: new Date().toISOString()
        }
      ])
    })
  }),
  openOrCreateTable: vi.fn().mockResolvedValue({
      add: vi.fn().mockResolvedValue(true)
  })
}));

describe('Memory Service Logic', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('stores a strategem correctly', async () => {
    const result = await storeStrategem({
      id: 'test-1',
      content: 'Viral loop mechanism',
      timestamp: new Date().toISOString()
    }, 'fake-key');

    expect(result).toBe(true);
  });

  it('retrieves memories correctly', async () => {
    const memories = await retrieveMemories('viral', 'fake-key');
    expect(memories).toHaveLength(1);
    expect(memories[0].id).toBe('mem-1');
  });
});
