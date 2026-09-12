import { describe, expect, it } from "vitest";
import { createItemSchema } from "../../lib/validators";
import { ITEM_STATUSES, ITEM_TYPES } from "../../lib/constants";

describe("UniTrace Item Domain & Lifecycle", () => {
  it("enforces valid item types", () => {
    expect(ITEM_TYPES.LOST).toBe("LOST");
    expect(ITEM_TYPES.FOUND).toBe("FOUND");
  });

  it("enforces standard item status lifecycle", () => {
    expect(ITEM_STATUSES.ACTIVE).toBe("ACTIVE");
    expect(ITEM_STATUSES.MATCH_PENDING).toBe("MATCH_PENDING");
    expect(ITEM_STATUSES.UNDER_VERIFICATION).toBe("UNDER_VERIFICATION");
    expect(ITEM_STATUSES.RECOVERED).toBe("RECOVERED");
  });

  it("validates full lost report submission", () => {
    const payload = {
      type: "LOST",
      title: "Black Laptop Sleeve",
      description: "Lost black neoprene sleeve with red sticker near library steps.",
      categoryId: "cat_bags",
      primaryLocationId: "loc_library_steps",
      incidentDate: "2026-09-10T16:30:00Z",
      incidentTime: "16:30",
      imageUrl: "/uploads/sleeve.jpg",
      isHighValue: false,
    };

    const parsed = createItemSchema.safeParse(payload);
    expect(parsed.success).toBe(true);
  });

  it("rejects invalid item with missing category or location", () => {
    const invalid = createItemSchema.safeParse({
      type: "LOST",
      title: "Wallet",
      description: "Brown leather wallet",
      categoryId: "",
      primaryLocationId: "",
      incidentDate: "2026-09-10",
    });

    expect(invalid.success).toBe(false);
  });
});
