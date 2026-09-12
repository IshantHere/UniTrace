import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    const match = await prisma.match.findUnique({
      where: { id: params.id },
      include: {
        lostItem: {
          include: {
            category: true,
            primaryLocation: true,
            images: true,
            visualFingerprint: true,
            reporter: { select: { id: true, name: true, role: true } },
          },
        },
        foundItem: {
          include: {
            category: true,
            primaryLocation: true,
            images: true,
            visualFingerprint: true,
            reporter: { select: { id: true, name: true, role: true } },
            sightings: {
              include: { location: true },
              orderBy: { sequenceOrder: "asc" },
            },
          },
        },
        evidence: true,
      },
    });

    if (!match) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Match record not found" } },
        { status: 404 }
      );
    }

    // Check if current user has an active claim on the found item
    let activeClaimId: string | null = null;
    if (user) {
      const claim = await prisma.claim.findFirst({
        where: {
          itemId: match.foundItemId,
          claimantId: user.id,
        },
        select: { id: true },
      });
      if (claim) activeClaimId = claim.id;
    }

    return NextResponse.json({
      success: true,
      data: {
        match,
        activeClaimId,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: error.message || "Failed to fetch match" } },
      { status: 500 }
    );
  }
}
