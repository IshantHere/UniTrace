import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { redeemPerk } from "@/lib/rewards/engine";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Please log in to redeem campus rewards" } },
        { status: 401 }
      );
    }

    const body = await req.json();
    if (!body.perkId) {
      return NextResponse.json(
        { success: false, error: { code: "MISSING_FIELD", message: "perkId is required" } },
        { status: 400 }
      );
    }

    const result = await redeemPerk({
      userId: user.id,
      perkId: body.perkId,
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: "REDEMPTION_FAILED", message: error.message || "Failed to redeem perk" } },
      { status: 400 }
    );
  }
}
