import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { runAutomaticMatching } from "@/lib/matching/engine";

export async function GET(
  req: NextRequest,
  { params }: { params: { itemId: string } }
) {
  try {
    const item = await prisma.item.findUnique({
      where: { id: params.itemId },
      include: {
        category: true,
        primaryLocation: true,
        images: true,
        visualFingerprint: true,
      },
    });

    if (!item) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Source item not found" } },
        { status: 404 }
      );
    }

    const evaluated = await runAutomaticMatching(item.id);

    return NextResponse.json({
      success: true,
      data: {
        sourceItem: item,
        candidatesCount: evaluated.length,
        matches: evaluated,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: "MATCHING_ERROR", message: error.message } },
      { status: 500 }
    );
  }
}
