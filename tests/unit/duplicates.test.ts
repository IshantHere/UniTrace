import { describe, expect, it } from "vitest";
import { DUPLICATE_CLUSTER_STATUSES } from "../../lib/constants";
import { mergeDuplicatesSchema } from "../../lib/validators";

describe("UniTrace Duplicate Detection & Deduplication", () => {
  it("enforces duplicate cluster status lifecycle", () => {
    expect(DUPLICATE_CLUSTER_STATUSES.SUGGESTED).toBe("SUGGESTED");
    expect(DUPLICATE_CLUSTER_STATUSES.MERGED).toBe("MERGED");
    expect(DUPLICATE_CLUSTER_STATUSES.DISMISSED).toBe("DISMISSED");
  });

  it("validates merge request payload", () => {
    const valid = mergeDuplicatesSchema.safeParse({
      clusterId: "cluster_hydroflask",
      canonicalItemId: "item_hydroflask_1",
      itemIds: ["item_hydroflask_1", "item_hydroflask_2"],
      notes: "Both reports describe the navy blue flask in cafeteria",
    });

    expect(valid.success).toBe(true);

    const invalid = mergeDuplicatesSchema.safeParse({
      clusterId: "cluster_1",
      canonicalItemId: "item_1",
      itemIds: ["item_1"], // Less than 2 items to merge
    });

    expect(invalid.success).toBe(false);
  });
});
