
import { prisma } from "../db";

/**
 * TWITTER/X PUBLISHING ENGINE
 * Handles OAuth 2.0 and Thread Creation.
 */

interface TwitterProfile {
    id: string;
    name: string;
    username: string;
}

export async function getTwitterToken(userId: string): Promise<string | null> {
    const account = await prisma.account.findFirst({
        where: {
            userId,
            provider: "twitter"
        }
    });

    if (!account?.access_token) return null;
    return account.access_token;
}

/**
 * Smartly splits text into 280-char chunks, respecting sentence boundaries.
 */
export function splitIntoTweets(text: string): string[] {
    const MAX_LENGTH = 280;
    const tweets: string[] = [];
    
    // Normalize newlines
    const normalized = text.replace(/\n\n/g, '\n'); 
    const paragraphs = normalized.split('\n');

    let currentTweet = "";

    for (const para of paragraphs) {
        // If paragraph itself is too long, split by sentences
        if (para.length > MAX_LENGTH) {
            const sentences = para.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [para];
            for (const sentence of sentences) {
                if ((currentTweet + sentence).length <= MAX_LENGTH) {
                    currentTweet += (currentTweet ? "\n" : "") + sentence;
                } else {
                    if (currentTweet) tweets.push(currentTweet.trim());
                    currentTweet = sentence.trim();
                }
            }
        } else {
            // Try to append paragraph
            if ((currentTweet + "\n" + para).length <= MAX_LENGTH) {
                currentTweet += (currentTweet ? "\n" : "") + para;
            } else {
                if (currentTweet) tweets.push(currentTweet.trim());
                currentTweet = para.trim();
            }
        }
    }
    if (currentTweet) tweets.push(currentTweet.trim());
    
    // Add numbering to thread? Optional aesthetic choice. 
    // For now, raw split.
    return tweets;
}

export async function publishToTwitter(userId: string, content: string | string[]) {
    const token = await getTwitterToken(userId);
    if (!token) throw new Error("No Twitter connection found for user.");

    // Handle both single string (needs splitting) or pre-split array
    const tweets = Array.isArray(content) ? content : splitIntoTweets(content);
    
    if (tweets.length === 0) throw new Error("Content is empty");

    let previousTweetId: string | undefined = undefined;
    let firstTweetId: string | undefined = undefined;

    try {
        for (const tweetText of tweets) {
            const body: any = { text: tweetText };
            
            if (previousTweetId) {
                body.reply = { in_reply_to_tweet_id: previousTweetId };
            }

            const response = await fetch("https://api.twitter.com/2/tweets", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(body)
            });

            if (!response.ok) {
                const error = await response.text();
                // Check for expired token (401) - In real app, we'd use refresh token here.
                throw new Error(`Twitter API Error: ${error}`);
            }

            const data = await response.json();
            const tweetId = data.data.id;
            
            if (!firstTweetId) firstTweetId = tweetId;
            previousTweetId = tweetId;
        }

        // Return URL of the first tweet (the thread starter)
        // Verify username? We can fetch me endpoint or just construct generalized URL
        // Standard URL: https://twitter.com/user/status/ID
        // We can use 'i' as user placeholder or fetch profile.
        
        return {
            success: true,
            externalId: firstTweetId,
            url: `https://twitter.com/i/status/${firstTweetId}` 
        };

    } catch (e) {
        console.error("Twitter Publish Error", e);
        throw e;
    }
}
