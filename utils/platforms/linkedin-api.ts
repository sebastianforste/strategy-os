
import { prisma } from "../db";

/**
 * LINKEDIN PUBLISHING ENGINE
 * Handles the OAuth handshake and formatting for UGC Posts.
 */

interface LinkedInProfile {
    id: string;
    localizedFirstName: string;
    localizedLastName: string;
}

export async function getLinkedInToken(userId: string): Promise<string | null> {
    const account = await prisma.account.findFirst({
        where: {
            userId,
            provider: "linkedin"
        }
    });

    if (!account?.access_token) return null;
    return account.access_token;
}

export async function getLinkedInProfile(accessToken: string): Promise<LinkedInProfile | null> {
    try {
        const response = await fetch("https://api.linkedin.com/v2/me", {
            headers: {
                "Authorization": `Bearer ${accessToken}`,
                "X-Restli-Protocol-Version": "2.0.0"
            }
        });

        if (!response.ok) return null;
        return await response.json();
    } catch (e) {
        console.error("LinkedIn Profile Error", e);
        return null;
    }
}

export async function publishToLinkedIn(userId: string, content: string, visibility: "PUBLIC" | "CONNECTIONS" = "PUBLIC") {
    const token = await getLinkedInToken(userId);
    if (!token) throw new Error("No LinkedIn connection found for user.");

    const profile = await getLinkedInProfile(token);
    if (!profile) throw new Error("Could not fetch LinkedIn profile URN.");

    const authorUrn = `urn:li:person:${profile.id}`;

    const body = {
        author: authorUrn,
        lifecycleState: "PUBLISHED",
        specificContent: {
            "com.linkedin.ugc.ShareContent": {
                shareCommentary: {
                    text: content
                },
                shareMediaCategory: "NONE"
            }
        },
        visibility: {
            "com.linkedin.ugc.MemberNetworkVisibility": visibility
        }
    };

    try {
        const response = await fetch("https://api.linkedin.com/v2/ugcPosts", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "X-Restli-Protocol-Version": "2.0.0",
                "Content-Type": "application/json"
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`LinkedIn API Error: ${error}`);
        }

        const data = await response.json();
        return {
            success: true,
            externalId: data.id,
            url: `https://www.linkedin.com/feed/update/${data.id}`
        };

    } catch (e) {
        console.error("LinkedIn Publish Error", e);
        throw e;
    }
}
