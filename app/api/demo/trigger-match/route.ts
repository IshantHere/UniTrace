/**
 * app/api/demo/trigger-match/route.ts
 *
 * Demo Simulation Endpoint.
 * Instantly broadcasts a live 94% Exceptional Match event through the real-time SSE event bus.
 * Visiting or fetching this URL immediately fires the Web Audio chime and floating toast
 * on all open browser tabs!
 */

import { NextResponse } from "next/server";
import { emitMatchFound } from "@/lib/realtime/bus";

export const dynamic = "force-dynamic";

export async function GET() {
  emitMatchFound({
    matchId: "match_airpods_golden",
    lostItemId: "item_lost_airpods",
    foundItemId: "item_found_airpods",
    itemTitle: "AirPods Pro Case (White)",
    itemImage: "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=400&q=80",
    score: 0.94,
    confidenceTier: "EXCEPTIONAL",
    locationName: "Library Steps (3rd Floor)",
    recipientUserId: "user_student_alex",
    timestamp: new Date().toISOString(),
  });

  return NextResponse.json({
    success: true,
    message: "⚡ Live AI match event broadcasted! The chime has sounded and the toast card is displayed on all open screens.",
  });
}
