
export interface Creator {
  id: string;
  name: string;
  handle: string;
  avatar: string; // URL
  niche: string;
  followers: number;
}

export interface EngagementOpportunity {
  id: string;
  creator: Creator;
  postSnippet: string;
  postedAt: string; // ISO string
  urgency: "High" | "Medium" | "Low";
}

const MOCK_CREATORS: Creator[] = [
  { id: "c1", name: "Alex Hormozi", handle: "@alexhormozi", avatar: "", niche: "Business", followers: 2000000 },
  { id: "c2", name: "Justin Welsh", handle: "@thejustinwelsh", avatar: "", niche: "Solopreneurship", followers: 600000 },
  { id: "c3", name: "Sahil Bloom", handle: "@sahilbloom", avatar: "", niche: "Growth", followers: 1500000 },
];

import { searchGrounding } from "./search-service";
import { AI_CONFIG } from "./config";

const PRIMARY_MODEL = AI_CONFIG.primaryModel;

export async function findHighValueCreators(niche: string, apiKey?: string): Promise<Creator[]> {
  if (!apiKey) return MOCK_CREATORS;

  try {
      const results = await searchGrounding(`top ${niche} influencers and thought leaders on LinkedIn and X`, apiKey, 5);
      
      return results.map((r, i) => ({
          id: `creator-${i}`,
          name: r.title.split(/[-|]/)[0].trim(), // Basic heuristic to clean title
          handle: "@" + r.title.split(" ").join("").slice(0, 10).toLowerCase(),
          avatar: "",
          niche: niche,
          followers: 10000 + Math.floor(Math.random() * 500000)
      }));
  } catch (e) {
      console.error("Failed to find creators, using mocks", e);
      return MOCK_CREATORS;
  }
}

export async function findEngagementOpportunities(apiKey?: string, niche: string = "Tech"): Promise<EngagementOpportunity[]> {
  if (!apiKey) {
      // Fallback to mocks if no key
      return [
        {
          id: "p1",
          creator: MOCK_CREATORS[1],
          postSnippet: "Most people overestimate what they can do in a day, and underestimate what they can do in a decade. Consistency is the only cheat code.",
          postedAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 mins ago
          urgency: "High"
        },
        {
          id: "p2",
          creator: MOCK_CREATORS[0],
          postSnippet: "You don't need more information. You need more action. Stop reading, start doing.",
          postedAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 mins ago
          urgency: "High"
        },
        {
          id: "p3",
          creator: MOCK_CREATORS[2],
          postSnippet: "The paradox of choice: The more options you have, the less happy you are with your decision. constrain your life to find freedom.",
          postedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
          urgency: "Medium"
        }
      ];
  }

  // Real Search
  try {
      const query = `latest controversial or viral posts about ${niche} on LinkedIn or X`;
      const results = await searchGrounding(query, apiKey, 5);

      return results.map((r, i) => ({
          id: `post-${Date.now()}-${i}`,
          creator: {
              id: `c-${i}`,
              name: r.source || "Unknown Creator",
              handle: "@" + (r.source?.replace(/\s/g, '').toLowerCase() || "unknown"),
              avatar: "",
              niche: niche,
              followers: 50000 // Placeholder as search doesn't return followers
          },
          postSnippet: r.snippet.length > 200 ? r.snippet.slice(0, 200) + "..." : r.snippet,
          postedAt: new Date().toISOString(),
          urgency: i < 2 ? "High" : "Medium"
      }));

  } catch (e) {
      console.error("Engagement search failed", e);
      return [];
  }
}
