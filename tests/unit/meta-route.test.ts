import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../lib/prisma", () => ({
  prisma: {
    institution: { count: vi.fn() },
    item: { count: vi.fn() },
  },
}));

import { GET } from "../../app/api/meta/route";
import { prisma } from "../../lib/prisma";

describe("GET /api/meta", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("reports a healthy database when Prisma queries succeed", async () => {
    vi.mocked(prisma.institution.count).mockResolvedValue(1);
    vi.mocked(prisma.item.count).mockResolvedValue(3);

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.database).toMatchObject({
      connected: true,
      institutions: 1,
      totalItems: 3,
    });
  });

  it("returns an unavailable status when a Prisma query fails", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.mocked(prisma.institution.count).mockRejectedValue(new Error("database unavailable"));

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(503);
    expect(body.success).toBe(false);
    expect(body.data.database.connected).toBe(false);
  });
});
