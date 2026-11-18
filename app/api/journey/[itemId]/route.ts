import { NextRequest, NextResponse } from "next/server";
import { getItemJourneyTimeline } from "@/lib/journey/tracker";

export async function GET(
  req: NextRequest,
  { params }: { params: { itemId: string } }
) {
  try {
    const timeline = await getItemJourneyTimeline(params.itemId);
    return NextResponse.json({
      success: true,
      data: timeline,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: "JOURNEY_ERROR", message: error.message || "Failed to load journey timeline" } },
      { status: error.message === "Item not found" ? 404 : 500 }
    );
  }
}
