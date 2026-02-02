import { describe, it, expect } from 'vitest'
import { LinkedInAdapter } from '../utils/platforms/linkedin'
import { TwitterAdapter } from '../utils/platforms/twitter'

describe('Platform Adapters', () => {
  describe('LinkedInAdapter', () => {
    it('should have correct platform identification', () => {
      expect(LinkedInAdapter.id).toBe('linkedin')
      expect(LinkedInAdapter.name).toBe('LinkedIn')
      expect(LinkedInAdapter.maxLength).toBe(3000)
    })

    it('should validate content length', () => {
      const shortContent = 'Short post'
      expect(LinkedInAdapter.validate(shortContent).isValid).toBe(true)

      const longContent = 'A'.repeat(3001)
      const result = LinkedInAdapter.validate(longContent)
      expect(result.isValid).toBe(false)
      expect(result.errors[0]).toContain('exceeds 3000')
    })

    it('should warn about excessive hashtags', () => {
      const manyHashtags = 'Post #one #two #three #four #five #six'
      const result = LinkedInAdapter.validate(manyHashtags)
      expect(result.warnings.length).toBeGreaterThan(0)
      expect(result.warnings[0]).toContain('hashtag')
    })

    it('should apply double line breaks', () => {
      const input = 'Line one.\nLine two.'
      const output = LinkedInAdapter.differentiate(input)
      expect(output).toBe('Line one.\n\nLine two.')
    })

    it('should provide AI instructions with platform-specific guidance', () => {
      const instructions = LinkedInAdapter.getAIInstructions()
      expect(instructions).toContain('LINKEDIN')
      expect(instructions).toContain('Bro-etry')
    })
  })

  describe('TwitterAdapter', () => {
    it('should have correct platform identification', () => {
      expect(TwitterAdapter.id).toBe('twitter')
      expect(TwitterAdapter.name).toBe('X (Twitter)')
      expect(TwitterAdapter.maxLength).toBe(280)
    })

    it('should validate content length', () => {
      const shortContent = 'Short tweet'
      expect(TwitterAdapter.validate(shortContent).isValid).toBe(true)

      const longContent = 'A'.repeat(281)
      const result = TwitterAdapter.validate(longContent)
      expect(result.isValid).toBe(false)
    })

    it('should provide AI instructions for Twitter style', () => {
      const instructions = TwitterAdapter.getAIInstructions()
      expect(instructions).toContain('TWITTER')
    })
  })
})
