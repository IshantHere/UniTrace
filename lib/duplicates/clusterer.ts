import { prisma } from "../prisma";
import { computeAttributeSimilarity } from "../ai/fingerprint";
import { computeSpatialScore, computeTemporalScore } from "../matching/scorer";

export async function detectDuplicateClusters(institutionId: string): Promise<number> {
  // Find active items grouped by category and type
  const items = await prisma.item.findMany({
    where: {
      institutionId,
      status: { in: ["ACTIVE", "MATCH_PENDING", "UNDER_VERIFICATION"] },
      isDuplicate: false,
    },
    include: {
      category: true,
      primaryLocation: true,
      visualFingerprint: true,
      clusterMemberships: true,
    },
  });

  let newClustersCreated = 0;

  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      const itemA = items[i];
      const itemB = items[j];

      // Duplicates must share type (both FOUND or both LOST) and category
      if (itemA.type !== itemB.type || itemA.categoryId !== itemB.categoryId) {
        continue;
      }

      // Check spatial proximity
      const spatial = computeSpatialScore(
        {
          building: itemA.primaryLocation.building,
          latitude: itemA.primaryLocation.latitude,
          longitude: itemA.primaryLocation.longitude,
        },
        {
          building: itemB.primaryLocation.building,
          latitude: itemB.primaryLocation.latitude,
          longitude: itemB.primaryLocation.longitude,
        }
      );

      // Check temporal proximity
      const temporal = computeTemporalScore(itemA.incidentDate, itemB.incidentDate);

      // Check visual attribute similarity
      const attr = computeAttributeSimilarity(
        itemA.visualFingerprint,
        itemB.visualFingerprint
      );

      // Combined duplicate score
      const duplicateSimilarity = parseFloat(
        (attr.score * 0.4 + spatial.score * 0.35 + temporal.score * 0.25).toFixed(2)
      );

      // Threshold for candidate duplicate cluster: >= 0.85
      if (duplicateSimilarity >= 0.85) {
        // Check if a cluster already contains either item
        const existingMember = await prisma.duplicateClusterMember.findFirst({
          where: { itemId: { in: [itemA.id, itemB.id] } },
          include: { cluster: true },
        });

        if (existingMember) {
          // Add other item if not already in cluster
          const otherId = existingMember.itemId === itemA.id ? itemB.id : itemA.id;
          await prisma.duplicateClusterMember.upsert({
            where: {
              clusterId_itemId: {
                clusterId: existingMember.clusterId,
                itemId: otherId,
              },
            },
            update: { similarityToCanonical: duplicateSimilarity },
            create: {
              clusterId: existingMember.clusterId,
              itemId: otherId,
              similarityToCanonical: duplicateSimilarity,
            },
          });
        } else {
          // Create new cluster
          await prisma.duplicateCluster.create({
            data: {
              institutionId,
              canonicalItemId: itemA.id,
              status: "SUGGESTED",
              averageSimilarity: duplicateSimilarity,
              members: {
                create: [
                  { itemId: itemA.id, similarityToCanonical: 1.0 },
                  { itemId: itemB.id, similarityToCanonical: duplicateSimilarity },
                ],
              },
            },
          });
          newClustersCreated++;
        }
      }
    }
  }

  return newClustersCreated;
}
