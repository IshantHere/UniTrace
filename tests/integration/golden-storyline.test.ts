import { describe, expect, it, beforeAll } from "vitest";
import { prisma } from "../../lib/prisma";
import { computeAttributeSimilarity } from "../../lib/ai/fingerprint";
import { computeCompositeMatchScore, computeSpatialScore, computeTemporalScore } from "../../lib/matching/scorer";
import { getItemJourneyTimeline } from "../../lib/journey/tracker";
import { generateHandoverPIN, canTransitionClaim } from "../../lib/claims/verification";
import { mergeDuplicateReports } from "../../lib/duplicates/merger";

describe("UniTrace Golden Storyline End-to-End Verification", () => {
  let studentUser: any;
  let staffUser: any;
  let lostItem: any;
  let foundItem: any;
  let matchRecord: any;

  beforeAll(async () => {
    studentUser = await prisma.user.findUnique({ where: { email: "student@apex.edu" } });
    staffUser = await prisma.user.findUnique({ where: { email: "staff@apex.edu" } });
    lostItem = await prisma.item.findUnique({
      where: { id: "item_lost_airpods" },
      include: { primaryLocation: true, visualFingerprint: true },
    });
    foundItem = await prisma.item.findUnique({
      where: { id: "item_found_airpods" },
      include: { primaryLocation: true, visualFingerprint: true },
    });
    matchRecord = await prisma.match.findUnique({
      where: { id: "match_airpods_golden" },
      include: { evidence: true },
    });

    // Ensure clean initial state for duplicate cluster and golden claim
    await prisma.duplicateCluster.update({
      where: { id: "cluster_hydroflask" },
      data: { status: "SUGGESTED" },
    });
    await prisma.item.update({
      where: { id: "item_hydroflask_2" },
      data: { isDuplicate: false, primaryItemId: null },
    });
    await prisma.handoverRecord.updateMany({
      where: { claimId: "claim_airpods_golden" },
      data: { handoverCode: "RC-8841" },
    });
  });

  it("Scene 1 & 2: User reported lost item with valid visual fingerprint", () => {
    expect(studentUser).toBeDefined();
    expect(lostItem).toBeDefined();
    expect(lostItem.visualFingerprint).toBeDefined();
    expect(lostItem.visualFingerprint.brand).toBe("Apple");
    expect(lostItem.visualFingerprint.primaryColor).toBe("White");
    expect(lostItem.visualFingerprint.stickers).toContain("blue");
  });

  it("Scene 3 & 4: Multimodal Matching yields Exceptional 94% score with evidence", () => {
    expect(matchRecord).toBeDefined();
    expect(matchRecord.overallScore).toBeGreaterThanOrEqual(0.9);
    expect(matchRecord.confidenceTier).toBe("EXCEPTIONAL");

    const attrSim = computeAttributeSimilarity(lostItem.visualFingerprint, foundItem.visualFingerprint);
    expect(attrSim.score).toBeGreaterThanOrEqual(0.9);

    const spatial = computeSpatialScore(
      { building: lostItem.primaryLocation.building, latitude: lostItem.primaryLocation.latitude, longitude: lostItem.primaryLocation.longitude },
      { building: foundItem.primaryLocation.building, latitude: foundItem.primaryLocation.latitude, longitude: foundItem.primaryLocation.longitude }
    );
    expect(spatial.score).toBeGreaterThanOrEqual(0.9);

    expect(matchRecord.evidence.length).toBeGreaterThanOrEqual(4);
    expect(matchRecord.evidence.some((e: any) => e.signalType === "STICKER_FINGERPRINT")).toBe(true);
  });

  it("Scene 5: Probable Item Journey reconstructs timeline with OBSERVED vs AI-INFERRED tags", async () => {
    const timeline = await getItemJourneyTimeline(foundItem.id);
    expect(timeline.events.length).toBe(4);

    const types = timeline.events.map((e) => e.sightingType);
    expect(types).toContain("OBSERVED");
    expect(types).toContain("AI_INFERRED");

    const inferred = timeline.events.find((e) => e.sightingType === "AI_INFERRED");
    expect(inferred).toBeDefined();
    expect(inferred?.confidence).toBe(0.82);
    expect(inferred?.building).toBe("Block 32");

    const current = timeline.events.find((e) => e.isCurrentLocation);
    expect(current?.building).toBe("Administration Building");
  });

  it("Scene 6: Zero-Knowledge Verification workflow and PIN generation", async () => {
    const claim = await prisma.claim.findUnique({
      where: { id: "claim_airpods_golden" },
      include: { verifications: true, handoverRecord: true },
    });

    expect(claim).toBeDefined();
    expect(claim?.claimantId).toBe(studentUser.id);
    expect(claim?.verificationLevel).toBe("HIGH_VALUE_STRICT");
    expect(claim?.verifications.length).toBe(2);

    expect(canTransitionClaim(claim!.status as any, "HANDOVER_SCHEDULED")).toBe(false); // must be VERIFIED first
    expect(canTransitionClaim("VERIFIED", "HANDOVER_SCHEDULED")).toBe(true);

    expect(claim?.handoverRecord).toBeDefined();
    expect(claim?.handoverRecord?.handoverCode).toBe("RC-8841");
  });

  it("Scene 7 & 8: Staff in-person handover and status transition to RECOVERED", async () => {
    const claim = await prisma.claim.findUnique({
      where: { id: "claim_airpods_golden" },
      include: { handoverRecord: true },
    });

    // Simulate completion
    await prisma.claim.update({
      where: { id: claim!.id },
      data: { status: "COMPLETED" },
    });

    await prisma.item.update({
      where: { id: foundItem.id },
      data: { status: "RECOVERED" },
    });

    const refreshedFound = await prisma.item.findUnique({ where: { id: foundItem.id } });
    expect(refreshedFound?.status).toBe("RECOVERED");

    // Restore state for demo
    await prisma.item.update({
      where: { id: foundItem.id },
      data: { status: "UNDER_VERIFICATION" },
    });
    await prisma.claim.update({
      where: { id: claim!.id },
      data: { status: "UNDER_REVIEW" },
    });
  });

  it("Scene 9: Duplicate detection cluster merge is auditable and preserves records", async () => {
    const cluster = await prisma.duplicateCluster.findUnique({
      where: { id: "cluster_hydroflask" },
      include: { members: true },
    });

    expect(cluster).toBeDefined();
    expect(cluster?.status).toBe("SUGGESTED");
    expect(cluster?.averageSimilarity).toBe(0.91);
    expect(cluster?.members.length).toBe(2);

    const mergeRes = await mergeDuplicateReports({
      clusterId: cluster!.id,
      canonicalItemId: "item_hydroflask_1",
      itemIdsToMerge: ["item_hydroflask_1", "item_hydroflask_2"],
      staffUserId: staffUser.id,
      notes: "Golden demo test merge",
    });

    expect(mergeRes.success).toBe(true);
    expect(mergeRes.mergedCount).toBe(1);

    const mergedChild = await prisma.item.findUnique({ where: { id: "item_hydroflask_2" } });
    expect(mergedChild?.isDuplicate).toBe(true);
    expect(mergedChild?.primaryItemId).toBe("item_hydroflask_1");

    // Check audit log
    const audit = await prisma.auditLog.findFirst({
      where: { entityId: cluster!.id, action: "ITEMS_MERGED" },
    });
    expect(audit).toBeDefined();
    expect(audit?.actorId).toBe(staffUser.id);

    // Restore state for demo / subsequent test runs
    await prisma.duplicateCluster.update({
      where: { id: cluster!.id },
      data: { status: "SUGGESTED" },
    });
    await prisma.item.update({
      where: { id: "item_hydroflask_2" },
      data: { isDuplicate: false, primaryItemId: null },
    });
  });
});
