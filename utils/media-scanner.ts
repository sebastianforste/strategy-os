
export interface MediaOpportunity {
  id: string;
  name: string;
  type: "Podcast" | "Newsletter";
  host: string;
  niche: string;
  reach: number;
  relevanceScore: number; // 0-100
  recentTopic: string;
}

const MOCK_OPPORTUNITIES: MediaOpportunity[] = [
  {
    id: "pod1",
    name: "Lenny's Podcast",
    type: "Podcast",
    host: "Lenny Rachitsky",
    niche: "Product & Growth",
    reach: 600000,
    relevanceScore: 98,
    recentTopic: "The Future of AI PMs"
  },
  {
    id: "pod2",
    name: "20VC",
    type: "Podcast",
    host: "Harry Stebbings",
    niche: "Venture Capital",
    reach: 1200000,
    relevanceScore: 85,
    recentTopic: "SaaS Valuation Multiples in 2026"
  },
  {
    id: "news1",
    name: "Platformer",
    type: "Newsletter",
    host: "Casey Newton",
    niche: "Tech News",
    reach: 180000,
    relevanceScore: 90,
    recentTopic: "The State of Social Media Algorithms"
  }
];

import { searchGrounding } from "./search-service";
import { AI_CONFIG } from "./config";


export async function findPodcastOpportunities(niche: string, apiKey?: string): Promise<MediaOpportunity[]> {
  if (!apiKey) return MOCK_OPPORTUNITIES;

  try {
      const query = `top podcasts about "${niche}" that accept guests or interviews`;
      const results = await searchGrounding(query, apiKey, 5);

      return results.map((r, i) => ({
          id: `pod-${Date.now()}-${i}`,
          name: r.title.replace(/podcast|show/gi, "").trim(),
          type: r.title.toLowerCase().includes("newsletter") ? "Newsletter" : "Podcast",
          host: r.snippet.match(/hosted by ([A-Z][a-z]+ [A-Z][a-z]+)/)?.[1] || "Unknown Host",
          niche: niche,
          reach: 10000 + Math.floor(Math.random() * 1000000), // Placeholder as reach data is hard to get via search
          relevanceScore: 90 - (i * 5),
          recentTopic: r.snippet.split(".")[0]
      }));
  } catch (e) {
      console.error("Podcast search failed", e);
      return MOCK_OPPORTUNITIES;
  }
}

export function analyzeHostStyle(opportunityId: string): "Data-Driven" | "Story-Driven" | "Contrarian" {
  // Mock logic based on ID
  if (opportunityId === "pod1") return "Data-Driven";
  if (opportunityId === "pod2") return "Contrarian";
  return "Story-Driven";
}
