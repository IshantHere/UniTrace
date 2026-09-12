import { beforeAll, describe, expect, it, vi } from "vitest";
import { runAutomaticMatching } from "../../lib/matching/engine";
import { bus } from "../../lib/realtime/bus";
import { prisma } from "../../lib/prisma";

describe("Autonomous Real-Time Matching Engine", () => {
  beforeAll(async () => {
    await prisma.item.update({
      where: { id: "item_lost_airpods" },
      data: { status: "MATCH_PENDING" },
    });
  });

  it("returns empty array for non-existent item id", async () => {
    const results = await runAutomaticMatching("item_does_not_exist_9999");
    expect(results).toEqual([]);
  });

  it("evaluates multi-signal match and emits targeted real-time alert for lost item owner", async () => {
    const matchListener = vi.fn();
    bus.on("match_detected", matchListener);

    // Run matching on the golden found item (item_found_airpods)
    const matches = await runAutomaticMatching("item_found_airpods");

    expect(matches.length).toBeGreaterThanOrEqual(1);

    const topMatch = matches[0];
    expect(topMatch.overallScore).toBeGreaterThanOrEqual(0.65);
    expect(topMatch.evidence.length).toBeGreaterThanOrEqual(4);

    // Verify real-time pusher event was emitted to the exact recipient
    expect(matchListener).toHaveBeenCalled();
    const matchingCall = matchListener.mock.calls.find(
      (c: any[]) => c[0].lostItemId === "item_lost_airpods"
    );
    expect(matchingCall).toBeDefined();
    const event = matchingCall![0];

    expect(event.lostItemId).toBe("item_lost_airpods");
    expect(event.score).toBeGreaterThanOrEqual(0.65);
    expect(event.recipientUserId).toBeDefined();

    bus.off("match_detected", matchListener);
  });

  it("works symmetrically when invoked on a LOST item", async () => {
    const matches = await runAutomaticMatching("item_lost_airpods");
    expect(matches.length).toBeGreaterThanOrEqual(1);

    const matchWithAirpods = matches.find((m) => m.foundItemId === "item_found_airpods");
    expect(matchWithAirpods).toBeDefined();
    expect(matchWithAirpods?.overallScore).toBeGreaterThanOrEqual(0.65);
  });
});
