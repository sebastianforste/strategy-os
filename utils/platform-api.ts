/**
 * PLATFORM API SERVICE
 * --------------------
 * Handles direct posting to external social platforms (Ghost Mode).
 * 
 * NOTE: For this V2 implementation, we are simulating the API calls
 * as we don't have OAuth tokens for the robust official APIs yet.
 * In a real V3, this would connect to the official LinkedIn/X APIs.
 */

export interface PostResult {
  success: boolean;
  platform: 'linkedin' | 'x' | 'substack';
  url?: string;
  error?: string;
}

export async function publishToPlatform(
  platform: 'linkedin' | 'x' | 'substack',
  content: string,
  apiKey?: string, // Placeholder for when we add real auth
  persona: string = "cso",
  imageUrl?: string
): Promise<PostResult> {
  console.log(`[Ghost Mode] Publishing to ${platform} as ${persona}...`);

  try {
    const response = await fetch("/api/distribute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            platform,
            content,
            imageUrl,
            persona
        }),
    });

    const data = await response.json();

    if (data.success) {
        return {
            success: true,
            platform,
            url: data.url
        };
    } else {
        return {
            success: false,
            platform,
            error: data.error || "Distribution failed"
        };
    }
  } catch (e) {
    return {
      success: false,
      platform,
      error: "API Gateway Error"
    };
  }
}
