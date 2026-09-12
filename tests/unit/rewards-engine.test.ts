import { describe, expect, it } from "vitest";
import { calculateTier, getNextTierProgress, awardPointsAndCredits, redeemPerk } from "../../lib/rewards/engine";
import { prisma } from "../../lib/prisma";

describe("Campus Finder Rewards & Credit Economy Engine", () => {
  it("calculates correct tier progression based on lifetime reputation points", () => {
    expect(calculateTier(0)).toBe("BRONZE");
    expect(calculateTier(50)).toBe("BRONZE");
    expect(calculateTier(99)).toBe("BRONZE");

    expect(calculateTier(100)).toBe("SILVER");
    expect(calculateTier(250)).toBe("SILVER");
    expect(calculateTier(299)).toBe("SILVER");

    expect(calculateTier(300)).toBe("GOLD");
    expect(calculateTier(500)).toBe("GOLD");
    expect(calculateTier(699)).toBe("GOLD");

    expect(calculateTier(700)).toBe("PLATINUM");
    expect(calculateTier(1500)).toBe("PLATINUM");
  });

  it("calculates accurate next-tier progress and points needed", () => {
    // Bronze with 50 points (needs 50 more to reach Silver at 100)
    const bronzeProgress = getNextTierProgress(50);
    expect(bronzeProgress.currentTier).toBe("BRONZE");
    expect(bronzeProgress.nextTier).toBe("SILVER");
    expect(bronzeProgress.progressPercent).toBe(50);
    expect(bronzeProgress.pointsToNext).toBe(50);

    // Silver with 200 points (tier span is 100 to 300, 100/200 = 50%)
    const silverProgress = getNextTierProgress(200);
    expect(silverProgress.currentTier).toBe("SILVER");
    expect(silverProgress.nextTier).toBe("GOLD");
    expect(silverProgress.progressPercent).toBe(50);
    expect(silverProgress.pointsToNext).toBe(100);

    // Platinum cap
    const platProgress = getNextTierProgress(850);
    expect(platProgress.currentTier).toBe("PLATINUM");
    expect(platProgress.nextTier).toBeNull();
    expect(platProgress.progressPercent).toBe(100);
    expect(platProgress.pointsToNext).toBe(0);
  });

  it("awards points and credits atomically and logs immutable ledger transaction", async () => {
    // Pick or create test user
    const testUser = await prisma.user.findFirst({
      where: { email: "jordan@apex.edu" },
    });
    expect(testUser).toBeDefined();

    const initialPoints = testUser!.points;
    const initialCredits = testUser!.credits;

    const result = await awardPointsAndCredits({
      userId: testUser!.id,
      points: 25,
      credits: 25,
      type: "FOUND_ITEM_REPORTED",
      description: "Test found item intake reward",
    });

    expect(result.user.points).toBe(initialPoints + 25);
    expect(result.user.credits).toBe(initialCredits + 25);
    expect(result.transaction.amount).toBe(25);
    expect(result.transaction.balanceAfter).toBe(initialCredits + 25);
    expect(result.transaction.type).toBe("FOUND_ITEM_REPORTED");

    // Verify transaction exists in DB
    const tx = await prisma.creditTransaction.findUnique({
      where: { id: result.transaction.id },
    });
    expect(tx).toBeDefined();
    expect(tx?.description).toBe("Test found item intake reward");
  });

  it("allows spending credits on campus perks and generates digital voucher code", async () => {
    const user = await prisma.user.findFirst({
      where: { email: "sam@apex.edu" }, // Has 420 credits
    });
    expect(user).toBeDefined();
    expect(user!.credits).toBeGreaterThanOrEqual(100);

    const perk = await prisma.rewardPerk.findFirst({
      where: { costCredits: { lte: 100 }, stock: { gt: 0 } },
    });
    expect(perk).toBeDefined();

    const initialCredits = user!.credits;
    const initialStock = perk!.stock;

    const result = await redeemPerk({
      userId: user!.id,
      perkId: perk!.id,
    });

    expect(result.newBalance).toBe(initialCredits - perk!.costCredits);
    expect(result.redemption.redemptionCode).toMatch(/^RC-/);
    expect(result.redemption.status).toBe("ACTIVE");
    expect(result.transaction.amount).toBe(-perk!.costCredits);

    // Verify stock decremented
    const refreshedPerk = await prisma.rewardPerk.findUnique({
      where: { id: perk!.id },
    });
    expect(refreshedPerk?.stock).toBe(initialStock - 1);
  });

  it("rejects redemption if user has insufficient credits", async () => {
    // Create a temporary poor user
    const poorUser = await prisma.user.create({
      data: {
        institutionId: "inst_apex_university",
        name: "Test Low Balance",
        email: `poor_${Date.now()}@apex.edu`,
        passwordHash: "hash123",
        credits: 10,
        points: 10,
      },
    });

    const expensivePerk = await prisma.rewardPerk.findFirst({
      where: { costCredits: { gt: 50 } },
    });
    expect(expensivePerk).toBeDefined();

    await expect(
      redeemPerk({
        userId: poorUser.id,
        perkId: expensivePerk!.id,
      })
    ).rejects.toThrow(/Insufficient credits/);

    // Clean up
    await prisma.user.delete({ where: { id: poorUser.id } });
  });
});
