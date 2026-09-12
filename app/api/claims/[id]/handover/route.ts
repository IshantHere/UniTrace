import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, requireRole } from "@/lib/auth";
import { ROLES } from "@/lib/constants";
import { handoverSchema } from "@/lib/validators";
import { logAudit } from "@/lib/audit";
import { awardPointsAndCredits } from "@/lib/rewards/engine";

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

    const body = await req.json();
    const parsed = handoverSchema.parse(body);

    const claim = await prisma.claim.findUnique({
      where: { id: params.id },
      include: {
        item: true,
        handoverRecord: true,
      },
    });

    if (!claim || !claim.handoverRecord) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Claim or handover record not found" } },
        { status: 404 }
      );
    }

    // Verify PIN match (case-insensitive)
    if (claim.handoverRecord.handoverCode.toUpperCase() !== parsed.handoverCode.trim().toUpperCase()) {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_PIN", message: "Verification PIN does not match" } },
        { status: 400 }
      );
    }

    // Mark claim COMPLETED and item RECOVERED
    await prisma.$transaction([
      prisma.claim.update({
        where: { id: claim.id },
        data: { status: "COMPLETED" },
      }),
      prisma.item.update({
        where: { id: claim.itemId },
        data: { status: "RECOVERED" },
      }),
      prisma.handoverRecord.update({
        where: { id: claim.handoverRecord.id },
        data: {
          releasedAt: new Date(),
          idVerificationMethod: parsed.idVerificationMethod,
          claimantSignature: parsed.claimantSignature || "VERIFIED_PRESENT_WITH_ID",
          notes: parsed.notes || "In-person physical release completed at Security Desk.",
        },
      }),
    ]);

    // If there was a linked lost item, mark it RECOVERED as well
    if (claim.lostItemId) {
      await prisma.item.update({
        where: { id: claim.lostItemId },
        data: { status: "RECOVERED" },
      });
    }

    // Notify claimant
    await prisma.notification.create({
      data: {
        userId: claim.claimantId,
        type: "CLAIM_UPDATE",
        title: "Item Recovered! Case Closed",
        message: `Your property "${claim.item.title}" was successfully handed over to you at the security desk. Case resolved.`,
        actionUrl: "/dashboard",
      },
    });

    // 🏆 Reward the Finder with Points & Spendable Credits!
    const finderId = claim.item.reporterId;
    if (finderId && finderId !== claim.claimantId) {
      let rewardPts = 100;
      let rewardCredits = 100;
      const reasons: string[] = ["Handover verified at Security Desk (+100)"];

      // Speed recovery bonus (< 48 hours)
      const hoursTaken = (Date.now() - new Date(claim.item.createdAt).getTime()) / (1000 * 60 * 60);
      if (hoursTaken <= 48) {
        rewardPts += 50;
        rewardCredits += 50;
        reasons.push("Speedy return bonus (<48h) (+50)");
      }

      // High-value item custody bonus
      if (claim.item.isHighValue) {
        rewardPts += 50;
        rewardCredits += 50;
        reasons.push("High-value item custody bonus (+50)");
      }

      await awardPointsAndCredits({
        userId: finderId,
        points: rewardPts,
        credits: rewardCredits,
        type: "HANDOVER_COMPLETED",
        description: `Returned "${claim.item.title}": ${reasons.join(", ")}`,
        referenceId: claim.id,
      }).catch((err) => {
        console.error("[Rewards] Failed to award finder points:", err);
      });
    }

    await logAudit({
      institutionId: user.institutionId,
      actorId: user.id,
      action: "HANDOVER_COMPLETED",
      entityType: "Claim",
      entityId: claim.id,
      metadata: {
        itemId: claim.itemId,
        claimantId: claim.claimantId,
        idVerificationMethod: parsed.idVerificationMethod,
      },
    });

    return NextResponse.json({
      success: true,
      data: { completed: true, status: "RECOVERED" },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: "HANDOVER_ERROR", message: error.message || "Failed to complete handover" } },
      { status: 400 }
    );
  }
}
