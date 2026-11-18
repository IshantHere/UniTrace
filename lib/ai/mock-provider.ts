import { AIService, VisualFingerprintData, EmbeddingResult } from "./ai-service";

export class MockAIService implements AIService {
  async extractVisualFingerprint(
    imageUrlOrBase64: string,
    contextHint?: string
  ): Promise<VisualFingerprintData> {
    const combined = `${imageUrlOrBase64} ${contextHint || ""}`.toLowerCase();

    if (combined.includes("airpod") || combined.includes("earbud") || combined.includes("audio")) {
      return {
        category: "Electronics",
        subcategory: "Audio Accessories",
        primaryColor: "White",
        secondaryColors: ["Silver", "Blue"],
        shape: "Compact Curved Rectangular",
        material: "Glossy Polycarbonate",
        brand: "Apple",
        visibleText: undefined,
        logo: "Apple embossed indicator",
        stickers: "Small circular blue sticker on top lid",
        scratches: "Minor surface scuff near bottom hinge",
        dents: "None",
        uniqueMarks: "Blue round NASA sticker and fine scuff",
        accessories: "None",
        approximateSize: "6cm x 4.5cm x 2cm",
        condition: "Used - Good Condition",
        distinctiveFeatures: [
          "Small circular blue sticker on top lid",
          "Minor surface scuff near bottom hinge",
        ],
        confidenceScores: {
          brand: 0.96,
          primaryColor: 0.99,
          stickers: 0.93,
          scratches: 0.85,
        },
        rawAiResponse: "[MockAIService: Audio Accessory Template Applied]",
      };
    }

    if (combined.includes("bottle") || combined.includes("flask") || combined.includes("tumbler")) {
      return {
        category: "Personal Items",
        subcategory: "Bottles & Tumblers",
        primaryColor: "Navy Blue",
        secondaryColors: ["Silver", "White"],
        shape: "Cylindrical Bottle",
        material: "Stainless Steel Coated",
        brand: "Hydro Flask",
        stickers: "Mountain outdoor sticker on center body",
        scratches: "Small dent on base rim",
        condition: "Used - Fair Condition",
        distinctiveFeatures: [
          "Mountain outdoor sticker on center body",
          "Small dent on base rim",
        ],
        confidenceScores: {
          brand: 0.91,
          primaryColor: 0.95,
          stickers: 0.89,
        },
        rawAiResponse: "[MockAIService: Bottle Template Applied]",
      };
    }

    if (combined.includes("laptop") || combined.includes("sleeve") || combined.includes("computer")) {
      return {
        category: "Bags & Sleeves",
        subcategory: "Computer Sleeves",
        primaryColor: "Black",
        secondaryColors: ["Red"],
        shape: "Rectangular Zippered Sleeve",
        material: "Neoprene Fabric",
        brand: "Incase",
        stickers: "Small red rectangular sticker on corner",
        scratches: "Slight fraying along edge seam",
        condition: "Used - Good Condition",
        distinctiveFeatures: [
          "Small red rectangular sticker on corner",
          "Zipper pull tab",
        ],
        confidenceScores: {
          primaryColor: 0.98,
          stickers: 0.88,
          brand: 0.75,
        },
        rawAiResponse: "[MockAIService: Laptop Sleeve Template Applied]",
      };
    }

    // Default fallback
    return {
      category: "General Belongings",
      primaryColor: "Black",
      secondaryColors: ["Gray"],
      shape: "Standard Object",
      material: "Composite Material",
      condition: "Used",
      distinctiveFeatures: ["Generic surface wear"],
      confidenceScores: {
        primaryColor: 0.8,
        condition: 0.75,
      },
      rawAiResponse: "[MockAIService: Generic Template Applied]",
    };
  }

  async generateTextEmbedding(text: string): Promise<EmbeddingResult> {
    const dimensions = 768;
    const vector = new Array(dimensions).fill(0);
    const normalized = text.toLowerCase().replace(/[^a-z0-9\s]/g, "");
    const words = normalized.split(/\s+/).filter(Boolean);

    // Semantic cluster mapping so related words map to similar vector subspaces
    const clusters: Record<string, number> = {
      airpod: 10,
      airpods: 10,
      earbud: 10,
      earbuds: 10,
      headphone: 10,
      headphones: 10,
      apple: 12,
      audio: 10,
      case: 14,
      cover: 14,
      sleeve: 20,
      laptop: 22,
      computer: 22,
      macbook: 22,
      bottle: 30,
      flask: 30,
      hydro: 30,
      tumbler: 30,
      sticker: 40,
      blue: 50,
      white: 52,
      black: 54,
      red: 56,
      library: 60,
      security: 62,
    };

    // Project tokens into vector space
    words.forEach((word) => {
      let clusterIdx = clusters[word];
      if (clusterIdx !== undefined) {
        for (let offset = 0; offset < 15; offset++) {
          const idx = (clusterIdx * 10 + offset) % dimensions;
          vector[idx] += 1.5;
        }
      }

      // Hash word characters
      for (let i = 0; i < word.length; i++) {
        const charCode = word.charCodeAt(i);
        const idx = (charCode * 31 + i * 17) % dimensions;
        vector[idx] += 0.3;
      }
    });

    // L2 Normalize
    let norm = Math.sqrt(vector.reduce((sum, v) => sum + v * v, 0));
    if (norm === 0) norm = 1;
    const normalizedVector = vector.map((v) => parseFloat((v / norm).toFixed(5)));

    return {
      vector: normalizedVector,
      dimensions,
      model: "mock-embedding-768",
    };
  }

  async moderateContent(text: string): Promise<{ isSafe: boolean; reason?: string }> {
    const prohibitedWords = ["hate", "weapon", "explosive", "narcotics"];
    const lower = text.toLowerCase();
    for (const w of prohibitedWords) {
      if (lower.includes(w)) {
        return { isSafe: false, reason: `Contains prohibited content category: ${w}` };
      }
    }
    return { isSafe: true };
  }
}
