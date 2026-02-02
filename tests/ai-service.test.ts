import { describe, it, expect, vi } from 'vitest'

// Mock server-only for Vitest
vi.mock('server-only', () => ({}))

// Mock database
vi.mock('../utils/db', () => ({
  prisma: { resource: { findMany: vi.fn(() => Promise.resolve([])) } }
}))

import { generateContent } from '../utils/ai-service-server'

// Mock the persona config
vi.mock('../utils/personas', () => ({
  PERSONAS: {
    cso: { id: 'cso', name: 'The Strategist', basePrompt: 'Prompt', jsonSchema: '{}' }
  }
}))

// Mock voice training service
vi.mock('../utils/voice-training-service', () => ({
  getActiveModel: vi.fn(() => Promise.resolve(null))
}))

describe('generateContent (Mock Mode)', () => {
  it('should return mock assets when apiKey is "demo"', async () => {
    const result = await generateContent("Test Input", "demo", "cso")
    
    expect(result).toHaveProperty('textPost')
    expect(result).toHaveProperty('imagePrompt')
    expect(result).toHaveProperty('videoScript')
    expect(result.textPost).toContain("[MOCK THE STRATEGIST OUTPUT]")
  })

  it('should handle missing persona gracefully by falling back to default name', async () => {
    // @ts-ignore - testing invalid personaId
    const result = await generateContent("Test Input", "demo", "invalid-id")
    expect(result.textPost).toContain("[MOCK UNKNOWN OUTPUT]")
  })
})
