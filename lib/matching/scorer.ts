import { ScoringWeights, DEFAULT_WEIGHTS } from "./weights";
import { MatchConfidenceTier } from "../constants";

export interface SpatialLocation {
  building?: string;
  latitude?: number | null;
  longitude?: number | null;
}

export function computeHaversineDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

export function computeSpatialScore(
  locA: SpatialLocation,
  locB: SpatialLocation,
  maxDistanceMeters = 1500
): { score: number; distanceMeters: number | null; reason: string } {
  // If exact same building
  if (locA.building && locB.building && locA.building.toLowerCase() === locB.building.toLowerCase()) {
    return { score: 1.0, distanceMeters: 0, reason: `Exact same campus building: ${locA.building}` };
  }

  // If geo-coordinates present
  if (
    locA.latitude != null &&
    locA.longitude != null &&
    locB.latitude != null &&
    locB.longitude != null
  ) {
    const d = computeHaversineDistanceMeters(
      locA.latitude,
      locA.longitude,
      locB.latitude,
      locB.longitude
    );
    const score = Math.max(0, 1 - d / maxDistanceMeters);
    return {
      score: parseFloat(score.toFixed(3)),
      distanceMeters: Math.round(d),
      reason: `Physical proximity: ${Math.round(d)} meters apart on campus`,
    };
  }

  // Fallback when only general campus area is known
  return { score: 0.7, distanceMeters: null, reason: "Campus-wide compatibility (general campus bounds)" };
}

export function computeTemporalScore(
  lostDate: Date,
  foundDate: Date
): { score: number; diffHours: number; reason: string } {
  const diffMs = foundDate.getTime() - lostDate.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);

  // If found within 2 hours of lost (ideal discovery window)
  if (diffHours >= -2 && diffHours <= 2) {
    return {
      score: 0.98,
      diffHours: Math.round(diffHours),
      reason: "Discovery occurred within 2 hours of report window",
    };
  }

  // If found after loss within 24 hours
  if (diffHours > 2 && diffHours <= 24) {
    return {
      score: 0.92,
      diffHours: Math.round(diffHours),
      reason: `Found ${Math.round(diffHours)} hours after loss incident`,
    };
  }

  // Found within 7 days
  if (diffHours > 24 && diffHours <= 168) {
    const days = Math.round(diffHours / 24);
    return {
      score: 0.8,
      diffHours: Math.round(diffHours),
      reason: `Found ${days} day${days > 1 ? "s" : ""} after report`,
    };
  }

  // If found before loss beyond 2 hour grace period (likely different items)
  if (diffHours < -2) {
    return {
      score: 0.3,
      diffHours: Math.round(diffHours),
      reason: "Item was found prior to reported loss timestamp",
    };
  }

  // Beyond 7 days
  return {
    score: 0.6,
    diffHours: Math.round(diffHours),
    reason: `Extended interval: ${Math.round(diffHours / 24)} days elapsed`,
  };
}

export function computeCompositeMatchScore(
  signals: {
    visualScore: number;
    semanticScore: number;
    attributeScore: number;
    spatialScore: number;
    temporalScore: number;
  },
  weights: ScoringWeights = DEFAULT_WEIGHTS
): {
  overallScore: number;
  confidenceTier: MatchConfidenceTier;
} {
  const totalWeight =
    weights.visual + weights.semantic + weights.attributes + weights.spatial + weights.temporal;

  const raw =
    (signals.visualScore * weights.visual +
      signals.semanticScore * weights.semantic +
      signals.attributeScore * weights.attributes +
      signals.spatialScore * weights.spatial +
      signals.temporalScore * weights.temporal) /
    totalWeight;

  const overallScore = parseFloat(Math.min(1.0, Math.max(0.0, raw)).toFixed(3));

  let confidenceTier: MatchConfidenceTier = "LOW";
  if (overallScore >= 0.9) {
    confidenceTier = "EXCEPTIONAL";
  } else if (overallScore >= 0.75) {
    confidenceTier = "HIGH";
  } else if (overallScore >= 0.55) {
    confidenceTier = "MEDIUM";
  }

  return {
    overallScore,
    confidenceTier,
  };
}
