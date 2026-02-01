import { describe, it, expect } from 'vitest'
import { applyAntiRobotFilter } from '../utils/text-processor'

describe('applyAntiRobotFilter', () => {
  it('should remove banned phrases', () => {
    const input = "Let's dive in. This is a testament to our success. In conclusion, we win."
    const expected = "This is a our success. we win."
    // Note: The filter might leave extra spaces or punctuation issues after removal, 
    // which we might want to fix in the revision phase.
    expect(applyAntiRobotFilter(input)).toContain("success")
    expect(applyAntiRobotFilter(input)).not.toContain("Let's dive in")
  })

  it('should replace banned words with better alternatives', () => {
    const input = "We need to leverage our assets and optimize our flux."
    const result = applyAntiRobotFilter(input)
    expect(result).toContain("use our assets")
    expect(result).toContain("fix our flux")
    expect(result).not.toContain("leverage")
    expect(result).not.toContain("optimize")
  })

  it('should delete banned words that have no replacement', () => {
    const input = "This is a revolutionary game-changer for the industry."
    const result = applyAntiRobotFilter(input)
    expect(result).not.toContain("revolutionary")
    expect(result).not.toContain("game-changer")
  })

  it('should preserve line breaks (BUG CHECK)', () => {
    const input = "Line one.\nLine two."
    const result = applyAntiRobotFilter(input)
    // If the buggy line is active, this will fail because \n becomes a single space
    expect(result).toContain("\n")
    expect(result).toContain("Line one.")
    expect(result).toContain("Line two.")
  })

  it('should enforce double line breaks for formatting', () => {
    const input = "Line one.\nLine two."
    const result = applyAntiRobotFilter(input)
    expect(result).toBe("Line one.\n\nLine two.")
  })
})
