
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateContent } from '../utils/ai-service-server';

// MOCK: @google/genai
vi.mock('@google/genai', () => {
    const mockResponse = {
        text: JSON.stringify({
            textPost: "Mock response",
            imagePrompt: "Mock prompt",
            videoScript: "Mock script"
        })
    };

    return {
        GoogleGenAI: class {
            models = {
                embedContent: vi.fn().mockImplementation(async () => ({
                    embedding: { values: Array(140).fill(0.5) }
                })),
                generateContent: vi.fn().mockResolvedValue(mockResponse)
            };
            // For safety, mock getGenerativeModel too
            getGenerativeModel = vi.fn().mockReturnValue({
                embedContent: vi.fn(),
                generateContent: vi.fn()
            })
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
        ...(actual as any),
        formatPrompt: vi.fn().mockImplementation((template, vars) => JSON.stringify(vars))
    };
});

// MOCK: utils/personas.ts (Partial)
vi.mock('../utils/personas', async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...(actual as any),
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

// MOCK: utils/vector-store.ts
vi.mock('../utils/vector-store', () => ({
    searchVectorStore: vi.fn().mockImplementation(async (query) => {
        // Return empty array for the "no resources" test
        if (query === "EMPTY_TEST") return [];
        return [{ text: "Mock vector search result" }];
    })
}));

describe('AI Service - RAG Logic', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should inject context when resources exist', async () => {
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

        await generateContent("Test Input", "test-key", "cso");

        expect(mockFindMany).toHaveBeenCalledWith({
            take: 3,
            orderBy: { createdAt: 'desc' },
            where: { type: 'pdf' }
        });
        expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("Injecting Strategic Context"));
    });

    it('should NOT inject context when no resources exist', async () => {
        // Arrange
        mockFindMany.mockResolvedValue([]); 

        // Act - Use specific query to trigger empty vector search mock
        await generateContent("EMPTY_TEST", "test-key", "cso");

        // Assert
        expect(mockFindMany).toHaveBeenCalled();
        expect(consoleSpy).not.toHaveBeenCalledWith(expect.stringContaining("Injecting Strategic Context"));
    });
});
