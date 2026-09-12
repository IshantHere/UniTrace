import { describe, expect, it, vi } from "vitest";
import { sendWhatsAppMessage, generateWhatsAppLink } from "../../lib/notifications/whatsapp-service";
import {
  sendHandoverPINAlert,
  formatSecurityAlertMessage,
  formatClaimantAlertMessage,
} from "../../lib/notifications/handover-alert";

describe("100% Free WhatsApp Notification Service & Handover Alerts", () => {
  it("gracefully returns sent:false when WHATSAPP_APIKEY is not set", async () => {
    const origKey = process.env.WHATSAPP_APIKEY;
    delete process.env.WHATSAPP_APIKEY;

    const result = await sendWhatsAppMessage("+919876543210", "Test WhatsApp Alert");
    expect(result.sent).toBe(false);
    expect(result.error).toContain("WHATSAPP_APIKEY not configured");

    if (origKey) process.env.WHATSAPP_APIKEY = origKey;
  });

  it("generateWhatsAppLink generates valid wa.me direct links", () => {
    const link = generateWhatsAppLink("+919456643467", "Hello from RETRACE PIN: RC-8841");
    expect(link).toContain("https://wa.me/919456643467?text=");
    expect(link).toContain("RC-8841");

    // Generic link when phone is null
    const genericLink = generateWhatsAppLink(null, "Handover alert PIN: RC-8841");
    expect(genericLink).toBe("https://wa.me/?text=Handover%20alert%20PIN%3A%20RC-8841");
  });

  it("formatSecurityAlertMessage includes PIN, item title, photo, and claimant details", () => {
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
    expect(message).toContain("Verify Student ID card on arrival");
  });

  it("sendHandoverPINAlert executes cleanly and returns direct WhatsApp link", async () => {
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

    expect(result.securityDeskLink).toContain("https://wa.me/");
    expect(result.securityDeskLink).toContain("RC-8841");

    consoleSpy.mockRestore();
  });
});
