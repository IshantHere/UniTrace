/**
 * lib/anti-fraud/collusion-detector.ts
 *
 * UniTrace Collusion & Sybil Farming Detection Engine
 *
 * Detects and prevents collusive behavior where friends or linked accounts
 * manufacture artificial lost-and-found transactions to farm reputation points,
 * climb leaderboards, and fraudulently redeem campus reward credits.
 */

import { prisma } from "../prisma";

export interface CollusionRiskReport {
  score: number; // 0 to 100
  level: "LOW" | "MEDIUM" | "HIGH";
  flags: string[];
  reasons: string[];
  isCollusionSuspected: boolean;
  recommendation: "APPROVE_SAFE" | "REQUIRE_SUPERVISOR" | "FLAG_FRAUD";
  details: {
    selfDealing: boolean;
    reciprocalHandoverCount: number;
    claimVelocityMinutes: number;
    claimantWeeklyClaims: number;
    finderWeeklyTurnIns: number;
  };
}

export async function analyzeCollusionRisk(params: {
  claimantId: string;
  finderId?: string | null;
  itemId: string;
  itemCreatedAt?: Date | string;
  claimCreatedAt?: Date | string;
}): Promise<CollusionRiskReport> {
  const { claimantId, finderId, itemId } = params;
  const flags: string[] = [];
  const reasons: string[] = [];
  let score = 0;

  // 1. Direct Self-Dealing Check (User claiming an item they reported finding)
  const isSelfDealing = Boolean(finderId && claimantId && finderId === claimantId);
  if (isSelfDealing) {
    flags.push("SELF_CLAIM_PROHIBITED");
    reasons.push("Claimant and finder are the same user account (self-dealing).");
    score += 100;
  }

  // 2. Reciprocal Interaction History (Alice finds Bob's item, Bob finds Alice's item)
  let reciprocalCount = 0;
  if (finderId && finderId !== claimantId) {
    try {
      const pastPairs = await prisma.claim.count({
        where: {
          OR: [
            // Claimant previously claimed items found by this finder
            {
              claimantId,
              item: { reporterId: finderId },
              status: { in: ["HANDOVER_SCHEDULED", "COMPLETED"] },
            },
            // Finder previously claimed items found by this claimant
            {
              claimantId: finderId,
              item: { reporterId: claimantId },
              status: { in: ["HANDOVER_SCHEDULED", "COMPLETED"] },
            },
          ],
        },
      });
      reciprocalCount = pastPairs;

      if (pastPairs >= 2) {
        flags.push("RECIPROCAL_PAIR_CYCLING");
        reasons.push(
          `Claimant and finder have a history of ${pastPairs} mutual recovery handovers (suspicious buddy loop).`
        );
        score += Math.min(50, pastPairs * 20);
      }
    } catch {
      // Graceful fallback if database index unavailable
    }
  }

  // 3. Temporal Claim Velocity Anomaly (Instant claim after intake)
  const itemDate = params.itemCreatedAt ? new Date(params.itemCreatedAt).getTime() : Date.now();
  const claimDate = params.claimCreatedAt ? new Date(params.claimCreatedAt).getTime() : Date.now();
  const elapsedMinutes = Math.max(0, Math.round((claimDate - itemDate) / (1000 * 60)));

  if (elapsedMinutes < 10 && elapsedMinutes >= 0 && finderId && finderId !== claimantId) {
    flags.push("UNNATURAL_CLAIM_VELOCITY");
    reasons.push(
      `Claim filed within ${elapsedMinutes} minute(s) of found intake (unnatural discovery speed without campus search journey).`
    );
    score += 25;
  }

  // 4. Weekly Velocity Quota Check (Burst activity)
  let claimantWeekly = 0;
  let finderWeekly = 0;
  try {
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    [claimantWeekly, finderWeekly] = await Promise.all([
      prisma.claim.count({
        where: {
          claimantId,
          createdAt: { gte: oneWeekAgo },
        },
      }),
      finderId
        ? prisma.item.count({
            where: {
              reporterId: finderId,
              type: "FOUND",
              createdAt: { gte: oneWeekAgo },
            },
          })
        : 0,
    ]);

    if (claimantWeekly > 3) {
      flags.push("CLAIMANT_BURST_VOLUME");
      reasons.push(`Claimant has filed ${claimantWeekly} claims in the past 7 days.`);
      score += 15;
    }

    if (finderWeekly > 5) {
      flags.push("FINDER_HIGH_VELOCITY");
      reasons.push(`Finder has logged ${finderWeekly} found items in the past 7 days.`);
      score += 15;
    }
  } catch {
    // Non-blocking fallback
  }

  const normalizedScore = Math.min(100, Math.max(0, score));
  const level: "LOW" | "MEDIUM" | "HIGH" =
    normalizedScore >= 60 ? "HIGH" : normalizedScore >= 30 ? "MEDIUM" : "LOW";

  const isCollusionSuspected = level === "HIGH";
  const recommendation =
    level === "HIGH"
      ? "FLAG_FRAUD"
      : level === "MEDIUM"
      ? "REQUIRE_SUPERVISOR"
      : "APPROVE_SAFE";

  return {
    score: normalizedScore,
    level,
    flags,
    reasons,
    isCollusionSuspected,
    recommendation,
    details: {
      selfDealing: isSelfDealing,
      reciprocalHandoverCount: reciprocalCount,
      claimVelocityMinutes: elapsedMinutes,
      claimantWeeklyClaims: claimantWeekly,
      finderWeeklyTurnIns: finderWeekly,
    },
  };
}
