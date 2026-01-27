/**
 * SCHEDULER SERVICE - AI-to-AI Agent Mesh
 * 
 * Enables sending generated content directly to external scheduling tools
 * like Buffer, Hootsuite, or any custom webhook endpoint.
 */

const WEBHOOK_URL_KEY = "strategyos_scheduler_webhook";

export function getSchedulerWebhook(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(WEBHOOK_URL_KEY) || "";
}

export function setSchedulerWebhook(url: string): void {
  localStorage.setItem(WEBHOOK_URL_KEY, url);
}

export interface SchedulePayload {
  content: string;
  platform: "linkedin" | "twitter";
  scheduledTime?: string; // ISO date string
  metadata?: Record<string, unknown>;
}

export interface ScheduleResult {
  success: boolean;
  message: string;
  externalId?: string;
}

/**
 * Send content to a generic webhook (Buffer, Zapier, Make, n8n, etc.)
 */
export async function sendToWebhook(payload: SchedulePayload): Promise<ScheduleResult> {
  const webhookUrl = getSchedulerWebhook();
  
  if (!webhookUrl) {
    return { 
      success: false, 
      message: "No scheduler webhook configured. Go to Settings to add one." 
    };
  }

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        source: "StrategyOS",
        timestamp: new Date().toISOString(),
        ...payload,
      }),
    });

    if (!response.ok) {
      throw new Error(`Webhook returned ${response.status}`);
    }

    const data = await response.json().catch(() => ({}));

    return {
      success: true,
      message: "Content sent to scheduler successfully!",
      externalId: data.id || data.postId || undefined,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return {
      success: false,
      message: `Failed to send: ${message}`,
    };
  }
}

/**
 * Mock Buffer API integration (for demo purposes)
 * In production, you'd use Buffer's actual OAuth flow
 */
export async function sendToBuffer(content: string, accessToken: string): Promise<ScheduleResult> {
  if (!accessToken) {
    return { success: false, message: "Buffer access token required" };
  }

  // This is a mock - real Buffer API would be:
  // POST https://api.bufferapp.com/1/updates/create.json
  console.log("[Mock Buffer] Would send:", content.substring(0, 100));
  
  // Simulate API delay
  await new Promise(r => setTimeout(r, 1000));
  
  return {
    success: true,
    message: "Sent to Buffer (mock)",
    externalId: `buffer-${Date.now()}`,
  };
}
