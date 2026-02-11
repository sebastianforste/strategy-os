import { describe, it, expect, vi } from "vitest";
import dotenv from "dotenv";
import path from "path";

// Load environment variables for real API calls
dotenv.config({ path: path.join(process.cwd(), ".env") });

// Mock server-only
vi.mock('server-only', () => ({}));

// Mock database to avoid prisma errors in CI/Test
vi.mock('../utils/db', () => ({
  prisma: { 
    resource: { findMany: vi.fn(() => Promise.resolve([]) ) },
    metric: { findMany: vi.fn(() => Promise.resolve([]) ) },
    performance: { findUnique: vi.fn(() => Promise.resolve(null) ) },
    strategy: { findMany: vi.fn(() => Promise.resolve([]) ) }
  }
}));

// Mock focus context (RAG)
vi.mock('../utils/rag-service', () => ({
  findRelevantConcepts: vi.fn(() => Promise.resolve([])),
  findGraphConcepts: vi.fn(() => Promise.resolve([]))
}));

// Mock vector store
vi.mock('../utils/vector-store', () => ({
  searchVectorStore: vi.fn(() => Promise.resolve([])),
  searchVoiceMemory: vi.fn(() => Promise.resolve([])),
  searchStyleMemory: vi.fn(() => Promise.resolve([])),
  searchGraphContext: vi.fn(() => Promise.resolve([]))
}));

// Mock trend service
vi.mock('../utils/trend-service', () => ({
  findTrends: vi.fn(() => Promise.resolve([])),
  fetchTrendingNews: vi.fn(() => Promise.resolve([]))
}));

// Mock next-auth
vi.mock('next-auth/next', () => ({
    getServerSession: vi.fn(() => Promise.resolve(null))
}));

import { 
    processInput, 
    generateCommentAction, 
    scoreViralityAction, 
    refineAuthorityAction 
} from "../actions/generate";

describe("StrategyOS Functional Validation", () => {
  const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "";
  
  if (!geminiKey) {
    it.skip("SKIPPING: GEMINI_API_KEY missing", () => {});
    return;
  }

  it("should generate a full content package with processInput", async () => {
    const testTopic = "The Future of AI Strategy in 2027: From Copilots to Autonomous Agents";
    console.log(`\n🚀 Testing [processInput] with topic: "${testTopic}"...`);
    
    const assets = await processInput(
      testTopic,
      { gemini: geminiKey },
      "cso",
      true // force trends
    );

    expect(assets).toHaveProperty("textPost");
    expect(assets.textPost.length).toBeGreaterThan(100);
    console.log("✅ processInput SUCCESS");
  }, 60000); // 60s timeout for real API call

  it("should score virality of the generated content", async () => {
    const testContent = "Most CEOs are playing the wrong game with AI. They think it's a tool, but it's an environment.";
    const virality = await scoreViralityAction(testContent, geminiKey, "cso");
    
    expect(virality).toHaveProperty("score");
    expect(virality.score).toBeGreaterThan(0);
    console.log(`✅ scoreViralityAction SUCCESS. Score: ${virality.score}/100`);
  }, 30000);

  it("should refine authority of a text", async () => {
    const testText = "We should use AI to make our business better and faster.";
    const refined = await refineAuthorityAction(testText, geminiKey, "cso");
    
    expect(refined).toBeDefined();
    expect(refined.textPost.length).toBeGreaterThan(testText.length);
    console.log("✅ refineAuthorityAction SUCCESS");
  }, 30000);

  it("should generate a high-status comment", async () => {
    const mockPost = "AI is just a tool. It will never replace human strategy.";
    const comment = await generateCommentAction(mockPost, "Contrarian", geminiKey, "cso");
    
    expect(comment).toBeDefined();
    expect(comment.length).toBeGreaterThan(20);
    console.log(`✅ generateCommentAction SUCCESS. Reply: "${comment}"`);
  }, 30000);
});
