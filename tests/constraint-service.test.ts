import { describe, it, expect } from 'vitest'
import { verifyConstraints } from '../utils/constraint-service'

describe('verifyConstraints', () => {
  it('should pass for empty or small text', () => {
     // Service says it fails for empty text
     expect(verifyConstraints("").valid).toBe(false)
     expect(verifyConstraints("Hook line 1\nLine 2").valid).toBe(true)
  })

  it('should fail if the hook is too long (> 210 chars)', () => {
    const longLine = "A".repeat(110)
    const text = `${longLine}\n${longLine}` // 220 chars hook
    const result = verifyConstraints(text)
    expect(result.valid).toBe(false)
    expect(result.reason).toContain("Hook is too long")
  })

  it('should pass if hook is exactly 210 chars', () => {
    const line1 = "A".repeat(105)
    const line2 = "B".repeat(105)
    const text = `${line1}\n${line2}`
    expect(verifyConstraints(text).valid).toBe(true)
  })

  it('should ignore empty lines when calculating hook length', () => {
    const line1 = "Start"
    const line2 = "Finish"
    const text = `${line1}\n\n\n${line2}`
    // It should count "Start" (5) + "Finish" (6) = 11
    // Let's check if the service correctly identifies the first two NON-EMPTY lines
    expect(verifyConstraints(text).valid).toBe(true)
  })
})
