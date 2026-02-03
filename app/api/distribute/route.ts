import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "../../../utils/db";
import { getCurrentUserProfile, createPost, createPostWithImage } from "../../../utils/linkedin-api-v2";

/**
 * API DISTRIBUTE ROUTE - Ghost Protocol
 * -------------------------------------
 * Handles the actual API requests to social platforms.
 */

export async function POST(req: Request) {
    try {
        const { platform, content, imageUrl, persona } = await req.json();

        if (!platform || !content) {
            return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
        }

        // 1. Get authenticated session (Real Integration)
        const session = await getServerSession(); // Ensure you import { getServerSession } from "next-auth"; 
        // Note: You might need to pass authOptions if not globally configured or import from your auth config file.
        
        let accessToken = process.env.LINKEDIN_ACCESS_TOKEN; // Fallback for dev
        let user: any = null;

        if (session?.user?.email) {
             user = await prisma.user.findUnique({
                where: { email: session.user.email },
                include: { accounts: { where: { provider: "linkedin" } } }
             });
             
             if (user?.accounts?.[0]?.access_token) {
                 accessToken = user.accounts[0].access_token;
             }
        }

        // 2. MOCK MODE (If secrets are missing AND no real token found)
        if (platform === 'linkedin' && !accessToken && !process.env.LINKEDIN_CLIENT_SECRET) {
            console.warn(`[API/Distribute] Missing LinkedIn credentials. Returning MOCK success.`);
            await new Promise(r => setTimeout(r, 1500));
            return NextResponse.json({
                success: true,
                platform,
                postId: `mock-${Date.now()}`,
                url: "https://www.linkedin.com/feed/",
                message: "MOCK: Post distributed successfully via Ghost Protocol."
            });
        }

        if (platform === 'linkedin' && accessToken) {
            // REAL LINKEDIN PUBLISHING
            const profile = await getCurrentUserProfile(accessToken);
            if (!profile) {
                return NextResponse.json({ success: false, error: "Failed to fetch LinkedIn profile" }, { status: 401 });
            }

            let result;
            if (imageUrl) {
                result = await createPostWithImage(accessToken, profile.personUrn, content, imageUrl);
            } else {
                result = await createPost(accessToken, profile.personUrn, content);
            }

            if (result.success) {
                // PERSISTENCE: Save to database for analytics loop
                if (user?.id) {
                    try {
                        await prisma.strategy.create({
                             data: {
                                 content,
                                 platform: platform.toUpperCase() === 'TWITTER' ? 'TWITTER' : 'LINKEDIN',
                                 authorId: user.id,
                                 isPublished: true,
                                 publishedAt: new Date(),
                                 externalId: result.postId,
                                 title: content.substring(0, 50) + "...",
                                 mode: "ghost_protocol",
                                 persona: persona || "cso"
                             }
                        });
                        console.log(`[API/Distribute] Persisted strategy for ${user.email}`);
                    } catch (dbError) {
                         console.error("[API/Distribute] Failed to persist strategy:", dbError);
                         // Don't fail the request if persistence fails, just log it
                    }
                }

                return NextResponse.json({
                    success: true,
                    platform,
                    postId: result.postId,
                    url: `https://www.linkedin.com/feed/update/${result.postId}`,
                    message: "Published successfully to LinkedIn."
                });
            } else {
                return NextResponse.json({ success: false, error: result.error }, { status: 500 });
            }
        }

        // 3. TWITTER / X PUBLISHING
        if (platform === 'twitter') {
            // Find Twitter account for authenticated user
            let twitterToken = process.env.TWITTER_ACCESS_TOKEN; // Fallback for dev
            
            if (session?.user?.email) {
                const twitterUser = await prisma.user.findUnique({
                    where: { email: session.user.email },
                    include: { accounts: { where: { provider: "twitter" } } }
                });
                
                if (twitterUser?.accounts?.[0]?.access_token) {
                    twitterToken = twitterUser.accounts[0].access_token;
                    user = twitterUser; // Set for persistence
                }
            }
            
            // MOCK MODE if no credentials
            if (!twitterToken && !process.env.TWITTER_CLIENT_SECRET) {
                console.warn(`[API/Distribute] Missing Twitter credentials. Returning MOCK success.`);
                await new Promise(r => setTimeout(r, 1000));
                return NextResponse.json({
                    success: true,
                    platform,
                    postId: `mock-tw-${Date.now()}`,
                    url: "https://x.com/home",
                    message: "MOCK: Distributed successfully to X (no credentials)."
                });
            }
            
            if (twitterToken) {
                // Import Twitter API dynamically
                const { postTweet, postThread } = await import("../../../utils/twitter-api");
                
                // Check if content is a thread (multiple paragraphs)
                const tweets = content.split("\n\n").filter((t: string) => t.trim().length > 0);
                
                let result;
                if (tweets.length > 1 && tweets.every((t: string) => t.length <= 280)) {
                    // Post as thread
                    result = await postThread(twitterToken, tweets);
                    if (result.success) {
                        // Persist to database
                        if (user?.id) {
                            try {
                                await prisma.strategy.create({
                                    data: {
                                        content,
                                        platform: 'TWITTER',
                                        authorId: user.id,
                                        isPublished: true,
                                        publishedAt: new Date(),
                                        externalId: result.tweetIds[0],
                                        title: content.substring(0, 50) + "...",
                                        mode: "ghost_protocol",
                                        persona: persona || "cso"
                                    }
                                });
                            } catch (dbError) {
                                console.error("[API/Distribute] Failed to persist Twitter strategy:", dbError);
                            }
                        }
                        
                        return NextResponse.json({
                            success: true,
                            platform,
                            postId: result.tweetIds[0],
                            url: `https://x.com/i/status/${result.tweetIds[0]}`,
                            message: `Published thread (${result.tweetIds.length} tweets) to X.`
                        });
                    }
                } else {
                    // Post as single tweet (truncate if needed)
                    const tweetContent = content.length > 280 ? content.substring(0, 277) + "..." : content;
                    result = await postTweet(twitterToken, tweetContent);
                    
                    if (result.success) {
                        if (user?.id) {
                            try {
                                await prisma.strategy.create({
                                    data: {
                                        content,
                                        platform: 'TWITTER',
                                        authorId: user.id,
                                        isPublished: true,
                                        publishedAt: new Date(),
                                        externalId: result.tweetId,
                                        title: content.substring(0, 50) + "...",
                                        mode: "ghost_protocol",
                                        persona: persona || "cso"
                                    }
                                });
                            } catch (dbError) {
                                console.error("[API/Distribute] Failed to persist Twitter strategy:", dbError);
                            }
                        }
                        
                        return NextResponse.json({
                            success: true,
                            platform,
                            postId: result.tweetId,
                            url: `https://x.com/i/status/${result.tweetId}`,
                            message: "Published successfully to X."
                        });
                    }
                }
                
                return NextResponse.json({ success: false, error: result?.error || "Twitter post failed" }, { status: 500 });
            }
        }

        // 4. DISCORD / SLACK WEBHOOKS
        if (platform === 'discord' || platform === 'slack') {
            const webhookUrl = platform === 'discord' 
                ? process.env.DISCORD_WEBHOOK_URL 
                : process.env.SLACK_WEBHOOK_URL;

            // MOCK MODE if no webhook configured
            if (!webhookUrl) {
                console.warn(`[API/Distribute] Missing ${platform.toUpperCase()} webhook. Returning MOCK success.`);
                await new Promise(r => setTimeout(r, 800));
                return NextResponse.json({
                    success: true,
                    platform,
                    postId: `mock-webhook-${Date.now()}`,
                    message: `MOCK: Content sent to ${platform} (no webhook configured).`
                });
            }

            try {
                const messagePayload = platform === 'slack' 
                    ? { text: `*StrategyOS Distribution*\n\n${content}` }
                    : { 
                        content: `**StrategyOS Distribution**\n\n${content}`,
                        embeds: imageUrl ? [{ image: { url: imageUrl } }] : []
                      };

                const response = await fetch(webhookUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(messagePayload)
                });

                if (!response.ok) {
                    throw new Error(`${platform.toUpperCase()} webhook returned ${response.status}`);
                }

                return NextResponse.json({
                    success: true,
                    platform,
                    postId: `hook-${Date.now()}`,
                    message: `Successfully pushed to ${platform}.`
                });
            } catch (hookError) {
                console.error(`[API/Distribute] ${platform} webhook failed:`, hookError);
                return NextResponse.json({ success: false, error: `${platform} webhook failed` }, { status: 500 });
            }
        }

        // 5. SUBSTACK (FALLTHROUGH TO MOCK FOR NOW)
        if (platform === 'substack') {
            await new Promise(r => setTimeout(r, 600));
            return NextResponse.json({
                success: true,
                platform,
                postId: `mock-subs-${Date.now()}`,
                message: "Substack draft simulated. Use 'Copy for Substack' in the UI for optimal results."
            });
        }

        return NextResponse.json({
            success: true,
            platform,
            postId: `post-${Date.now()}`,
            url: platform === 'linkedin' ? "https://www.linkedin.com/feed/" : platform === 'twitter' ? "https://x.com/home" : undefined,
            message: "Distributed successfully (Fallthrough Mock)."
        });

    } catch (e) {
        console.error("[API/Distribute] Error:", e);
        return NextResponse.json({ 
            success: false, 
            error: e instanceof Error ? e.message : "Distribution server error" 
        }, { status: 500 });
    }
}
