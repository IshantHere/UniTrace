import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { createSightingSchema } from "@/lib/validators";
import { logAudit } from "@/lib/audit";
import { awardPointsAndCredits } from "@/lib/rewards/engine";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } },
        { status: 401 }
      );
    }

    const body = await req.json();
    const parsed = createSightingSchema.parse(body);

    const count = await prisma.sighting.count({
      where: { itemId: parsed.itemId },
    });

    const sighting = await prisma.sighting.create({
      data: {
        itemId: parsed.itemId,
        locationId: parsed.locationId,
        timestamp: new Date(parsed.timestamp),
        sightingType: parsed.sightingType,
        confidence: parsed.confidence,
        reportedBy: parsed.reportedBy || user.name,
        notes: parsed.notes || null,
        sequenceOrder: count + 1,
      },
      include: {
        location: true,
      },
    });

    await logAudit({
      institutionId: user.institutionId,
      actorId: user.id,
      action: "SIGHTING_RECORDED",
      entityType: "Sighting",
      entityId: sighting.id,
      metadata: {
        itemId: parsed.itemId,
        locationName: sighting.location.name,
        type: parsed.sightingType,
      },
    });

    // 🏆 Reward citizen for providing item waypoint sighting (+10 pts & credits)
    awardPointsAndCredits({
      userId: user.id,
      points: 10,
      credits: 10,
      type: "SIGHTING_SUBMITTED",
      description: `Reported sighting at ${sighting.location.name}`,
      referenceId: sighting.id,
    }).catch((err) => {
      console.error("[Rewards] Failed to award sighting credits:", err);
    });

    return NextResponse.json(
      { success: true, data: { sighting } },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: "VALIDATION_ERROR", message: error.message || "Failed to record sighting" } },
      { status: 400 }
    );
  }
}
