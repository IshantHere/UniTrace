import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { createItemSchema } from "@/lib/validators";
import { logAudit } from "@/lib/audit";
import { runAutomaticMatching } from "@/lib/matching/engine";
import { awardPointsAndCredits } from "@/lib/rewards/engine";
import { sendItemReportNotification } from "@/lib/notifications/item-alert";

export const dynamic = "force-dynamic";
export const revalidate = 0;

declare global {
  var __unitrace_dynamic_items: any[] | undefined;
}
if (!globalThis.__unitrace_dynamic_items) {
  globalThis.__unitrace_dynamic_items = [];
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type"); // LOST | FOUND
    const categoryId = searchParams.get("categoryId");
    const locationId = searchParams.get("locationId");
    const status = searchParams.get("status");
    const query = searchParams.get("query");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "50")));
    const skip = (page - 1) * limit;

    const where: any = {};
    if (type && type !== "ALL") where.type = type;
    if (categoryId) where.categoryId = categoryId;
    if (locationId) where.primaryLocationId = locationId;
    if (status) where.status = status;

    if (query && query.trim()) {
      const trimmed = query.trim();
      const words = trimmed.split(/\s+/).filter((w) => w.length >= 2);

      const conditions: any[] = [
        { title: { contains: trimmed } },
        { description: { contains: trimmed } },
      ];

      for (const word of words) {
        conditions.push({ title: { contains: word } });
        conditions.push({ description: { contains: word } });
        conditions.push({ category: { name: { contains: word } } });
        conditions.push({ primaryLocation: { name: { contains: word } } });
        conditions.push({ primaryLocation: { building: { contains: word } } });
      }

      where.OR = conditions;
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

    // Merge in-memory items from current process
    const inMemoryItems = (globalThis.__unitrace_dynamic_items || []).filter((item) => {
      if (type && type !== "ALL" && item.type !== type) return false;
      if (categoryId && item.categoryId !== categoryId) return false;
      if (locationId && item.primaryLocationId !== locationId) return false;
      if (status && item.status !== status) return false;
      return true;
    });

    const seenIds = new Set(items.map((i) => i.id));
    const mergedItems = [...items];
    for (const mem of inMemoryItems) {
      if (!seenIds.has(mem.id)) {
        seenIds.add(mem.id);
        mergedItems.unshift(mem);
      }
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          items: mergedItems,
          pagination: {
            page,
            limit,
            total: total + inMemoryItems.filter((m) => !seenIds.has(m.id)).length,
            totalPages: Math.ceil((total + inMemoryItems.length) / limit),
          },
        },
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        },
      }
    );
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
        reporter: { select: { id: true, name: true, role: true } },
      },
    });

    // Push to in-memory process registry
    if (globalThis.__unitrace_dynamic_items) {
      const idx = globalThis.__unitrace_dynamic_items.findIndex((i) => i.id === item.id);
      if (idx >= 0) {
        globalThis.__unitrace_dynamic_items[idx] = item;
      } else {
        globalThis.__unitrace_dynamic_items.unshift(item);
      }
    }

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

    // ✈️ Dispatch instant Multi-Channel Alerts (Telegram + WhatsApp + In-App Notifications)
    sendItemReportNotification({
      itemId: item.id,
      type: parsed.type,
      title: item.title,
      description: item.description,
      categoryName: item.category?.name,
      locationName: item.primaryLocation?.name || "Campus Grounds",
      buildingName: item.primaryLocation?.building,
      reporterId: user.id,
      reporterName: user.name,
      reporterRole: user.role,
      imageUrl: item.images?.[0]?.url,
      isHighValue: item.isHighValue,
    }).catch((notifErr) => {
      console.error("[ItemAlert] Failed to dispatch report notification:", notifErr);
    });

    // ⚡ Trigger autonomous multi-signal matching in background
    runAutomaticMatching(item.id).catch((err) => {
      console.error("[AutoMatching] Background matching failed:", err);
    });

    return NextResponse.json(
      {
        success: true,
        data: { item },
      },
      {
        status: 201,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: "VALIDATION_ERROR", message: error.message || "Invalid report payload" } },
      { status: 400 }
    );
  }
}
