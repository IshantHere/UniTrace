import { AIService, VisualFingerprintData, EmbeddingResult } from "./ai-service";
import { MockAIService } from "./mock-provider";

export class GeminiAIService implements AIService {
  private apiKey: string;
  private fallback: MockAIService;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.GEMINI_API_KEY || "";
    this.fallback = new MockAIService();
  }

  async extractVisualFingerprint(
    imageUrlOrBase64: string,
    contextHint?: string
  ): Promise<VisualFingerprintData> {
    if (!this.apiKey) {
      return this.fallback.extractVisualFingerprint(imageUrlOrBase64, contextHint);
    }

    try {
      // Vision prompt requesting structured JSON matching VisualFingerprintData
      const prompt = `You are UniTrace's AI Visual Fingerprinting engine. Analyze this item photograph and return ONLY a valid JSON object matching this schema:
{
  "category": "Electronics | Bags & Sleeves | Wallets | Bottles | Keys | Clothing | Other",
  "subcategory": "specific item type",
  "primaryColor": "dominant color",
  "secondaryColors": ["list", "of", "secondary", "colors"],
  "shape": "shape description",
  "material": "material description",
  "brand": "brand name or null if unbranded",
  "visibleText": "any visible lettering or null",
  "logo": "logo description or null",
  "stickers": "detailed description of any stickers or null",
  "scratches": "detailed description of scratches or null",
  "dents": "dents or null",
  "uniqueMarks": "distinct identifying marks or null",
  "accessories": "attached cables, case, charms or null",
  "approximateSize": "estimated dimensions",
  "condition": "New | Like New | Good | Fair | Damaged",
  "distinctiveFeatures": ["list", "of", "unique", "characteristics"],
  "confidenceScores": {
    "primaryColor": 0.95,
    "brand": 0.85,
    "stickers": 0.90
  }
}
Context description from reporter: ${contextHint || "None provided"}`;

      // Call Gemini 1.5 Flash via REST API
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`;
      const payload = {
        contents: [
          {
            parts: [
              { text: prompt },
              imageUrlOrBase64.startsWith("data:")
                ? {
                    inlineData: {
                      mimeType: imageUrlOrBase64.split(";")[0].replace("data:", ""),
                      data: imageUrlOrBase64.split(",")[1],
                    },
                  }
                : { text: `Image URL: ${imageUrlOrBase64}` },
            ],
          },
        ],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.1,
        },
      };

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.warn(`[Gemini API Warning] Status ${response.status}. Falling back to deterministic model.`);
        return this.fallback.extractVisualFingerprint(imageUrlOrBase64, contextHint);
      }

      const json = await response.json();
      const rawText = json.candidates?.[0]?.content?.parts?.[0]?.text;
      if (rawText) {
        const parsed = JSON.parse(rawText);
        return {
          ...parsed,
          rawAiResponse: rawText,
        };
      }

      return this.fallback.extractVisualFingerprint(imageUrlOrBase64, contextHint);
    } catch (error) {
      console.warn("[Gemini API Error] Falling back to deterministic provider:", error);
      return this.fallback.extractVisualFingerprint(imageUrlOrBase64, contextHint);
    }
  }

  async generateTextEmbedding(text: string): Promise<EmbeddingResult> {
    if (!this.apiKey) {
      return this.fallback.generateTextEmbedding(text);
    }

    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${this.apiKey}`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "models/text-embedding-004",
          content: { parts: [{ text }] },
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const json = await response.json();
        const values = json.embedding?.values;
        if (Array.isArray(values)) {
          return {
            vector: values,
            dimensions: values.length,
            model: "text-embedding-004",
          };
        }
      }

      return this.fallback.generateTextEmbedding(text);
    } catch (error) {
      return this.fallback.generateTextEmbedding(text);
    }
  }

  async moderateContent(text: string): Promise<{ isSafe: boolean; reason?: string }> {
    return this.fallback.moderateContent(text);
  }
}

let aiServiceInstance: AIService | null = null;

export function getAIService(): AIService {
  if (!aiServiceInstance) {
    aiServiceInstance = new GeminiAIService();
  }
  return aiServiceInstance;
}
