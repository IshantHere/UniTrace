import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { createClaimSchema } from "@/lib/validators";
import { logAudit } from "@/lib/audit";
import { analyzeCollusionRisk } from "@/lib/anti-fraud/collusion-detector";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } }, { status: 401 });
    }

    const isStaffOrAdmin = ["STAFF", "ADMIN", "SUPER_ADMIN"].includes(user.role);
    const where: any = isStaffOrAdmin
      ? {}
      : { claimantId: user.id };

    const claims = await prisma.claim.findMany({
      where,
      include: {
        claimant: {
          select: { id: true, name: true, email: true, phone: true },
        },
        item: {
          include: {
            category: true,
            primaryLocation: true,
            images: true,
            reporter: { select: { id: true, name: true, email: true } },
          },
        },
        verifications: true,
        handoverRecord: {
          include: {
            handoverLocation: true,
            staffUser: { select: { name: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const enrichedClaims = await Promise.all(
      claims.map(async (c) => {
        if (!isStaffOrAdmin) return c;
        try {
          const collusionRisk = await analyzeCollusionRisk({
            claimantId: c.claimantId,
            finderId: c.item?.reporterId,
            itemId: c.itemId,
            itemCreatedAt: c.item?.createdAt,
            claimCreatedAt: c.createdAt,
          });
          return { ...c, collusionRisk };
        } catch {
          return c;
        }
      })
    );

    return NextResponse.json(
      { success: true, data: { claims: enrichedClaims } },
      { headers: { "Cache-Control": "no-store, no-cache, must-revalidate" } }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: error.message || "Failed to fetch claims" } },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "You must be signed in to submit an ownership claim" } },
        { status: 401 }
      );
    }

    const body = await req.json();
    const parsed = createClaimSchema.parse(body);

    const targetItem = await prisma.item.findUnique({
      where: { id: parsed.itemId },
      include: { category: true },
    });

    if (!targetItem) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Item to claim not found" } },
        { status: 404 }
      );
    }

    // Check if user already has an active claim
    const existing = await prisma.claim.findFirst({
      where: {
        itemId: parsed.itemId,
        claimantId: user.id,
        status: { in: ["PENDING", "UNDER_REVIEW", "VERIFICATION_REQUIRED", "VERIFIED", "HANDOVER_SCHEDULED"] },
      },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: { code: "CLAIM_EXISTS", message: "You already have an active claim for this item" } },
        { status: 400 }
      );
    }

    const verificationLevel = targetItem.isHighValue || targetItem.category.isHighValue
      ? "HIGH_VALUE_STRICT"
      : "STANDARD";

    const claim = await prisma.claim.create({
      data: {
        itemId: parsed.itemId,
        claimantId: user.id,
        lostItemId: parsed.lostItemId || null,
        status: "UNDER_REVIEW",
        verificationLevel,
        claimantNotes: parsed.notes || null,
        verifications: {
          create: parsed.verificationAnswers.map((va) => ({
            question: va.question,
            claimantAnswer: va.answer,
            evidenceFiles: parsed.evidenceFiles ? JSON.stringify(parsed.evidenceFiles) : null,
          })),
        },
      },
      include: {
        item: true,
        verifications: true,
      },
    });

    // Update item status to UNDER_VERIFICATION
    await prisma.item.update({
      where: { id: targetItem.id },
      data: { status: "UNDER_VERIFICATION" },
    });

    await logAudit({
      institutionId: user.institutionId,
      actorId: user.id,
      action: "CLAIM_SUBMITTED",
      entityType: "Claim",
      entityId: claim.id,
      metadata: { itemId: targetItem.id, verificationLevel },
    });

    return NextResponse.json(
      { success: true, data: { claim } },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: "VALIDATION_ERROR", message: error.message || "Failed to submit claim" } },
      { status: 400 }
    );
  }
}
