/**
 * lib/notifications/whatsapp-service.ts
 *
 * 100% Free WhatsApp message sender using the CallMeBot Free API (https://www.callmebot.com)
 * No trials, no credit cards, free forever.
 *
 * Usage:
 *   sendWhatsAppMessage("+919876543210", "Hello! Your PIN is RC-8841")
 */

import https from "https";

export interface WhatsAppResult {
  sent: boolean;
  error?: string;
}

/**
 * Send a WhatsApp message using CallMeBot Free API.
 * Gracefully logs and returns { sent: false } if WHATSAPP_* env vars are not set.
 */
export async function sendWhatsAppMessage(
  phone: string,
  message: string,
  apiKeyOverride?: string
): Promise<WhatsAppResult> {
  const apiKey = apiKeyOverride || process.env.WHATSAPP_APIKEY;

  // Clean phone number: remove any non-digit chars except leading plus, then strip plus for CallMeBot
  const cleanPhone = phone.replace(/[^0-9]/g, "");

  if (!apiKey) {
    console.log(`[WhatsApp] Skipped (WHATSAPP_APIKEY not configured in .env). Would have sent to ${phone}:\n${message}`);
    return { sent: false, error: "WHATSAPP_APIKEY not configured" };
  }

  if (!cleanPhone || cleanPhone.length < 8) {
    console.warn(`[WhatsApp] Invalid recipient phone number: "${phone}".`);
    return { sent: false, error: `Invalid phone number: ${phone}` };
  }

  const encodedText = encodeURIComponent(message);
  const url = `https://api.callmebot.com/whatsapp.php?phone=${cleanPhone}&text=${encodedText}&apikey=${apiKey}`;

  return new Promise<WhatsAppResult>((resolve) => {
    https
      .get(url, (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            console.log(`[WhatsApp] Message successfully dispatched to +${cleanPhone}`);
            resolve({ sent: true });
          } else {
            console.error(`[WhatsApp] CallMeBot error ${res.statusCode}: ${data}`);
            resolve({ sent: false, error: data || `HTTP ${res.statusCode}` });
          }
        });
      })
      .on("error", (err) => {
        console.error("[WhatsApp] Network error:", err.message);
        resolve({ sent: false, error: err.message });
      });
  });
}

/**
 * Generate a 1-click WhatsApp Click-to-Chat URL (wa.me)
 * This allows opening WhatsApp Web or Mobile directly with the prefilled message.
 */
export function generateWhatsAppLink(phone: string | null | undefined, message: string): string {
  const cleanPhone = phone ? phone.replace(/[^0-9]/g, "") : "";
  const encodedText = encodeURIComponent(message);
  if (cleanPhone) {
    return `https://wa.me/${cleanPhone}?text=${encodedText}`;
  }
  return `https://wa.me/?text=${encodedText}`;
}
