import { prisma } from "../prisma";

export type TierLevel = "BRONZE" | "SILVER" | "GOLD" | "PLATINUM";

export interface TierInfo {
  name: TierLevel;
  label: string;
  minPoints: number;
  badge: string;
  color: string;
  haloColor: string;
  perkDescription: string;
}

export const TIER_CONFIG: Record<TierLevel, TierInfo> = {
  BRONZE: {
    name: "BRONZE",
    label: "Bronze Scout",
    minPoints: 0,
    badge: "🥉",
    color: "text-amber-700 bg-amber-50 border-amber-200",
    haloColor: "ring-amber-400/40",
    perkDescription: "Entry finder recognition on campus directory.",
  },
  SILVER: {
    name: "SILVER",
    label: "Silver Detective",
    minPoints: 100,
    badge: "🥈",
    color: "text-slate-700 bg-slate-100 border-slate-300",
    haloColor: "ring-slate-400/50",
    perkDescription: "1.1x Credit booster on all verified returns.",
  },
  GOLD: {
    name: "GOLD",
    label: "Gold Guardian",
    minPoints: 300,
    badge: "🥇",
    color: "text-amber-600 bg-amber-50/80 border-amber-300",
    haloColor: "ring-amber-500/70 shadow-amber-200/50",
    perkDescription: "1.25x Credit booster + Priority Desk Verification.",
  },
  PLATINUM: {
    name: "PLATINUM",
    label: "Platinum Legend",
    minPoints: 700,
    badge: "💎",
    color: "text-purple-700 bg-purple-50 border-purple-200",
    haloColor: "ring-purple-500 shadow-purple-300",
    perkDescription: "Dean's Honor Roll citation + Unlimited express passes.",
  },
};

export const REWARD_RULES = {
  FOUND_ITEM_REPORTED: {
    points: 15,
    credits: 15,
    label: "Reported Found Item",
    desc: "Civic intake credit for logging a found item in the campus registry.",
  },
  SIGHTING_SUBMITTED: {
    points: 10,
    credits: 10,
    label: "Verified Sighting / Waypoint",
    desc: "Contributed a verified item sighting with photo or location waypoint.",
  },
  HANDOVER_BASE: {
    points: 100,
    credits: 100,
    label: "Item Handover Completed",
    desc: "Successfully returned verified property to owner at Security Desk.",
  },
  SPEED_BONUS: {
    points: 50,
    credits: 50,
    label: "Speedy Recovery Bonus",
    desc: "Item reunited with owner in under 24 hours of report.",
  },
  HIGH_VALUE_BONUS: {
    points: 50,
    credits: 50,
    label: "High-Value Custody Bonus",
    desc: "Successfully safeguarded high-value electronics, wallet, or passport.",
  },
};

/**
 * Calculates user's tier based on cumulative lifetime points
 */
export function calculateTier(points: number): TierLevel {
  if (points >= TIER_CONFIG.PLATINUM.minPoints) return "PLATINUM";
  if (points >= TIER_CONFIG.GOLD.minPoints) return "GOLD";
  if (points >= TIER_CONFIG.SILVER.minPoints) return "SILVER";
  return "BRONZE";
}

/**
 * Next tier progression calculation
 */
export function getNextTierProgress(points: number) {
  const currentTier = calculateTier(points);
  if (currentTier === "PLATINUM") {
    return {
      currentTier,
      nextTier: null,
      progressPercent: 100,
      pointsToNext: 0,
    };
  }

  const nextTier: TierLevel =
    currentTier === "BRONZE" ? "SILVER" : currentTier === "SILVER" ? "GOLD" : "PLATINUM";

  const currentMin = TIER_CONFIG[currentTier].minPoints;
  const nextMin = TIER_CONFIG[nextTier].minPoints;
  const span = nextMin - currentMin;
  const earnedInTier = points - currentMin;
  const progressPercent = Math.min(100, Math.max(0, Math.round((earnedInTier / span) * 100)));
  const pointsToNext = Math.max(0, nextMin - points);

  return {
    currentTier,
    nextTier,
    progressPercent,
    pointsToNext,
  };
}

/**
 * Atomic helper to award points and credits to a user
 */
