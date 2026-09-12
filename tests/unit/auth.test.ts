import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "../../lib/auth";

describe("UniTrace Authentication Utilities", () => {
  it("hashes passwords securely with bcrypt", async () => {
    const plain = "SuperSecretPassword123!";
    const hash = await hashPassword(plain);
    expect(hash).not.toBe(plain);
    expect(hash.startsWith("$2")).toBe(true);
  });

  it("verifies correct password against hash", async () => {
    const plain = "CampusSafety2026";
    const hash = await hashPassword(plain);
    const valid = await verifyPassword(plain, hash);
    expect(valid).toBe(true);

    const invalid = await verifyPassword("WrongPassword", hash);
    expect(invalid).toBe(false);
  });
});
