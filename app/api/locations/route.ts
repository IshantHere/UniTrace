import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const locations = await prisma.location.findMany({
      orderBy: [{ building: "asc" }, { name: "asc" }],
      include: {
        campus: { select: { name: true, code: true } },
        _count: { select: { items: true, sightings: true } },
      },
    });

    return NextResponse.json({
      success: true,
      data: { locations },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: error.message || "Failed to fetch locations" } },
      { status: 500 }
    );
  }
}
