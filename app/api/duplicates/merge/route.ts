import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, requireRole } from "@/lib/auth";
import { ROLES } from "@/lib/constants";
import { mergeDuplicatesSchema } from "@/lib/validators";
import { mergeDuplicateReports } from "@/lib/duplicates/merger";

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

    const body = await req.json();
    const parsed = mergeDuplicatesSchema.parse(body);

    const result = await mergeDuplicateReports({
      clusterId: parsed.clusterId,
      canonicalItemId: parsed.canonicalItemId,
      itemIdsToMerge: parsed.itemIds,
      staffUserId: user.id,
      notes: parsed.notes,
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: "MERGE_FAILED", message: error.message || "Failed to merge duplicates" } },
      { status: 400 }
    );
  }
}
