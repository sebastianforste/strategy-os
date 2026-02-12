import { describe, it, expect, vi, beforeEach } from 'vitest';
import { migrateHistoryToCloud, __resetHistoryAuthCacheForTests } from '../utils/history-service';

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
Object.defineProperty(global, 'crypto', { value: { randomUUID: () => 'test-uuid' } });

// Mock fetch
global.fetch = vi.fn();

describe('History Migration Verification', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
    __resetHistoryAuthCacheForTests();
  });

  it('should successfully migrate history with metadata', async () => {
    // 1. Setup mock history in LocalStorage
    const mockHistory = [
      {
        id: '1',
        input: 'Test input',
        assets: { textPost: 'Test content', imagePrompt: '', videoScript: '' },
        personaId: 'cso',
        createdAt: 1700000000000,
        performance: { rating: 'viral' }
      }
    ];
    localStorageMock.setItem('strategyos_history', JSON.stringify(mockHistory));

    // 2. Mock successful API response
    (global.fetch as any)
      // hasAuthenticatedSession probe
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ user: { id: "test-user" } }),
      })
      // migration request
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true, migrated: 1, failed: 0 }),
      });

    // 3. Run migration
    const result = await migrateHistoryToCloud();

    // 4. Verify API call contains correct metadata
    expect(global.fetch).toHaveBeenCalledWith('/api/migrate-history', expect.objectContaining({
      method: 'POST',
      body: expect.stringContaining('"rating":"viral"')
    }));
    expect(global.fetch).toHaveBeenCalledWith('/api/migrate-history', expect.objectContaining({
      body: expect.stringContaining('"createdAt":1700000000000')
    }));

    // 5. Verify local storage is cleared
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('strategyos_history');
    expect(result.success).toBe(true);
    expect(result.migrated).toBe(1);
  });

  it('should NOT clear local storage if migration fails', async () => {
    const mockHistory = [{ id: '1', input: 'x', assets: {}, personaId: 'c' }];
    localStorageMock.setItem('strategyos_history', JSON.stringify(mockHistory));

    (global.fetch as any)
      // hasAuthenticatedSession probe
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ user: { id: "test-user" } }),
      })
      // migration request
      .mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ error: 'Server Error' }),
      });

    const result = await migrateHistoryToCloud();

    expect(result.success).toBe(false);
    expect(localStorageMock.removeItem).not.toHaveBeenCalled();
  });
});
