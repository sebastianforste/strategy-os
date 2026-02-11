import { describe, it, expect } from 'vitest'
import { detectIntent } from '../utils/intent-engine'

describe('detectIntent', () => {
  it('should detect SUBSTACK intent with hashtag', () => {
    const input = "Why we must decentralize everything. #substack"
    const result = detectIntent(input)
    expect(result.intent).toBe('SUBSTACK')
    expect(result.activeContexts).toContain('NEWSLETTER_SYNTAX')
  })

  it('should detect LINKEDIN intent with hashtag', () => {
    const input = "The secret to 10x growth. #linkedin"
    const result = detectIntent(input)
    expect(result.intent).toBe('LINKEDIN')
    expect(result.activeContexts).toContain('VIRAL_SYNTAX')
  })

  it('should detect NEWSJACKING intent with URL', () => {
    const input = "Check this out: https://news.google.com/topstories"
    const result = detectIntent(input)
    expect(result.intent).toBe('NEWSJACKING')
    expect(result.confidence).toBeGreaterThan(0.9)
  })

  it('should detect REPLYING intent with re:', () => {
    const input = "re: Your post about AI"
    const result = detectIntent(input)
    expect(result.intent).toBe('REPLYING')
  })

  it('should detect SUBSTACK intent with long form and headers', () => {
    const input = "# The Great Reset\n\nThis is a deep dive into the nature of reality...\n" + "A".repeat(2000)
    const result = detectIntent(input)
    expect(result.intent).toBe('SUBSTACK')
    expect(result.activeContexts).toContain('EDITORIAL_FLOW')
  })

  it('should detect LINKEDIN intent with bro-etry formatting', () => {
    const input = "One sentence.\n\nTwo sentences.\n\nThree sentences.\n\nFour sentences."
    const result = detectIntent(input)
    expect(result.intent).toBe('LINKEDIN')
  })

  it('should detect POLISHING intent for medium-length generic text', () => {
    const input = "This is a generic paragraph with about sixty or so words. It doesn't have any specific hashtags or URLs or any bro-etry line breaks. It just exists as a piece of text that needs some sort of strategic upgrade or high-status polish before it can be published anywhere useful. We need to ensure that the AI understands that this is a serious piece of content that requires significant refinement and adversarial critique to achieve our world-class standards."
    const result = detectIntent(input)
    expect(result.intent).toBe('POLISHING')
  })

  it('should default to IDEATION for short text', () => {
    const input = "Draft idea"
    const result = detectIntent(input)
    expect(result.intent).toBe('IDEATION')
  })
})
