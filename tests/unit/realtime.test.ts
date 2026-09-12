import { describe, expect, it, vi } from "vitest";
import { bus, emitMatchFound, emitClaimStatusChanged, RealtimeMatchEvent, RealtimeClaimEvent } from "../../lib/realtime/bus";

describe("Native Real-Time Notification Pusher (Event Bus)", () => {
  it("initializes singleton bus with multi-listener support", () => {
    expect(bus).toBeDefined();
    expect(bus.getMaxListeners()).toBeGreaterThanOrEqual(50);
  });

  it("publishes and delivers match_detected events to active subscribers", async () => {
    const mockListener = vi.fn();
    bus.on("match_detected", mockListener);

    const testMatch: RealtimeMatchEvent = {
      matchId: "match_realtime_001",
      lostItemId: "item_lost_airpods",
      foundItemId: "item_found_airpods",
      itemTitle: "AirPods Pro (White)",
      itemImage: "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434",
      score: 0.94,
      confidenceTier: "EXCEPTIONAL",
      locationName: "Library Steps",
      recipientUserId: "user_alex_chen",
      timestamp: new Date().toISOString(),
    };

    emitMatchFound(testMatch);

    expect(mockListener).toHaveBeenCalledTimes(1);
    expect(mockListener).toHaveBeenCalledWith(testMatch);

    bus.off("match_detected", mockListener);
  });

  it("publishes and delivers claim_updated events to active subscribers", async () => {
    const mockClaimListener = vi.fn();
    bus.on("claim_updated", mockClaimListener);

    const testClaim: RealtimeClaimEvent = {
      claimId: "claim_001",
      itemId: "item_found_airpods",
      itemTitle: "AirPods Pro (White)",
      status: "HANDOVER_SCHEDULED",
      recipientUserId: "user_alex_chen",
      handoverCode: "RC-8841",
      timestamp: new Date().toISOString(),
    };

    emitClaimStatusChanged(testClaim);

    expect(mockClaimListener).toHaveBeenCalledTimes(1);
    expect(mockClaimListener).toHaveBeenCalledWith(testClaim);

    bus.off("claim_updated", mockClaimListener);
  });

  it("supports concurrent multi-subscriber fan-out without loss", () => {
    const sub1 = vi.fn();
    const sub2 = vi.fn();

    bus.on("match_detected", sub1);
    bus.on("match_detected", sub2);

    const event: RealtimeMatchEvent = {
      matchId: "match_fanout_test",
      lostItemId: "item_1",
      foundItemId: "item_2",
      itemTitle: "Hydro Flask",
      score: 0.88,
      confidenceTier: "HIGH",
      locationName: "Gym",
      recipientUserId: "user_alex",
      timestamp: new Date().toISOString(),
    };

    emitMatchFound(event);

    expect(sub1).toHaveBeenCalledWith(event);
    expect(sub2).toHaveBeenCalledWith(event);

    bus.off("match_detected", sub1);
    bus.off("match_detected", sub2);
  });
});
