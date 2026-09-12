import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { getNextTierProgress, TIER_CONFIG } from "@/lib/rewards/engine";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser().catch(() => null);

    const perks = await prisma.rewardPerk.findMany({
      where: { isActive: true },
      orderBy: { costCredits: "asc" },
    });

    let userData = null;
    if (user) {
      const refreshedUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: {
          id: true,
          name: true,
          points: true,
          credits: true,
          tier: true,
          creditTransactions: {
            orderBy: { createdAt: "desc" },
            take: 20,
          },
          redemptions: {
            where: { status: "ACTIVE" },
            include: { perk: true },
            orderBy: { createdAt: "desc" },
          },
        },
      });

      if (refreshedUser) {
        const progress = getNextTierProgress(refreshedUser.points);
        userData = {
          id: refreshedUser.id,
          name: refreshedUser.name,
          points: refreshedUser.points,
          credits: refreshedUser.credits,
          tier: refreshedUser.tier,
          tierInfo: TIER_CONFIG[refreshedUser.tier as keyof typeof TIER_CONFIG] || TIER_CONFIG.BRONZE,
          transactions: refreshedUser.creditTransactions,
          activeRedemptions: refreshedUser.redemptions,
          ...progress,
        };
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        perks,
        user: userData,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: "REWARDS_ERROR", message: error.message } },
      { status: 500 }
    );
  }
}
