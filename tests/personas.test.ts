import { describe, it, expect } from 'vitest'
import { PERSONAS, PersonaId } from '../utils/personas'

describe('Personas Configuration', () => {
  it('should have all required persona IDs', () => {
    const requiredPersonas: PersonaId[] = ['cso', 'storyteller', 'contrarian', 'colleague', 'custom']
    requiredPersonas.forEach(id => {
      expect(PERSONAS[id]).toBeDefined()
      expect(PERSONAS[id].id).toBe(id)
    })
  })

  it('should have valid structure for each persona', () => {
    Object.values(PERSONAS).forEach(persona => {
      expect(persona.id).toBeTruthy()
      expect(persona.name).toBeTruthy()
      expect(persona.description).toBeTruthy()
      expect(persona.basePrompt).toBeTruthy()
      expect(persona.jsonSchema).toBeTruthy()
    })
  })

  it('should have the colleague persona for Employee Advocacy', () => {
    const colleague = PERSONAS.colleague
    expect(colleague).toBeDefined()
    expect(colleague.name).toBe('The High-Performer')
    expect(colleague.basePrompt).toContain('WE')
    expect(colleague.basePrompt).toContain('team')
  })

  it('should not contain banned words in output schema', () => {
    // Note: basePrompt contains INSTRUCTIONS about banned words (e.g., "BANNED: delve, leverage...")
    // so we check the jsonSchema instead which defines actual output format
    const bannedWords = ['delve', 'leverage', 'unleash', 'unlock', 'embark', 'navigate', 'tapestry', 'game-changer', 'seamless']
    Object.values(PERSONAS).forEach(persona => {
      bannedWords.forEach(word => {
        expect(persona.jsonSchema?.toLowerCase()).not.toContain(word)
      })
    })
  })
})
