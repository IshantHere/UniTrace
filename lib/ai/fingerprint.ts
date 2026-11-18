import { z } from "zod";
import { VisualFingerprintData } from "./ai-service";

export const visualFingerprintSchema = z.object({
  category: z.string().default("General"),
  subcategory: z.string().optional().nullable(),
  primaryColor: z.string().default("Unknown"),
  secondaryColors: z.array(z.string()).default([]),
  secondaryColorsJson: z.string().optional().nullable(),
  shape: z.string().optional().nullable(),
  material: z.string().optional().nullable(),
  brand: z.string().optional().nullable(),
  visibleText: z.string().optional().nullable(),
  logo: z.string().optional().nullable(),
  stickers: z.string().optional().nullable(),
  scratches: z.string().optional().nullable(),
  dents: z.string().optional().nullable(),
  uniqueMarks: z.string().optional().nullable(),
  accessories: z.string().optional().nullable(),
  approximateSize: z.string().optional().nullable(),
  condition: z.string().optional().nullable(),
  distinctiveFeatures: z.union([z.array(z.string()), z.string()]).optional().nullable(),
  confidenceScores: z.union([z.record(z.number()), z.string()]).optional().nullable(),
  rawAiResponse: z.string().optional().nullable(),
});

function parseColors(fp: VisualFingerprintData): string[] {
  if (Array.isArray(fp.secondaryColors)) return fp.secondaryColors;
  if (fp.secondaryColorsJson) {
    try {
      const parsed = JSON.parse(fp.secondaryColorsJson);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      // ignore
    }
  }
  return [];
}

export function computeAttributeSimilarity(
  fpA: VisualFingerprintData | null,
  fpB: VisualFingerprintData | null
): { score: number; reasons: string[] } {
  if (!fpA || !fpB) {
    return { score: 0.5, reasons: ["Basic category matching used (no photo fingerprint)"] };
  }

  let matchedPoints = 0;
  let totalPoints = 0;
  const reasons: string[] = [];

  // 1. Primary Color
  if (fpA.primaryColor && fpB.primaryColor) {
    totalPoints += 25;
    if (fpA.primaryColor.toLowerCase() === fpB.primaryColor.toLowerCase()) {
      matchedPoints += 25;
      reasons.push(`Matching primary color: ${fpA.primaryColor}`);
    } else {
      // Check secondary overlap
      const aSec = parseColors(fpA).map((c) => c.toLowerCase());
      const bSec = parseColors(fpB).map((c) => c.toLowerCase());
      if (aSec.includes(fpB.primaryColor.toLowerCase()) || bSec.includes(fpA.primaryColor.toLowerCase())) {
        matchedPoints += 15;
        reasons.push(`Color tone overlap between primary and secondary shades`);
      }
    }
  }

  // 2. Brand
  if (fpA.brand && fpB.brand) {
    totalPoints += 25;
    if (fpA.brand.toLowerCase() === fpB.brand.toLowerCase()) {
      matchedPoints += 25;
      reasons.push(`Identical brand detected: ${fpA.brand}`);
    }
  }

  // 3. Category / Subcategory
  if (fpA.category && fpB.category) {
    totalPoints += 20;
    if (fpA.category.toLowerCase() === fpB.category.toLowerCase()) {
      matchedPoints += 20;
      reasons.push(`Same object category: ${fpA.category}`);
    }
  }

  // 4. Distinctive Stickers / Scratches / Marks
  const marksA = [fpA.stickers, fpA.scratches, fpA.uniqueMarks].filter(Boolean).join(" ").toLowerCase();
  const marksB = [fpB.stickers, fpB.scratches, fpB.uniqueMarks].filter(Boolean).join(" ").toLowerCase();

  if (marksA && marksB) {
    totalPoints += 30;
    const tokensA = marksA.split(/\s+/).filter((w) => w.length > 3);
    const tokensB = marksB.split(/\s+/).filter((w) => w.length > 3);
    const common = tokensA.filter((t) => tokensB.includes(t));

    if (common.length > 0) {
      matchedPoints += 30;
      reasons.push(`Distinctive mark overlap: "${common.join(", ")}"`);
    } else if (fpA.stickers && fpB.stickers) {
      matchedPoints += 15;
      reasons.push(`Stickers present on exterior in both records`);
    }
  }

  const score = totalPoints > 0 ? Math.min(1.0, Math.max(0.0, matchedPoints / totalPoints)) : 0.5;

  return {
    score: parseFloat(score.toFixed(2)),
    reasons,
  };
}
