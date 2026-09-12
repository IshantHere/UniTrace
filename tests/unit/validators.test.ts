import { describe, expect, it } from "vitest";
import { registerSchema, loginSchema, createItemSchema, createClaimSchema } from "../../lib/validators";

describe("UniTrace Zod Validators", () => {
  it("validates user registration", () => {
    const valid = registerSchema.safeParse({
      name: "Alex Sharma",
      email: "alex@apex.edu",
      password: "Password123!",
      role: "STUDENT",
    });
    expect(valid.success).toBe(true);

    const invalid = registerSchema.safeParse({
      name: "A",
      email: "invalid-email",
      password: "short",
    });
    expect(invalid.success).toBe(false);
  });

  it("validates item creation with required fields", () => {
    const valid = createItemSchema.safeParse({
      type: "LOST",
      title: "Apple AirPods Case",
      description: "Lost my white AirPods case near the library steps with blue sticker.",
      categoryId: "cat_audio",
      primaryLocationId: "loc_library_steps",
      incidentDate: "2026-09-10T16:30:00Z",
    });
    expect(valid.success).toBe(true);

    const invalid = createItemSchema.safeParse({
      type: "LOST",
      title: "Ai",
      description: "Too short",
      categoryId: "",
      primaryLocationId: "",
      incidentDate: "2026-09-10",
    });
    expect(invalid.success).toBe(false);
  });

  it("validates claim verification answers", () => {
    const valid = createClaimSchema.safeParse({
      itemId: "item_found_airpods",
      verificationAnswers: [
        {
          question: "Describe any distinctive stickers on the case.",
          answer: "Circular blue NASA sticker on the top lid.",
        },
      ],
    });
    expect(valid.success).toBe(true);

    const invalid = createClaimSchema.safeParse({
      itemId: "item_found_airpods",
      verificationAnswers: [],
    });
    expect(invalid.success).toBe(false);
  });
});
