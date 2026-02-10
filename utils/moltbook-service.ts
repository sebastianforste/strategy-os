/**
 * MOLTBOOK SERVICE
 * ----------------
 * Provides integration with Moltbook (Social Network for AI Agents).
 * Supports posting content and reading community feedback.
 */

console.log("DEBUG: Moltbook Service initialized");

export interface MoltPost {
  id: string;
  content: string;
  author: string;
  submolt: string;
  createdAt: string;
}

export const moltbookService = {
  /**
   * POST TO MOLTBOOK
   * Shares a generated post to the specified "submolt".
   */
  async postToMoltbook(content: string, submolt: string = "strategy"): Promise<{ success: boolean; data?: any; error?: string }> {
    const MOLTBOOK_API_KEY = process.env.MOLTBOOK_API_KEY;
    const MOLTBOOK_API_URL = process.env.MOLTBOOK_API_URL || "https://www.moltbook.com/api/v1";

    if (!MOLTBOOK_API_KEY) {
      console.warn("MOLTBOOK_API_KEY not found. Skipping post.");
      return { success: false, error: "API key missing" };
    }

    try {
      const response = await fetch(`${MOLTBOOK_API_URL}/posts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${MOLTBOOK_API_KEY}`,
        },
        body: JSON.stringify({
          title: content.slice(0, 50).split('\n')[0] + "...",
          content,
          submolt,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[Moltbook] API Error: ${response.status} ${response.statusText}`, errorText);
        throw new Error(`Moltbook API error: ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error: any) {
      console.error("Moltbook Post Error:", error);
      return { success: false, error: error.message };
    }
  },

  /**
   * GET TRENDING FROM SUBMOLT
   * Retrieves trending discussions from a specific submolt.
   */
  async getTrending(submolt: string = "strategy"): Promise<MoltPost[]> {
    const MOLTBOOK_API_KEY = process.env.MOLTBOOK_API_KEY;
    const MOLTBOOK_API_URL = process.env.MOLTBOOK_API_URL || "https://www.moltbook.com/api/v1";

    try {
      const url = `${MOLTBOOK_API_URL}/submolts/${submolt}/feed?sort=hot`;
      console.log(`[Moltbook] Fetching trending from: ${url}`);
      
      const headers: Record<string, string> = {
        "Content-Type": "application/json"
      };
      
      if (MOLTBOOK_API_KEY) {
        headers["Authorization"] = `Bearer ${MOLTBOOK_API_KEY}`;
      } else {
        console.warn("[Moltbook] No API Key found for trending fetch (might fail)");
      }

      const response = await fetch(url, { headers });
      
      if (!response.ok) {
        console.warn(`[Moltbook] API error for ${submolt}: ${response.status} ${response.statusText}`);
        const text = await response.text();
        console.warn(`[Moltbook] Response body: ${text}`);
        return [];
      }
      
      const data = await response.json();
      console.log(`[Moltbook] Data for ${submolt}: found ${data.posts?.length || 0} posts`);
      return data.posts || [];
    } catch (error) {
      console.error("[Moltbook] Trends Error:", error);
      return [];
    }
  },

  /**
   * SEMANTIC SEARCH
   * LEVEL 1: SOCIAL OBSERVER
   * Searches Moltbook for relevant agent discourse.
   */
  async search(query: string, limit: number = 5): Promise<MoltPost[]> {
    const MOLTBOOK_API_KEY = process.env.MOLTBOOK_API_KEY;
    const MOLTBOOK_API_URL = process.env.MOLTBOOK_API_URL || "https://www.moltbook.com/api/v1";

    try {
      const url = `${MOLTBOOK_API_URL}/search?q=${encodeURIComponent(query)}&type=posts&limit=${limit}`;
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (MOLTBOOK_API_KEY) headers["Authorization"] = `Bearer ${MOLTBOOK_API_KEY}`;

      const response = await fetch(url, { headers });
      if (!response.ok) return [];

      const data = await response.json();
      return data.results || [];
    } catch (error) {
      console.error("[Moltbook] Search Error:", error);
      return [];
    }
  },

  /**
   * CHECK NOTIFICATIONS
   * LEVEL 2: ENGAGEMENT LOOP
   */
  async checkNotifications(): Promise<any[]> {
    const MOLTBOOK_API_KEY = process.env.MOLTBOOK_API_KEY;
    const MOLTBOOK_API_URL = process.env.MOLTBOOK_API_URL || "https://www.moltbook.com/api/v1";

    if (!MOLTBOOK_API_KEY) return [];

    try {
      const response = await fetch(`${MOLTBOOK_API_URL}/agents/me/notifications`, {
        headers: { "Authorization": `Bearer ${MOLTBOOK_API_KEY}` }
      });
      if (!response.ok) return [];
      const data = await response.json();
      return data.notifications || [];
    } catch (error) {
      console.error("[Moltbook] Notifications Error:", error);
      return [];
    }
  },

  /**
   * CHECK DM ACTIVITY
   * LEVEL 4: COMMAND & CONTROL
   */
  async checkDMActivity(): Promise<{ has_activity: boolean; summary: string }> {
    const MOLTBOOK_API_KEY = process.env.MOLTBOOK_API_KEY;
    const MOLTBOOK_API_URL = process.env.MOLTBOOK_API_URL || "https://www.moltbook.com/api/v1";

    if (!MOLTBOOK_API_KEY) return { has_activity: false, summary: "No API Key" };

    try {
      const response = await fetch(`${MOLTBOOK_API_URL}/agents/dm/check`, {
        headers: { "Authorization": `Bearer ${MOLTBOOK_API_KEY}` }
      });
      if (!response.ok) return { has_activity: false, summary: "API Error" };
      return await response.json();
    } catch (error) {
      console.error("[Moltbook] DM Check Error:", error);
      return { has_activity: false, summary: "Error" };
    }
  },

  /**
   * GET DM CONVERSATIONS
   * LEVEL 4: COMMAND & CONTROL
   */
  async getDMConversations(): Promise<any[]> {
    const MOLTBOOK_API_KEY = process.env.MOLTBOOK_API_KEY;
    const MOLTBOOK_API_URL = process.env.MOLTBOOK_API_URL || "https://www.moltbook.com/api/v1";

    if (!MOLTBOOK_API_KEY) return [];

    try {
      const response = await fetch(`${MOLTBOOK_API_URL}/agents/dm/conversations`, {
        headers: { "Authorization": `Bearer ${MOLTBOOK_API_KEY}` }
      });
      if (!response.ok) return [];
      const data = await response.json();
      return data.conversations?.items || [];
    } catch (error) {
      console.error("[Moltbook] DM Conv Error:", error);
      return [];
    }
  },

  /**
   * SEND DM MESSAGE
   * LEVEL 4: COMMAND & CONTROL
   */
  async sendDM(conversationId: string, message: string): Promise<boolean> {
    const MOLTBOOK_API_KEY = process.env.MOLTBOOK_API_KEY;
    const MOLTBOOK_API_URL = process.env.MOLTBOOK_API_URL || "https://www.moltbook.com/api/v1";

    if (!MOLTBOOK_API_KEY) return false;

    try {
      const response = await fetch(`${MOLTBOOK_API_URL}/agents/dm/conversations/${conversationId}/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${MOLTBOOK_API_KEY}`,
        },
        body: JSON.stringify({ message }),
      });
      return response.ok;
    } catch (error) {
      console.error("[Moltbook] DM Send Error:", error);
      return false;
    }
  },

  /**
   * POST COMMENT
   * LEVEL 2: ENGAGEMENT LOOP
   */
  async postComment(postId: string, content: string, parentId?: string): Promise<boolean> {
    const MOLTBOOK_API_KEY = process.env.MOLTBOOK_API_KEY;
    const MOLTBOOK_API_URL = process.env.MOLTBOOK_API_URL || "https://www.moltbook.com/api/v1";

    if (!MOLTBOOK_API_KEY) return false;

    try {
      const response = await fetch(`${MOLTBOOK_API_URL}/posts/${postId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${MOLTBOOK_API_KEY}`,
        },
        body: JSON.stringify({ content, parent_id: parentId }),
      });
      return response.ok;
    } catch (error) {
      console.error("[Moltbook] Comment Error:", error);
      return false;
    }
  },

  /**
   * GET TOP POSTS
   * LEVEL 3: COMPETITIVE INTEL
   */
  async getTopPosts(submolt: string = "strategy", limit: number = 10): Promise<MoltPost[]> {
    const MOLTBOOK_API_KEY = process.env.MOLTBOOK_API_KEY;
    const MOLTBOOK_API_URL = process.env.MOLTBOOK_API_URL || "https://www.moltbook.com/api/v1";

    try {
      const url = `${MOLTBOOK_API_URL}/submolts/${submolt}/feed?sort=top&limit=${limit}`;
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (MOLTBOOK_API_KEY) headers["Authorization"] = `Bearer ${MOLTBOOK_API_KEY}`;

      const response = await fetch(url, { headers });
      if (!response.ok) return [];

      const data = await response.json();
      return data.posts || [];
    } catch (error) {
      console.error("[Moltbook] Top Posts Error:", error);
      return [];
    }
  },

  /**
   * CREATE SUBMOLT
   * LEVEL 5: COMMUNITY BUILDER
   */
  async createSubmolt(name: string, displayName: string, description: string): Promise<boolean> {
    const MOLTBOOK_API_KEY = process.env.MOLTBOOK_API_KEY;
    const MOLTBOOK_API_URL = process.env.MOLTBOOK_API_URL || "https://www.moltbook.com/api/v1";

    if (!MOLTBOOK_API_KEY) return false;

    try {
      const response = await fetch(`${MOLTBOOK_API_URL}/submolts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${MOLTBOOK_API_KEY}`,
        },
        body: JSON.stringify({ name, display_name: displayName, description }),
      });
      return response.ok;
    } catch (error) {
      console.error("[Moltbook] Submolt Creation Error:", error);
      return false;
    }
  },

  /**
   * GET POST METRICS
   * LEVEL 6: ANALYTICS LOOP
   * Fetches specific engagement numbers for a post.
   */
  async getPostMetrics(postId: string): Promise<{ likes: number; comments: number; shares: number; views: number } | null> {
    const MOLTBOOK_API_KEY = process.env.MOLTBOOK_API_KEY;
    const MOLTBOOK_API_URL = process.env.MOLTBOOK_API_URL || "https://www.moltbook.com/api/v1";

    if (!MOLTBOOK_API_KEY) return null;

    try {
      const response = await fetch(`${MOLTBOOK_API_URL}/posts/${postId}`, {
        headers: { "Authorization": `Bearer ${MOLTBOOK_API_KEY}` }
      });
      
      if (!response.ok) return null;
      
      const data = await response.json();
      return {
        likes: data.post?.likes_count || 0,
        comments: data.post?.comments_count || 0,
        shares: data.post?.shares_count || 0,
        views: data.post?.views_count || 0
      };
    } catch (error) {
      console.error(`[Moltbook] Metrics Error for ${postId}:`, error);
      return null;
    }
  },

  /**
   * GET RECENT POSTS (SELF)
   * LEVEL 6: ANALYTICS LOOP
   * Fetches the agent's own recent posts to check for performance.
   */
  async getRecentPosts(limit: number = 20): Promise<MoltPost[]> {
    const MOLTBOOK_API_KEY = process.env.MOLTBOOK_API_KEY;
    const MOLTBOOK_API_URL = process.env.MOLTBOOK_API_URL || "https://www.moltbook.com/api/v1";

    if (!MOLTBOOK_API_KEY) return [];

    try {
      // Assuming /agents/me/posts endpoint exists, or filtering global feed by author
      // Using /agents/me/posts as it's standard in Moltbook API v1
      const response = await fetch(`${MOLTBOOK_API_URL}/agents/me/posts?limit=${limit}`, {
        headers: { "Authorization": `Bearer ${MOLTBOOK_API_KEY}` }
      });

      if (!response.ok) return [];

      const data = await response.json();
      return data.posts || [];
    } catch (error) {
      console.error("[Moltbook] Recent Posts Error:", error);
      return [];
    }
  }
};
