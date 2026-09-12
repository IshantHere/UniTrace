export interface VisualFingerprintData {
  category?: string | null;
  subcategory?: string | null;
  primaryColor?: string | null;
  secondaryColors?: string[] | null;
  secondaryColorsJson?: string | null;
  shape?: string | null;
  material?: string | null;
  brand?: string | null;
  visibleText?: string | null;
  logo?: string | null;
  stickers?: string | null;
  scratches?: string | null;
  dents?: string | null;
  uniqueMarks?: string | null;
  accessories?: string | null;
  approximateSize?: string | null;
  condition?: string | null;
  distinctiveFeatures?: string[] | string | null;
  confidenceScores?: Record<string, number> | string | null;
  rawAiResponse?: string | null;
}

export interface EmbeddingResult {
  vector: number[];
  dimensions: number;
  model: string;
}

export interface AIService {
  extractVisualFingerprint(
    imageUrlOrBase64: string,
    contextHint?: string
  ): Promise<VisualFingerprintData>;

  generateTextEmbedding(text: string): Promise<EmbeddingResult>;

  moderateContent(text: string): Promise<{ isSafe: boolean; reason?: string }>;
}
