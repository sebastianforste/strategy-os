import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getEmbedding, getBatchEmbeddings, cosineSimilarity } from '../utils/gemini-embedding';

// Mock the GoogleGenAI SDK
vi.mock('@google/genai', () => {
  return {
    GoogleGenAI: class {
      models = {
        embedContent: vi.fn().mockImplementation(async ({ contents }) => {
          if (Array.isArray(contents) && contents.length > 1) {
            // Batch mock
            return {
              embeddings: contents.map(() => ({ values: [0.1, 0.2, 0.3] }))
            };
          }
          // Single mock
          return {
            embedding: { values: [0.1, 0.2, 0.3] }
          };
        })
      };
    }
  };
});

describe('Gemini Embedding Utility', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches a single embedding correctly', async () => {
    const result = await getEmbedding('Test content', 'fake-key');
    expect(result).toEqual([0.1, 0.2, 0.3]);
  });

  it('returns empty array for empty input', async () => {
    const result = await getEmbedding('');
    expect(result).toEqual([]);
  });

  it('fetches batch embeddings correctly', async () => {
    const texts = ['Text 1', 'Text 2'];
    const results = await getBatchEmbeddings(texts, 'fake-key');
    expect(results).toHaveLength(2);
    expect(results[0]).toEqual([0.1, 0.2, 0.3]);
    expect(results[1]).toEqual([0.1, 0.2, 0.3]);
  });

  it('calculates cosine similarity correctly', () => {
    const vecA = [1, 0, 0];
    const vecB = [1, 0, 0];
    const vecC = [0, 1, 0];
    
    expect(cosineSimilarity(vecA, vecB)).toBeCloseTo(1);
    expect(cosineSimilarity(vecA, vecC)).toBe(0);
  });

  it('handles dissimilar vector lengths in similarity', () => {
    expect(cosineSimilarity([1], [1, 2])).toBe(0);
  });
});
