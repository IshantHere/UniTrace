import { describe, expect, it, vi } from "vitest";
import { sendTelegramAlert, generateTelegramShareLink } from "../../lib/notifications/telegram-service";
import {
  sendHandoverPINAlert,
  formatSecurityAlertMessage,
  formatClaimantAlertMessage,
} from "../../lib/notifications/handover-alert";

describe("100% Free Telegram Bot Notification Service & Handover Alerts", () => {
  it("gracefully returns sent:false when TELEGRAM_BOT_TOKEN is not set", async () => {
    const origToken = process.env.TELEGRAM_BOT_TOKEN;
    delete process.env.TELEGRAM_BOT_TOKEN;

    const result = await sendTelegramAlert("123456789", "Test Telegram Alert");
    expect(result.sent).toBe(false);
    expect(result.error).toContain("Telegram credentials not configured");

    if (origToken) process.env.TELEGRAM_BOT_TOKEN = origToken;
  });

  it("generateTelegramShareLink generates valid t.me/share URLs", () => {
    const link = generateTelegramShareLink("Handover PIN: RC-8841", "http://localhost:3000/staff/handover");
    expect(link).toContain("https://t.me/share/url?url=");
    expect(link).toContain("RC-8841");
  });

  it("formatSecurityAlertMessage formats rich markdown with PIN and photo", () => {
    const message = formatSecurityAlertMessage({
      pin: "RC-8841",
      itemTitle: "AirPods Pro Case (White)",
      itemDescription: "White casing with blue NASA sticker",
      imageUrl: "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434",
      claimantName: "Alex Chen",
      locationName: "Security Desk, Administration Building",
      institutionName: "Apex University",
    });

    expect(message).toContain("*RC-8841*");
    expect(message).toContain("AirPods Pro Case (White)");
    expect(message).toContain("Alex Chen");
    expect(message).toContain("Security Desk, Administration Building");
    expect(message).toContain("https://images.unsplash.com/photo-1600294037681-c80b4cb5b434");
  });

  it("sendHandoverPINAlert executes cleanly and returns both Telegram and WhatsApp direct links", async () => {
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    const result = await sendHandoverPINAlert({
      pin: "RC-8841",
      itemTitle: "AirPods Pro Case (White)",
      itemDescription: "White casing with blue NASA sticker",
      imageUrl: "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434",
      claimantName: "Alex Chen",
      claimantPhone: "+919876543210",
      locationName: "Security Desk, Administration Building",
      institutionName: "Apex University",
    });

    expect(result.telegramLink).toContain("https://t.me/share/url");
    expect(result.telegramLink).toContain("RC-8841");
    expect(result.securityDeskLink).toContain("https://wa.me/");

    consoleSpy.mockRestore();
  });
});
