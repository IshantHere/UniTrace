import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const start = Date.now();
  let dbOk = false;
  let institutionCount = 0;
  let itemsCount = 0;

  try {
    institutionCount = await prisma.institution.count();
    itemsCount = await prisma.item.count();
    dbOk = true;
  } catch (error) {
    dbOk = false;
  }

  const latencyMs = Date.now() - start;

  return NextResponse.json({
    success: true,
    data: {
      platform: "UniTrace",
      tagline: "AI-Powered Campus Lost & Found Intelligence Platform",
      version: "1.0.0",
      status: dbOk ? "healthy" : "degraded",
      database: {
        connected: dbOk,
        latencyMs,
        institutions: institutionCount,
        totalItems: itemsCount,
      },
      aiProvider: process.env.GEMINI_API_KEY ? "gemini-live" : "mock-deterministic",
      timestamp: new Date().toISOString(),
    },
  });
}
