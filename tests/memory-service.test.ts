import { describe, it, expect, vi, beforeEach } from 'vitest';
import { storeStrategem, retrieveMemories } from '../utils/memory-service';

vi.mock("next-auth/next", () => ({
  getServerSession: vi.fn().mockResolvedValue({ user: { id: "u1" } }),
}));

vi.mock("../utils/vector-store", () => ({
  upsertResource: vi.fn().mockResolvedValue(undefined),
  searchResources: vi.fn().mockResolvedValue([
    {
      id: "memory:u1:mem-1",
      text: "Past success",
      metadata: { sourceType: "memory", topic: "viral", timestamp: new Date().toISOString() },
    },
  ]),
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
    expect(memories[0].id).toBe('memory:u1:mem-1');
  });
});
