import { describe, expect, it } from "vitest";
import { MockAIService } from "../../lib/ai/mock-provider";
import { computeAttributeSimilarity } from "../../lib/ai/fingerprint";
import { cosineSimilarity } from "../../lib/ai/vector-store";

describe("UniTrace AI Vision & Vector Mathematics", () => {
  const ai = new MockAIService();

  it("extracts structured visual fingerprint for AirPods with high confidence", async () => {
    const fp = await ai.extractVisualFingerprint(
      "https://example.com/airpods.jpg",
      "white case with blue circular sticker on lid"
    );

    expect(fp.brand).toBe("Apple");
    expect(fp.primaryColor).toBe("White");
    expect(fp.stickers).toContain("blue");

    if (
      !fp.confidenceScores ||
      typeof fp.confidenceScores === "string"
    ) {
      throw new Error("Expected structured confidence scores from the mock AI provider");
    }

    expect(fp.confidenceScores.primaryColor).toBeGreaterThan(0.9);
    expect(fp.confidenceScores.stickers).toBeGreaterThan(0.85);
  });

  it("computes cosine similarity accurately", () => {
    const vecA = [1, 0, 0];
    const vecB = [1, 0, 0];
    const vecC = [0, 1, 0];

    expect(cosineSimilarity(vecA, vecB)).toBe(1);
    expect(cosineSimilarity(vecA, vecC)).toBe(0);
  });

  it("produces high cosine similarity for semantically related descriptions", async () => {
    const emb1 = await ai.generateTextEmbedding("white Apple AirPods Pro case with sticker");
    const emb2 = await ai.generateTextEmbedding("white wireless earbuds charging cover");
    const emb3 = await ai.generateTextEmbedding("heavy iron metal dumbbell for weightlifting");

    const simRelated = cosineSimilarity(emb1.vector, emb2.vector);
    const simUnrelated = cosineSimilarity(emb1.vector, emb3.vector);

    expect(simRelated).toBeGreaterThan(0.65);
    expect(simRelated).toBeGreaterThan(simUnrelated);
  });

  it("evaluates attribute similarity with explainable reasons", () => {
    const fpA = {
      primaryColor: "White",
      brand: "Apple",
      category: "Electronics",
      stickers: "circular blue sticker on lid",
    };

    const fpB = {
      primaryColor: "White",
      brand: "Apple",
      category: "Electronics",
      stickers: "round blue sticker on cover",
    };

    const result = computeAttributeSimilarity(fpA, fpB);
    expect(result.score).toBeGreaterThanOrEqual(0.9);
    expect(result.reasons.length).toBeGreaterThan(2);
    expect(result.reasons.some((r) => r.includes("White"))).toBe(true);
    expect(result.reasons.some((r) => r.includes("Apple"))).toBe(true);
  });
});
