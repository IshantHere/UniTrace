import { describe, expect, it } from "vitest";
import { prisma } from "../../lib/prisma";
import { verifyPassword } from "../../lib/auth";
import { computeAttributeSimilarity } from "../../lib/ai/fingerprint";
import { computeCompositeMatchScore, computeSpatialScore, computeTemporalScore } from "../../lib/matching/scorer";
import { getItemJourneyTimeline } from "../../lib/journey/tracker";
import { generateHandoverPIN, canTransitionClaim } from "../../lib/claims/verification";
import { detectDuplicateClusters } from "../../lib/duplicates/clusterer";
import fs from "fs";
import path from "path";

describe("UniTrace Comprehensive Platform & Error Healthcheck", () => {
  it("1. Database & Institutions: All 16 models have valid active records", async () => {
    const institutionCount = await prisma.institution.count();
    const campusCount = await prisma.campus.count();
    const locationCount = await prisma.location.count();
    const userCount = await prisma.user.count();
    const categoryCount = await prisma.category.count();
    const itemCount = await prisma.item.count();
    const fingerprintCount = await prisma.visualFingerprint.count();
    const matchCount = await prisma.match.count();
    const evidenceCount = await prisma.matchEvidence.count();
    const sightingCount = await prisma.sighting.count();
    const claimCount = await prisma.claim.count();
    const handoverCount = await prisma.handoverRecord.count();
    const clusterCount = await prisma.duplicateCluster.count();
    const auditCount = await prisma.auditLog.count();

    expect(institutionCount).toBeGreaterThanOrEqual(1);
    expect(campusCount).toBeGreaterThanOrEqual(1);
    expect(locationCount).toBeGreaterThanOrEqual(6);
    expect(userCount).toBeGreaterThanOrEqual(4);
    expect(categoryCount).toBeGreaterThanOrEqual(5);
    expect(itemCount).toBeGreaterThanOrEqual(4);
    expect(fingerprintCount).toBeGreaterThanOrEqual(2);
    expect(matchCount).toBeGreaterThanOrEqual(1);
    expect(evidenceCount).toBeGreaterThanOrEqual(3);
    expect(sightingCount).toBeGreaterThanOrEqual(3);
    expect(claimCount).toBeGreaterThanOrEqual(1);
    expect(handoverCount).toBeGreaterThanOrEqual(1);
    expect(clusterCount).toBeGreaterThanOrEqual(1);
    expect(auditCount).toBeGreaterThanOrEqual(1);
  });

  it("2. User Authentication & Personas: Passwords verify for all core roles", async () => {
    const student = await prisma.user.findUnique({ where: { email: "student@apex.edu" } });
    const staff = await prisma.user.findUnique({ where: { email: "staff@apex.edu" } });
    const admin = await prisma.user.findUnique({ where: { email: "admin@apex.edu" } });

    expect(student).not.toBeNull();
    expect(staff).not.toBeNull();
    expect(admin).not.toBeNull();

    const isStudentValid = await verifyPassword("Password123!", student!.passwordHash);
    const isStaffValid = await verifyPassword("Password123!", staff!.passwordHash);
    const isAdminValid = await verifyPassword("Password123!", admin!.passwordHash);

    expect(isStudentValid).toBe(true);
    expect(isStaffValid).toBe(true);
    expect(isAdminValid).toBe(true);
  });

  it("3. Visual Fingerprint AI Engine: Attribute similarity correctly isolates features", () => {
    const fpA = {
      primaryColor: "White",
      brand: "Apple",
      category: "Audio",
      stickers: "circular blue NASA sticker",
      scratches: "hairline scratch near hinge",
    };
    const fpB = {
      primaryColor: "White",
      brand: "Apple",
      category: "Audio",
      stickers: "NASA sticker on front",
      scratches: "minor scratch on back",
    };

    const sim = computeAttributeSimilarity(fpA as any, fpB as any);
    expect(sim.score).toBeGreaterThanOrEqual(0.85);
    expect(sim.reasons.some((r) => r.toLowerCase().includes("brand"))).toBe(true);
    expect(sim.reasons.some((r) => r.toLowerCase().includes("color"))).toBe(true);
  });

  it("4. Multi-Signal Scorer: Produces accurate weighted composite score", () => {
    const spatial = computeSpatialScore(
      { building: "Student Union", latitude: 37.7749, longitude: -122.4194 },
      { building: "Student Union", latitude: 37.7749, longitude: -122.4194 }
    );
    expect(spatial.score).toBe(1.0);

    const now = new Date();
    const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
    const temporal = computeTemporalScore(now, oneHourLater);
    expect(temporal.score).toBeGreaterThanOrEqual(0.9);

    const composite = computeCompositeMatchScore({
      visualScore: 0.95,
      semanticScore: 0.92,
      attributeScore: 0.95,
      spatialScore: spatial.score,
      temporalScore: temporal.score,
    });

    expect(composite.overallScore).toBeGreaterThanOrEqual(0.9);
    expect(composite.confidenceTier).toBe("EXCEPTIONAL");
  });

  it("5. Journey Timeline: Reconstructs sequence with both OBSERVED and AI_INFERRED", async () => {
    const timeline = await getItemJourneyTimeline("item_found_airpods");
    expect(timeline.itemId).toBe("item_found_airpods");
    expect(timeline.events.length).toBeGreaterThanOrEqual(2);

    const types = timeline.events.map((e) => e.sightingType);
    expect(types).toContain("OBSERVED");
    expect(types).toContain("AI_INFERRED");

    // Last event should be flagged as currentLocation
    const lastEvent = timeline.events[timeline.events.length - 1];
    expect(lastEvent.isCurrentLocation).toBe(true);
  });

  it("6. Claims & Handover Desk: PIN format and valid transitions", () => {
    const pin = generateHandoverPIN();
    expect(pin).toMatch(/^RC-[A-Z0-9]{4}$/);

    expect(canTransitionClaim("PENDING", "UNDER_REVIEW")).toBe(true);
    expect(canTransitionClaim("UNDER_REVIEW", "VERIFIED")).toBe(true);
    expect(canTransitionClaim("VERIFIED", "HANDOVER_SCHEDULED")).toBe(true);
    expect(canTransitionClaim("HANDOVER_SCHEDULED", "COMPLETED")).toBe(true);

    // Illegal transitions are rejected
    expect(canTransitionClaim("PENDING", "COMPLETED")).toBe(false);
    expect(canTransitionClaim("COMPLETED", "PENDING")).toBe(false);
  });

  it("7. CSS Bundle & Static Output: CSS bundle exists and contains Tailwind styles", () => {
    const cssDir = path.join(process.cwd(), ".next/static/css");
    expect(fs.existsSync(cssDir)).toBe(true);

    // Support both production (.next/static/css/*.css) and dev (.next/static/css/app/*.css)
    const findCssFiles = (dir: string): string[] => {
      let results: string[] = [];
      const list = fs.readdirSync(dir);
      for (const file of list) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat && stat.isDirectory()) {
          results = results.concat(findCssFiles(fullPath));
        } else if (file.endsWith(".css")) {
          results.push(fullPath);
        }
      }
      return results;
    };

    const cssFiles = findCssFiles(cssDir);
    expect(cssFiles.length).toBeGreaterThanOrEqual(1);

    const cssContent = fs.readFileSync(cssFiles[0], "utf8");
    // Verify core Tailwind classes are compiled
    expect(cssContent).toContain("bg-brand-600");
    expect(cssContent).toContain("btn-primary");
    expect(cssContent).toContain("rounded-xl");
    expect(cssContent).toContain("text-slate-900");
  });
});
