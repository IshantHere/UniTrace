import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { createItemSchema } from "@/lib/validators";
import { logAudit } from "@/lib/audit";
import { runAutomaticMatching } from "@/lib/matching/engine";
import { awardPointsAndCredits } from "@/lib/rewards/engine";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type"); // LOST | FOUND
    const categoryId = searchParams.get("categoryId");
    const locationId = searchParams.get("locationId");
    const status = searchParams.get("status");
    const query = searchParams.get("query");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "12")));
    const skip = (page - 1) * limit;

    const where: any = {};
    if (type) where.type = type;
    if (categoryId) where.categoryId = categoryId;
    if (locationId) where.primaryLocationId = locationId;
    if (status) where.status = status;
    if (query) {
      where.OR = [
        { title: { contains: query } },
        { description: { contains: query } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.item.findMany({
        where,
        include: {
          category: true,
          primaryLocation: true,
          images: true,
          visualFingerprint: true,
          reporter: {
            select: { id: true, name: true, role: true },
          },
          lostMatches: {
            select: { id: true, overallScore: true, confidenceTier: true },
            take: 1,
            orderBy: { overallScore: "desc" },
          },
          foundMatches: {
            select: { id: true, overallScore: true, confidenceTier: true },
            take: 1,
            orderBy: { overallScore: "desc" },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.item.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        items,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: error.message || "Failed to fetch items" } },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "You must be signed in to submit a report" } },
        { status: 401 }
      );
    }

    const body = await req.json();
    const parsed = createItemSchema.parse(body);

    const category = await prisma.category.findUnique({
      where: { id: parsed.categoryId },
    });

    const isHighValue = parsed.isHighValue || category?.isHighValue || false;

    const item = await prisma.item.create({
      data: {
        institutionId: user.institutionId,
        reporterId: user.id,
        type: parsed.type,
        title: parsed.title,
        description: parsed.description,
        categoryId: parsed.categoryId,
        primaryLocationId: parsed.primaryLocationId,
        incidentDate: new Date(parsed.incidentDate),
        incidentTime: parsed.incidentTime || null,
        status: "ACTIVE",
        isHighValue,
        privateNotes: parsed.privateNotes || null,
        images: parsed.imageUrl
          ? {
              create: {
                url: parsed.imageUrl,
                isPrimary: true,
              },
            }
          : undefined,
      },
      include: {
        category: true,
        primaryLocation: true,
        images: true,
      },
    });

    // Create initial Sighting for the reported location
    await prisma.sighting.create({
      data: {
        itemId: item.id,
        locationId: item.primaryLocationId,
        timestamp: item.incidentDate,
        sightingType: "OBSERVED",
        confidence: 1.0,
        reportedBy: `${user.name} (${parsed.type === "LOST" ? "Owner" : "Finder"})`,
        notes: `Initial ${parsed.type.toLowerCase()} report filed at ${item.primaryLocation.name}.`,
        sequenceOrder: 1,
      },
    });

    await logAudit({
      institutionId: user.institutionId,
      actorId: user.id,
      action: `${parsed.type}_ITEM_REPORTED`,
      entityType: "Item",
      entityId: item.id,
      metadata: { title: item.title, category: category?.name },
    });

    // 🏆 If user reported a FOUND item, award intake points & spendable credits
    if (parsed.type === "FOUND") {
      awardPointsAndCredits({
        userId: user.id,
        points: 15,
        credits: 15,
        type: "FOUND_ITEM_REPORTED",
        description: `Reported found item "${item.title}"`,
        referenceId: item.id,
      }).catch((err) => {
        console.error("[Rewards] Failed to award found item credits:", err);
      });
    }

    // ⚡ Trigger autonomous multi-signal matching in background (non-blocking)
    runAutomaticMatching(item.id).catch((err) => {
      console.error("[AutoMatching] Background matching failed:", err);
    });

    return NextResponse.json(
      {
        success: true,
        data: { item },
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: "VALIDATION_ERROR", message: error.message || "Invalid report payload" } },
      { status: 400 }
    );
  }
}
