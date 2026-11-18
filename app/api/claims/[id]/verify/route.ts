import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, requireRole } from "@/lib/auth";
import { ROLES } from "@/lib/constants";
import { generateHandoverPIN } from "@/lib/claims/verification";
import { logAudit } from "@/lib/audit";
import { sendHandoverPINAlert } from "@/lib/notifications/handover-alert";
import { emitClaimStatusChanged } from "@/lib/realtime/bus";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } }, { status: 401 });
    }

    try {
      requireRole(user, [ROLES.STAFF, ROLES.ADMIN, ROLES.SUPER_ADMIN]);
    } catch {
      return NextResponse.json({ success: false, error: { code: "FORBIDDEN", message: "Forbidden" } }, { status: 403 });
    }

    const { action, reviewerNotes, rejectionReason } = await req.json();

    const claim = await prisma.claim.findUnique({
      where: { id: params.id },
      include: {
        item: {
          include: {
            primaryLocation: true,
            images: { where: { isPrimary: true }, take: 1 },
            institution: true,
          },
        },
        claimant: true,
      },
    });

    if (!claim) {
      return NextResponse.json({ success: false, error: { code: "NOT_FOUND", message: "Claim not found" } }, { status: 404 });
    }

    if (action === "APPROVE") {
      const handoverCode = generateHandoverPIN();

      // Find security desk location
      const securityLoc = await prisma.location.findFirst({
        where: { isSecurityDesk: true },
      });

      const handoverLocationId = securityLoc?.id || claim.item.primaryLocationId;

      const updatedClaim = await prisma.claim.update({
        where: { id: params.id },
        data: {
          status: "HANDOVER_SCHEDULED",
          handoverRecord: {
            upsert: {
              create: {
                staffUserId: user.id,
                handoverCode,
                handoverLocationId,
                idVerificationMethod: "STUDENT_ID_CARD",
                notes: reviewerNotes || "Claim verified by security officer. PIN generated.",
              },
              update: {
                staffUserId: user.id,
                handoverCode,
                handoverLocationId,
                notes: reviewerNotes || "Claim re-verified. PIN regenerated.",
              },
            },
          },
        },
        include: { handoverRecord: true },
      });

      // Send claimant high-priority notification
      await prisma.notification.create({
        data: {
          userId: claim.claimantId,
          type: "HANDOVER_READY",
          title: "Ownership Verified! Ready for Handover",
          message: `Your claim on "${claim.item.title}" has been approved. Present Handover PIN ${handoverCode} and your student ID card at the security desk.`,
          actionUrl: "/claims",
        },
      });

      // ⚡ Emit real-time notification to claimant browser
      emitClaimStatusChanged({
        claimId: claim.id,
        itemId: claim.itemId,
        itemTitle: claim.item.title,
        status: "HANDOVER_SCHEDULED",
        recipientUserId: claim.claimantId,
        handoverCode,
        timestamp: new Date().toISOString(),
      });

      // 🔔 Fire 100% Free WhatsApp alerts — to security desk + claimant (fire-and-forget, never blocks)
      const primaryImage = claim.item.images?.[0]?.url;
      const pickupLocation = securityLoc
        ? `${securityLoc.name}, ${securityLoc.building}`
        : `${claim.item.primaryLocation.name}, ${claim.item.primaryLocation.building}`;

      const alertPayload = {
        pin: handoverCode,
        itemTitle: claim.item.title,
        itemDescription: claim.item.description?.slice(0, 80),
        imageUrl: primaryImage,
        claimantName: claim.claimant.name,
        claimantPhone: claim.claimant.phone,
        locationName: pickupLocation,
        institutionName: claim.item.institution?.name,
      };

      const alertResult = await sendHandoverPINAlert(alertPayload).catch((err) => {
        console.error("[HandoverAlert] Unexpected error:", err);
        return { securityDeskLink: "", telegramLink: "" };
      });

      await logAudit({
        institutionId: user.institutionId,
        actorId: user.id,
        action: "CLAIM_VERIFIED_APPROVED",
        entityType: "Claim",
        entityId: claim.id,
        metadata: { handoverCode, reviewerNotes },
      });

      const whatsappPhone = process.env.WHATSAPP_SECURITY_PHONE || process.env.SECURITY_DESK_PHONE || null;
      const isWhatsappConfigured = !!process.env.WHATSAPP_APIKEY;
      const isTelegramConfigured = !!(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID);

      return NextResponse.json({
        success: true,
        data: {
          claim: updatedClaim,
          handoverCode,
          whatsappAlert: {
            phone: whatsappPhone,
            configured: isWhatsappConfigured,
            directLink: alertResult?.securityDeskLink || "",
          },
          telegramAlert: {
            configured: isTelegramConfigured,
            directLink: alertResult?.telegramLink || "",
          },
        },
      });
    } else if (action === "REJECT") {
      const updatedClaim = await prisma.claim.update({
        where: { id: params.id },
        data: {
          status: "REJECTED",
          rejectionReason: rejectionReason || "Answers did not match inspection records.",
        },
      });

      await prisma.notification.create({
        data: {
          userId: claim.claimantId,
          type: "CLAIM_UPDATE",
          title: "Ownership Verification Unsuccessful",
          message: `Your claim on "${claim.item.title}" could not be verified. Reason: ${rejectionReason || "Details did not match secured property."}`,
          actionUrl: "/claims",
        },
      });

      await logAudit({
        institutionId: user.institutionId,
        actorId: user.id,
        action: "CLAIM_REJECTED",
        entityType: "Claim",
        entityId: claim.id,
        metadata: { rejectionReason },
      });

      return NextResponse.json({ success: true, data: { claim: updatedClaim } });
    }

    return NextResponse.json({ success: false, error: { code: "INVALID_ACTION", message: "Unknown action" } }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: "VERIFICATION_ERROR", message: error.message || "Failed to verify claim" } },
      { status: 500 }
    );
  }
}
