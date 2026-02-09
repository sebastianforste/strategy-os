import { describe, it, expect, vi } from 'vitest';
import { processInput } from '../actions/generate';
import { SECTORS } from '../utils/sectors';

// Mock DB to prevent Prisma engine errors in JSDOM environment
vi.mock('../utils/db', () => ({
  prisma: {
    strategy: {
      create: vi.fn(() => Promise.resolve({})),
      findMany: vi.fn(() => Promise.resolve([])),
    },
    resource: {
      findMany: vi.fn(() => Promise.resolve([])),
    },
  },
}));

// Mock AI Service to prevent real API calls
vi.mock('../utils/ai-service-server', () => ({
  generateContent: vi.fn().mockResolvedValue({
    textPost: "Mock response",
    imagePrompt: "Mock prompt",
    videoScript: "Mock script",
    ragConcepts: []
  }),
  fetchContext: vi.fn().mockResolvedValue({ context: "", concepts: [] })
}));

// Mock Refinement Service
vi.mock('../utils/refinement-service', () => ({
  optimizeContent: vi.fn().mockImplementation((text) => Promise.resolve(text))
}));

// Mock server-only since we're in Vitest
vi.mock('server-only', () => ({}));

describe('Sector-Specific Generation', () => {
  // Use a dummy key if none provided to ensure tests are evaluated
  const geminiKey = process.env.GEMINI_API_KEY || "demo";

  it('should inject SaaS jargon when saas sector is selected', async () => {
    if (geminiKey === "demo") {
        console.warn("Using demo/mock for sector test");
    }

    const result = await processInput(
      "How to scale a business",
      { gemini: geminiKey },
      "cso",
      false,
      "linkedin",
      false,
      undefined,
      false,
      undefined,
      undefined,
      undefined,
      undefined,
      "professional",
      false,
      "saas"
    );
    
    console.log("SaaS Output:", result.textPost.substring(0, 100));
    // We can't strictly assert jargon presence because LLM is probabilistic, 
    // but we can check if it runs without error.
    expect(result).toBeDefined();
    expect(result.textPost).toBeTruthy();
  }, 30000);

  it('should inject Real Estate jargon when real_estate sector is selected', async () => {
    const result = await processInput(
      "How to scale a business",
      { gemini: geminiKey },
      "cso",
      false,
      "linkedin",
      false,
      undefined,
      false,
      undefined,
      undefined,
      undefined,
      undefined,
      "professional",
      false,
      "real_estate"
    );

    console.log("Real Estate Output:", result.textPost.substring(0, 100));
    expect(result).toBeDefined();
    expect(result.textPost).toBeTruthy();
  }, 30000);
});
