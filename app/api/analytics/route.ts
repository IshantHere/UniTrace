import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, requireRole } from "@/lib/auth";
import { ROLES } from "@/lib/constants";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } }, { status: 401 });
  }

  try {
    requireRole(user, [ROLES.ADMIN, ROLES.STAFF, ROLES.SUPER_ADMIN]);
  } catch {
    return NextResponse.json({ success: false, error: { code: "FORBIDDEN", message: "Forbidden" } }, { status: 403 });
  }

  const [
    totalLost,
    totalFound,
    recoveredCount,
    activeMatches,
    duplicateClusters,
    locations,
    categories,
  ] = await Promise.all([
    prisma.item.count({ where: { type: "LOST" } }),
    prisma.item.count({ where: { type: "FOUND" } }),
    prisma.item.count({ where: { status: "RECOVERED" } }),
    prisma.match.count({ where: { overallScore: { gte: 0.75 } } }),
    prisma.duplicateCluster.count(),
    prisma.location.findMany({
      include: {
        _count: { select: { items: true, sightings: true } },
      },
    }),
    prisma.category.findMany({
      include: {
        _count: { select: { items: true } },
      },
    }),
  ]);

  const recoveryRate = totalLost > 0 ? Math.round((recoveredCount / totalLost) * 100) : 0;

  return NextResponse.json({
    success: true,
    data: {
      metrics: {
        totalLost,
        totalFound,
        recoveredCount,
        recoveryRate,
        activeMatches,
        duplicateClusters,
      },
      locations: locations.map((loc) => ({
        id: loc.id,
        name: loc.name,
        building: loc.building,
        itemCount: loc._count.items,
        sightingCount: loc._count.sightings,
      })),
      categories: categories.map((cat) => ({
        id: cat.id,
        name: cat.name,
        isHighValue: cat.isHighValue,
        itemCount: cat._count.items,
      })),
    },
  });
}
