/**
 * lib/notifications/handover-alert.ts
 *
 * Multi-Channel Handover Alert System:
 *   1. ✈️ Telegram Bot API (Official, 100% Free with Embedded Photos)
 *   2. 💬 WhatsApp (CallMeBot API + wa.me 1-click links)
 *
 * Both are fire-and-forget with graceful failure — a failed alert never
 * blocks the claim verification flow.
 */

import { sendWhatsAppMessage, generateWhatsAppLink } from "./whatsapp-service";
import { sendTelegramAlert, generateTelegramShareLink } from "./telegram-service";

export interface HandoverAlertPayload {
  /** The handover PIN e.g. "RC-8841" */
  pin: string;
  /** Item display title e.g. "AirPods Pro Case (White)" */
  itemTitle: string;
  /** Short description e.g. "White case with blue NASA sticker" */
  itemDescription?: string;
  /** Full URL to the item's primary image e.g. "http://localhost:3000/uploads/img.jpg" */
  imageUrl?: string;
  /** Claimant full name e.g. "Alex Chen" */
  claimantName: string;
  /** Claimant phone in international format e.g. "+919876543210" (optional) */
  claimantPhone?: string | null;
  /** Pickup location name e.g. "Security Desk, Administration Building" */
  locationName: string;
  /** Institution name e.g. "Apex University" */
  institutionName?: string;
}

/**
 * Format the official Security Desk handover alert message.
 */
export function formatSecurityAlertMessage(payload: HandoverAlertPayload): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const institutionTag = payload.institutionName ? `[${payload.institutionName}] ` : "";
  const photoLine = payload.imageUrl
    ? `\n🖼️ *Photo:* ${payload.imageUrl.startsWith("http") ? payload.imageUrl : `${appUrl}${payload.imageUrl}`}`
    : "";
  const descLine = payload.itemDescription ? `\n📝 *Details:* ${payload.itemDescription.slice(0, 80)}` : "";

  return [
    `🔐 *${institutionTag} UniTrace SECURITY HANDOVER ALERT*`,
    `━━━━━━━━━━━━━━━━━━━━`,
    `📌 *Handover PIN:* *${payload.pin}*`,
    `📦 *Item:* ${payload.itemTitle}${descLine}`,
    `👤 *Claimant:* ${payload.claimantName}`,
    `📍 *Station:* ${payload.locationName}${photoLine}`,
    `━━━━━━━━━━━━━━━━━━━━`,
    `👉 *Action:* Verify Student ID card on arrival.`,
    `Complete handover at: ${appUrl}/staff/handover`,
  ].join("\n");
}

/**
 * Format the student claimant pickup notification message.
 */
export function formatClaimantAlertMessage(payload: HandoverAlertPayload): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const institutionTag = payload.institutionName ? `[${payload.institutionName}] ` : "";

  return [
    `✅ *${institutionTag}Your Item is Ready for Pickup!*`,
    `━━━━━━━━━━━━━━━━━━━━`,
    `📦 *Item:* ${payload.itemTitle}`,
    `🔑 *Your Handover PIN:* *${payload.pin}*`,
    `📍 *Location:* ${payload.locationName}`,
    `━━━━━━━━━━━━━━━━━━━━`,
    `Present this PIN + your Student ID card to the security officer.`,
    `Track your case at: ${appUrl}/claims`,
  ].join("\n");
}

/**
 * Send handover PIN alerts via Telegram and WhatsApp to security desk and claimant.
 * Never throws — all errors are logged and swallowed.
 */
export async function sendHandoverPINAlert(payload: HandoverAlertPayload): Promise<{
  securityDeskLink: string;
  claimantLink?: string;
  telegramLink: string;
}> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const securityDeskPhone = process.env.WHATSAPP_SECURITY_PHONE || process.env.SECURITY_DESK_PHONE;
  const securityMsg = formatSecurityAlertMessage(payload);

  // 1-Click Direct Links
  const securityWhatsAppLink = generateWhatsAppLink(securityDeskPhone, securityMsg);
  const telegramLink = generateTelegramShareLink(securityMsg, `${appUrl}/staff/handover`);

  // Full image URL for photo attachments
  const fullImageUrl = payload.imageUrl
    ? payload.imageUrl.startsWith("http")
      ? payload.imageUrl
      : `${appUrl}${payload.imageUrl}`
    : undefined;

  // ── 1. ✈️ TELEGRAM BOT ALERT ──────────────────────────────────────────────
  try {
    const telegramResult = await sendTelegramAlert(
      process.env.TELEGRAM_CHAT_ID,
      securityMsg,
      fullImageUrl
    );
    if (telegramResult.sent) {
      console.log(`[HandoverAlert] Telegram Bot alert dispatched for PIN: ${payload.pin}`);
    }
  } catch (err) {
    console.error("[HandoverAlert] Telegram Bot alert failed:", err);
  }

  // ── 2. 💬 WHATSAPP BOT ALERT TO SECURITY DESK ─────────────────────────────
  if (securityDeskPhone) {
    try {
      const result = await sendWhatsAppMessage(securityDeskPhone, securityMsg);
      if (result.sent) {
        console.log(`[HandoverAlert] Security desk WhatsApp sent (${payload.pin}) to ${securityDeskPhone}`);
      }
    } catch (err) {
      console.error("[HandoverAlert] Security desk WhatsApp failed:", err);
    }
  }

  // ── 3. 💬 WHATSAPP BOT ALERT TO CLAIMANT ──────────────────────────────────
  let claimantLink: string | undefined;
  if (payload.claimantPhone) {
    const claimantMsg = formatClaimantAlertMessage(payload);
    claimantLink = generateWhatsAppLink(payload.claimantPhone, claimantMsg);

    try {
      const result = await sendWhatsAppMessage(payload.claimantPhone, claimantMsg);
      if (result.sent) {
        console.log(`[HandoverAlert] Claimant WhatsApp sent to ${payload.claimantPhone}`);
      }
    } catch (err) {
      console.error("[HandoverAlert] Claimant WhatsApp failed:", err);
    }
  }

  return {
    securityDeskLink: securityWhatsAppLink,
    claimantLink,
    telegramLink,
  };
}
