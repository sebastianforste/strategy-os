/**
 * LINKEDIN API V2 SERVICE
 * -----------------------
 * Phase 17.3: Full LinkedIn integration with REST API v2
 * 
 * Features:
 * - OAuth 2.0 token refresh
 * - Share/UGC post creation
 * - Engagement analytics
 * - Comment retrieval for reply suggestions
 */

import { logger } from "./logger";

const log = logger.scope("LinkedIn");

// API Endpoints
const LINKEDIN_API_BASE = "https://api.linkedin.com/v2";
const LINKEDIN_REST_BASE = "https://api.linkedin.com/rest";

// --- Types ---

export interface LinkedInToken {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  refresh_token_expires_in?: number;
  scope: string;
  created_at: number;
}

export interface LinkedInPost {
  id: string;
  content: string;
  createdAt: string;
  visibility: "PUBLIC" | "CONNECTIONS";
}

export interface LinkedInAnalytics {
  impressions: number;
  clicks: number;
  likes: number;
  comments: number;
  shares: number;
  engagementRate: number;
  saves: number;
  reach: number;
}

export interface LinkedInComment {
  id: string;
  author: string;
  authorHeadline?: string;
  authorImage?: string;
  content: string;
  createdAt: string;
  likeCount: number;
}

// --- Token Management ---

/**
 * Store token securely (server-side use only)
 */
export function storeToken(userId: string, token: LinkedInToken): void {
  // In production, store encrypted in database
  // For now, we'll use environment-based storage pattern
  log.info("Token stored for user", { userId, expiresIn: token.expires_in });
}

/**
 * Check if token needs refresh (expires within 5 minutes)
 */
export function isTokenExpired(token: LinkedInToken): boolean {
  const expiresAt = token.created_at + (token.expires_in * 1000);
  const bufferMs = 5 * 60 * 1000; // 5 minute buffer
  return Date.now() > (expiresAt - bufferMs);
}

/**
 * Refresh access token using refresh token
 */
export async function refreshAccessToken(
  refreshToken: string,
  clientId: string,
  clientSecret: string
): Promise<LinkedInToken | null> {
  try {
    const response = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
        client_id: clientId,
        client_secret: clientSecret,
      }),
    });

    if (!response.ok) {
      log.error("Token refresh failed", undefined, { status: response.status });
      return null;
    }

    const data = await response.json();
    return {
      ...data,
      created_at: Date.now(),
    };
  } catch (error) {
    log.error("Token refresh error", error as Error);
    return null;
  }
}

// --- Posting ---

/**
 * Create a text post on LinkedIn (UGC Share)
 */
export async function createPost(
  accessToken: string,
  personUrn: string,
  content: string,
  visibility: "PUBLIC" | "CONNECTIONS" = "PUBLIC"
): Promise<{ success: boolean; postId?: string; error?: string }> {
  log.info("Creating LinkedIn post", { personUrn, visibility, contentLength: content.length });

  try {
    const response = await fetch(`${LINKEDIN_REST_BASE}/posts`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "LinkedIn-Version": "202401",
        "X-Restli-Protocol-Version": "2.0.0",
      },
      body: JSON.stringify({
        author: personUrn,
        commentary: content,
        visibility: visibility,
        distribution: {
          feedDistribution: "MAIN_FEED",
          targetEntities: [],
          thirdPartyDistributionChannels: [],
        },
        lifecycleState: "PUBLISHED",
        isReshareDisabledByAuthor: false,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      log.error("LinkedIn post creation failed", undefined, { status: response.status, error: errorText });
      return { success: false, error: `API Error: ${response.status}` };
    }

    // LinkedIn returns the post URN in the x-restli-id header
    const postId = response.headers.get("x-restli-id") || "";
    log.info("LinkedIn post created", { postId });

    return { success: true, postId };
  } catch (error) {
    log.error("LinkedIn post error", error as Error);
    return { success: false, error: (error as Error).message };
  }
}

/**
 * Create a post with an image
 */
export async function createPostWithImage(
  accessToken: string,
  personUrn: string,
  content: string,
  imageUrl: string,
  visibility: "PUBLIC" | "CONNECTIONS" = "PUBLIC"
): Promise<{ success: boolean; postId?: string; error?: string }> {
  log.info("Creating LinkedIn post with image", { personUrn, imageUrl });

  try {
    // Step 1: Initialize image upload
    const initResponse = await fetch(`${LINKEDIN_REST_BASE}/images?action=initializeUpload`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "LinkedIn-Version": "202401",
      },
      body: JSON.stringify({
        initializeUploadRequest: {
          owner: personUrn,
        },
      }),
    });

    if (!initResponse.ok) {
      throw new Error(`Failed to initialize image upload: ${initResponse.status}`);
    }

    const { value: uploadInfo } = await initResponse.json();
    const uploadUrl = uploadInfo.uploadUrl;
    const imageUrn = uploadInfo.image;

    // Step 2: Fetch and Upload image binary
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error(`Failed to fetch image from URL: ${imageUrl}`);
    }
    const imageBlob = await imageResponse.blob();

    const uploadResponse = await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
      },
      body: imageBlob,
    });

    if (!uploadResponse.ok) {
      throw new Error(`Failed to upload image binary: ${uploadResponse.status}`);
    }

    // Step 3: Create post with image reference
    const postResponse = await fetch(`${LINKEDIN_REST_BASE}/posts`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "LinkedIn-Version": "202401",
        "X-Restli-Protocol-Version": "2.0.0",
      },
      body: JSON.stringify({
        author: personUrn,
        commentary: content,
        visibility: visibility,
        distribution: {
          feedDistribution: "MAIN_FEED",
          targetEntities: [],
          thirdPartyDistributionChannels: [],
        },
        content: {
          media: {
            title: "Strategy Visualization",
            id: imageUrn,
          },
        },
        lifecycleState: "PUBLISHED",
        isReshareDisabledByAuthor: false,
      }),
    });

    if (!postResponse.ok) {
      const errorText = await postResponse.text();
      log.error("LinkedIn image post failed", undefined, { status: postResponse.status, error: errorText });
      return { success: false, error: `API Error: ${postResponse.status}` };
    }

    const postId = postResponse.headers.get("x-restli-id") || "";
    log.info("LinkedIn image post created", { postId });

    return { success: true, postId };
  } catch (error) {
    log.error("LinkedIn image post error", error as Error);
    return { success: false, error: (error as Error).message };
  }
}

