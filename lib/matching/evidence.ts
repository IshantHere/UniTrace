export interface MatchEvidenceItem {
  signalType: string;
  description: string;
  score: number;
  weight: number;
}

export function compileMatchEvidence(params: {
  categoryMatch: boolean;
  categoryName: string;
  visualScore: number;
  semanticScore: number;
  attributeReasons: string[];
  attributeScore: number;
  spatialReason: string;
  spatialScore: number;
  temporalReason: string;
  temporalScore: number;
}): MatchEvidenceItem[] {
  const evidence: MatchEvidenceItem[] = [];

  // 1. Category Alignment
  if (params.categoryMatch) {
    evidence.push({
      signalType: "CATEGORY_MATCH",
      description: `Identical object category: "${params.categoryName}"`,
      score: 1.0,
      weight: 0.2,
    });
  }

  // 2. Distinctive Attributes & Stickers
  if (params.attributeReasons.length > 0) {
    params.attributeReasons.forEach((reason) => {
      evidence.push({
        signalType: reason.toLowerCase().includes("sticker")
          ? "STICKER_FINGERPRINT"
          : reason.toLowerCase().includes("color")
          ? "COLOR_AGREEMENT"
          : "ATTRIBUTE_ALIGNMENT",
        description: reason,
        score: params.attributeScore,
        weight: 0.25,
      });
    });
  }

  // 3. Visual Appearance
  if (params.visualScore >= 0.7) {
    evidence.push({
      signalType: "VISUAL_SIMILARITY",
      description: `High visual appearance correlation (${Math.round(params.visualScore * 100)}% visual alignment)`,
      score: params.visualScore,
      weight: 0.3,
    });
  }

  // 4. Spatial Proximity
  evidence.push({
    signalType: "SPATIAL_PROXIMITY",
    description: params.spatialReason,
    score: params.spatialScore,
    weight: 0.15,
  });

  // 5. Temporal Compatibility
  evidence.push({
    signalType: "TEMPORAL_COMPATIBILITY",
    description: params.temporalReason,
    score: params.temporalScore,
    weight: 0.1,
  });

  return evidence;
}
