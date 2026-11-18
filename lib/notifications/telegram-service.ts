/**
 * lib/notifications/telegram-service.ts
 *
 * 100% Free, Official Telegram Bot API notification service.
 * Supports sending instant push notifications with text, markdown, and embedded photo attachments.
 *
 * No external npm packages required — uses native Node.js https module.
 */

import https from "https";

export interface TelegramResult {
  sent: boolean;
  messageId?: number;
  error?: string;
}

/**
 * Send an alert via Telegram Bot.
 * If imageUrl is provided and starts with http, uses sendPhoto. Otherwise uses sendMessage.
 * Gracefully logs and returns { sent: false } if credentials are not configured.
 */
export async function sendTelegramAlert(
  chatId: string | undefined,
  message: string,
  imageUrl?: string,
  tokenOverride?: string
): Promise<TelegramResult> {
  const token = tokenOverride || process.env.TELEGRAM_BOT_TOKEN;
  const targetChatId = chatId || process.env.TELEGRAM_CHAT_ID;

  if (!token || !targetChatId) {
    console.log(
      `[Telegram] Skipped (TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID not configured). Would have sent to chat ${targetChatId || "default"}:\n${message}`
    );
    return { sent: false, error: "Telegram credentials not configured" };
  }

  // If imageUrl is a valid web URL, send as photo with caption
  const hasValidPhoto = imageUrl && (imageUrl.startsWith("http://") || imageUrl.startsWith("https://"));
  const endpoint = hasValidPhoto
    ? `/bot${token}/sendPhoto`
    : `/bot${token}/sendMessage`;

  const payload = hasValidPhoto
    ? {
        chat_id: targetChatId,
        photo: imageUrl,
        caption: message,
        parse_mode: "Markdown",
      }
    : {
        chat_id: targetChatId,
        text: message,
        parse_mode: "Markdown",
      };

  const postData = JSON.stringify(payload);

  return new Promise<TelegramResult>((resolve) => {
    const req = https.request(
      {
        hostname: "api.telegram.org",
        port: 443,
        path: endpoint,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(postData),
        },
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          try {
            const json = JSON.parse(data);
            if (json.ok) {
              console.log(`[Telegram] Alert successfully delivered to chat ${targetChatId} (msg: ${json.result?.message_id})`);
              resolve({ sent: true, messageId: json.result?.message_id });
            } else {
              console.error(`[Telegram] Telegram API Error: ${json.description}`);
              resolve({ sent: false, error: json.description });
            }
          } catch {
            resolve({ sent: false, error: "Failed to parse Telegram API response" });
          }
        });
      }
    );

    req.on("error", (err) => {
      console.error("[Telegram] Network error:", err.message);
      resolve({ sent: false, error: err.message });
    });

    req.write(postData);
    req.end();
  });
}

/**
 * Generate a 1-click Telegram Share Link.
 * This opens Telegram Web or App with the pre-filled handover alert message.
 */
export function generateTelegramShareLink(message: string, url?: string): string {
  const encodedText = encodeURIComponent(message);
  const encodedUrl = url ? encodeURIComponent(url) : "";
  return `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`;
}
