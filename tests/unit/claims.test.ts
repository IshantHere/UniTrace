import { describe, expect, it } from "vitest";
import { generateHandoverPIN, canTransitionClaim } from "../../lib/claims/verification";
import { CLAIM_STATUSES } from "../../lib/constants";

describe("UniTrace Ownership Verification & Claims Lifecycle", () => {
  it("generates formatted 6-7 character security handover PINs", () => {
    const pin = generateHandoverPIN();
    expect(pin.startsWith("RC-")).toBe(true);
    expect(pin.length).toBe(7);
  });

  it("enforces allowed claim state lifecycle transitions", () => {
    expect(canTransitionClaim("PENDING", "UNDER_REVIEW")).toBe(true);
    expect(canTransitionClaim("UNDER_REVIEW", "VERIFIED")).toBe(true);
    expect(canTransitionClaim("VERIFIED", "HANDOVER_SCHEDULED")).toBe(true);
    expect(canTransitionClaim("HANDOVER_SCHEDULED", "COMPLETED")).toBe(true);

    // Invalid transition
    expect(canTransitionClaim("COMPLETED", "PENDING")).toBe(false);
    expect(canTransitionClaim("REJECTED", "VERIFIED")).toBe(false);
  });
});
