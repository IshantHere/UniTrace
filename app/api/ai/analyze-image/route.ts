import { NextRequest, NextResponse } from "next/server";
import { getAIService } from "@/lib/ai/gemini-provider";

export async function POST(req: NextRequest) {
  try {
    const { imageUrl, description } = await req.json();

    if (!imageUrl) {
      return NextResponse.json(
        { success: false, error: { code: "MISSING_IMAGE", message: "Image URL or data is required" } },
        { status: 400 }
      );
    }

    const ai = getAIService();
    const fingerprint = await ai.extractVisualFingerprint(imageUrl, description);

    return NextResponse.json({
      success: true,
      data: { fingerprint },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: "AI_ERROR", message: error.message || "Failed to analyze image" } },
      { status: 500 }
    );
  }
}
