import { describe, expect, it } from "vitest";
import { analyzeCollusionRisk } from "../../lib/anti-fraud/collusion-detector";

describe("UniTrace Anti-Collusion & Farming Detection Engine", () => {
  it("flags direct self-dealing when claimant and finder are identical", async () => {
    const report = await analyzeCollusionRisk({
      claimantId: "user_alice",
      finderId: "user_alice",
      itemId: "item_airpods_123",
      itemCreatedAt: new Date(Date.now() - 3600 * 1000),
      claimCreatedAt: new Date(),
    });

    expect(report.score).toBe(100);
    expect(report.level).toBe("HIGH");
    expect(report.isCollusionSuspected).toBe(true);
    expect(report.flags).toContain("SELF_CLAIM_PROHIBITED");
    expect(report.recommendation).toBe("FLAG_FRAUD");
  });

  it("evaluates genuine legitimate handovers as LOW risk", async () => {
    const report = await analyzeCollusionRisk({
      claimantId: "user_student_alex",
      finderId: "user_finder_maya",
      itemId: "item_laptop_456",
      itemCreatedAt: new Date(Date.now() - 24 * 3600 * 1000), // 24 hours later
      claimCreatedAt: new Date(),
    });

    expect(report.level).toBe("LOW");
    expect(report.score).toBeLessThan(30);
    expect(report.isCollusionSuspected).toBe(false);
    expect(report.recommendation).toBe("APPROVE_SAFE");
  });

  it("detects unnatural instant claiming velocity (< 10 minutes from found report)", async () => {
    const itemTime = new Date();
    const claimTime = new Date(itemTime.getTime() + 2 * 60 * 1000); // 2 minutes later

    const report = await analyzeCollusionRisk({
      claimantId: "user_bob",
      finderId: "user_carol",
      itemId: "item_watch_789",
      itemCreatedAt: itemTime,
      claimCreatedAt: claimTime,
    });

    expect(report.flags).toContain("UNNATURAL_CLAIM_VELOCITY");
    expect(report.details.claimVelocityMinutes).toBe(2);
    expect(report.score).toBeGreaterThanOrEqual(25);
  });
});
