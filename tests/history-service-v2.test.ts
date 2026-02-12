import { describe, it, expect, vi, beforeEach } from 'vitest';
import { saveHistory, getHistory, __resetHistoryAuthCacheForTests } from '../utils/history-service';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: vi.fn((key: string) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; }),
  };
})();

Object.defineProperty(global, 'localStorage', { value: localStorageMock });
Object.defineProperty(global, 'crypto', { value: { randomUUID: () => Math.random().toString() } });

// Mock workspace service
vi.mock('../utils/workspace-service', () => ({
  getActiveWorkspaceId: vi.fn().mockReturnValue('test-workspace')
}));

// Mock fetch for migration - return a generic error to trigger fallback to LocalStorage
global.fetch = vi.fn().mockResolvedValue({
  ok: false,
  status: 404,
  json: () => Promise.resolve({ error: 'Not found' })
});

describe('History Service - Queue & Integrity', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
    __resetHistoryAuthCacheForTests();
  });

  it('handles rapid sequential saves correctly', async () => {
    const assets = { textPost: 'Content', imagePrompt: '', videoScript: '' };
    
    // Trigger multiple saves simultaneously
    const p1 = saveHistory('Input 1', assets);
    const p2 = saveHistory('Input 2', assets);
    const p3 = saveHistory('Input 3', assets);

    await Promise.all([p1, p2, p3]);

    const history = await getHistory('test-workspace');
    expect(history).toHaveLength(3);
    expect(history[0].input).toBe('Input 3'); // Most recent first
    expect(history[2].input).toBe('Input 1');
  });

  it('preserves history under race-like conditions', async () => {
    const assets = { textPost: 'Content', imagePrompt: '', videoScript: '' };
    
    // Simulate a slow read-modify-write by wrapping the logic if we could, 
    // but the queue should handle it regardless.
    const results = await Promise.all([
      saveHistory('A', assets),
      saveHistory('B', assets),
      saveHistory('C', assets),
      saveHistory('D', assets)
    ]);

    expect(results.every(id => id !== "")).toBe(true);
    const history = await getHistory('test-workspace');
    expect(history).toHaveLength(4);
  });
});
