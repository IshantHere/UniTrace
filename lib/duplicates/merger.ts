import { prisma } from "../prisma";
import { logAudit } from "../audit";

export async function mergeDuplicateReports(params: {
  clusterId: string;
  canonicalItemId: string;
  itemIdsToMerge: string[];
  staffUserId: string;
  notes?: string;
}): Promise<{ success: boolean; mergedCount: number }> {
  const { clusterId, canonicalItemId, itemIdsToMerge, staffUserId, notes } = params;

  const cluster = await prisma.duplicateCluster.findUnique({
    where: { id: clusterId },
  });

  if (!cluster) {
    throw new Error("Cluster not found");
  }

  // Canonical item must not be merged into itself
  const childIds = itemIdsToMerge.filter((id) => id !== canonicalItemId);

  // Update duplicate items with canonical link and flag
  await prisma.item.updateMany({
    where: { id: { in: childIds } },
    data: {
      isDuplicate: true,
      primaryItemId: canonicalItemId,
      status: "ARCHIVED",
    },
  });

  // Update cluster status to MERGED
  await prisma.duplicateCluster.update({
    where: { id: clusterId },
    data: {
      canonicalItemId,
      status: "MERGED",
    },
  });

  // Log immutable audit event
  await logAudit({
    institutionId: cluster.institutionId,
    actorId: staffUserId,
    action: "ITEMS_MERGED",
    entityType: "DuplicateCluster",
    entityId: clusterId,
    metadata: {
      canonicalItemId,
      mergedItemIds: childIds,
      staffNotes: notes || "Staff reviewed and approved duplicate report cluster",
    },
  });

  return {
    success: true,
    mergedCount: childIds.length,
  };
}
