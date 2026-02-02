
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateContent } from '../utils/ai-service-server';

// MOCK: @google/genai
vi.mock('@google/genai', () => {
    return {
        GoogleGenAI: class {
            models = {
                generateContent: vi.fn().mockResolvedValue({
                    text: JSON.stringify({
                        textPost: "Mock response",
                        imagePrompt: "Mock prompt",
                        videoScript: "Mock script"
                    })
                })
            };
        }
    };
});

// MOCK: utils/db.ts
// We use a hoisted variable for the mock function
const { mockFindMany } = vi.hoisted(() => {
  return { mockFindMany: vi.fn() };
});

vi.mock('../utils/db', () => ({
    prisma: {
        resource: {
            findMany: mockFindMany
        }
    }
}));

// MOCK: utils/prompts.ts
vi.mock('../utils/prompts', async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...actual,
        formatPrompt: vi.fn().mockImplementation((template, vars) => JSON.stringify(vars))
    };
});

// MOCK: utils/personas.ts (Partial)
vi.mock('../utils/personas', async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...actual,
        PERSONAS: {
            cso: {
                basePrompt: "Base System Prompt",
                jsonSchema: "{}"
            }
        }
    };
});

// MOCK: utils/refinement-service.ts
vi.mock('../utils/refinement-service', () => ({
    optimizeContent: vi.fn().mockImplementation((text) => Promise.resolve(text))
}));

// MOCK: utils/constraint-service.ts (just to be safe)
vi.mock('../utils/constraint-service', () => ({
    verifyConstraints: vi.fn().mockReturnValue({ valid: true })
}));

// Mock console.log to keep output clean but allow inspection
const consoleSpy = vi.spyOn(console, 'log');

describe('AI Service - RAG Logic', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should inject context when resources exist', async () => {
        // Arrange
        const mockResources = [
            {
                title: 'Test Doc',
                metadata: {
                    document_type: 'Report',
                    date: '2025-01-01',
                    summary: 'Strategic Overview'
                }
            }
        ];
        mockFindMany.mockResolvedValue(mockResources);

        // Act
        // We trigger generation, which should internaly call fetchContext
        await generateContent("Test Input", "test-key", "cso");

        // Assert
        // 1. Verify Prisma was called
        expect(mockFindMany).toHaveBeenCalledWith({
            take: 3,
            orderBy: { createdAt: 'desc' },
            where: { type: 'pdf' }
        });

        // 2. Verify console.log confirmed injection
        // The implementation logs: "[AI Service] Injecting Strategic Context..."
        expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("Injecting Strategic Context"));
    });

    it('should NOT inject context when no resources exist', async () => {
        // Arrange
        mockFindMany.mockResolvedValue([]); // Empty list

        // Act
        await generateContent("Test Input", "test-key", "cso");

        // Assert
        expect(mockFindMany).toHaveBeenCalled();
        expect(consoleSpy).not.toHaveBeenCalledWith(expect.stringContaining("Injecting Strategic Context"));
    });
});
