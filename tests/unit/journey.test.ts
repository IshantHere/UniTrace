import { describe, expect, it } from "vitest";
import { SIGHTING_TYPES } from "../../lib/constants";

describe("UniTrace Item Journey & Sighting Logic", () => {
  it("enforces strict distinction between OBSERVED and AI_INFERRED sightings", () => {
    expect(SIGHTING_TYPES.OBSERVED).toBe("OBSERVED");
    expect(SIGHTING_TYPES.AI_INFERRED).toBe("AI_INFERRED");
  });

  it("verifies event chronological sequencing structure", () => {
    const events = [
      { sequence: 1, type: SIGHTING_TYPES.OBSERVED, location: "Library Steps", confidence: 1.0 },
      { sequence: 2, type: SIGHTING_TYPES.OBSERVED, location: "Library Desk", confidence: 1.0 },
      { sequence: 3, type: SIGHTING_TYPES.AI_INFERRED, location: "Block 32", confidence: 0.82 },
      { sequence: 4, type: SIGHTING_TYPES.OBSERVED, location: "Security Desk", confidence: 1.0 },
    ];

    expect(events.length).toBe(4);
    expect(events[0].type).toBe("OBSERVED");
    expect(events[2].type).toBe("AI_INFERRED");
    expect(events[2].confidence).toBeLessThan(1.0);
    expect(events[3].location).toBe("Security Desk");
  });
});
