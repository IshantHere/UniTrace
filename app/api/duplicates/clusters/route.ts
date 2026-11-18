import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, requireRole } from "@/lib/auth";
import { ROLES } from "@/lib/constants";

export async function GET(req: NextRequest) {
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

    const clusters = await prisma.duplicateCluster.findMany({
      include: {
        canonicalItem: {
          include: { category: true, primaryLocation: true, images: true },
        },
        members: {
          include: {
            item: {
              include: {
                category: true,
                primaryLocation: true,
                images: true,
                reporter: { select: { id: true, name: true, email: true } },
              },
            },
          },
        },
      },
      orderBy: { detectedAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      data: { clusters },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: error.message || "Failed to fetch duplicate clusters" } },
      { status: 500 }
    );
  }
}
