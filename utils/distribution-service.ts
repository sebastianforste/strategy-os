/**
 * DISTRIBUTION SERVICE - Ghost Protocol
 * ------------------------------------
 * Handles direct API posting to professional platforms.
 */

export interface DistributionResult {
    success: boolean;
    platform: string;
    postId?: string;
    url?: string;
    strategyId?: string;
    error?: string;
}

export interface PlatformConfig {
    linkedInEnabled: boolean;
    xEnabled: boolean;
    linkedInToken?: string;
    xToken?: string;
}

/**
 * PUBLISH TO PLATFORM
 * Dispatches content to the specified social API.
 */
export async function publishToPlatform(
    platform: 'linkedin' | 'x',
    content: string,
    config: PlatformConfig,
    options?: { imageUrl?: string; personaId?: string; title?: string; strategyId?: string }
): Promise<DistributionResult> {
    // If we have real tokens, we'd call the real APIs here.
    // For now, we implement a robust proxy that can handle both mock and real flows.
    
    console.log(`[GhostProtocol] Publishing to ${platform}...`);
    
    try {
        const response = await fetch('/api/distribute', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              platform,
              content,
              imageUrl: options?.imageUrl,
              persona: options?.personaId,
              title: options?.title,
              strategyId: options?.strategyId,
            })
        });

        const data = await response.json();
        return data;
    } catch (e) {
        console.error(`[GhostProtocol] Distribution failed for ${platform}:`, e);
        return {
            success: false,
            platform,
            error: e instanceof Error ? e.message : "Unknown connectivity error"
        };
    }
}

/**
 * GET PLATFORM CONFIG
 * Retrieves OAuth status from local persistent storage.
 */
export function getPlatformConfig(): PlatformConfig {
    if (typeof window === 'undefined') return { linkedInEnabled: false, xEnabled: false };
    
    const saved = localStorage.getItem('strategy-os-platforms');
    if (saved) {
        try {
            return JSON.parse(saved);
        } catch (e) {
            console.error("Failed to parse platform config:", e);
        }
    }
    
    return { linkedInEnabled: false, xEnabled: false };
}

/**
 * SAVE PLATFORM CONFIG
 */
export function savePlatformConfig(config: PlatformConfig) {
    if (typeof window === 'undefined') return;
    localStorage.setItem('strategy-os-platforms', JSON.stringify(config));
}
