/**
 * app/api/events/route.ts
 *
 * Real-Time Server-Sent Events (SSE) Streaming Route Handler.
 * Streams real-time match events and claim status updates to connected browsers.
 */

import { NextRequest } from "next/server";
import { bus, RealtimeMatchEvent, RealtimeClaimEvent } from "@/lib/realtime/bus";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();

      // Initial connection greeting
      controller.enqueue(
        encoder.encode(`event: connected\ndata: ${JSON.stringify({ status: "connected", time: new Date().toISOString() })}\n\n`)
      );

      // Periodic heartbeat ping every 25 seconds to keep connection alive
      const pingInterval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`event: ping\ndata: "keepalive"\n\n`));
        } catch {
          clearInterval(pingInterval);
        }
      }, 25000);

      // Handler for new match discoveries
      const onMatch = (event: RealtimeMatchEvent) => {
        try {
          // If authenticated, forward if user is the recipient or staff/admin. If guest, forward high-tier matches
          const isRecipient = user && event.recipientUserId === user.id;
          const isStaff = user && ["STAFF", "ADMIN", "SUPER_ADMIN"].includes(user.role);
          const shouldDeliver = !user || isRecipient || isStaff;

          if (shouldDeliver) {
            const data = `event: match\ndata: ${JSON.stringify(event)}\n\n`;
            controller.enqueue(encoder.encode(data));
          }
        } catch (err) {
          console.error("[SSE] Error delivering match event:", err);
        }
      };

      // Handler for claim updates
      const onClaim = (event: RealtimeClaimEvent) => {
        try {
          const isRecipient = user && event.recipientUserId === user.id;
          const isStaff = user && ["STAFF", "ADMIN", "SUPER_ADMIN"].includes(user.role);

          if (isRecipient || isStaff) {
            const data = `event: claim\ndata: ${JSON.stringify(event)}\n\n`;
            controller.enqueue(encoder.encode(data));
          }
        } catch (err) {
          console.error("[SSE] Error delivering claim event:", err);
        }
      };

      bus.on("match_detected", onMatch);
      bus.on("claim_updated", onClaim);

      // Clean up when client disconnects
      req.signal.addEventListener("abort", () => {
        clearInterval(pingInterval);
        bus.off("match_detected", onMatch);
        bus.off("claim_updated", onClaim);
        try {
          controller.close();
        } catch {}
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no", // Disables Nginx response buffering
    },
  });
}