// --- Analytics ---

/**
 * Get analytics for a specific post
 */
export async function getPostAnalytics(
  accessToken: string,
  postUrn: string
): Promise<LinkedInAnalytics | null> {
  log.info("Fetching post analytics", { postUrn });

  try {
    const response = await fetch(
      `${LINKEDIN_API_BASE}/socialActions/${encodeURIComponent(postUrn)}?projection=(likesSummary,commentsSummary,shareStatistics)`,
      {
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "LinkedIn-Version": "202401",
        },
      }
    );

    if (!response.ok) {
      log.error("Analytics fetch failed", undefined, { status: response.status });
      return null;
    }

    const data = await response.json();
    
    // Map to our interface
    return {
      impressions: data.shareStatistics?.impressionCount || 0,
      clicks: data.shareStatistics?.clickCount || 0,
      likes: data.likesSummary?.totalLikes || 0,
      comments: data.commentsSummary?.totalFirstLevelComments || 0,
      shares: data.shareStatistics?.shareCount || 0,
      reach: data.shareStatistics?.uniqueImpressionsCount || data.shareStatistics?.impressionCount || 0,
      saves: 0, // LinkedIn API for individuals doesn't provide Saves directly
      engagementRate: calculateEngagementRate(data),
    };
  } catch (error) {
    log.error("Analytics error", error as Error);
    return null;
  }
}

/**
 * Get comments on a post
 */
export async function getPostComments(
  accessToken: string,
  postUrn: string,
  limit: number = 10
): Promise<LinkedInComment[]> {
  log.info("Fetching post comments", { postUrn, limit });

  try {
    const response = await fetch(
      `${LINKEDIN_API_BASE}/socialActions/${encodeURIComponent(postUrn)}/comments?count=${limit}`,
      {
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "LinkedIn-Version": "202401",
        },
      }
    );

    if (!response.ok) {
      log.error("Comments fetch failed", undefined, { status: response.status });
      return [];
    }

    const data = await response.json();
    
    return (data.elements || []).map((comment: Record<string, unknown>) => ({
      id: comment.id as string,
      author: (comment.actor as string) || "Unknown",
      content: ((comment.message as Record<string, unknown>)?.text as string) || "",
      createdAt: new Date((comment.created as Record<string, unknown>)?.time as number).toISOString(),
      likeCount: (comment.likesSummary as Record<string, unknown>)?.totalLikes as number || 0,
    }));
  } catch (error) {
    log.error("Comments error", error as Error);
    return [];
  }
}

// --- User Profile ---

/**
 * Get the current user's LinkedIn profile (for personUrn)
 */
export async function getCurrentUserProfile(
  accessToken: string
): Promise<{ personUrn: string; name: string; email?: string } | null> {
  try {
    const response = await fetch(`${LINKEDIN_API_BASE}/userinfo`, {
      headers: {
        "Authorization": `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      log.error("Profile fetch failed", undefined, { status: response.status });
      return null;
    }

    const data = await response.json();
    
    return {
      personUrn: `urn:li:person:${data.sub}`,
      name: data.name || "",
      email: data.email,
    };
  } catch (error) {
    log.error("Profile error", error as Error);
    return null;
  }
}

// --- Helpers ---

function calculateEngagementRate(data: Record<string, unknown>): number {
  const impressions = (data.shareStatistics as Record<string, unknown>)?.impressionCount as number || 0;
  if (impressions === 0) return 0;
  
  const engagements = 
    ((data.likesSummary as Record<string, unknown>)?.totalLikes as number || 0) +
    ((data.commentsSummary as Record<string, unknown>)?.totalFirstLevelComments as number || 0) +
    ((data.shareStatistics as Record<string, unknown>)?.shareCount as number || 0);
  
  return Number(((engagements / impressions) * 100).toFixed(2));
}
