/**
 * NOTIFICATION SERVICE - Push Intelligence
 * 
 * Enables proactive notifications via Slack webhooks or Telegram bots.
 * The "Morning Brief" feature uses this to push Ghost Agent drafts to users.
 */

const SLACK_WEBHOOK_KEY = "strategyos_slack_webhook";
const TEAMS_WEBHOOK_KEY = "strategyos_teams_webhook";
const TELEGRAM_BOT_KEY = "strategyos_telegram_bot";
const TELEGRAM_CHAT_KEY = "strategyos_telegram_chat";

// Slack Configuration
export function getSlackWebhook(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(SLACK_WEBHOOK_KEY) || "";
}

export function setSlackWebhook(url: string): void {
  localStorage.setItem(SLACK_WEBHOOK_KEY, url);
}

// MS Teams Configuration
export function getTeamsWebhook(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(TEAMS_WEBHOOK_KEY) || "";
}

export function setTeamsWebhook(url: string): void {
  localStorage.setItem(TEAMS_WEBHOOK_KEY, url);
}

// Telegram Configuration
export function getTelegramConfig(): { botToken: string; chatId: string } {
  if (typeof window === "undefined") return { botToken: "", chatId: "" };
  return {
    botToken: localStorage.getItem(TELEGRAM_BOT_KEY) || "",
    chatId: localStorage.getItem(TELEGRAM_CHAT_KEY) || "",
  };
}

export function setTelegramConfig(botToken: string, chatId: string): void {
  localStorage.setItem(TELEGRAM_BOT_KEY, botToken);
  localStorage.setItem(TELEGRAM_CHAT_KEY, chatId);
}

export interface NotificationResult {
  success: boolean;
  message: string;
}

/**
 * Send a message to Slack via Incoming Webhook
 */
export async function sendSlackMessage(message: string, blocks?: unknown[]): Promise<NotificationResult> {
  const webhookUrl = getSlackWebhook();
  
  if (!webhookUrl) {
    return { success: false, message: "Slack webhook not configured" };
  }

  try {
    const payload: Record<string, unknown> = {
      text: message,
      username: "StrategyOS Ghost Agent",
      icon_emoji: ":ghost:",
    };

    if (blocks) {
      payload.blocks = blocks;
    }

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Slack returned ${response.status}`);
    }

    return { success: true, message: "Sent to Slack" };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return { success: false, message: `Slack failed: ${msg}` };
  }
}

/**
 * Send a message to Telegram via Bot API
 */
export async function sendTelegramMessage(message: string): Promise<NotificationResult> {
  const { botToken, chatId } = getTelegramConfig();
  
  if (!botToken || !chatId) {
    return { success: false, message: "Telegram not configured" };
  }

  try {
    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
    
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: "Markdown",
      }),
    });

    const data = await response.json();
    
    if (!data.ok) {
      throw new Error(data.description || "Telegram error");
    }

    return { success: true, message: "Sent to Telegram" };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return { success: false, message: `Telegram failed: ${msg}` };
  }
}

/**
 * Send a message to MS Teams via Incoming Webhook
 */
export async function sendMSTeamsMessage(message: string, title?: string): Promise<NotificationResult> {
  const webhookUrl = getTeamsWebhook();
  
  if (!webhookUrl) return { success: false, message: "Teams webhook not configured" };

  try {
    const payload = {
      "@type": "MessageCard",
      "@context": "http://schema.org/extensions",
      "themeColor": "0076D7",
      "summary": title || "StrategyOS Notification",
      "sections": [{
        "activityTitle": title || "StrategyOS Ghost Agent",
        "activitySubtitle": "New content drafted",
        "text": message
      }]
    };

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) throw new Error(`Teams returned ${response.status}`);

    return { success: true, message: "Sent to MS Teams" };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return { success: false, message: `Teams failed: ${msg}` };
  }
}

/**
 * Send Morning Brief - Attempts Slack, Teams, then Telegram
 */
export async function sendMorningBrief(drafts: { topic: string; preview: string }[]): Promise<NotificationResult> {
  const briefMessage = `🌅 *Morning Strategy Brief*

Your Ghost Agent found ${drafts.length} opportunities while you slept:

${drafts.map((d, i) => `${i + 1}. *${d.topic}*
   > ${d.preview.substring(0, 100)}...`).join("\n\n")}

Open StrategyOS to review and refine these drafts.`;

  // Try Slack first
  const slackResult = await sendSlackMessage(briefMessage);
  if (slackResult.success) return slackResult;

  // Fallback to Telegram
  const telegramResult = await sendTelegramMessage(briefMessage);
  if (telegramResult.success) return telegramResult;

  return { 
    success: false, 
    message: "No notification channel configured. Add Slack or Telegram in Settings." 
  };
}
