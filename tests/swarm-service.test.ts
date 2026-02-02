import { describe, it, expect } from 'vitest'
import { COUNCIL, AUDIENCE } from '../utils/swarm-service'

describe('Swarm Service Configuration', () => {
  describe('Council Configuration', () => {
    it('should have exactly 4 council members (UI presentation)', () => {
      expect(COUNCIL).toHaveLength(4)
    })

    it('should have required council roles mapped', () => {
      const ids = COUNCIL.map(m => m.id)
      expect(ids).toContain('visionary')
      expect(ids).toContain('skeptic')
      expect(ids).toContain('realist')
      expect(ids).toContain('editor')
    })

    it('should have valid structure for each council member', () => {
      COUNCIL.forEach(member => {
        expect(member.id).toBeTruthy()
        expect(member.name).toBeTruthy()
        expect(member.role).toBeTruthy()
        expect(member.avatar).toBeTruthy()
        // systemPrompt is stored internally in AGENT_PROMPTS, not on the member object
      })
    })
  })

  describe('Audience Configuration', () => {
    it('should have at least 3 default audience members', () => {
      expect(AUDIENCE.length).toBeGreaterThanOrEqual(3)
    })

    it('should have valid structure for each audience member', () => {
      AUDIENCE.forEach(member => {
        expect(member.id).toBeTruthy()
        expect(member.name).toBeTruthy()
        expect(member.role).toBeTruthy()
        expect(member.avatar).toBeTruthy()
        // bias is implied by role, not a direct property
      })
    })

    it('should have diverse audience roles', () => {
      const roles = AUDIENCE.map(m => m.role.toLowerCase())
      // Check for Tech/Founder overlap
      expect(roles.some(r => r.includes('cto') || r.includes('engineer'))).toBe(true)
      // Check for Investor/Business side
      expect(roles.some(r => r.includes('partner') || r.includes('equity'))).toBe(true)
    })
  })
})
