import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    const item = await prisma.item.findUnique({
      where: { id: params.id },
      include: {
        category: true,
        primaryLocation: true,
        images: true,
        visualFingerprint: true,
        reporter: {
          select: { id: true, name: true, role: true },
        },
        sightings: {
          include: { location: true },
          orderBy: { sequenceOrder: "asc" },
        },
        claimsReceived: {
          include: {
            claimant: { select: { id: true, name: true, email: true } },
            verifications: true,
            handoverRecord: true,
          },
        },
        lostMatches: {
          include: {
            foundItem: {
              include: { images: true, primaryLocation: true },
            },
            evidence: true,
          },
          orderBy: { overallScore: "desc" },
        },
        foundMatches: {
          include: {
            lostItem: {
              include: { images: true, primaryLocation: true },
            },
            evidence: true,
          },
          orderBy: { overallScore: "desc" },
        },
      },
    });

    if (!item) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Item not found" } },
        { status: 404 }
      );
    }

    const isStaffOrAdmin = user?.role && ["STAFF", "ADMIN", "SUPER_ADMIN"].includes(user.role);
    const isOwner = user?.id === item.reporterId;

    // Security & Zero-Knowledge: Redact sensitive notes and claims for unauthorized public viewers
    const sanitizedItem = {
      ...item,
      privateNotes: isStaffOrAdmin || isOwner ? item.privateNotes : undefined,
      claimsReceived: isStaffOrAdmin ? item.claimsReceived : undefined,
    };

    return NextResponse.json({
      success: true,
      data: { item: sanitizedItem },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: error.message || "Failed to fetch item" } },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } },
        { status: 401 }
      );
    }

    const item = await prisma.item.findUnique({
      where: { id: params.id },
    });

    if (!item) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Item not found" } },
        { status: 404 }
      );
    }

    const isStaffOrAdmin = ["STAFF", "ADMIN", "SUPER_ADMIN"].includes(user.role);
    const isOwner = user.id === item.reporterId;

    if (!isStaffOrAdmin && !isOwner) {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "Not permitted to edit this item" } },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { status, title, description, categoryId, primaryLocationId, privateNotes } = body;

    const updated = await prisma.item.update({
      where: { id: params.id },
      data: {
        status: status || undefined,
        title: title || undefined,
        description: description || undefined,
        categoryId: categoryId || undefined,
        primaryLocationId: primaryLocationId || undefined,
        privateNotes: privateNotes !== undefined ? privateNotes : undefined,
      },
      include: {
        category: true,
        primaryLocation: true,
        images: true,
      },
    });

    await logAudit({
      institutionId: user.institutionId,
      actorId: user.id,
      action: "ITEM_UPDATED",
      entityType: "Item",
      entityId: updated.id,
      metadata: { previousStatus: item.status, newStatus: updated.status },
    });

    return NextResponse.json({
      success: true,
      data: { item: updated },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: "UPDATE_FAILED", message: error.message || "Failed to update item" } },
      { status: 500 }
    );
  }
}