export async function awardPointsAndCredits(params: {
  userId: string;
  points: number;
  credits: number;
  type: string;
  description: string;
  referenceId?: string;
}) {
  const { userId, points, credits, type, description, referenceId } = params;

  return await prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({
      where: { id: userId },
      select: { id: true, points: true, credits: true, tier: true, name: true },
    });

    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }

    const newPoints = user.points + Math.max(0, points);
    const newCredits = user.credits + Math.max(0, credits);
    const newTier = calculateTier(newPoints);
    const leveledUp = newTier !== user.tier;

    // Update user
    const updatedUser = await tx.user.update({
      where: { id: userId },
      data: {
        points: newPoints,
        credits: newCredits,
        tier: newTier,
      },
    });

    // Create immutable ledger transaction
    const transaction = await tx.creditTransaction.create({
      data: {
        userId,
        amount: credits,
        balanceAfter: newCredits,
        type,
        description,
        referenceId,
      },
    });

    // Send in-app notification
    const notificationTitle = leveledUp
      ? `🎉 Level Up! You achieved ${TIER_CONFIG[newTier].label}`
      : `🪙 +${credits} Credits Earned!`;

    const notificationMessage = leveledUp
      ? `Congratulations ${user.name}! With ${newPoints} lifetime points, you reached ${TIER_CONFIG[newTier].label}. ${TIER_CONFIG[newTier].perkDescription}`
      : `${description} (+${points} pts, +${credits} credits). Current balance: ${newCredits} credits.`;

    await tx.notification.create({
      data: {
        userId,
        type: "CLAIM_UPDATE",
        title: notificationTitle,
        message: notificationMessage,
        actionUrl: "/leaderboard",
      },
    });

    return {
      user: updatedUser,
      transaction,
      leveledUp,
      oldTier: user.tier,
      newTier,
    };
  });
}

/**
 * Redeem a campus perk using credits
 */
export async function redeemPerk(params: { userId: string; perkId: string }) {
  const { userId, perkId } = params;

  return await prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({
      where: { id: userId },
      select: { id: true, credits: true, points: true, tier: true },
    });

    if (!user) {
      throw new Error("User not found");
    }

    const perk = await tx.rewardPerk.findUnique({
      where: { id: perkId },
    });

    if (!perk || !perk.isActive) {
      throw new Error("Perk not found or currently unavailable");
    }

    if (perk.stock <= 0) {
      throw new Error("This perk is currently out of stock");
    }

    if (user.credits < perk.costCredits) {
      throw new Error(
        `Insufficient credits. You have ${user.credits} credits, but this reward requires ${perk.costCredits} credits.`
      );
    }

    // Deduct credits & decrement stock
    const newBalance = user.credits - perk.costCredits;
    await tx.user.update({
      where: { id: userId },
      data: { credits: newBalance },
    });

    await tx.rewardPerk.update({
      where: { id: perkId },
      data: { stock: { decrement: 1 } },
    });

    // Generate unique voucher PIN code (e.g. RC-COFFEE-A729)
    const categoryPrefix = perk.category.replace(/[^A-Z]/g, "").slice(0, 4) || "PERK";
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const redemptionCode = `RC-${categoryPrefix}-${randomSuffix}`;

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30-day validity

    const redemption = await tx.rewardRedemption.create({
      data: {
        userId,
        perkId,
        redemptionCode,
        creditsSpent: perk.costCredits,
        status: "ACTIVE",
        expiresAt,
      },
      include: {
        perk: true,
      },
    });

    // Record negative debit transaction
    const transaction = await tx.creditTransaction.create({
      data: {
        userId,
        amount: -perk.costCredits,
        balanceAfter: newBalance,
        type: "REWARD_REDEEMED",
        description: `Redeemed voucher: ${perk.title}`,
        referenceId: redemption.id,
      },
    });

    // Create confirmation notification
    await tx.notification.create({
      data: {
        userId,
        type: "CLAIM_UPDATE",
        title: `🎁 Voucher Ready: ${perk.title}`,
        message: `Your voucher code is ${redemptionCode}. Show this code at the campus desk before ${expiresAt.toLocaleDateString()}.`,
        actionUrl: "/leaderboard?tab=vouchers",
      },
    });

    return {
      redemption,
      transaction,
      newBalance,
    };
  });
}
