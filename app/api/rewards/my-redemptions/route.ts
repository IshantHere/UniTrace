import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } },
        { status: 401 }
      );
    }

    const redemptions = await prisma.rewardRedemption.findMany({
      where: { userId: user.id },
      include: { perk: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      data: { redemptions },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: "FETCH_FAILED", message: error.message } },
      { status: 500 }
    );
  }
}
