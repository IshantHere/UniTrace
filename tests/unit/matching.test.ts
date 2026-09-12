import { describe, expect, it } from "vitest";
import {
  computeHaversineDistanceMeters,
  computeSpatialScore,
  computeTemporalScore,
  computeCompositeMatchScore,
} from "../../lib/matching/scorer";
import { compileMatchEvidence } from "../../lib/matching/evidence";

describe("UniTrace Multimodal Matching Engine", () => {
  it("computes Haversine distance correctly between campus points", () => {
    // Library to Block 32 on campus (~140m)
    const d = computeHaversineDistanceMeters(37.7749, -122.4194, 37.7758, -122.4182);
    expect(d).toBeGreaterThan(100);
    expect(d).toBeLessThan(200);
  });

  it("awards 1.0 spatial score for exact same building", () => {
    const res = computeSpatialScore(
      { building: "Main Library", latitude: 37.7749, longitude: -122.4194 },
      { building: "Main Library", latitude: 37.7751, longitude: -122.4191 }
    );
    expect(res.score).toBe(1.0);
    expect(res.reason).toContain("Exact same campus building");
  });

  it("evaluates temporal window compatibility", () => {
    const tLost = new Date("2026-09-10T16:30:00Z");
    const tFound = new Date("2026-09-10T17:05:00Z"); // 35 min later

    const res = computeTemporalScore(tLost, tFound);
    expect(res.score).toBeGreaterThanOrEqual(0.9);
    expect(res.diffHours).toBeLessThanOrEqual(1);
  });

  it("computes composite score and classifies EXCEPTIONAL confidence tier", () => {
    const signals = {
      visualScore: 0.96,
      semanticScore: 0.93,
      attributeScore: 0.95,
      spatialScore: 0.92,
      temporalScore: 0.94,
    };

    const result = computeCompositeMatchScore(signals);
    expect(result.overallScore).toBeGreaterThanOrEqual(0.9);
    expect(result.confidenceTier).toBe("EXCEPTIONAL");
  });

  it("compiles structured explainable evidence cards", () => {
    const evidence = compileMatchEvidence({
      categoryMatch: true,
      categoryName: "Audio & Headphones",
      visualScore: 0.95,
      semanticScore: 0.92,
      attributeReasons: ["Distinctive blue sticker on top lid"],
      attributeScore: 0.95,
      spatialReason: "140 meters apart on campus",
      spatialScore: 0.92,
      temporalReason: "Found 35 minutes after report",
      temporalScore: 0.94,
    });

    expect(evidence.length).toBeGreaterThanOrEqual(4);
    expect(evidence.some((e) => e.signalType === "CATEGORY_MATCH")).toBe(true);
    expect(evidence.some((e) => e.signalType === "STICKER_FINGERPRINT")).toBe(true);
  });
});
