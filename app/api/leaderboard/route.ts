import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { getNextTierProgress, TIER_CONFIG } from "@/lib/rewards/engine";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser().catch(() => null);

    // Fetch top 50 finders ordered by lifetime points
    const topUsers = await prisma.user.findMany({
      where: {
        points: { gt: 0 },
        isActive: true,
      },
      orderBy: [{ points: "desc" }, { createdAt: "asc" }],
      take: 50,
      select: {
        id: true,
        name: true,
        role: true,
        avatarUrl: true,
        points: true,
        credits: true,
        tier: true,
        createdAt: true,
        reportedItems: {
          where: { type: "FOUND" },
          select: { id: true, status: true },
        },
      },
    });

    const leaderboard = topUsers.map((u, index) => {
      const returnedCount = u.reportedItems.filter((i) => i.status === "RECOVERED").length;
      const totalReported = u.reportedItems.length;
      const tierInfo = TIER_CONFIG[u.tier as keyof typeof TIER_CONFIG] || TIER_CONFIG.BRONZE;

      return {
        rank: index + 1,
        id: u.id,
        name: u.name,
        role: u.role,
        avatarUrl: u.avatarUrl,
        points: u.points,
        credits: u.credits,
        tier: u.tier,
        tierInfo,
        itemsReturnedCount: returnedCount,
        totalFoundReported: totalReported,
      };
    });

    // Campus-wide metrics
    const [totalRecoveries, totalTransactions, totalFinders] = await Promise.all([
      prisma.item.count({ where: { status: "RECOVERED" } }),
      prisma.creditTransaction.aggregate({
        _sum: { amount: true },
        where: { amount: { gt: 0 } },
      }),
      prisma.user.count({ where: { points: { gt: 0 } } }),
    ]);

    // Current user's specific ranking
    let userRankData = null;
    if (user) {
      const userRank =
        (await prisma.user.count({
          where: {
            points: { gt: user.points },
            isActive: true,
          },
        })) + 1;

      const progress = getNextTierProgress(user.points);

      userRankData = {
        rank: userRank,
        id: user.id,
        name: user.name,
        points: user.points,
        credits: user.credits,
        tier: user.tier,
        tierInfo: TIER_CONFIG[user.tier as keyof typeof TIER_CONFIG] || TIER_CONFIG.BRONZE,
        ...progress,
      };
    }

    return NextResponse.json({
      success: true,
      data: {
        leaderboard,
        stats: {
          totalRecoveries,
          totalCreditsAwarded: totalTransactions._sum.amount || 0,
          activeFindersCount: totalFinders,
        },
        currentUserRank: userRankData,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: "LEADERBOARD_ERROR", message: error.message } },
      { status: 500 }
    );
  }
}
