/**
 * DISTRIBUTION AGENT - Multi-Chain Dispatcher
 * -------------------------------------------
 * Centralized agent for routing content to various high-reach platforms.
 * Supports: LinkedIn, X (Twitter), Substack, Discord, Slack.
 */

export type DistributionPlatform = 'linkedin' | 'x' | 'substack' | 'discord' | 'slack';

export interface DistributionPayload {
    platform: DistributionPlatform;
    content: string;
    personaId?: string;
    imageUrl?: string;
    title?: string;
}

export interface DistributionResponse {
    success: boolean;
    platform: DistributionPlatform;
    url?: string;
    postId?: string;
    error?: string;
}

/**
 * DISPATCH CONTENT
 * Main entry point for sending content to platforms.
 */
export async function dispatchToPlatform(payload: DistributionPayload): Promise<DistributionResponse> {
    console.log(`[DistributionAgent] Dispatching to ${payload.platform}...`);

    try {
        const response = await fetch("/api/distribute", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (data.success) {
            return {
                success: true,
                platform: payload.platform,
                url: data.url,
                postId: data.postId
            };
        } else {
            return {
                success: false,
                platform: payload.platform,
                error: data.error || "Remote distribution failed"
            };
        }
    } catch (e) {
        return {
            success: false,
            platform: payload.platform,
            error: "Distribution Agent Connectivity Error"
        };
    }
}

/**
 * DISPATCH VOLUME (High Concurrency)
 * Handles multiple parallel dispatches with optional delay to avoid rate limits.
 */
export async function dispatchVolume(payloads: DistributionPayload[], concurrency: number = 2): Promise<DistributionResponse[]> {
    console.log(`[DistributionAgent] Multi-Dispatch initiated for ${payloads.length} targets...`);
    const results: DistributionResponse[] = [];
    
    // Process in batches of 'concurrency'
    for (let i = 0; i < payloads.length; i += concurrency) {
        const batch = payloads.slice(i, i + concurrency);
        const batchResults = await Promise.all(batch.map(p => dispatchToPlatform(p)));
        results.push(...batchResults);
        
        // Add a small jitter/delay between batches
        if (i + concurrency < payloads.length) {
            await new Promise(resolve => setTimeout(resolve, 500));
        }
    }
    
    return results;
}

/**
 * FORMAT FOR SUBSTACK
 * Injects specific markdown enhancements for Substack's editor.
 */
export function formatForSubstack(content: string, title?: string): string {
    const divider = "\n---\n";
    const header = title ? `# ${title}\n\n` : "";
    
    return `${header}${content}${divider}*Generated via StrategyOS Experimental Intelligence*`;
}

/**
 * MOCK WEBHOOK TEST
 * Used to verify Discord/Slack connectivity in dev mode.
 */
export async function testWebhook(platform: 'discord' | 'slack', url: string): Promise<boolean> {
    try {
        const payload = {
            text: `[StrategyOS] Connectivity Test for ${platform.toUpperCase()}. Active at ${new Date().toLocaleTimeString()}`,
            content: `[StrategyOS] Connectivity Test for ${platform.toUpperCase()}.`
        };
        
        const response = await fetch(url, {
            method: 'POST',
            body: JSON.stringify(platform === 'slack' ? { text: payload.text } : { content: payload.content }),
            headers: { 'Content-Type': 'application/json' }
        });
        
        return response.ok;
    } catch (e) {
        return false;
    }
}
