/**
 * lib/matching/engine.ts
 *
 * Autonomous Real-Time Matching Engine.
 * Automatically evaluates multi-signal composite matches whenever ANY item
 * is reported on campus, persists match evidence, and fires targeted real-time alerts.
 */

import { prisma } from "../prisma";
import { computeAttributeSimilarity } from "../ai/fingerprint";
import {
  computeSpatialScore,
  computeTemporalScore,
  computeCompositeMatchScore,
} from "./scorer";
import { compileMatchEvidence } from "./evidence";
import { emitMatchFound } from "../realtime/bus";

/**
 * Execute automated matching for an item against all active opposing items in the database.
 * @param itemId The newly reported or updated item's ID
 * @returns Array of evaluated matches
 */
export async function runAutomaticMatching(itemId: string) {
  const item = await prisma.item.findUnique({
    where: { id: itemId },
    include: {
      category: true,
      primaryLocation: true,
      images: true,
      visualFingerprint: true,
    },
  });

  if (!item) {
    return [];
  }

  const targetType = item.type === "LOST" ? "FOUND" : "LOST";

  // Query opposing active candidate items
  const candidates = await prisma.item.findMany({
    where: {
      institutionId: item.institutionId,
      type: targetType,
      status: { in: ["ACTIVE", "MATCH_PENDING", "UNDER_VERIFICATION"] },
      id: { not: item.id },
    },
    include: {
      category: true,
      primaryLocation: true,
      images: true,
      visualFingerprint: true,
    },
    take: 50,
  });

  const evaluatedMatches = [];

  for (const candidate of candidates) {
    const lostItem = item.type === "LOST" ? item : candidate;
    const foundItem = item.type === "FOUND" ? item : candidate;

    // 1. Category comparison
    const categoryMatch = lostItem.categoryId === foundItem.categoryId;

    // 2. Visual attribute fingerprinting
    const attrResult = computeAttributeSimilarity(
      lostItem.visualFingerprint,
      foundItem.visualFingerprint
    );

    // 3. Spatiotemporal distance calculation
    const spatialResult = computeSpatialScore(
      {
        building: lostItem.primaryLocation?.building,
        latitude: lostItem.primaryLocation?.latitude,
        longitude: lostItem.primaryLocation?.longitude,
      },
      {
        building: foundItem.primaryLocation?.building,
        latitude: foundItem.primaryLocation?.latitude,
        longitude: foundItem.primaryLocation?.longitude,
      }
    );

    // 4. Temporal proximity
    const temporalResult = computeTemporalScore(
      lostItem.incidentDate,
      foundItem.incidentDate
    );

    // 5. Visual appearance score
    const visualScore =
      lostItem.images.length > 0 && foundItem.images.length > 0
        ? parseFloat(Math.min(1.0, attrResult.score + 0.05).toFixed(2))
        : 0.5;

    // 6. Semantic keyword score
    const lostWords = lostItem.title.toLowerCase().split(/\s+/);
    const foundWords = foundItem.title.toLowerCase().split(/\s+/);
    const commonWords = lostWords.filter((w) => w.length > 2 && foundWords.includes(w));
    let semanticScore = categoryMatch ? 0.9 : 0.6;
    if (commonWords.length > 0) {
      semanticScore = Math.min(1.0, semanticScore + 0.1);
    }

    // 7. Composite multi-signal aggregation
    const composite = computeCompositeMatchScore({
      visualScore,
      semanticScore,
      attributeScore: attrResult.score,
      spatialScore: spatialResult.score,
      temporalScore: temporalResult.score,
    });

    // If match meets minimum plausibility threshold (>= 60%)
    if (composite.overallScore >= 0.6) {
      const evidence = compileMatchEvidence({
        categoryMatch,
        categoryName: lostItem.category.name,
        visualScore,
        semanticScore,
        attributeReasons: attrResult.reasons,
        attributeScore: attrResult.score,
        spatialReason: spatialResult.reason,
        spatialScore: spatialResult.score,
        temporalReason: temporalResult.reason,
        temporalScore: temporalResult.score,
      });

      // Upsert into Match table
      const match = await prisma.match.upsert({
        where: {
          lostItemId_foundItemId: {
            lostItemId: lostItem.id,
            foundItemId: foundItem.id,
          },
        },
        update: {
          overallScore: composite.overallScore,
          visualScore,
          semanticScore,
          attributeScore: attrResult.score,
          locationScore: spatialResult.score,
          timeScore: temporalResult.score,
          confidenceTier: composite.confidenceTier,
        },
        create: {
          lostItemId: lostItem.id,
          foundItemId: foundItem.id,
          overallScore: composite.overallScore,
          visualScore,
          semanticScore,
          attributeScore: attrResult.score,
          locationScore: spatialResult.score,
          timeScore: temporalResult.score,
          confidenceTier: composite.confidenceTier,
          status: "POTENTIAL",
          evidence: {
            create: evidence.map((ev) => ({
              signalType: ev.signalType,
              description: ev.description,
              score: ev.score,
              weight: ev.weight,
            })),
          },
        },
        include: {
          lostItem: { include: { images: true, primaryLocation: true } },
          foundItem: { include: { images: true, primaryLocation: true } },
          evidence: true,
        },
      });

      evaluatedMatches.push(match);

      // ⚡ If strong match (>= 65%), dispatch real-time pop-up & create notification
      if (composite.overallScore >= 0.65) {
        // Create in-app notification for the user who lost the item
        await prisma.notification
          .create({
            data: {
              userId: lostItem.reporterId,
              type: "MATCH_FOUND",
              title: `Match Found for "${lostItem.title}" (${Math.round(composite.overallScore * 100)}%)`,
              message: `A recovered item matching your ${lostItem.title} was reported at ${foundItem.primaryLocation.name}.`,
              actionUrl: `/match/${match.id}`,
            },
          })
          .catch(() => {});

        // 🔔 Dispatch Real-Time Pusher (Web Audio Chime + Floating Card)
        emitMatchFound({
          matchId: match.id,
          lostItemId: lostItem.id,
          foundItemId: foundItem.id,
          itemTitle: lostItem.title,
          itemImage: foundItem.images?.[0]?.url,
          score: composite.overallScore,
          confidenceTier: composite.confidenceTier,
          locationName: foundItem.primaryLocation.name,
          recipientUserId: lostItem.reporterId,
          timestamp: new Date().toISOString(),
        });
      }
    }
  }

  evaluatedMatches.sort((a, b) => b.overallScore - a.overallScore);
  return evaluatedMatches;
}
