/**
 * TWITTER API v2 WRAPPER
 * ----------------------
 * Functions for posting to Twitter/X via the v2 API.
 * Requires OAuth 2.0 access token with tweet.write scope.
 */

const TWITTER_API_BASE = "https://api.twitter.com/2";

export interface TweetResult {
  success: boolean;
  tweetId?: string;
  error?: string;
}

/**
 * Post a single tweet
 */
export async function postTweet(
  accessToken: string,
  content: string
): Promise<TweetResult> {
  try {
    const response = await fetch(`${TWITTER_API_BASE}/tweets`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: content,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("[Twitter API] Post failed:", error);
      return {
        success: false,
        error: error?.detail || error?.title || "Tweet failed",
      };
    }

    const data = await response.json();
    return {
      success: true,
      tweetId: data.data?.id,
    };
  } catch (e) {
    console.error("[Twitter API] Request error:", e);
    return {
      success: false,
      error: e instanceof Error ? e.message : "Network error",
    };
  }
}

/**
 * Post a thread (multiple tweets in reply chain)
 */
export async function postThread(
  accessToken: string,
  tweets: string[]
): Promise<{ success: boolean; tweetIds: string[]; error?: string }> {
  const tweetIds: string[] = [];
  let inReplyToId: string | undefined;

  for (let i = 0; i < tweets.length; i++) {
    const tweetContent = tweets[i];
    
    try {
      const body: { text: string; reply?: { in_reply_to_tweet_id: string } } = {
        text: tweetContent,
      };
      
      // If this is a reply in a thread, set the parent tweet ID
      if (inReplyToId) {
        body.reply = { in_reply_to_tweet_id: inReplyToId };
      }

      const response = await fetch(`${TWITTER_API_BASE}/tweets`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error(`[Twitter API] Thread tweet ${i + 1} failed:`, error);
        return {
          success: false,
          tweetIds,
          error: `Tweet ${i + 1} failed: ${error?.detail || "Unknown error"}`,
        };
      }

      const data = await response.json();
      const tweetId = data.data?.id;
      
      if (tweetId) {
        tweetIds.push(tweetId);
        inReplyToId = tweetId; // Next tweet replies to this one
      }
      
      // Rate limiting: Small delay between tweets
      if (i < tweets.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
    } catch (e) {
      console.error(`[Twitter API] Thread error at tweet ${i + 1}:`, e);
      return {
        success: false,
        tweetIds,
        error: e instanceof Error ? e.message : "Network error",
      };
    }
  }

  return {
    success: true,
    tweetIds,
  };
}

/**
 * Get user profile (for verification)
 */
export async function getTwitterProfile(accessToken: string) {
  try {
    const response = await fetch(`${TWITTER_API_BASE}/users/me`, {
      headers: {
        "Authorization": `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.data;
  } catch (e) {
    console.error("[Twitter API] Profile fetch error:", e);
    return null;
  }
}
