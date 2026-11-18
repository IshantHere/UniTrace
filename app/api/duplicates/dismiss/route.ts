import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, requireRole } from "@/lib/auth";
import { ROLES } from "@/lib/constants";
import { logAudit } from "@/lib/audit";

export async function POST(req: NextRequest) {
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

    const { clusterId, notes } = await req.json();

    const cluster = await prisma.duplicateCluster.update({
      where: { id: clusterId },
      data: { status: "DISMISSED" },
    });

    await logAudit({
      institutionId: cluster.institutionId,
      actorId: user.id,
      action: "CLUSTER_DISMISSED",
      entityType: "DuplicateCluster",
      entityId: cluster.id,
      metadata: { notes: notes || "Staff dismissed duplicate cluster as separate items" },
    });

    return NextResponse.json({ success: true, data: { dismissed: true } });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: "DISMISS_FAILED", message: error.message || "Failed to dismiss cluster" } },
      { status: 400 }
    );
  }
}
