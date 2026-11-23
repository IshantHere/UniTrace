/**
 * lib/notifications/item-alert.ts
 *
 * Real-time notification dispatch when a Lost or Found item is reported:
 *   1. ✈️ Telegram Bot Alert (with photo attachment if present)
 *   2. 💬 WhatsApp Notification to Security Desk
 *   3. 🔔 In-App Notifications for campus staff & reporter
 *   4. ⚡ Realtime Event Bus broadcast
 */

import { sendTelegramAlert } from "./telegram-service";
import { sendWhatsAppMessage } from "./whatsapp-service";
import { prisma } from "../prisma";
import { bus } from "../realtime/bus";

export interface ItemReportAlertPayload {
  itemId: string;
  type: "LOST" | "FOUND";
  title: string;
  description: string;
  categoryName?: string;
  locationName: string;
  buildingName?: string;
  reporterId: string;
  reporterName: string;
  reporterRole?: string;
  imageUrl?: string;
  isHighValue?: boolean;
  institutionName?: string;
}

/**
 * Format notification message for Telegram & WhatsApp
 */
export function formatItemReportMessage(payload: ItemReportAlertPayload): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const institutionTag = payload.institutionName ? `[${payload.institutionName}] ` : "[Newton University] ";
  const isFound = payload.type === "FOUND";

  const header = isFound
    ? `📦 *${institutionTag}UniTrace NEW FOUND PROPERTY INTAKE*`
    : `🔍 *${institutionTag}UniTrace NEW LOST PROPERTY REPORT*`;

  const details = [
    header,
    `━━━━━━━━━━━━━━━━━━━━`,
    `📌 *Item:* ${payload.title}`,
    `🏷️ *Category:* ${payload.categoryName || "General Property"}`,
    `📍 *Location:* ${payload.locationName}${payload.buildingName ? ` (${payload.buildingName})` : ""}`,
    `👤 *Reporter:* ${payload.reporterName} (${payload.reporterRole || (isFound ? "Finder" : "Owner")})`,
    payload.isHighValue ? `💎 *Status:* HIGH-VALUE PROPERTY (Zero-Knowledge Protected)` : null,
    `━━━━━━━━━━━━━━━━━━━━`,
    isFound
      ? `👉 *Action:* Multi-signal AI correlation active.\nReview at: ${appUrl}/staff/dashboard`
      : `👉 *Action:* Scanning campus registry for candidate matches.\nView Registry: ${appUrl}/search`,
  ]
    .filter(Boolean)
    .join("\n");

  return details;
}

/**
 * Dispatch multi-channel notifications when an item is reported
 */
export async function sendItemReportNotification(payload: ItemReportAlertPayload): Promise<{
  telegramSent: boolean;
  whatsappSent: boolean;
}> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const message = formatItemReportMessage(payload);

  const fullImageUrl = payload.imageUrl
    ? payload.imageUrl.startsWith("http")
      ? payload.imageUrl
      : `${appUrl}${payload.imageUrl}`
    : undefined;

  let telegramSent = false;
  let whatsappSent = false;

  // 1. ✈️ Telegram Bot Alert
  try {
    const tgRes = await sendTelegramAlert(process.env.TELEGRAM_CHAT_ID, message, fullImageUrl);
    telegramSent = tgRes.sent;
    if (tgRes.sent) {
      console.log(`[ItemAlert] Telegram alert dispatched for ${payload.type} item: ${payload.title}`);
    }
  } catch (err) {
    console.error("[ItemAlert] Telegram alert failed:", err);
  }

  // 2. 💬 WhatsApp Notification (for Found items turned in to Security Desk)
  const securityDeskPhone = process.env.WHATSAPP_SECURITY_PHONE || process.env.SECURITY_DESK_PHONE;
  if (securityDeskPhone && payload.type === "FOUND") {
    try {
      const waRes = await sendWhatsAppMessage(securityDeskPhone, message);
      whatsappSent = waRes.sent;
      if (waRes.sent) {
        console.log(`[ItemAlert] WhatsApp alert sent to security desk: ${securityDeskPhone}`);
      }
    } catch (err) {
      console.error("[ItemAlert] WhatsApp alert failed:", err);
    }
  }

  // 3. 🔔 In-App Notifications for Campus Staff & Admins
  try {
    const staffUsers = await prisma.user.findMany({
      where: {
        role: { in: ["STAFF", "ADMIN", "SUPER_ADMIN"] },
        isActive: true,
      },
      select: { id: true },
    });

    if (staffUsers.length > 0) {
      await prisma.notification.createMany({
        data: staffUsers.map((su) => ({
          userId: su.id,
          type: payload.type === "FOUND" ? "CLAIM_UPDATE" : "MATCH_FOUND",
          title: `New ${payload.type} Item: "${payload.title}"`,
          message: `${payload.reporterName} reported a ${payload.type.toLowerCase()} item at ${payload.locationName}.`,
          actionUrl: payload.type === "FOUND" ? "/staff/dashboard" : "/search",
        })),
      });
    }

    // Also notify reporter confirming submission
    await prisma.notification.create({
      data: {
        userId: payload.reporterId,
        type: "CLAIM_UPDATE",
        title: `${payload.type === "FOUND" ? "Found Property" : "Lost Report"} Recorded`,
        message: `Your report for "${payload.title}" is active in the campus recovery index.`,
        actionUrl: `/journey/${payload.itemId}`,
      },
    });
  } catch (notifErr) {
    console.warn("[ItemAlert] In-app notification creation error:", notifErr);
  }

  // 4. ⚡ Realtime Event Broadcast
  try {
    bus.emit("item_reported", {
      itemId: payload.itemId,
      type: payload.type,
      title: payload.title,
      location: payload.locationName,
      timestamp: new Date().toISOString(),
    });
  } catch (busErr) {
    console.warn("[ItemAlert] Bus event broadcast error:", busErr);
  }

  return { telegramSent, whatsappSent };
}
