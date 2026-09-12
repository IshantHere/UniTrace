import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { createClaimSchema } from "@/lib/validators";
import { logAudit } from "@/lib/audit";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } }, { status: 401 });
    }

    const claims = await prisma.claim.findMany({
      where: { claimantId: user.id },
      include: {
        item: {
          include: {
            category: true,
            primaryLocation: true,
            images: true,
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

    return NextResponse.json({ success: true, data: { claims } });
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
